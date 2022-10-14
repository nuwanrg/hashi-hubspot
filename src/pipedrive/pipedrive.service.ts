import { Injectable, Req } from '@nestjs/common';
import { Address, Data, WalletAddress, WalletStat } from './types';
import { ethers } from 'ethers';
import * as moment from 'moment';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './pipedrive.wallet.entity';

const Moralis = require('moralis/node');

@Injectable()
export class PipedriveService {
  getWallet(req: any): any {
    console.log(`getWallet req`, req);
    let walletAddress: WalletAddress = new WalletAddress();
    let address: Address = new Address();
    walletAddress.data = address;
    return walletAddress;
  }

  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {
    const moralis_serverUrl = process.env.moralis_serverUrl;
    const moralis_appId = process.env.moralis_appId;
    Moralis.start({
      serverUrl: moralis_serverUrl,
      appId: moralis_appId,
    });
  }

  public async create(wallet: Wallet): Promise<any> {
    //let wallet: Wallet = new Wallet();
    return this.walletRepository.save(wallet);
  }

  async getWalletStat(@Req() req, chain: string): Promise<any> {
    let walletStat: WalletStat = new WalletStat();

    let data: Data = new Data();

    const id = req.query.wallet_address;

    const asociatedObjectId = req.query.selectedIds;
    console.log(`Requesting native balance for the wallet ......`);
    console.log(`req.query : `, req.query);

    const options = {
      chain: chain,
      address: id,
      from_block: '0',
    };

    let stats = {
      sent: 0,
      receive: 0,
    };

    // get BSC transfers for a given address
    // with most recent transfers appearing first
    let externalTransactions: string = '';
    let externalReceive = 0;
    let externalSent = 0;
    let externalTransactionCount = 0;

    await axios
      .get(
        `https://api.etherscan.io/api?module=account&action=txlistinternal&address=${id}&startblock=0&endblock=99999999&page=1&sort=desc&apikey=7JADMJRD9WF7M3AR2EYJ99RQ5HW7RUJC6Z`,
      )
      .then(async (d) => {
        //console.log(d.data.result, 'aaa');
        externalTransactions = d.data.result;
      });
    for (const externalTransaction of externalTransactions) {
      // console.log('externalTransaction[from] ', externalTransaction['from']);
      if (externalTransaction['from'].toUpperCase() === id.toUpperCase()) {
        externalSent = externalSent + Number(externalTransaction['value']);
      } else {
        externalReceive = externalSent + Number(externalTransaction['value']);
      }
      externalTransactionCount = externalTransactionCount + 1;
    }

    // console.log('externalReceive ', externalReceive);
    // console.log('externalSent ', externalSent);
    // console.log('externalTransaction ', externalTransactions);
    const transfers = await Moralis.Web3API.account.getTransactions(options);
    let ethSent: number = externalSent;
    let ethReveived: number = externalReceive;
    const usdoptions = {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: chain,
    };
    const price = await Moralis.Web3API.token.getTokenPrice(usdoptions);

    for (const transfer of transfers.result) {
      if (transfer.value !== '0') {
        if (transfer.from_address.toUpperCase() === id.toUpperCase()) {
          ethSent = ethSent + Number(transfer.value);
          if (data.lastBalanceChangeHub == '') {
            data.lastBalanceChangeHub = moment(transfer.block_timestamp)
              .utc()
              .format('YYYY-MM-DD');
          }

          data.firstBalanceChangeHub = moment(transfer.block_timestamp)
            .utc()
            .format('YYYY-MM-DD');
        } else {
          ethReveived = ethReveived + Number(transfer.value);
          if (data.lastBalanceChangeHub == '') {
            data.lastBalanceChangeHub = moment(transfer.block_timestamp)
              .utc()
              .format('YYYY-MM-DD');
          }
          data.firstBalanceChangeHub = moment(transfer.block_timestamp)
            .utc()
            .format('YYYY-MM-DD');
        }
      }
    }
    data.transactionCount = transfers.total + externalTransactionCount;

    const ethVal = ethers.utils.formatEther(ethSent.toString());
    // const externalEthSent = ethers.utils.formatEther(externalSent.toString());
    // const externalEthReceive = ethers.utils.formatEther(
    //   externalReceive.toString(),
    // );

    // console.log('externalEthSent ', externalEthSent);
    // console.log('externalEthReceive ', externalEthReceive);
    data.totalSpent =
      parseFloat(ethVal).toFixed(6) +
      ' ETH  ' +
      (parseFloat(ethVal) * price.usdPrice).toFixed(2) +
      ' USD';

    const ethRec = ethers.utils.formatEther(ethReveived.toString());

    data.totalReceive =
      parseFloat(ethRec).toFixed(6) +
      ' ETH  ' +
      (parseFloat(ethRec) * price.usdPrice).toFixed(2) +
      ' USD';

    //get wallet balance
    const balance = await Moralis.Web3API.account.getNativeBalance(options);
    const ethValue = ethers.utils.formatEther(balance.balance);

    data.balance =
      parseFloat(ethValue).toFixed(6) +
      ' ETH  ' +
      (parseFloat(ethValue) * price.usdPrice).toFixed(2) +
      ' USD';

    //fetch usd price
    // const usdoptions = {
    //   address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    //   chain: chain,
    // };

    // const price = await Moralis.Web3API.token.getTokenPrice(usdoptions);

    data.balance_usd =
      (parseFloat(ethValue) * price.usdPrice).toFixed(2) + ' USD';

    // const balance_rec_usd: number =
    //   this.formatVal(ethRec, 18) * price.usdPrice;
    // console.log(`balance_rec_usd `, balance_rec_usd);

    data.totalReceive_usd =
      (parseFloat(data.totalReceive) * price.usdPrice).toFixed(2) + ' USD';

    data.totalSpent_usd =
      (parseFloat(data.totalSpent) * price.usdPrice).toFixed(2) + ' USD';

    //  this.formatVal(walletStatsResponse.totalSpent, 18) * price.usdPrice;

    data.walletID = id;
    data.id = parseInt(asociatedObjectId);
    walletStat.data = data;

    console.log('walletStat: ', JSON.stringify(walletStat));

    return walletStat;
  }
}
