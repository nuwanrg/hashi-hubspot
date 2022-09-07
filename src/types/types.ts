export class WalletStatsResponse {
  balance?: string = '';
  balance_usd?: string = '';
  totalReceive?: string = '';
  totalSpent?: string = '';
  totalReceive_usd?: string = '';
  totalSpent_usd?: string = ' ';
  firstBalanceChange?: Date = null;
  firstBalanceChangeHub?: string = '';
  lastBalanceChange?: Date = null;
  lastBalanceChangeHub?: string = '';
  transactionCount?: number = null;
  walletID?: string = null;
  title: string = 'Wallet Balance';
  objectId?: number = null;
}

export class WalletStatsResultHub {
  balance?: string = '';
  balance_usd?: string = '';
  totalReceive?: string = '';
  totalSpent?: string = '';
  totalReceive_usd?: string = '';
  totalSpent_usd?: string = ' ';
  firstBalanceChangeHub?: string = '';
  lastBalanceChangeHub?: string = '';
  transactionCount?: number = null;
  walletID?: string = null;
  title: string = 'Wallet Balance';
  objectId?: number = null;
}

export class WalletStatsResponseHub {
  results?: WalletStatsResultHub[] = [];
}

export class WalletNFTResponse {
  walletID?: string = '';
  title: string = '';
  objectId?: number = null;
  token_address?: string = '';
  name?: string = '';
  token_uri?: string = '';
  metadata?: string = '';
  site_link: string = 'http://d2com83m29wuat.cloudfront.net/';
}

export class WalletNFTResponseHub {
  results?: WalletNFTResponse[] = [];
}

export class TokenTransfersResponse {
  walletID?: string = '';
  title: string = '';
  objectId?: number = null;
  from_address?: string = '';
  to_address?: string = '';
  value?: string = '';
  value_usd?: string = '';
  created_at?: string = '';
  transaction_hash?: string = '';
  site_link: string = 'http://d2com83m29wuat.cloudfront.net/';
}

export class TokenTransfersHub {
  results?: TokenTransfersResponse[] = [];
}
