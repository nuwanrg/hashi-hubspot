import { Injectable, Req } from '@nestjs/common';
import axios from 'axios';
import { ethers } from 'ethers';
import { ERC20Transactions } from './erc20Transactions.dto';
import * as moment from 'moment';
import {
  TokenTransfersHub,
  TokenTransfersResponse,
  WalletNFTResponse,
  WalletNFTResponseHub,
  WalletStatsResponse,
  WalletStatsResponseHub,
  WalletStatsResultHub,
} from 'src/types/types';
const Moralis = require('moralis/node');

let chains = new Map<string, string>([
  ['eth', 'value1'],
  ['bsc', 'value2'],
]);

@Injectable()
export class TransactionService {
  //stats: any;
  constructor() {
    const moralis_serverUrl = process.env.moralis_serverUrl;
    const moralis_appId = process.env.moralis_appId;
    Moralis.start({
      serverUrl: moralis_serverUrl,
      appId: moralis_appId,
    });
  }

  async getTransactionHistory(id: string, count: string): Promise<any> {
    console.log(
      `Requesting ${count} of latest transactions from the wallet ${id} ......`,
    );
    let provider = new ethers.providers.EtherscanProvider(
      process.env.NETWORK,
      process.env.API_KEY,
    );

    let transactions = await provider.getHistory(id);

    //transactions.forEach(async (value, index) => {
    let transactionReceipt = await provider.getTransaction(
      '0xa5110e71657c8b3ae395303ed54f4b9cbf587ab1c6a8e81eb5f0abb5d9e7f010',
    );
    console.log('transactionReceipt', transactionReceipt);
    //});

    // console.log(transactions);

    return transactions;
  }

  async getNFTs(chain: string, id: string): Promise<any> {
    const options = {
      chain: chain,
      address: id,
    };
    const nfts = await Moralis.Web3API.account.getNFTs(options);
    console.log('NFTs : ', nfts);

    return JSON.stringify(nfts);
  }

  async getTokenMetadata(chain: string, id: string): Promise<any> {
    const options = {
      chain: chain,
      addresses: [id],
    };
    const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(options);

    return tokenMetadata;
  }

  async getTokenBalances(chain: string, id: string): Promise<any> {
    const contract_addresses = JSON.parse(process.env.CONTRACT_ADDRESSES);
    console.log('contract_addresses ', contract_addresses);
    // const moralis_serverUrl = process.env.moralis_serverUrl;
    // const moralis_appId = process.env.moralis_appId;

    // await Moralis.start({
    //   serverUrl: moralis_serverUrl,
    //   appId: moralis_appId,
    // });

    const options = {
      chain: chain,
      address: id,
    };
    const balances = await Moralis.Web3API.account.getTokenBalances(options);

    console.log('balances ', balances);

    return balances;
  }

  async getAssetTransfers(
    chain: string,
    id: string,
    limit: string,
    cursor?: string | number,
  ): Promise<any> {
    //moraliz api key rcgt9o9fPORVL4fZvDR8i9by5khR8HZRrTyBMhfdMxQ09gWCpmMuCiznTpMb8DSD

    // const moralis_serverUrl = process.env.moralis_serverUrl;
    // const moralis_appId = process.env.moralis_appId;

    // await Moralis.start({
    //   serverUrl: moralis_serverUrl,
    //   appId: moralis_appId,
    // });

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

    // const transactions = await Moralis.Web3API.account.getTransactions({
    //   chain: chain,
    //   address: id,
    //   from_block: '0',
    //   limit: limit,
    //   cursor: cursor,
    // });

    const transactions = await Moralis.Web3API.account.getTokenTransfers(
      options,
    );

    //console.log(transactions);
    let transferMetadata: Array<any> = new Array();
    for (const transfer of transactions.result) {
      const metadata = await this.getTokenMetadata(chain, transfer.address);

      let temp = transfer;
      temp['meta'] = metadata[0];
      transferMetadata.push(metadata);
      //console.log('transferMetadata: ', transferMetadata);
    }

    let eRC20Transactions: ERC20Transactions = new ERC20Transactions();
    eRC20Transactions.transfers = transactions;
    eRC20Transactions.metadata = transferMetadata;

    console.log('eRC20Transactions: ', JSON.stringify(eRC20Transactions));

    return eRC20Transactions;
  }

