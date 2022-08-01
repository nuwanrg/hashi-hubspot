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
const Moralis = require('moralis/node');

@Injectable()
export class TransactionService {
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

  async getNFTs(id: string): Promise<any> {
    // Initialize an alchemy-web3 instance:
    const web3 = createAlchemyWeb3(process.env.ALCHEMY_RPC_URL);

    const nfts = await web3.alchemy.getNfts({
      owner: id,
    });

    console.log(nfts);

    return nfts;
  }

  async getTokenBalances(id: string): Promise<any> {
    // // const axios = require('axios')

    // // Wallet address
    // const address = '0x48f1af5164d19200924ec1ee9a38b6894ba59a98';

    // // Alchemy URL
    // const baseURL =
    //   'https://eth-goerli.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY;

    // const data = JSON.stringify({
    //   jsonrpc: '2.0',
    //   method: 'alchemy_getTokenBalances',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   params: [`${address}`, 'DEFAULT_TOKENS'],
    //   id: 42,
    // });

    // const config = {
    //   method: 'post',
    //   url: baseURL,
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   data: data,
    // };

    // // Make the request and print the formatted response:
    // axios(config)
    //   .then((response) => {
    //     // Get balances
    //     const balances = response['data']['result'];
    //     console.log('balances ', balances);

    //     let balance = balances.tokenBalances[0].tokenBalance / Math.pow(10, 10);
    //     console.log('balance :', balance);

    //     // Remove tokens with zero balance
    //     const nonZeroBalances = balances['tokenBalances'].filter((token) => {
    //       return token['tokenBalance'] !== '0';
    //     });

    //     console.log(`Token balances of ${address} \n`);

    //     // Counter for SNo of final output
    //     let i = 1;

    //     // Loop through all tokens with non-zero balance
    //     for (const token of nonZeroBalances) {
    //       // Get balance of token
    //       let balance = token['tokenBalance'];

    //       const metadataParams = JSON.stringify({
    //         jsonrpc: '2.0',
    //         method: 'alchemy_getTokenMetadata',
    //         params: [`${token['contractAddress']}`],
    //         id: 42,
    //       });

    //       const metadataConfig = {
    //         method: 'post',
    //         url: baseURL,
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         data: metadataParams,
    //       };

    //       // Get metadata of token
    //       axios(config)
    //         .then((metadata) => {
    //           // Compute token balance in human-readable format
    //           balance = balance / Math.pow(10, metadata['decimals']);
    //           balance = balance.toFixed(2);

    //           // Print name, balance, and symbol of token
    //           console.log(`${i++}. ${metadata['name']}: ${balance}
    //              ${metadata['symbol']}`);
    //         })
    //         .catch((error) => console.log('error', error));
    //     }
    //   })
    //   .catch((error) => console.log('error', error));
    // return null;

    const web3 = createAlchemyWeb3(process.env.ALCHEMY_RPC_URL);

    // const contract_addresses = [
    //   '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D',
    //   '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
    //   '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60',
    //   '0x07865c6E87B9F70255377e024ace6630C1Eaa37F',
    //   '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
    // ];
    const contract_addresses = JSON.parse(process.env.CONTRACT_ADDRESSES);
    console.log('contract_addresses ', contract_addresses);
    const balances = await web3.alchemy.getTokenBalances(
      id,
      contract_addresses,
    );

    console.log('balances ', balances);
    console.log('=================');
    let tokenBalanceDtos: Array<TokenBalanceDto> = new Array();
    for (let balanceObj of balances.tokenBalances) {
      console.log(balanceObj);

      let tokenBalanceDto: TokenBalanceDto = new TokenBalanceDto();
      tokenBalanceDto.tokenBalance = balanceObj;

      const metadata = await web3.alchemy.getTokenMetadata(
        balanceObj.contractAddress,
      );
      tokenBalanceDto.tokenMetadataResponse = metadata;
      console.log(balanceObj.contractAddress, ' metadata : ', metadata);

      //   let balance =balanceObj['tokenBalance'];
      //    let balance_num = balanceObj.tokenBalance/Math.pow(10, metadata['decimals']);
      //    balance = balance.toFixed(2);

      tokenBalanceDtos.push(tokenBalanceDto);
    }

    //console.log('balances : ', balances);

    return tokenBalanceDtos;
  }

  async getAssetTransfers(id: string, limit: string): Promise<any> {
    //moraliz api key rcgt9o9fPORVL4fZvDR8i9by5khR8HZRrTyBMhfdMxQ09gWCpmMuCiznTpMb8DSD

    const serverUrl = 'https://shzzwqifgpc8.usemoralis.com:2053/server'; //"https://xxxxx/server";
    const appId = 'bc85c2rEtYwdp87r7tNXkNGzL6384dXEw2QEtxBP';
    const masterKey = 'JEds8iBaxBhbYMDHWMuSfEhphqVESSQvLhrIB6BI';

    await Moralis.start({ serverUrl, appId });

    const options = {
      chain: 'eth',
      address: id,
      order: 'desc',
      from_block: '0',
    };

    const transactions = await Moralis.Web3API.account.getTransactions({
      chain: 'eth',
      address: id,
      from_block: '0',
      limit: limit,
    });
    console.log(transactions);
    return transactions;
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

  async getETHBalance(id: string): Promise<String> {
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
}
