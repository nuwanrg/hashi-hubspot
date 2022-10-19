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
  name?: string = null;
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
