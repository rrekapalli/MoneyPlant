#!/usr/bin/env python3
"""
nse_bhav_pipeline.py

Full pipeline:
- download NSE bhavcopy CSV zip files (historical equities)
- unzip & normalize CSVs
- store raw OHLC to Parquet
- ingest corporate_actions.csv (user-provided)
- compute adjusted OHLC & adj_close (splits, bonus, dividend, rights)
- store adjusted Parquet files

Usage:
    python nse_bhav_pipeline.py --start 1998-01-01 --end 2025-11-12 --out ./data

Requirements:
    pip install requests pandas pyarrow tqdm python-dateutil
"""

import argparse
import calendar
import csv
import io
import os
import sys
import time
import zipfile
from datetime import datetime, timedelta
from dateutil import parser as du_parser
from pathlib import Path

import pandas as pd
import requests
from tqdm import tqdm

# ---------- CONFIG ----------
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
BASE_BHAV_URL = "https://www.nseindia.com/content/historical/EQUITIES/{year}/{mon_abbr}/cm{DDMMMYYYY}bhav.csv.zip"
# Example cm01JAN2024bhav.csv.zip
# --------------------------------

def nse_session():
    s = requests.Session()
    s.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://www.nseindia.com/",
    })
    # initial page to set cookies
    r = s.get("https://www.nseindia.com", timeout=10)
    r.raise_for_status()
    return s

def format_bhav_url(date: datetime):
    DD = date.strftime("%d")
    MMM = date.strftime("%b").upper()
    YYYY = date.strftime("%Y")
    # cm{DD}{MMM}{YYYY}bhav.csv.zip where MMM is e.g., JAN
    name = f"cm{DD}{MMM}{YYYY}bhav.csv.zip"
    return f"https://www.nseindia.com/content/historical/EQUITIES/{YYYY}/{date.strftime('%b').upper()}/{name}"

def download_bhav_for_date(session: requests.Session, date: datetime, out_dir: Path, max_retries=6):
    url = format_bhav_url(date)
    out_dir.mkdir(parents=True, exist_ok=True)
    local_zip = out_dir / f"{date.strftime('%Y%m%d')}_bhav.zip"
    if local_zip.exists() and local_zip.stat().st_size > 0:
        return local_zip  # resume
    tries = 0
    backoff = 1.0
    while tries < max_retries:
        try:
            r = session.get(url, timeout=20)
            if r.status_code == 200 and r.headers.get("Content-Type", "").startswith("application/zip"):
                with open(local_zip, "wb") as f:
                    f.write(r.content)
                return local_zip
            else:
                # Sometimes NSE returns 200 but HTML saying blocked. Check length.
                if r.status_code == 404:
                    # no bhav for weekends/holidays; treat as missing
                    return None
                # else wait and retry
                tries += 1
                time.sleep(backoff)
                backoff *= 2
        except requests.RequestException as e:
            tries += 1
            time.sleep(backoff)
            backoff *= 2
    # final attempt without raising to allow pipeline to continue
    return None

def extract_bhav_zip(zip_path: Path):
    if zip_path is None or not zip_path.exists():
        return None
    with zipfile.ZipFile(zip_path, "r") as z:
        # find the csv file inside
        names = [n for n in z.namelist() if n.lower().endswith(".csv")]
        if not names:
            return None
        data = z.read(names[0])
        # Some NSE bhav files may have header lines or extraneous text; pandas can usually parse them
        df = pd.read_csv(io.BytesIO(data), encoding="utf-8")
        return df

def normalize_bhav_df(df: pd.DataFrame):
    # Keep expected columns and rename to lower case
    if df is None or df.shape[0] == 0:
        return None
    df = df.rename(columns={c: c.strip() for c in df.columns})
    # common columns in bhavcopy: SYMBOL, SERIES, OPEN, HIGH, LOW, CLOSE, LAST, PREVCLOSE, TOTTRDQTY, TOTTRDVAL
    # normalize names
    mapping = {}
    for c in df.columns:
        lc = c.strip().upper()
        if lc in ("SYMBOL",):
            mapping[c] = "symbol"
        elif lc in ("SERIES",):
            mapping[c] = "series"
        elif lc in ("OPEN",):
            mapping[c] = "open"
        elif lc in ("HIGH",):
            mapping[c] = "high"
        elif lc in ("LOW",):
            mapping[c] = "low"
        elif lc in ("CLOSE",):
            mapping[c] = "close"
        elif lc in ("LAST",):
            mapping[c] = "last"
        elif lc in ("PREVCLOSE",):
            mapping[c] = "prev_close"
        elif lc in ("TOTTRDQTY", "TOTALTRadedQuantity".upper()):
            mapping[c] = "volume"
        elif lc in ("TOTTRDVAL", "TOTTRDVAL"):
            mapping[c] = "turnover"
    df = df.rename(columns=mapping)
    # ensure numeric types
    for col in ("open","high","low","close","last","prev_close","volume","turnover"):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    # remove rows with missing symbol or close
    df = df[df["symbol"].notna()]
    # Ensure date column to be added by caller
    return df

