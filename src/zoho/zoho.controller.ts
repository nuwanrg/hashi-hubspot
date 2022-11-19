import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { ZohoWalletDto } from './types';

@Controller('zoho')
export class ZohoController {
  constructor(private readonly zohoService: ZohoService) {}

  @Get('/getWalletStat/:chain')
  async getWalletStat(@Req() req, @Param('chain') chain: string): Promise<any> {
    //console.log(`req.query.wallet_address...`, req.query.wallet_address);
    return this.zohoService.getWalletStat(req, chain);
  }

  @Post('/wallet')
  async getWallet(@Req() req, @Body() body: ZohoWalletDto): Promise<any> {
    console.log('wallet body  ', body);
    console.log('req.body ', req.body);

    return this.zohoService.getWalletAddress(
      body.companyId,
      body.personId,
      body.userId,
    );
    //return this.zohoService.create(wallet);
  }

  // @Get('/wallet')
  // async getWallet(@Req() req): Promise<any> {
  //   return this.zohoService.getWallet(req);
  // }
}
