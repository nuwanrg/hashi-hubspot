import { Controller, Get, Param } from '@nestjs/common';
import {
  createAlchemyWeb3,
  AssetTransfersCategory,
  AssetTransfersResponse,
  AssetTransfersOrder,
} from '@alch/alchemy-web3';
import { ethers } from 'ethers';
import { TransactionService } from './transaction.service';
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
    @Param('cursor') cursor: string,
  ): Promise<any> {
    console.log(`Fetching assets tranfers ${id} ...`);
    return this.transactionService.getAssetTransfers(chain, id, limit, cursor);
  }

  @Get('/getNFTs/:id')
  async getNFTs(@Param('id') id: string): Promise<any> {
    console.log(`Requesting NFTs from the wallet ${id} ......`);

    return this.transactionService.getNFTs(id);
  }

  @Get('/getBalance/:id')
  async getBalance(@Param('id') id: string): Promise<any> {
    console.log(`Requesting balance for the wallet ${id} ......`);

    return this.transactionService.getTokenBalances(id);
  }

  @Get('/getETHBalance/:id')
  async getETHBalance(@Param('id') id: string): Promise<String> {
    console.log(`Requesting ETH balance for the wallet ${id} ......`);

    return this.transactionService.getETHBalance(id);
  }

  @Get()
  async transaction(): Promise<String> {
    return 'Hello Transaction...';
  }
}