def save_parquet(df: pd.DataFrame, out_root: Path, date_col_name="date", prefix="raw"):
    # Partition by year/month (fast querying)
    if df is None or df.shape[0] == 0:
        return
    df = df.copy()
    df[date_col_name] = pd.to_datetime(df[date_col_name])
    df["year"] = df[date_col_name].dt.year
    df["month"] = df[date_col_name].dt.month
    out_dir = out_root / prefix
    out_dir.mkdir(parents=True, exist_ok=True)
    # we will write one file per date for simplicity
    for y, g1 in df.groupby(["year", "month"]):
        year, month = y
        subdir = out_dir / f"{year:04d}" / f"{month:02d}"
        subdir.mkdir(parents=True, exist_ok=True)
    # write parquet partitioning by year/month for all rows
    fp = out_dir / "bhav.parquet"
    # Append mode: if exists, read and append (simple approach)
    if fp.exists():
        existing = pd.read_parquet(fp)
        combined = pd.concat([existing, df], ignore_index=True)
        combined = combined.drop_duplicates(subset=["symbol", date_col_name], keep="last")
        combined.to_parquet(fp, index=False)
    else:
        df.to_parquet(fp, index=False)

# --------- Adjustment logic ----------

def parse_ratio(ratio_text: str):
    # parse "1:5" -> (1,5)
    try:
        left, right = ratio_text.split(":")
        return float(left), float(right)
    except Exception:
        return None

def compute_adjusted_series(raw_df: pd.DataFrame, ca_df: pd.DataFrame):
    """
    raw_df: DataFrame with ['symbol','date','open','high','low','close','prev_close','volume',...]
    ca_df: DataFrame with corporate actions columns: ['symbol','ex_date','type','detail','amount']
    Returns: DataFrame with additional columns: adj_open, adj_high, adj_low, adj_close
    """
    if raw_df is None or raw_df.shape[0] == 0:
        return raw_df
    # ensure types
    raw_df = raw_df.copy()
    raw_df['date'] = pd.to_datetime(raw_df['date'])
    raw_df = raw_df.sort_values(['symbol', 'date']).reset_index(drop=True)
    # prepare corporate actions map
    if ca_df is None or ca_df.shape[0] == 0:
        # nothing to adjust
        for col in ['adj_open','adj_high','adj_low','adj_close']:
            raw_df[col] = raw_df[['open','high','low','close']].min(axis=1) * 0 + raw_df['close']  # simple copy
        raw_df['adj_open'] = raw_df['open']
        raw_df['adj_high'] = raw_df['high']
        raw_df['adj_low'] = raw_df['low']
        raw_df['adj_close'] = raw_df['close']
        return raw_df

    ca_df = ca_df.copy()
    ca_df['ex_date'] = pd.to_datetime(ca_df['ex_date'])
    # normalize types column values
    ca_df['type'] = ca_df['type'].str.lower().str.strip()

    out_rows = []
    symbols = raw_df['symbol'].unique()
    for sym in tqdm(symbols, desc="Adjusting symbols"):
        s_df = raw_df[raw_df['symbol'] == sym].copy().sort_values('date').reset_index(drop=True)
        if s_df.shape[0] == 0:
            continue
        # default multipliers (cumulative)
        s_df['multiplier'] = 1.0

        events = ca_df[ca_df['symbol'] == sym].sort_values('ex_date')
        cum_multiplier = 1.0
        # We'll apply each event sequentially; for each event with ex_date E,
        # multiply all rows with date < E by event_multiplier
        for _, ev in events.iterrows():
            ev_date = pd.to_datetime(ev['ex_date'])
            typ = ev['type']
            detail = str(ev.get('detail','')) if pd.notna(ev.get('detail')) else ""
            amount = ev.get('amount', None)
            event_multiplier = None

            if typ in ('split','bonus'):
                # parse ratio "1:5" meaning 1 old -> 5 new -> factor = old/new = 1/5
                parsed = parse_ratio(detail)
                if parsed is None:
                    print(f"[WARN] Could not parse ratio for {sym} event {ev}. Skipping")
                    continue
                old_shares, new_shares = parsed
                if new_shares == 0:
                    continue
                event_multiplier = (old_shares / new_shares)
            elif typ == 'dividend':
                # need previous close to compute factor: factor = (prev_close - dividend) / prev_close
                # find prev trading day price (last date < ex_date)
                prev_row = s_df[s_df['date'] < ev_date].tail(1)
                if prev_row.shape[0] == 0:
                    # no history before event - skip
                    print(f"[WARN] No prior price for dividend event {sym} {ev_date.date()}, skipping dividend")
                    continue
                prev_close = float(prev_row['close'].values[0])
                div = float(amount) if pd.notna(amount) else 0.0
                if prev_close == 0:
                    print(f"[WARN] Prev close zero for dividend {sym} at {ev_date.date()}. Skipping")
                    continue
                event_multiplier = (prev_close - div) / prev_close
            elif typ == 'rights':
                # detail like "1:4@200" (ratio@price)
                # parse ratio and rights price
                try:
                    if '@' in detail:
                        ratio_part, rprice = detail.split('@')
                        rprice = float(rprice)
                    else:
                        ratio_part = detail
                        rprice = None
                    parsed = parse_ratio(ratio_part)
                    if parsed is None:
                        print(f"[WARN] Could not parse rights ratio for {sym} {detail}")
                        continue
                    offer, base = parsed  # e.g., 1:4
                    # TODO: use TERP formula: TERP = (base * market_price + offer * rights_price) / (base + offer)
                    # We need market price just prior to ex_date:
                    prev_row = s_df[s_df['date'] < ev_date].tail(1)
                    if prev_row.shape[0] == 0:
                        continue
                    prev_close = float(prev_row['close'].values[0])
                    rights_price = rprice if rprice is not None else 0.0
                    terP = (base * prev_close + offer * rights_price) / (base + offer)
                    event_multiplier = terP / prev_close
                except Exception as e:
                    print(f"[WARN] Error parsing rights for {sym} : {e}")
                    continue
            else:
                print(f"[INFO] Unknown corporate action type '{typ}' for {sym}, skipping.")
                continue

            if event_multiplier is None:
                continue
            # apply event multiplier to all rows with date < ev_date
            mask = s_df['date'] < ev_date
            # multiply the current multipliers
            s_df.loc[mask, 'multiplier'] *= event_multiplier

        # after processing events, compute adjusted OHLC by multiplying by multiplier
        for col in ['open','high','low','close']:
            if col in s_df.columns:
                s_df[f'adj_{col}'] = s_df[col] * s_df['multiplier']
            else:
                s_df[f'adj_{col}'] = pd.NA
        out_rows.append(s_df)

    result = pd.concat(out_rows, ignore_index=True) if out_rows else raw_df
    # drop helper multiplier (keep if you want)
    result = result.drop(columns=['multiplier'], errors='ignore')
    # rename adj_close column if exists
    if 'adj_close' not in result.columns and 'adj_close' in result.columns:
        pass
    return result

