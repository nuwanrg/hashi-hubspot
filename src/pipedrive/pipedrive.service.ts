import { Injectable, Req } from '@nestjs/common';
import { Address, Data, WalletAddress, WalletStat } from './types';
import { ethers } from 'ethers';
import * as moment from 'moment';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './pipedrive.wallet.entity';
import {
  TokenTransfersHub,
  TokenTransfersResponse,
  WalletNFTResponse,
  WalletNFTResponseHub,
} from 'src/types/types';
import { ERC20Transactions } from 'src/transaction/erc20Transactions.dto';

const Moralis = require('moralis/node');

@Injectable()
export class PipedriveService {
  getWallet(req?: any): any {
    console.log('Called getWallet req', req);
    let walletAddress: WalletAddress = new WalletAddress();
    let address: Address = new Address();
    walletAddress.data = address;
    return JSON.stringify(walletAddress);
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
    //console.log('Called create wallet', wallet);
    //let wallet: Wallet = new Wallet();
    const walletExists = await this.getWalletAddress(
      wallet.companyId,
      wallet.userId,
      wallet.personId,
    );
    console.log('walletExists :', walletExists);
    if (walletExists === null) {
      this.walletRepository.save(wallet);
    } else {
      (await walletExists).walletAddress = wallet.walletAddress;
      this.walletRepository.update((await walletExists).id, wallet);
    }
    let walletAddress: WalletAddress = this.getWallet();
    return walletAddress;
  }

  async getWalletAddress(
    companyId: number,
    userId: number,
    personId: number,
  ): Promise<Wallet> {
    return this.walletRepository.findOne({
      select: ['id', 'walletAddress', 'userId', 'companyId', 'personId'],
      where: {
        companyId,
        userId,
        personId,
      },
    });
  }

  async getWalletStat(@Req() req, chain: string): Promise<any> {
    //console.log('Called getWalletStat req', req);
    const asociatedObjectId = req.query.selectedIds;
    let walletStat: WalletStat = new WalletStat();
    let data: Data = new Data();
    data.id = parseInt(asociatedObjectId);
    walletStat.data.push(data);

    const wallet = await this.getWalletAddress(
      req.query.companyId,
      req.query.userId,
      req.query.id,
    );
    console.log('wallet : ', wallet);
    let id: string;
    if (wallet !== null && wallet.walletAddress !== null) {
      id = wallet.walletAddress; //.query.wallet_address;
    } else {
      return walletStat;
    }

    //console.log(`Requesting native balance for the wallet ......`);
    //console.log(`req.query : `, req.query);

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

    /*data.balance_usd =
      (parseFloat(ethValue) * price.usdPrice).toFixed(2) + ' USD';
*/
    // const balance_rec_usd: number =
    //   this.formatVal(ethRec, 18) * price.usdPrice;
    // console.log(`balance_rec_usd `, balance_rec_usd);

    /* data.totalReceive_usd =
      (parseFloat(data.totalReceive) * price.usdPrice).toFixed(2) + ' USD';

    data.totalSpent_usd =
      (parseFloat(data.totalSpent) * price.usdPrice).toFixed(2) + ' USD';*/

    //  this.formatVal(walletStatsResponse.totalSpent, 18) * price.usdPrice;

    data.walletID = id;

    //gets nfts

    const nfts = await this.getNFTsHub(id, 'eth');
    for (const nft of nfts.results) {
      let nftdata: Data = new Data();
      nftdata.id = parseInt(asociatedObjectId);
      nftdata.header = 'NFT-' + nft.name;
      nftdata.name = nft.name;
      nftdata.token_address = nft.token_address;
      walletStat.data.push(nftdata);
    }

    //gets transactions

    const transactions = await this.getAssetTransfersHub(id, 'eth', '3');
    for (const transaction of transactions.results) {
      let trxdata: Data = new Data();
      trxdata.id = parseInt(asociatedObjectId);
      trxdata.header = transaction.title;
      trxdata.from_address = transaction.from_address;
      trxdata.to_address = transaction.to_address;
      trxdata.value = transaction.value;
      trxdata.value_usd = transaction.value_usd;
      trxdata.created_at = transaction.created_at;
      trxdata.transaction_hash = transaction.transaction_hash;

      walletStat.data.push(trxdata);
    }

    return walletStat;
  }

