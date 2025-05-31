import { Holding } from './holding';

export interface HoldingGroup {
  id: string;
  name: string;
  description: string;
  totalValue: number;
  dailyChange: number;
  holdings: Holding[];
}