import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { Wallet } from './zoho.wallet.entity';

@Controller('zoho')
export class ZohoController {
  constructor(private readonly zohoService: ZohoService) {}

  @Get('/getWalletStat/:chain')
  async getWalletStat(@Req() req, @Param('chain') chain: string): Promise<any> {
    //console.log(`req.query.wallet_address...`, req.query.wallet_address);
    return this.zohoService.getWalletStat(req, chain);
  }

  @Post('/wallet')
  async saveWallet(@Req() req, @Body() body): Promise<any> {
    console.log('reg body ', body);
    console.log('reg  ', req);
    const wallet = new Wallet();
    wallet.companyId = body.companyId;
    wallet.userId = body.userId;
    wallet.personId = body.personId;
    //wallet.walletAddress = body.wallet_address;
    console.log('wallet : ', wallet);
    return this.zohoService.getWalletAddress(
      wallet.companyId,
      wallet.personId,
      wallet.userId,
    );
    //return this.zohoService.create(wallet);
  }

  @Get('/wallet')
  async getWallet(@Req() req): Promise<any> {
    return this.zohoService.getWallet(req);
  }
}
