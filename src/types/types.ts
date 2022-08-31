export class WalletStatsResponse {
  balance?: number = 0;
  balance_usd?: number = 0;
  totalReceive?: number = 0;
  totalSpent?: number = 0;
  totalReceive_usd?: number = 0;
  totalSpent_usd?: number = 0;
  firstBalanceChange?: Date = null;
  lastBalanceChange?: Date = null;
  transactionCount?: number = null;
}

export class WalletStatsResponseHub {
  results?: WalletStatsResponse[] = [];
}
