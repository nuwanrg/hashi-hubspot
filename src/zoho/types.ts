export class Data {
  balance?: string = null;
  //balance_usd?: string = null;
  totalReceive?: string = null;
  totalSpent?: string = null;
  //totalReceive_usd?: string = null;
  //totalSpent_usd?: string = null;
  firstBalanceChangeHub?: string = null;
  lastBalanceChangeHub?: string = null;
  transactionCount?: number = null;
  walletID?: string = null;
  header = 'Wallet Stats';
  id: number;

  //nft
  name?: string = null;
  token_address?: string = null;

  //trx
  from_address?: string = null;
  to_address?: string = null;
  value?: string = null;
  value_usd?: string = null;
  created_at?: string = null;
  transaction_hash?: string = null;
}

export class WalletStat {
  data?: Data[] = [];
}

export class Address {
  //wallet_address?: string = '';
}

export class WalletAddress {
  data?: Address = null;
}

export class ZohoWallet {
  userId: string;

  companyId: string;

  personId: string;

  platformId: string;
}