  /*   async getAssetTransfers(id: string): Promise<any> {
    // Replace with your Alchemy api key:
    //const apiKey = '9VwBM-ZeGsWH7Qghe6CUed0XMStv8Hm2';

    // Initialize an alchemy-web3 instance:
    // const web3 = createAlchemyWeb3(
    //   `https://eth-goerli.alchemyapi.io/v2/${apiKey}`,
    // );

    var data = JSON.stringify({
      jsonrpc: '2.0',
      id: 0,
      method: 'alchemy_getAssetTransfers',
      params: [
        {
          fromBlock: '0x0',
          //"toBlock": "0xA97CAC",
          fromAddress: id,
          //contractAddresses: [id],
          //maxCount: '0x20',
          excludeZeroValue: false,
          category: ['ERC20'],
          withMetadata: true,
        },
      ],
    });
    var config = {
      method: 'post',
      url: process.env.ALCHEMY_RPC_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: data,
    };

    let transfers;
    await axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        transfers = JSON.stringify(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });

    return transfers;
    // const data = await web3.alchemy.getAssetTransfers({
    //   fromBlock: '0x0',
    //   //order: AssetTransfersOrder.DESCENDING,
    //   fromAddress: id,
    //   maxCount: 10,
    //   category: [
    //     AssetTransfersCategory.EXTERNAL,
    //     AssetTransfersCategory.INTERNAL,
    //     AssetTransfersCategory.ERC20,
    //   ],
    // });

    // // Print response:
    // console.log(data);
    // return data;
  } */

  async getETHBalance(chain: string, id: string): Promise<String> {
    console.log(`Requesting balance for the wallet ${id} ......`);

    // const provider = new ethers.providers.JsonRpcProvider(
    //   'https://goerli.prylabs.net/',
    // );
    console.log(process.env.rpcURL);
    const provider = new ethers.providers.JsonRpcProvider(process.env.rpcURL);

    const balance: ethers.BigNumber = await provider.getBalance(id);

    console.log(
      `Balance of the wallet ${id} is `,
      ethers.utils.formatEther(balance),
    );
    return ethers.utils.formatEther(balance);
  }

  async getNativeBalance(
    chain: string,
    id: string,
  ): Promise<WalletStatsResponse> {
    console.log(`Requesting native balance for the wallet ${id} ......`);
    // const moralis_serverUrl = process.env.moralis_serverUrl;
    // const moralis_appId = process.env.moralis_appId;

    // await Moralis.start({
    //   serverUrl: moralis_serverUrl,
    //   appId: moralis_appId,
    // });

    // export class WalletStatsResponse {
    //   balance?: number = 0;
    //   totalReceive?: number = 0;
    //   totalSpent?: number = 0;
    //   firstBalanceChange?: Date = null;
    //   lastBalanceChange?: Date = null;
    //   transactionCount?: number = null;
    // }

    let walletStatsResponse: WalletStatsResponse = new WalletStatsResponse();

    const options = {
      chain: chain,
      address: id,
      from_block: '0',
    };

    let stats = {
      sent: 0,
      receive: 0,
    };

    const transfers = await Moralis.Web3API.account.getTransactions(options);
    let ethSent: number = 0;
    let ethReveived: number = 0;
    for (const transfer of transfers.result) {
      if (transfer.value !== '0') {
        if (transfer.from_address.toUpperCase() === id.toUpperCase()) {
          ethSent = ethSent + Number(transfer.value);
          if (walletStatsResponse.lastBalanceChange == null) {
            walletStatsResponse.lastBalanceChange = transfer.block_timestamp;
          }

          walletStatsResponse.firstBalanceChange = transfer.block_timestamp;
        } else {
          ethReveived = ethReveived + Number(transfer.value);
          if (walletStatsResponse.lastBalanceChange == null) {
            walletStatsResponse.lastBalanceChange = transfer.block_timestamp;
          }
          walletStatsResponse.firstBalanceChange = transfer.block_timestamp;
        }
      }
    }
    walletStatsResponse.transactionCount = transfers.total;
    walletStatsResponse.totalSpent = ethSent.toString();
    walletStatsResponse.totalReceive = ethReveived.toString();

    const balance = await Moralis.Web3API.account.getNativeBalance(options);
    walletStatsResponse.balance = balance.balance;

    //fetch usd price

    const usdoptions = {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: chain,
    };

    if (chain === 'eth') {
      const price = await Moralis.Web3API.token.getTokenPrice(usdoptions);
      walletStatsResponse.balance_usd = (
        this.formatVal(walletStatsResponse.balance, 18) * price.usdPrice
      ).toString();

      walletStatsResponse.totalReceive_usd = (
        this.formatVal(walletStatsResponse.totalReceive, 18) * price.usdPrice
      ).toString();

      walletStatsResponse.totalSpent_usd = (
        this.formatVal(walletStatsResponse.totalSpent, 18) * price.usdPrice
      ).toString();
    }

    return walletStatsResponse;
  }

  formatVal(e, decimals) {
    let divisor = 10 ** decimals;
    return e / divisor;
  }

  async getAllTransfers(chain: string, id: string): Promise<any> {
    const options = {
      chain: chain,
      address: id,
      from_block: '0',
    };

    let stats = {
      sent: 0,
      receive: 0,
    };

    const transfers = await Moralis.Web3API.account.getTransactions(options);
    let ethSent: number = 0;
    let ethReveived: number = 0;

    for (const transfer of transfers.result) {
      if (transfer.from_address == id) {
        ethSent = ethSent + Number(transfer.value);
      } else {
        ethReveived = ethReveived + Number(transfer.value);
      }
    }
    //convert to usdt
    stats.sent = ethSent;
    stats.receive = ethReveived;

    console.log('stats ', JSON.stringify(stats));
    return stats;
  }

