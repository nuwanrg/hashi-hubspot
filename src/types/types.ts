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
  walletID?: string = null;
  title: string = 'Wallet Balance';
  objectId?: number = null;
}

export class WalletStatsResponseHub {
  results?: WalletStatsResponse[] = [];
}

export class WalletNFTResponse {
  walletID?: string = '';
  title: string = '';
  objectId?: number = null;
  token_address?: string = '';
  name?: string = '';
  token_uri?: string = '';
  metadata?: string = '';
}

export class WalletNFTResponseHub {
  results?: WalletNFTResponse[] = [];
}
