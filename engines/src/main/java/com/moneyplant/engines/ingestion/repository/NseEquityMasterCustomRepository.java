package com.moneyplant.engines.ingestion.repository;

import com.moneyplant.engines.common.entities.NseEquityMaster;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

/**
 * Custom repository for NSE Equity Master batch operations.
 * Provides high-performance batch upsert functionality.
 * 
 * Requirements: 7.3, 7.6
 */
@Repository
@Slf4j
public class NseEquityMasterCustomRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    public NseEquityMasterCustomRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    
    /**
     * Batch upsert NSE equity master data.
     * Uses PostgreSQL ON CONFLICT clause for efficient upsert operations.
     * 
     * @param masterDataList list of NSE equity master data to upsert
     * @return number of rows affected
     */
    @Transactional
    public int batchUpsert(List<NseEquityMaster> masterDataList) {
        if (masterDataList == null || masterDataList.isEmpty()) {
            log.warn("Attempted to batch upsert empty master data list");
            return 0;
        }
        
        log.info("Batch upserting {} NSE equity master records", masterDataList.size());
        
        String sql = "INSERT INTO nse_eq_master " +
            "(symbol, company_name, industry, sector, basic_industry, isin, series, " +
            "is_fno_sec, is_ca_sec, is_slb_sec, is_debt_sec, is_suspended, is_etf_sec, is_delisted, " +
            "slb_isin, listing_date, is_municipal_bond, is_hybrid_symbol, is_top10, identifier, " +
            "status, last_update_time, pd_sector_pe, pd_symbol_pe, pd_sector_ind, " +
            "board_status, trading_status, trading_segment, session_no, slb, class_of_share, " +
            "derivatives, surveillance_surv, surveillance_desc, face_value, issued_size, " +
            "sdd_auditor, sdd_status, current_market_type, last_price, change, p_change, " +
            "previous_close, open, close, vwap, stock_ind_close_price, lower_cp, upper_cp, " +
            "p_price_band, base_price, intra_day_high_low_min, intra_day_high_low_max, " +
            "intra_day_high_low_value, week_high_low_min, week_high_low_min_date, " +
            "week_high_low_max, week_high_low_max_date, i_nav_value, check_inav, tick_size, " +
            "ieq, macro, ato_buy, ato_sell, iep, total_traded_volume, final_price, " +
            "final_quantity, pre_open_last_update_time, total_buy_quantity, total_sell_quantity, " +
            "ato_buy_qty, ato_sell_qty, pre_open_change, per_change, prev_close) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " +
            "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, " +
            "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
            "ON CONFLICT (symbol) DO UPDATE SET " +
            "company_name = EXCLUDED.company_name, " +
            "industry = EXCLUDED.industry, " +
            "sector = EXCLUDED.sector, " +
            "basic_industry = EXCLUDED.basic_industry, " +
            "isin = EXCLUDED.isin, " +
            "series = EXCLUDED.series, " +
            "is_fno_sec = EXCLUDED.is_fno_sec, " +
            "is_ca_sec = EXCLUDED.is_ca_sec, " +
            "is_slb_sec = EXCLUDED.is_slb_sec, " +
            "is_debt_sec = EXCLUDED.is_debt_sec, " +
            "is_suspended = EXCLUDED.is_suspended, " +
            "is_etf_sec = EXCLUDED.is_etf_sec, " +
            "is_delisted = EXCLUDED.is_delisted, " +
            "slb_isin = EXCLUDED.slb_isin, " +
            "listing_date = EXCLUDED.listing_date, " +
            "is_municipal_bond = EXCLUDED.is_municipal_bond, " +
            "is_hybrid_symbol = EXCLUDED.is_hybrid_symbol, " +
            "is_top10 = EXCLUDED.is_top10, " +
            "identifier = EXCLUDED.identifier, " +
            "status = EXCLUDED.status, " +
            "last_update_time = EXCLUDED.last_update_time, " +
            "pd_sector_pe = EXCLUDED.pd_sector_pe, " +
            "pd_symbol_pe = EXCLUDED.pd_symbol_pe, " +
            "pd_sector_ind = EXCLUDED.pd_sector_ind, " +
            "board_status = EXCLUDED.board_status, " +
            "trading_status = EXCLUDED.trading_status, " +
            "trading_segment = EXCLUDED.trading_segment, " +
            "session_no = EXCLUDED.session_no, " +
            "slb = EXCLUDED.slb, " +
            "class_of_share = EXCLUDED.class_of_share, " +
            "derivatives = EXCLUDED.derivatives, " +
            "surveillance_surv = EXCLUDED.surveillance_surv, " +
            "surveillance_desc = EXCLUDED.surveillance_desc, " +
            "face_value = EXCLUDED.face_value, " +
            "issued_size = EXCLUDED.issued_size, " +
            "sdd_auditor = EXCLUDED.sdd_auditor, " +
            "sdd_status = EXCLUDED.sdd_status, " +
            "current_market_type = EXCLUDED.current_market_type, " +
            "last_price = EXCLUDED.last_price, " +
            "change = EXCLUDED.change, " +
            "p_change = EXCLUDED.p_change, " +
            "previous_close = EXCLUDED.previous_close, " +
            "open = EXCLUDED.open, " +
            "close = EXCLUDED.close, " +
            "vwap = EXCLUDED.vwap, " +
            "stock_ind_close_price = EXCLUDED.stock_ind_close_price, " +
            "lower_cp = EXCLUDED.lower_cp, " +
            "upper_cp = EXCLUDED.upper_cp, " +
            "p_price_band = EXCLUDED.p_price_band, " +
            "base_price = EXCLUDED.base_price, " +
            "intra_day_high_low_min = EXCLUDED.intra_day_high_low_min, " +
            "intra_day_high_low_max = EXCLUDED.intra_day_high_low_max, " +
            "intra_day_high_low_value = EXCLUDED.intra_day_high_low_value, " +
            "week_high_low_min = EXCLUDED.week_high_low_min, " +
            "week_high_low_min_date = EXCLUDED.week_high_low_min_date, " +
            "week_high_low_max = EXCLUDED.week_high_low_max, " +
            "week_high_low_max_date = EXCLUDED.week_high_low_max_date, " +
            "i_nav_value = EXCLUDED.i_nav_value, " +
            "check_inav = EXCLUDED.check_inav, " +
            "tick_size = EXCLUDED.tick_size, " +
            "ieq = EXCLUDED.ieq, " +
            "macro = EXCLUDED.macro, " +
            "ato_buy = EXCLUDED.ato_buy, " +
            "ato_sell = EXCLUDED.ato_sell, " +
            "iep = EXCLUDED.iep, " +
            "total_traded_volume = EXCLUDED.total_traded_volume, " +
            "final_price = EXCLUDED.final_price, " +
            "final_quantity = EXCLUDED.final_quantity, " +
            "pre_open_last_update_time = EXCLUDED.pre_open_last_update_time, " +
            "total_buy_quantity = EXCLUDED.total_buy_quantity, " +
            "total_sell_quantity = EXCLUDED.total_sell_quantity, " +
            "ato_buy_qty = EXCLUDED.ato_buy_qty, " +
            "ato_sell_qty = EXCLUDED.ato_sell_qty, " +
            "pre_open_change = EXCLUDED.pre_open_change, " +
            "per_change = EXCLUDED.per_change, " +
            "prev_close = EXCLUDED.prev_close";
        
        int[] updateCounts = jdbcTemplate.batchUpdate(sql, 
            new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    NseEquityMaster master = masterDataList.get(i);
                    int paramIndex = 1;
                    
                    ps.setString(paramIndex++, master.getSymbol());
                    ps.setString(paramIndex++, master.getCompanyName());
                    ps.setString(paramIndex++, master.getIndustry());
                    ps.setString(paramIndex++, master.getSector());
                    ps.setString(paramIndex++, master.getBasicIndustry());
                    ps.setString(paramIndex++, master.getIsin());
                    ps.setString(paramIndex++, master.getSeries());
                    ps.setString(paramIndex++, master.getIsFnoSec());
                    ps.setString(paramIndex++, master.getIsCaSec());
                    ps.setString(paramIndex++, master.getIsSlbSec());
                    ps.setString(paramIndex++, master.getIsDebtSec());
                    ps.setString(paramIndex++, master.getIsSuspended());
                    ps.setString(paramIndex++, master.getIsEtfSec());
                    ps.setString(paramIndex++, master.getIsDelisted());
                    ps.setString(paramIndex++, master.getSlbIsin());
                    ps.setString(paramIndex++, master.getListingDate());
                    ps.setString(paramIndex++, master.getIsMunicipalBond());
                    ps.setString(paramIndex++, master.getIsHybridSymbol());
                    ps.setString(paramIndex++, master.getIsTop10());
                    ps.setString(paramIndex++, master.getIdentifier());
                    ps.setString(paramIndex++, master.getStatus());
                    ps.setString(paramIndex++, master.getLastUpdateTime());
                    setFloatOrNull(ps, paramIndex++, master.getPdSectorPe());
                    setFloatOrNull(ps, paramIndex++, master.getPdSymbolPe());
                    ps.setString(paramIndex++, master.getPdSectorInd());
                    ps.setString(paramIndex++, master.getBoardStatus());
                    ps.setString(paramIndex++, master.getTradingStatus());
                    ps.setString(paramIndex++, master.getTradingSegment());
                    ps.setString(paramIndex++, master.getSessionNo());
                    ps.setString(paramIndex++, master.getSlb());
                    ps.setString(paramIndex++, master.getClassOfShare());
                    ps.setString(paramIndex++, master.getDerivatives());
                    ps.setString(paramIndex++, master.getSurveillanceSurv());
                    ps.setString(paramIndex++, master.getSurveillanceDesc());
                    setFloatOrNull(ps, paramIndex++, master.getFaceValue());
                    setFloatOrNull(ps, paramIndex++, master.getIssuedSize());
                    ps.setString(paramIndex++, master.getSddAuditor());
                    ps.setString(paramIndex++, master.getSddStatus());
                    ps.setString(paramIndex++, master.getCurrentMarketType());
                    setFloatOrNull(ps, paramIndex++, master.getLastPrice());
                    setFloatOrNull(ps, paramIndex++, master.getChange());
                    setFloatOrNull(ps, paramIndex++, master.getPChange());
                    setFloatOrNull(ps, paramIndex++, master.getPreviousClose());
                    setFloatOrNull(ps, paramIndex++, master.getOpen());
                    setFloatOrNull(ps, paramIndex++, master.getClose());
                    setFloatOrNull(ps, paramIndex++, master.getVwap());
                    setFloatOrNull(ps, paramIndex++, master.getStockIndClosePrice());
                    ps.setString(paramIndex++, master.getLowerCp());
                    ps.setString(paramIndex++, master.getUpperCp());
                    ps.setString(paramIndex++, master.getPPriceBand());
                    setFloatOrNull(ps, paramIndex++, master.getBasePrice());
                    setFloatOrNull(ps, paramIndex++, master.getIntraDayHighLowMin());
                    setFloatOrNull(ps, paramIndex++, master.getIntraDayHighLowMax());
                    setFloatOrNull(ps, paramIndex++, master.getIntraDayHighLowValue());
                    setFloatOrNull(ps, paramIndex++, master.getWeekHighLowMin());
                    ps.setString(paramIndex++, master.getWeekHighLowMinDate());
                    setFloatOrNull(ps, paramIndex++, master.getWeekHighLowMax());
                    ps.setString(paramIndex++, master.getWeekHighLowMaxDate());
                    setFloatOrNull(ps, paramIndex++, master.getINavValue());
                    ps.setString(paramIndex++, master.getCheckInav());
                    setFloatOrNull(ps, paramIndex++, master.getTickSize());
                    ps.setString(paramIndex++, master.getIeq());
                    ps.setString(paramIndex++, master.getMacro());
                    setFloatOrNull(ps, paramIndex++, master.getAtoBuy());
                    setFloatOrNull(ps, paramIndex++, master.getAtoSell());
                    setFloatOrNull(ps, paramIndex++, master.getIep());
                    setFloatOrNull(ps, paramIndex++, master.getTotalTradedVolume());
                    setFloatOrNull(ps, paramIndex++, master.getFinalPrice());
                    setFloatOrNull(ps, paramIndex++, master.getFinalQuantity());
                    ps.setString(paramIndex++, master.getPreOpenLastUpdateTime());
                    setFloatOrNull(ps, paramIndex++, master.getTotalBuyQuantity());
                    setFloatOrNull(ps, paramIndex++, master.getTotalSellQuantity());
                    setFloatOrNull(ps, paramIndex++, master.getAtoBuyQty());
                    setFloatOrNull(ps, paramIndex++, master.getAtoSellQty());
                    setFloatOrNull(ps, paramIndex++, master.getPreOpenChange());
                    setFloatOrNull(ps, paramIndex++, master.getPerChange());
                    setFloatOrNull(ps, paramIndex++, master.getPrevClose());
                }
                
                @Override
                public int getBatchSize() {
                    return masterDataList.size();
                }
            }
        );
        
        int totalAffected = 0;
        for (int count : updateCounts) {
            if (count > 0) {
                totalAffected += count;
            }
        }
        
        log.info("Successfully batch upserted {} NSE equity master records", totalAffected);
        return totalAffected;
    }
    
    /**
     * Helper method to set Float value or NULL
     */
    private void setFloatOrNull(PreparedStatement ps, int paramIndex, Float value) throws SQLException {
        if (value != null) {
            ps.setFloat(paramIndex, value);
        } else {
            ps.setNull(paramIndex, java.sql.Types.REAL);
        }
    }
    
    /**
     * Search symbols by query string, sector, and industry.
     * Searches in symbol, company_name, sector, and industry fields.
     * 
     * @param query search query string
     * @param sector optional sector filter
     * @param industry optional industry filter
     * @param limit maximum number of results
     * @return list of matching symbols
     */
    @Transactional(readOnly = true)
    public List<NseEquityMaster> searchSymbols(String query, String sector, String industry, int limit) {
        StringBuilder sql = new StringBuilder(
            "SELECT * FROM nse_eq_master WHERE trading_status = 'Active' AND ("
        );
        
        sql.append("UPPER(symbol) LIKE UPPER(?) OR UPPER(company_name) LIKE UPPER(?)");
        sql.append(")");
        
        if (sector != null && !sector.trim().isEmpty()) {
            sql.append(" AND UPPER(sector) = UPPER(?)");
        }
        
        if (industry != null && !industry.trim().isEmpty()) {
            sql.append(" AND UPPER(industry) = UPPER(?)");
        }
        
        sql.append(" ORDER BY symbol LIMIT ?");
        
        String searchPattern = "%" + query + "%";
        
        return jdbcTemplate.query(sql.toString(), ps -> {
            int paramIndex = 1;
            ps.setString(paramIndex++, searchPattern);
            ps.setString(paramIndex++, searchPattern);
            
            if (sector != null && !sector.trim().isEmpty()) {
                ps.setString(paramIndex++, sector);
            }
            
            if (industry != null && !industry.trim().isEmpty()) {
                ps.setString(paramIndex++, industry);
            }
            
            ps.setInt(paramIndex, limit);
        }, (rs, rowNum) -> mapRowToNseEquityMaster(rs));
    }
    
    /**
     * Find symbol by exact symbol code.
     * 
     * @param symbol the symbol code
     * @return NseEquityMaster or null if not found
     */
    @Transactional(readOnly = true)
    public NseEquityMaster findBySymbol(String symbol) {
        String sql = "SELECT * FROM nse_eq_master WHERE symbol = ?";
        
        List<NseEquityMaster> results = jdbcTemplate.query(
            sql,
            new Object[]{symbol},
            (rs, rowNum) -> mapRowToNseEquityMaster(rs)
        );
        
        return results.isEmpty() ? null : results.get(0);
    }
    
    /**
     * Find symbols by sector.
     * 
     * @param sector the sector name
     * @param limit maximum number of results
     * @return list of symbols in the sector
     */
    @Transactional(readOnly = true)
    public List<NseEquityMaster> findBySector(String sector, int limit) {
        String sql = "SELECT * FROM nse_eq_master " +
                    "WHERE UPPER(sector) = UPPER(?) AND trading_status = 'Active' " +
                    "ORDER BY symbol LIMIT ?";
        
        return jdbcTemplate.query(
            sql,
            new Object[]{sector, limit},
            (rs, rowNum) -> mapRowToNseEquityMaster(rs)
        );
    }
    
    /**
     * Map ResultSet row to NseEquityMaster entity.
     * Only maps essential fields for API responses.
     */
    private NseEquityMaster mapRowToNseEquityMaster(java.sql.ResultSet rs) throws SQLException {
        NseEquityMaster master = new NseEquityMaster();
        master.setSymbol(rs.getString("symbol"));
        master.setCompanyName(rs.getString("company_name"));
        master.setIndustry(rs.getString("industry"));
        master.setSector(rs.getString("sector"));
        master.setBasicIndustry(rs.getString("basic_industry"));
        master.setIsin(rs.getString("isin"));
        master.setSeries(rs.getString("series"));
        master.setIsFnoSec(rs.getString("is_fno_sec"));
        master.setIsSuspended(rs.getString("is_suspended"));
        master.setIsDelisted(rs.getString("is_delisted"));
        master.setTradingStatus(rs.getString("trading_status"));
        master.setTradingSegment(rs.getString("trading_segment"));
        master.setLastPrice(getFloatOrNull(rs, "last_price"));
        master.setPreviousClose(getFloatOrNull(rs, "previous_close"));
        master.setOpen(getFloatOrNull(rs, "open"));
        master.setClose(getFloatOrNull(rs, "close"));
        master.setVwap(getFloatOrNull(rs, "vwap"));
        master.setTotalTradedVolume(getFloatOrNull(rs, "total_traded_volume"));
        master.setPdSectorPe(getFloatOrNull(rs, "pd_sector_pe"));
        master.setPdSymbolPe(getFloatOrNull(rs, "pd_symbol_pe"));
        master.setPdSectorInd(rs.getString("pd_sector_ind"));
        master.setFaceValue(getFloatOrNull(rs, "face_value"));
        master.setIssuedSize(getFloatOrNull(rs, "issued_size"));
        master.setListingDate(rs.getString("listing_date"));
        master.setLastUpdateTime(rs.getString("last_update_time"));
        return master;
    }
    
    /**
     * Helper method to get Float value or NULL from ResultSet
     */
    private Float getFloatOrNull(java.sql.ResultSet rs, String columnName) throws SQLException {
        float value = rs.getFloat(columnName);
        return rs.wasNull() ? null : value;
    }
}
