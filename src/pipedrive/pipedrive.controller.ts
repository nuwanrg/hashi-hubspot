import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { PipedriveService } from './pipedrive.service';
import { Wallet } from './pipedrive.wallet.entity';

@Controller('pipedrive')
export class PipedriveController {
  constructor(private readonly pipedriveService: PipedriveService) {}

  @Get('/getWalletStat/:chain')
  async getWalletStat(@Req() req, @Param('chain') chain: string): Promise<any> {
    console.log(`req.query.wallet_address...`, req.query.wallet_address);
    return this.pipedriveService.getWalletStat(req, chain);
  }

  @Post('/wallet')
  async saveWallet(@Req() req, @Body() body): Promise<any> {
    console.log('Saving wallet address');
    // console.log('Saving wallet address');
    // console.log('Saving wallet address');
    const wallet = new Wallet();
    wallet.companyId = req.query.companyId;
    wallet.userId = req.query.userId;
    wallet.personId = req.query.id;
    wallet.walletAddress = body.wallet_address;
    console.log('wallet : ', wallet);
    return this.pipedriveService.create(wallet);
  }

  @Get('/wallet')
  async getWallet(@Req() req): Promise<any> {
    return this.pipedriveService.getWallet(req);
  }
}
