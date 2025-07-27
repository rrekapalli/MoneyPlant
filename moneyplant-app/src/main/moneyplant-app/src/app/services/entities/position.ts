export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  entryDate: string;
  pnl: number;
  pnlPercentage: number;
}