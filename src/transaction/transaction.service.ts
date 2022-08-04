import {
  createAlchemyWeb3,
  AssetTransfersCategory,
  AssetTransfersResponse,
  AssetTransfersOrder,
} from '@alch/alchemy-web3';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ethers } from 'ethers';
import { TokenBalanceDto } from './tokenBalance.dto';
import { ERC20Transactions } from './erc20Transactions.dto';
const Moralis = require('moralis/node');

let chains = new Map<string, string>([
  ['eth', 'value1'],
  ['bsc', 'value2'],
]);

@Injectable()
export class TransactionService {
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
    // Initialize an alchemy-web3 instance:
    /*  const web3 = createAlchemyWeb3(process.env.ALCHEMY_RPC_URL);

    const nfts = await web3.alchemy.getNfts({
      owner: id,
    });

    console.log(nfts);
*/

    const options = {
      chain: chain,
      address: id,
    };
    const nfts = await Moralis.Web3API.account.getNFTs(options);
    console.log('NFTs : ', nfts);

    return JSON.stringify(nfts);
  }

  async getTokenMetadata(chain: string, id: string): Promise<any> {
    // const moralis_serverUrl = process.env.moralis_serverUrl;
    // const moralis_appId = process.env.moralis_appId;

    // await Moralis.start({
    //   serverUrl: moralis_serverUrl,
    //   appId: moralis_appId,
    // });

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

  async getNativeBalance(chain: string, id: string): Promise<String> {
    console.log(`Requesting native balance for the wallet ${id} ......`);
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
    const balance = await Moralis.Web3API.account.getNativeBalance(options);
    return balance;
  }
}