# ---------- Orchestration ----------
def pipeline(start_date: datetime, end_date: datetime, out_root: Path, corp_actions_csv: Path = None):
    session = nse_session()
    out_root.mkdir(parents=True, exist_ok=True)
    date = start_date
    raw_rows = []
    dates = []
    pbar = tqdm(total=(end_date - start_date).days + 1, desc="Dates")
    while date <= end_date:
        # attempt download; skip weekends (no bhav)
        if date.weekday() >= 5:
            date += timedelta(days=1)
            pbar.update(1)
            continue
        try:
            zip_path = download_bhav_for_date(session, date, out_root / "zips")
            if zip_path:
                df = extract_bhav_zip(zip_path)
                df = normalize_bhav_df(df)
                if df is not None and df.shape[0] > 0:
                    df['date'] = pd.to_datetime(date.strftime("%Y-%m-%d"))
                    raw_rows.append(df)
                    dates.append(date)
            # polite sleep to avoid being blocked
            time.sleep(0.3)
        except Exception as e:
            print(f"[WARN] error at {date}: {e}")
        date += timedelta(days=1)
        pbar.update(1)
    pbar.close()

    if not raw_rows:
        print("[INFO] No data downloaded. Exiting.")
        return

    big = pd.concat(raw_rows, ignore_index=True)
    # ensure basic columns
    for col in ('open','high','low','close','prev_close','volume'):
        if col not in big.columns:
            big[col] = pd.NA

    # save raw parquet
    save_parquet(big, out_root, date_col_name='date', prefix='raw')

    # read corporate actions if provided
    ca_df = None
    if corp_actions_csv is not None and corp_actions_csv.exists():
        ca_df = pd.read_csv(corp_actions_csv)
        # enforce expected columns
        expected = {'symbol','ex_date','type','detail','amount'}
        if not expected.issubset(set(ca_df.columns)):
            print(f"[WARN] corporate_actions.csv should have columns: {expected}. Provided columns: {set(ca_df.columns)}")
    else:
        print("[INFO] No corporate_actions.csv provided; adjusted series will equal raw series.")

    # compute adjusted series
    adjusted = compute_adjusted_series(big, ca_df)
    # save adjusted parquet
    save_parquet(adjusted, out_root, date_col_name='date', prefix='adjusted')
    print("[DONE] Pipeline completed.")

# ---------- CLI ----------
def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--start", required=True, help="start date YYYY-MM-DD")
    p.add_argument("--end", required=True, help="end date YYYY-MM-DD")
    p.add_argument("--out", default="./data", help="output root folder")
    p.add_argument("--corp", default="./corporate_actions.csv", help="corporate actions csv")
    return p.parse_args()

if __name__ == "__main__":
    args = parse_args()
    s = du_parser.parse(args.start)
    e = du_parser.parse(args.end)
    out_root = Path(args.out)
    corp = Path(args.corp) if args.corp else None
    pipeline(s, e, out_root, corp)
