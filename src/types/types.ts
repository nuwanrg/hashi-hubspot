export class ETHWalletDetalResults {
  eth_balance?: string = '';
  usdt_balance?: string = '0.0 USDT';
  usdc_balance?: string = '0.0 USDC';
  totalReceive?: string = '';
  totalSpent?: string = '';
  title = 'ETH Wallet';
  objectId?: number = null;
}

export class ETHWalletDetals {
  results?: ETHWalletDetalResults[] = [];
}

export class BTCWalletDetals {
  results?: BTCWalletDetalResults[] = [];
}

export class BTCWalletDetalResults {
  btc_balance?: string = '';
  btc_total_received?: string = '';
  btc_n_tx?: string = '';
  btc_total_sent?: string = '';
  title = 'ETH Wallet';
  objectId?: number = null;
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
  symbol?: string;
  value_usd?: string = '';
  created_at?: string = '';
  transaction_hash?: string = '';
  site_link: string = 'http://d2com83m29wuat.cloudfront.net/';
}

export class TokenTransfersHub {
  results?: TokenTransfersResponse[] = [];
}
