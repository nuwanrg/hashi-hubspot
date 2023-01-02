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

let chain: EvmChain = EvmChain.ETHEREUM;
const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDC_CONTRACT_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const BUSD_CONTRACT_ADDRESS = '0xe9e7cea3dedca5984780bafc599bd69add087d56';
const USDT_CONTRACT_DECIMAL = 6;
const USDC_CONTRACT_DECIMAL = 6;
const BUSD_CONTRACT_DECIMAL = 18;

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

  formatVal(e, decimals) {
    let divisor = 10 ** decimals;
    return e / divisor;
  }

  async getBitcoinWallet(btc_address): Promise<AxiosResponse> {
    console.log('BTC Address : ', btc_address);
    return this.httpService.axiosRef.get(
      `https://blockchain.info/rawaddr/${btc_address}?limit=5`,
    );
  }

  async getBTCExchangeRate(): Promise<AxiosResponse> {
    //console.log('BTC Address : ');
    return this.httpService.axiosRef.get(`https://blockchain.info/ticker`);
  }

  async getBTCWalletDetails(@Req() req): Promise<BTCWalletDetals> {
    let bTCWalletDetalResults: BTCWalletDetalResults =
      new BTCWalletDetalResults();

    const btc_address = req.query.btc_address;
    const objectId = req.query.associatedObjectId;
    bTCWalletDetalResults.title = 'Addr:' + btc_address;

    //BTC balance
    const btcwallet = await this.getBitcoinWallet(btc_address);
    //console.log('btcresponse : ', btcwallet.data);
    //btc exchange rate
    const btcRates = await this.getBTCExchangeRate();
    //console.log('final_balance_usd ', btcRates.data.USD.last);

    //btc_balance
    const btc_balance = sb.toBitcoin(btcwallet.data.final_balance);
    const usd_balance =
      sb.toBitcoin(btcwallet.data.final_balance) * btcRates.data.USD.last;
    bTCWalletDetalResults.btc_balance =
      btc_balance.toFixed(6) + ' BTC | ' + usd_balance.toFixed(6) + ' USD';

    //btc_received
    const btc_received = sb.toBitcoin(btcwallet.data.total_received);
    const usd_received =
      sb.toBitcoin(btcwallet.data.total_received) * btcRates.data.USD.last;
    bTCWalletDetalResults.btc_total_received =
      btc_received.toFixed(6) + ' BTC | ' + usd_received.toFixed(6) + ' USD';

    //btc_total_sent
    const btc_sent = sb.toBitcoin(btcwallet.data.total_sent);
    const usd_sent =
      sb.toBitcoin(btcwallet.data.total_sent) * btcRates.data.USD.last;
    bTCWalletDetalResults.btc_total_sent =
      btc_sent.toFixed(6) + ' BTC | ' + usd_sent.toFixed(6) + ' USD';

    bTCWalletDetalResults.btc_n_tx = btcwallet.data.n_tx.toString();

    bTCWalletDetalResults.objectId = objectId;
    const bTCWalletDetals: BTCWalletDetals = new BTCWalletDetals();
    bTCWalletDetals.results.push(bTCWalletDetalResults);
    console.log('BTC Wallet fetched ', btc_address);
    return bTCWalletDetals;
  }

  async getETHWalletDetails(@Req() req): Promise<ETHWalletDetals> {
    const eTHWalletDetalResults: ETHWalletDetalResults =
      new ETHWalletDetalResults();
    let totalBalance: number = 0;
    let a: number = 9;

    const address = req.query.eth_address;
    eTHWalletDetalResults.title = 'Addr:' + address;
    const objectId = req.query.associatedObjectId;

    //ETH BALANCE
    const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain,
    });
    const ethBalance: number = parseFloat(
      ethers.utils.formatEther(nativeBalance.raw.balance),
    );

    //ETH EXCHANGE RATE
    const usdoptions = {
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      chain: chain,
    };
    const tokenPrice = await Moralis.EvmApi.token.getTokenPrice(usdoptions);

    // console.log('TokenPrice : ', tokenPrice.result.usdPrice);
    const ethPrice = tokenPrice.result.usdPrice;
    const usdValue: number = ethPrice * ethBalance;

    eTHWalletDetalResults.eth_balance =
      ethBalance.toFixed(6) + ' ETH | ' + usdValue.toFixed(6) + ' USD';
    totalBalance = totalBalance + usdValue;

    //console.log(totalBalance);

    //get token balances
    const walletTokenBalances =
      await Moralis.EvmApi.token.getWalletTokenBalances({
        address,
        chain,
      });
    //console.log('walletTokenBalances : ', walletTokenBalances);

    for (const token of walletTokenBalances.result) {
      //console.log('token : ', token);
      //USDT
      if (token.token.symbol === 'USDT') {
        //console.log('token : ', token.amount);
        eTHWalletDetalResults.usdt_balance =
          Number(token.amount) / 10 ** token.decimals + ' USDT';

        totalBalance =
          totalBalance + Number(token.amount) / 10 ** token.decimals;

        //console.log('sdf ', totalBalance);
      }

      //USDC
      if (token.token.symbol === 'USDC') {
        //console.log('token : ', token.amount);
        eTHWalletDetalResults.usdc_balance =
          Number(token.amount) / 10 ** token.decimals + ' USDC';
        totalBalance =
          totalBalance + Number(token.amount) / 10 ** token.decimals;
      }
    }

    eTHWalletDetalResults.totalBalance = totalBalance.toFixed(6) + ' USD';

    //get total received and sent

    const options = {
      chain: chain,
      address: address,
    };

    const walletTokenTransfers =
      await Moralis.EvmApi.token.getWalletTokenTransfers(options);

    let usdt_spent = 0;
    let usdt_received = 0;
    let usdc_spent = 0;
    let usdc_received = 0;

    for (const walletTransfer of walletTokenTransfers.result) {
      //console.log('walletTransfer : ', walletTransfer);
      if (
        walletTransfer.address.lowercase === USDT_CONTRACT_ADDRESS.toLowerCase()
      ) {
        if (walletTransfer.fromAddress.lowercase === address.toLowerCase()) {
          usdt_spent =
            usdt_spent +
            Number(walletTransfer.value) / 10 ** USDT_CONTRACT_DECIMAL;
        } else if (
          walletTransfer.toAddress.lowercase === address.toLowerCase()
        ) {
          usdt_received =
            usdt_received +
            Number(walletTransfer.value) / 10 ** USDT_CONTRACT_DECIMAL;
        }
      } else if (
        walletTransfer.address.lowercase === USDC_CONTRACT_ADDRESS.toLowerCase()
      ) {
        if (walletTransfer.fromAddress.lowercase === address.toLowerCase()) {
          usdc_spent =
            usdc_spent +
            Number(walletTransfer.value) / 10 ** USDC_CONTRACT_DECIMAL;
        } else if (
          walletTransfer.toAddress.lowercase === address.toLowerCase()
        ) {
          usdc_received =
            usdc_received +
            Number(walletTransfer.value) / 10 ** USDC_CONTRACT_DECIMAL;
        }
      }
    }

    // console.log('usdt_spent /usdt_RECEIVED: ', usdt_spent - usdt_received);
    // console.log(
    //   'usdc_spent /usdc_RECEIVED/balance: ',
    //   usdc_spent,
    //   usdc_received,
    //   usdc_received - usdc_spent,
    // );

    eTHWalletDetalResults.usdt_received = usdt_received.toFixed(6) + ' USDT';
    eTHWalletDetalResults.usdt_spent = usdt_spent.toFixed(6) + ' USDT';
    eTHWalletDetalResults.usdc_received = usdc_received.toFixed(6) + ' USDC';
    eTHWalletDetalResults.usdc_spent = usdc_spent.toFixed(6) + ' USDC';

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
      //limit: limit,
    };

    const transactions = await Moralis.EvmApi.token.getWalletTokenTransfers(
      options,
    );

    //console.log(transactions);

    const tokenTransfersHub: TokenTransfersHub = new TokenTransfersHub();

    let tnxCount = 0;
    for (const transfer of transactions.result) {
      //console.log('transfer ', transfer);
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
      //console.log('metadata :', metadata['jsonResponse']['0']);
      const symbol = metadata['jsonResponse']['0'].symbol;

      // console.log('transfer.value : ', transfer.value);

      if (symbol === 'USDT' || symbol === 'USDC' || symbol === 'BUSD') {
        const value = transfer.value;
        const decimals = parseInt(metadata['jsonResponse']['0'].decimals);
        //console.log(' value/decimals ', value, decimals);
        let tokenValue: any = 0;
        tokenValue = Number(transfer.value) / 10 ** decimals;
        tokenTransfersResponse.value = tokenValue + ' ' + symbol;
        tokenTransfersHub.results.push(tokenTransfersResponse);
        tnxCount = tnxCount + 1;
        if (tnxCount == 10) {
          break;
        }
      }
    }

    let eRC20Transactions: ERC20Transactions = new ERC20Transactions();
    eRC20Transactions.transfers = transactions;

    return tokenTransfersHub;
  }
}
