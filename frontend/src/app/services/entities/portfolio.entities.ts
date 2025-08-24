export interface PortfolioDto {
  id: number;
  name: string;
  description: string;
  baseCurrency: string;
  inceptionDate: string;
  riskProfile: string;
  isActive: boolean;
}

export interface PortfolioCreateRequest {
  name: string;
  description: string;
  baseCurrency: string;
  inceptionDate: string;
  riskProfile: string;
  isActive: boolean;
}

export interface PortfolioUpdateRequest {
  name: string;
  description: string;
  baseCurrency: string;
  inceptionDate: string;
  riskProfile: string;
  isActive: boolean;
}

export interface PortfolioPatchRequest {
  name?: string;
  description?: string;
  baseCurrency?: string;
  inceptionDate?: string;
  riskProfile?: string;
  isActive?: boolean;
}

export interface PortfolioMetricsDailyDto {
  id: number;
  portfolioId: number;
  date: string;
  nav: number;
  twrDailyPct: number;
  twrCumulativePct: number;
  mwrCumulativePct: number;
  irrToDatePct: number;
  irrAnnualizedPct: number;
  xirrToDatePct: number;
  xirrAnnualizedPct: number;
  cagrPct: number;
  ytdReturnPct: number;
  return1mPct: number;
  return3mPct: number;
  return6mPct: number;
  return1yPct: number;
  return3yAnnualizedPct: number;
  return5yAnnualizedPct: number;
  drawdownPct: number;
  maxDrawdownPct: number;
  volatility30dPct: number;
  volatility90dPct: number;
  downsideDeviation30dPct: number;
  sharpe30d: number;
  sortino30d: number;
  calmar1y: number;
  treynor30d: number;
  beta30d: number;
  alpha30d: number;
  trackingError30d: number;
  informationRatio30d: number;
  var9530d: number;
  cvar9530d: number;
  upsideCapture1y: number;
  downsideCapture1y: number;
  activeReturn30dPct: number;
}

export interface PortfolioHoldingDto {
  id: number;
  portfolioId: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  lastUpdated: string;
}

export interface PortfolioTransactionDto {
  id: number;
  portfolioId: number;
  symbol: string;
  transactionType: string;
  quantity: number;
  price: number;
  transactionDate: string;
  fees: number;
  notes: string;
}

export interface PortfolioCashFlowDto {
  id: number;
  portfolioId: number;
  date: string;
  type: string;
  amount: number;
  description: string;
}

export interface PortfolioValuationDailyDto {
  id: number;
  portfolioId: number;
  date: string;
  totalValue: number;
  cashValue: number;
  investmentValue: number;
  totalReturn: number;
  totalReturnPct: number;
  dailyReturn: number;
  dailyReturnPct: number;
  lastUpdated: string;
}

export interface PortfolioBenchmarkDto {
  id: number;
  portfolioId: number;
  benchmarkSymbol: string;
  benchmarkName: string;
  correlation: number;
  trackingError: number;
  informationRatio: number;
}
