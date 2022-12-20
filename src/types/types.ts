export class WalletStatsResultHub {
  balance_eth?: string = '';
  balance_btc?: string = '';
  btc_total_received?: string = '';
  btc_n_tx?: string = '';
  btc_total_sent?: string = '';
  balance_usd?: string = '';
  totalReceive?: string = '';
  totalSpent?: string = '';
  //title: string = 'Wallet Details';
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
  nft_image: string = '';
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
