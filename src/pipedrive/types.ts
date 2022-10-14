export class Data {
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
  header?: string = 'Wallet Stats';
  id?: number;
}

export class WalletStat {
  data: Data = null;
}

export class Address {
  wallet_address?: string = '0xC9D0Ef45068474DB7A6321848b41265f51fD280A';
}

export class WalletAddress {
  data?: Address = null;
}