  async getNativeBalanceHub(
    @Req() req,
    chain: string,
  ): Promise<WalletStatsResponseHub> {
    let id = req.query.wallet_address;
    let objectId = req.query.associatedObjectId;
    console.log(`Requesting native balance for the wallet ${id} ......`);

    let walletStatsResultHub: WalletStatsResultHub = new WalletStatsResultHub();

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
      console.log('externalTransaction[from] ', externalTransaction['from']);
      if (externalTransaction['from'].toUpperCase() === id.toUpperCase()) {
        externalSent = externalSent + Number(externalTransaction['value']);
      } else {
        externalReceive = externalSent + Number(externalTransaction['value']);
      }
      externalTransactionCount = externalTransactionCount + 1;
    }

    console.log('externalReceive ', externalReceive);
    console.log('externalSent ', externalSent);
    console.log('externalTransaction ', externalTransactions);
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
          if (walletStatsResultHub.lastBalanceChangeHub == '') {
            walletStatsResultHub.lastBalanceChangeHub = moment(
              transfer.block_timestamp,
            )
              .utc()
              .format('YYYY-MM-DD');
          }

          walletStatsResultHub.firstBalanceChangeHub = moment(
            transfer.block_timestamp,
          )
            .utc()
            .format('YYYY-MM-DD');
        } else {
          ethReveived = ethReveived + Number(transfer.value);
          if (walletStatsResultHub.lastBalanceChangeHub == '') {
            walletStatsResultHub.lastBalanceChangeHub = moment(
              transfer.block_timestamp,
            )
              .utc()
              .format('YYYY-MM-DD');
          }
          walletStatsResultHub.firstBalanceChangeHub = moment(
            transfer.block_timestamp,
          )
            .utc()
            .format('YYYY-MM-DD');
        }
      }
    }
    walletStatsResultHub.transactionCount =
      transfers.total + externalTransactionCount;

    const ethVal = ethers.utils.formatEther(ethSent.toString());
    // const externalEthSent = ethers.utils.formatEther(externalSent.toString());
    // const externalEthReceive = ethers.utils.formatEther(
    //   externalReceive.toString(),
    // );

    // console.log('externalEthSent ', externalEthSent);
    // console.log('externalEthReceive ', externalEthReceive);
    walletStatsResultHub.totalSpent =
      parseFloat(ethVal).toFixed(6) +
      ' ETH  ' +
      (parseFloat(ethVal) * price.usdPrice).toFixed(2) +
      ' USD';

    const ethRec = ethers.utils.formatEther(ethReveived.toString());

    walletStatsResultHub.totalReceive =
      parseFloat(ethRec).toFixed(6) +
      ' ETH  ' +
      (parseFloat(ethRec) * price.usdPrice).toFixed(2) +
      ' USD';

    //get wallet balance
    const balance = await Moralis.Web3API.account.getNativeBalance(options);
    const ethValue = ethers.utils.formatEther(balance.balance);

    walletStatsResultHub.balance =
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

    walletStatsResultHub.balance_usd =
      (parseFloat(ethValue) * price.usdPrice).toFixed(2) + ' USD';

    // const balance_rec_usd: number =
    //   this.formatVal(ethRec, 18) * price.usdPrice;
    // console.log(`balance_rec_usd `, balance_rec_usd);

    walletStatsResultHub.totalReceive_usd =
      (parseFloat(walletStatsResultHub.totalReceive) * price.usdPrice).toFixed(
        2,
      ) + ' USD';

    walletStatsResultHub.totalSpent_usd =
      (parseFloat(walletStatsResultHub.totalSpent) * price.usdPrice).toFixed(
        2,
      ) + ' USD';

    //  this.formatVal(walletStatsResponse.totalSpent, 18) * price.usdPrice;

    walletStatsResultHub.walletID = id;
    walletStatsResultHub.objectId = objectId;
    const walletStatsResponseHub: WalletStatsResponseHub =
      new WalletStatsResponseHub();
    walletStatsResponseHub.results.push(walletStatsResultHub);
    return walletStatsResponseHub;
  }

  async getNFTsHub(@Req() req, chain: string): Promise<WalletNFTResponseHub> {
    let id = req.query.wallet_address;
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
      walletNFTResponse.objectId = req.query.associatedObjectId;
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

  async getAssetTransfersHub(
    @Req() req,
    chain: string,
    limit: string,
    cursor?: string | number,
  ): Promise<TokenTransfersHub> {
    let id = req.query.wallet_address;
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
      tokenTransfersResponse.objectId = req.query.associatedObjectId;
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
}