
export type Direction = 'BUY' | 'SELL'
export interface Idea {
  id?: string; symbol: string; baseFlag?: string; quoteFlag?: string; direction: Direction;
  entry?: number; currentPrice?: number; stopLoss?: number; takeProfit?: number; ptsDiff?: number;
  note?: string; style?: string; status?: 'ATTIVO' | 'CHIUSO'; author?: string; authorUid?: string;
  createdAt?: any; updatedAt?: any; closedAt?: any; plPts?: number;
}
