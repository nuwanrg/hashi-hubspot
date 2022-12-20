import { Controller, Get, Param, Req } from '@nestjs/common';

import { TransactionService } from './transaction.service';

@Controller('hub')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}
  /*
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
  
  @Get('/getNFTs/:chain/:id')
  async getNFTs(
    @Param('chain') chain: string,
    @Param('id') id: string,
  ): Promise<any> {
    console.log(`Requesting NFTs from the wallet ${id} ......`);

    return this.transactionService.getNFTs(chain, id);
  }
*/
  @Get('/getNFTsHub/:chain')
  async getNFTsHub(@Req() req, @Param('chain') chain: string): Promise<any> {
    //return this.transactionService.getNFTsHub(req, chain);
  }

  @Get('/getBalance/:chain/:id')
  async getBalance(
    @Param('chain') chain: string,
    @Param('id') id: string,
  ): Promise<any> {
    console.log(`Requesting balance for the wallet ${id} ......`);

    //return this.transactionService.getTokenBalances(chain, id);
  }

  @Get('/getWalletBalance')
  async getNativeBalance(@Req() req): Promise<any> {
    console.log(`req.query.wallet_address...`, req.query.eth_address);
    return this.transactionService.getWalletBalance(req);
  }

  @Get('/assetTransfersHub/:chain/:limit')
  async getAssetTransfersHub(
    @Req() req,
    @Param('chain') chain: string,
    @Param('limit') limit: string,
    @Param('cursor') cursor: string | number,
  ): Promise<any> {
    console.log(
      `Fetching assets tranfers for Hubspot ${req.query.wallet_address} ...`,
    );
    /*return this.transactionService.getAssetTransfersHub(
      req,
      chain,
      limit,
      cursor,
    );*/
  }

  @Get()
  async transaction(): Promise<String> {
    return 'Hello Transaction...';
  }
}
