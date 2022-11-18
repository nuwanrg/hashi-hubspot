import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { ZohoWallet } from './types';

@Controller('zoho')
export class ZohoController {
  constructor(private readonly zohoService: ZohoService) {}

  @Get('/getWalletStat/:chain')
  async getWalletStat(@Req() req, @Param('chain') chain: string): Promise<any> {
    //console.log(`req.query.wallet_address...`, req.query.wallet_address);
    return this.zohoService.getWalletStat(req, chain);
  }

  @Post('/wallet')
  async saveWallet(@Req() req, @Body() body: ZohoWallet): Promise<any> {
    console.log('wallet body  ', body);
    console.log('req.body ', req.body);
    console.log('req  ', req);
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
