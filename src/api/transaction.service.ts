import { ForbiddenException, Injectable, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import { ERC20Transactions } from './erc20Transactions.dto';
import * as moment from 'moment';
import {
  TokenTransfersHub,
  TokenTransfersResponse,
  WalletNFTResponse,
  WalletNFTResponseHub,
  WalletStatsResponseHub,
  WalletStatsResultHub,
} from 'src/types/types';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import { map, catchError } from 'rxjs';
var sb = require('satoshi-bitcoin');

const startServer = async () => {
  await Moralis.start({
    //serverUrl: 'https://shzzwqifgpc8.usemoralis.com:2053/server',
    apiKey: 'rcgt9o9fPORVL4fZvDR8i9by5khR8HZRrTyBMhfdMxQ09gWCpmMuCiznTpMb8DSD',
  });
};
//startServer();

@Injectable()
export class TransactionService {
  constructor(private readonly httpService: HttpService) {
    this.startMoralisServer();
  }

  //Start Morali SDK
  async startMoralisServer() {
    const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

    console.log('Starting Moralis...', MORALIS_API_KEY);
    await Moralis.start({
      apiKey: MORALIS_API_KEY,
    });
  }

  async getTokenMetadata(chain: string, id: string): Promise<any> {
    const options = {
      chain: chain,
      addresses: [id],
    };
    const tokenMetadata = await Moralis.EvmApi.token.getTokenMetadata(options);

    return tokenMetadata;
  }

  /*
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
    const balances = await Moralis.EvmApi.token.getTokenBalances(options);

    console.log('balances ', balances);

    return balances;
  }*/

  /*
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

    // const transactions = await Moralis.EvmApi.account.getTransactions({
    //   chain: chain,
    //   address: id,
    //   from_block: '0',
    //   limit: limit,
    //   cursor: cursor,
    // });

    const transactions = await Moralis.EvmApi.account.getTokenTransfers(
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

  formatVal(e, decimals) {
    let divisor = 10 ** decimals;
    return e / divisor;
  }
  /*
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

    const transfers = await Moralis.EvmApi.account.getTransactions(options);
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
*/

  async getBitcoinWallet(btc_address): Promise<AxiosResponse> {
    console.log('BTC Address : ', btc_address);
    return this.httpService.axiosRef.get(
      `https://blockchain.info/rawaddr/${btc_address}?limit=5`,
    );
  }

  async getBTCWalletBalance(@Req() req): Promise<WalletStatsResponseHub> {
    let walletStatsResultHub: WalletStatsResultHub = new WalletStatsResultHub();
    walletStatsResultHub.title = 'BTC Wallet';

    const btc_address = req.query.btc_address;
    const objectId = req.query.associatedObjectId;

    //BTC balance
    const btcwallet = await this.getBitcoinWallet(btc_address);
    /*this.httpService.get(
      'https://blockchain.info/rawaddr/bc1qevr4wsp5kr4dmha20c6klnce262yxt34el9u6w',
    );*/
    console.log('btcresponse : ', btcwallet.data);
    walletStatsResultHub.balance_btc =
      sb.toBitcoin(btcwallet.data.final_balance) + ' BTC';
    walletStatsResultHub.btc_n_tx = btcwallet.data.n_tx.toString();
    walletStatsResultHub.btc_total_received =
      btcwallet.data.total_received.toString();
    walletStatsResultHub.btc_total_sent = btcwallet.data.total_sent.toString();
    walletStatsResultHub.objectId = objectId;
    const walletStatsResponseHub: WalletStatsResponseHub =
      new WalletStatsResponseHub();
    walletStatsResponseHub.results.push(walletStatsResultHub);
    return walletStatsResponseHub;
  }

  async getWalletBalance(@Req() req): Promise<WalletStatsResponseHub> {
    let walletStatsResultHub: WalletStatsResultHub = new WalletStatsResultHub();

    const address = req.query.eth_address;
    const btc_address = req.query.btc_address;
    const objectId = req.query.associatedObjectId;
    const chain = EvmChain.GOERLI;

    const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain,
    });
    console.log('Eth(Native) Balance : ', nativeBalance.raw.balance);
    let balance: number = parseFloat(
      ethers.utils.formatEther(nativeBalance.raw.balance),
    );
    walletStatsResultHub.balance_eth = balance.toFixed(5) + ' ETH';

    /*const tokenBalances = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain,
    });*/

    //BTC balance
    const btcwallet = await this.getBitcoinWallet(btc_address);
    /*this.httpService.get(
      'https://blockchain.info/rawaddr/bc1qevr4wsp5kr4dmha20c6klnce262yxt34el9u6w',
    );*/
    console.log('btcresponse : ', btcwallet.data);
    walletStatsResultHub.balance_btc =
      sb.toBitcoin(btcwallet.data.final_balance) + ' BTC';
    walletStatsResultHub.btc_n_tx = btcwallet.data.n_tx.toString();
    walletStatsResultHub.btc_total_received =
      btcwallet.data.total_received.toString();
    walletStatsResultHub.btc_total_sent = btcwallet.data.total_sent.toString();

    /*
    let id = req.query.wallet_address;
    let objectId = req.query.associatedObjectId;
    console.log(`Requesting native balance for the wallet ${id} ......`);



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


    const transfers = await Moralis.EvmApi.account.getTransactions(options);
    let ethSent: number = externalSent;
    let ethReveived: number = externalReceive;
    const usdoptions = {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: chain,
    };
    const price = await Moralis.EvmApi.token.getTokenPrice(usdoptions);

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
    const balance = await Moralis.EvmApi.account.getNativeBalance(options);
    const ethValue = ethers.utils.formatEther(balance.balance);

    walletStatsResultHub.balance =
      parseFloat(ethValue).toFixed(6) +
      ' ETH  ' +
      (parseFloat(ethValue) * price.usdPrice).toFixed(2) +
      ' USD';



    walletStatsResultHub.balance_usd =
      (parseFloat(ethValue) * price.usdPrice).toFixed(2) + ' USD';


    walletStatsResultHub.totalReceive_usd =
      (parseFloat(walletStatsResultHub.totalReceive) * price.usdPrice).toFixed(
        2,
      ) + ' USD';

    walletStatsResultHub.totalSpent_usd =
      (parseFloat(walletStatsResultHub.totalSpent) * price.usdPrice).toFixed(
        2,
      ) + ' USD';



    walletStatsResultHub.walletID = id;*/
    walletStatsResultHub.objectId = objectId;
    const walletStatsResponseHub: WalletStatsResponseHub =
      new WalletStatsResponseHub();
    walletStatsResponseHub.results.push(walletStatsResultHub);
    return walletStatsResponseHub;
  }

  /*async getNFTsHub(@Req() req, chain: string): Promise<WalletNFTResponseHub> {
    let id = req.query.wallet_address;
    const options = {
      chain: chain,
      address: id,
    };
    const nfts = await Moralis.EvmApi.account.getNFTs(options);
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

    const transactions = await Moralis.EvmApi.account.getTokenTransfers(
      options,
    );

    //console.log(transactions);
    const usdoptions = {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: chain,
    };
    const price = await Moralis.EvmApi.token.getTokenPrice(usdoptions);

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
  }*/
}
