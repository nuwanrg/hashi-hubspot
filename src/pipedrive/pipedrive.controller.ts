import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { PipedriveService } from './pipedrive.service';

@Controller('pipedrive')
export class PipedriveController {
  constructor(private readonly pipedriveService: PipedriveService) {}

  @Get('/getWalletStat/:chain')
  async getWalletStat(@Req() req, @Param('chain') chain: string): Promise<any> {
    console.log(`req.query.wallet_address...`, req.query.wallet_address);
    return this.pipedriveService.getWalletStat(req, chain);
  }

  @Post('/saveWallet')
  async saveWallet(@Req() req): Promise<any> {
    console.log(`req.query.wallet_address...`, req.query.wallet_address);
    return this.pipedriveService.saveWallet(req);
  }
}
