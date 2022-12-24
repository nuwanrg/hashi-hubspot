import { ForbiddenException, Injectable, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import axios, { AxiosResponse } from 'axios';
import { BigNumberish, ethers } from 'ethers';
import { ERC20Transactions } from './erc20Transactions.dto';
import * as moment from 'moment';
import {
  BTCWalletDetalResults,
  BTCWalletDetals,
  TokenTransfersHub,
  TokenTransfersResponse,
  WalletNFTResponse,
  WalletNFTResponseHub,
  ETHWalletDetalResults,
  ETHWalletDetals,
} from 'src/types/types';
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';
import { map, catchError } from 'rxjs';
import UsersDiscovery from '@hubspot/api-client/lib/src/discovery/settings/users/UsersDiscovery';
var sb = require('satoshi-bitcoin');

const startServer = async () => {
  await Moralis.start({
    //serverUrl: 'https://shzzwqifgpc8.usemoralis.com:2053/server',
    apiKey: 'rcgt9o9fPORVL4fZvDR8i9by5khR8HZRrTyBMhfdMxQ09gWCpmMuCiznTpMb8DSD',
  });
};
//startServer();
let chain: EvmChain = EvmChain.ETHEREUM;

@Injectable()
export class TransactionService {
  constructor(private readonly httpService: HttpService) {
    this.startMoralisServer();
  }

  //Start Morali SDK
  async startMoralisServer() {
    if (process.env.EVM_CHAIN === 'GOERLI') {
      chain = EvmChain.GOERLI;
    }
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

  async getBTCWalletDetails(@Req() req): Promise<BTCWalletDetals> {
    let bTCWalletDetalResults: BTCWalletDetalResults =
      new BTCWalletDetalResults();

    const btc_address = req.query.btc_address;
    const objectId = req.query.associatedObjectId;
    bTCWalletDetalResults.title = 'Addr:' + btc_address;

    //BTC balance
    const btcwallet = await this.getBitcoinWallet(btc_address);
    /*this.httpService.get(
      'https://blockchain.info/rawaddr/bc1qevr4wsp5kr4dmha20c6klnce262yxt34el9u6w',
    );*/
    console.log('btcresponse : ', btcwallet.data);
    bTCWalletDetalResults.btc_balance =
      sb.toBitcoin(btcwallet.data.final_balance) + ' BTC';
    bTCWalletDetalResults.btc_n_tx = btcwallet.data.n_tx.toString();
    bTCWalletDetalResults.btc_total_received =
      sb.toBitcoin(btcwallet.data.total_received) + ' BTC';

    bTCWalletDetalResults.btc_total_sent =
      sb.toBitcoin(btcwallet.data.total_sent) + ' BTC';
    bTCWalletDetalResults.objectId = objectId;
    const bTCWalletDetals: BTCWalletDetals = new BTCWalletDetals();
    bTCWalletDetals.results.push(bTCWalletDetalResults);
    return bTCWalletDetals;
  }

  async getETHWalletDetails(@Req() req): Promise<ETHWalletDetals> {
    const eTHWalletDetalResults: ETHWalletDetalResults =
      new ETHWalletDetalResults();

    const address = req.query.eth_address;
    eTHWalletDetalResults.title = 'Addr:' + address;
    const objectId = req.query.associatedObjectId;

    const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain,
    });
    console.log('Eth(Native) Balance : ', nativeBalance.raw.balance);
    let balance: number = parseFloat(
      ethers.utils.formatEther(nativeBalance.raw.balance),
    );
    eTHWalletDetalResults.eth_balance = balance.toFixed(5) + ' ETH';

    //get token balances
    const walletTokenBalances =
      await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain,
      });
    //console.log('walletTokenBalances : ', walletTokenBalances);

    for (const token of walletTokenBalances.result) {
      console.log('token : ', token);
      //USDT
      if (token.token.symbol === 'USDT') {
        console.log('token : ', token.amount);
        eTHWalletDetalResults.usdt_balance =
          Number(token.amount) / 10 ** token.decimals + ' USDT';
      }

      //USDC
      if (token.token.symbol === 'USDC') {
        console.log('token : ', token.amount);
        eTHWalletDetalResults.usdc_balance =
          Number(token.amount) / 10 ** token.decimals + ' USDC';
      }
    }

    /*const tokenBalances = await Moralis.EvmApi.token.getWalletTokenBalances({
      address,
      chain,
    });*/

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

    eTHWalletDetalResults.objectId = objectId;
    const eTHWalletDetals: ETHWalletDetals = new ETHWalletDetals();
    eTHWalletDetals.results.push(eTHWalletDetalResults);
    return eTHWalletDetals;
  }

  async getNFTsHub(@Req() req): Promise<WalletNFTResponseHub> {
    let address = req.query.eth_address;
    const options = {
      chain: chain,
      address: address,
    };
    const nfts = await Moralis.EvmApi.nft.getWalletNFTs(options);
    console.log('NFTs results : ', nfts.result);
    const obj = nfts['result'];

    const walletNFTResponseHub: WalletNFTResponseHub =
      new WalletNFTResponseHub();

    for (var key in obj) {
      // console.log(
      //   'key: ' +
      //     key +
      //     ', obj[key].token_address: ' +
      //     obj[key].tokenAddress.lowercase,
      // );

      let walletNFTResponse: WalletNFTResponse = new WalletNFTResponse();
      walletNFTResponse.walletID = address;
      walletNFTResponse.objectId = req.query.associatedObjectId;
      walletNFTResponse.title = obj[key].name;
      walletNFTResponse.name = 'NFT Name: ' + obj[key].name;
      walletNFTResponse.token_address = obj[key].tokenAddress.lowercase;
      walletNFTResponse.token_uri = obj[key].tokenUri;

      const metadata = obj[key].metadata;
      //console.log('metadata: ', metadata);

      let imgUrl = metadata['image'];

      if (imgUrl.includes('ipfs://')) {
        imgUrl = imgUrl.substring(imgUrl.indexOf('ipfs://') + 7);
        imgUrl = 'https://ipfs.io/ipfs/' + imgUrl;
        //console.log('imgUrl ', imgUrl);
      }

      walletNFTResponse.nft_image = imgUrl;
      walletNFTResponseHub.results.push(walletNFTResponse);
    }

    return walletNFTResponseHub;
  }

  async getAssetTransfersHub(
    @Req() req,
    limit: number,
    cursor?: string,
  ): Promise<TokenTransfersHub> {
    let address = req.query.eth_address;
    if (cursor === '0') {
      cursor = null;
    }

    //const chain = EvmChain.ETHEREUM;

    const options = {
      chain: chain,
      address: address,
      limit: limit,
    };

    const transactions = await Moralis.EvmApi.token.getWalletTokenTransfers(
      options,
    );

    console.log(transactions);

    //const totalTxns = transactions['pagination'].total;

    const tokenTransfersHub: TokenTransfersHub = new TokenTransfersHub();

    const usdoptions = {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: chain,
    };
    const price = await Moralis.EvmApi.token.getTokenPrice(usdoptions);

    let transferMetadata: Array<any> = new Array();

    for (const transfer of transactions.result) {
      console.log('transfer ', transfer);
      //console.log('transfer.address ', transfer.address);

      let tokenTransfersResponse: TokenTransfersResponse =
        new TokenTransfersResponse();
      tokenTransfersResponse.walletID = address;
      tokenTransfersResponse.objectId = req.query.associatedObjectId;
      tokenTransfersResponse.from_address = transfer.fromAddress.lowercase;
      tokenTransfersResponse.to_address = transfer.toAddress.lowercase;
      tokenTransfersResponse.created_at = moment(transfer.blockTimestamp)
        .utc()
        .format('YYYY-MM-DD');
      tokenTransfersResponse.transaction_hash =
        'https://etherscan.io/tx/' + transfer.transactionHash;

      if (transfer.fromAddress.lowercase == address.toLowerCase()) {
        tokenTransfersResponse.title = 'Outbound Transaction';
      } else {
        tokenTransfersResponse.title = 'Inbound Transaction';
      }

      /*let token_value = '';
      if (transfer.value !== 0) {
        token_value = transfer.value;
      }*/

      //get sysmbol
      const options = {
        chain: chain,
        addresses: [transfer.address.lowercase],
      };

      const metadata = await Moralis.EvmApi.token.getTokenMetadata(options);
      console.log('metadata :', metadata['jsonResponse']['0']);
      const symbol = metadata['jsonResponse']['0'].symbol;

      // console.log('transfer.value : ', transfer.value);
      const value = transfer.value;
      const decimals = parseInt(metadata['jsonResponse']['0'].decimals);
      console.log(' value/decimals ', value, decimals);
      let tokenValue: any = 0;
      tokenValue = Number(transfer.value) / 10 ** decimals;
      tokenTransfersResponse.value = tokenValue + ' ' + symbol;

      // tokenTransfersResponse.value_usd =
      //  (parseFloat(ethValue) * price.usdPrice).toFixed(2) + ' USD';

      let temp = transfer;
      temp['meta'] = metadata[0];
      transferMetadata.push(metadata);
      tokenTransfersHub.results.push(tokenTransfersResponse);
    }

    let eRC20Transactions: ERC20Transactions = new ERC20Transactions();
    eRC20Transactions.transfers = transactions;
    eRC20Transactions.metadata = transferMetadata;

    //console.log('tokenTransfersHub: ', tokenTransfersHub);

    return tokenTransfersHub;
  }
}
