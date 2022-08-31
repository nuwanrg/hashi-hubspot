import { Controller, Get, Param, Req } from '@nestjs/common';
import {
  createAlchemyWeb3,
  AssetTransfersCategory,
  AssetTransfersResponse,
  AssetTransfersOrder,
} from '@alch/alchemy-web3';
import { ethers } from 'ethers';
import { TransactionService } from './transaction.service';
import { WalletStatsResponse } from 'src/types/types';
const rpcURL = 'https://goerli.prylabs.net/'; //'https://rinkeby.infura.io/';
const provider = new ethers.providers.JsonRpcProvider(rpcURL);
//const network =

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/transactionHistory/:id/:count')
  async getTransactionHistory(
    @Param('id') id: string,
    @Param('count') count: string,
  ): Promise<any> {
    console.log(`Fetching transaction history from the wallet ${id} ...`);
    return this.transactionService.getTransactionHistory(id, count);
  }

  @Get('/assetTransfers/:chain/:id/:limit/:cursor')
  async getAssetTransfers(
    @Param('chain') chain: string,
    @Param('id') id: string,
    @Param('limit') limit: string,
    @Param('cursor') cursor: string | number,
  ): Promise<any> {
    console.log(`Fetching assets tranfers ${id} ...`);
    return this.transactionService.getAssetTransfers(chain, id, limit, cursor);
  }

  //Depreciated
  //   @Get('/getNFTs/:id')
  //   async getNFTs(@Param('id') id: string): Promise<any> {
  //     console.log(`Requesting NFTs from the wallet ${id} ......`);

  //     return this.transactionService.getNFTs(id);
  //   }

  @Get('/getNFTs/:chain/:id')
  async getNFTs(
    @Param('chain') chain: string,
    @Param('id') id: string,
  ): Promise<any> {
    console.log(`Requesting NFTs from the wallet ${id} ......`);

    return this.transactionService.getNFTs(chain, id);
  }

  @Get('/getBalance/:chain/:id')
  async getBalance(
    @Param('chain') chain: string,
    @Param('id') id: string,
  ): Promise<any> {
    console.log(`Requesting balance for the wallet ${id} ......`);

    return this.transactionService.getTokenBalances(chain, id);
  }

  //   @Get('/getETHBalance/:id')
  //   async getETHBalance(
  //     @Param('chain') chain: string,
  //     @Param('id') id: string,
  //   ): Promise<String> {
  //     console.log(`Requesting ETH balance for the wallet ${id} ......`);

  //     return this.transactionService.getETHBalance(chain, id);
  //   }

  @Get('/getNativeBalanceHub/:chain/:id')
  async getNativeBalance(
    @Req() req,
    @Param('chain') chain: string,
    @Param('id') id: string,
  ): Promise<any> {
    console.log(`Req...`, req.query.walletID);
    console.log(`Requesting ETH balance for the wallet ${id} ......`);

    const res = `{
      "results": [{
        "objectId": 101,
        "walletID": ${req.query.walletID},
        "email": ${req.query.email},
        "title": "Wallet Balance",
        "balance": "0.0017 ETH",
        "balance_usd": 269.0446810728103,
        "totalReceive": "0.0017 ETH",
        "totalSpent": 0,
        "totalReceive_usd": 269.0446810728103,
        "totalSpent_usd": 0,
        "firstBalanceChange": "2022-03-14T00:31:22.000Z",
        "lastBalanceChange": "2022-05-26T01:43:09.000Z",
        "transactionCount": 21
    }]
    }`;

    //return JSON.stringify(res);
    return this.transactionService.getNativeBalanceHub(req, chain, id);
  }

  @Get()
  async transaction(): Promise<String> {
    return 'Hello Transaction...';
  }
}
