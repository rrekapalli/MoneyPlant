export interface ITileOptions {
  accessor?: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
  description: string;
}
