// types/index.ts
export interface Trade {
  id: number;
  dateEntry: string;
  dateExit: string;
  instrument: string;
  position: 'Long' | 'Short';
  entry: number;
  exit: number;
  lot: number;
  fees: number;
  pnl: number;
  rate: number;
  result: 'Win' | 'Loss';
}