  async getAssetTransfersHub(
    id: string,
    chain: string,
    limit: string,
    cursor?: string | number,
  ): Promise<TokenTransfersHub> {
    //let id = req.query.wallet_address;
    if (cursor === '0') {
      cursor = null;
    }

    const options = {
      chain: chain,
      address: id,
      from_block: '0',
      limit: limit,
      cursor: cursor,
    };

    const transactions = await Moralis.Web3API.account.getTokenTransfers(
      options,
    );

    //console.log(transactions);
    const usdoptions = {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: chain,
    };
    const price = await Moralis.Web3API.token.getTokenPrice(usdoptions);

    let transferMetadata: Array<any> = new Array();
    const tokenTransfersHub: TokenTransfersHub = new TokenTransfersHub();
    for (const transfer of transactions.result) {
      console.log('transfer value ', transfer.value);
      console.log('transfer ', transfer);

      let tokenTransfersResponse: TokenTransfersResponse =
        new TokenTransfersResponse();
      tokenTransfersResponse.walletID = id;
      //tokenTransfersResponse.objectId = parseInt(asociatedObjectId);
      tokenTransfersResponse.from_address = transfer.from_address;
      tokenTransfersResponse.to_address = transfer.to_address;
      tokenTransfersResponse.created_at = moment(transfer.block_timestamp)
        .utc()
        .format('YYYY-MM-DD');
      tokenTransfersResponse.transaction_hash =
        'https://etherscan.io/tx/' + transfer.transaction_hash;

      if (transfer.from_address.toUpperCase() == id.toUpperCase()) {
        tokenTransfersResponse.title = 'Outbound Transaction';
      } else {
        tokenTransfersResponse.title = 'Inbound Transaction';
      }
      let token_value = '';
      if (transfer.value !== '0') {
        token_value = transfer.value;
      }

      const ethValue = ethers.utils.formatEther(token_value);
      console.log('ethValue value ', ethValue);
      tokenTransfersResponse.value = parseFloat(ethValue).toFixed(6) + ' ETH';

      tokenTransfersResponse.value_usd =
        (parseFloat(ethValue) * price.usdPrice).toFixed(2) + ' USD';

      const metadata = await this.getTokenMetadata(chain, transfer.address);

      let temp = transfer;
      temp['meta'] = metadata[0];
      transferMetadata.push(metadata);
      tokenTransfersHub.results.push(tokenTransfersResponse);
    }

    let eRC20Transactions: ERC20Transactions = new ERC20Transactions();
    eRC20Transactions.transfers = transactions;
    eRC20Transactions.metadata = transferMetadata;

    console.log('eRC20Transactions: ', JSON.stringify(eRC20Transactions));

    return tokenTransfersHub;
  }

  async getTokenMetadata(chain: string, id: string): Promise<any> {
    const options = {
      chain: chain,
      addresses: [id],
    };
    const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(options);

    return tokenMetadata;
  }

  async getNFTsHub(id: string, chain: string): Promise<WalletNFTResponseHub> {
    //let id = req.query.wallet_address;
    const options = {
      chain: chain,
      address: id,
    };
    const nfts = await Moralis.Web3API.account.getNFTs(options);
    console.log('NFTs results : ', nfts['result']);
    const obj = nfts['result'];

    const walletNFTResponseHub: WalletNFTResponseHub =
      new WalletNFTResponseHub();

    for (var key in obj) {
      console.log(
        'key: ' + key + ', obj[key].token_address: ' + obj[key].token_address,
      );

      let walletNFTResponse: WalletNFTResponse = new WalletNFTResponse();
      walletNFTResponse.walletID = id;
      //walletNFTResponse.objectId = req.query.associatedObjectId;
      walletNFTResponse.title = obj[key].name;
      walletNFTResponse.name = obj[key].name;
      walletNFTResponse.token_address = obj[key].token_address;
      //walletNFTResponse.token_uri = obj[key].token_uri;
      walletNFTResponse.metadata = obj[key].metadata;

      //const metadata=  JSON.parse(data);

      const metadata = JSON.parse(obj[key].metadata);
      console.log('metadata: ', metadata);

      let imgUrl = metadata['image'];

      if (imgUrl.includes('ipfs://')) {
        //let index = str.indexOf("ipfs://")
        imgUrl = imgUrl.substring(imgUrl.indexOf('ipfs://') + 7);
        //index =index+7;
        //const dd = imgUrl.ipfs;
        console.log('imgUrl ', imgUrl);
        imgUrl = 'https://ipfs.io/ipfs/' + imgUrl;
        console.log('imgUrl ', imgUrl);
      }

      walletNFTResponse.token_uri = imgUrl;

      //walletNFTResponse.=nfts['result'];

      walletNFTResponseHub.results.push(walletNFTResponse);
    }

    return walletNFTResponseHub;
    //return JSON.stringify(nfts);
  }
}
