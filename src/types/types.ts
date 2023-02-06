export class ETHWalletDetalResults {
  eth_balance?: string = '';
  usdt_balance?: string = '';
  usdc_balance?: string = '';
  usdt_received?: string = '';
  usdt_spent?: string = '';
  usdc_received?: string = '';
  usdc_spent?: string = '';

  totalReceive?: string = '';
  totalSpent?: string = '';
  totalBalance?: string;
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
  title = 'BTC Wallet';
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
