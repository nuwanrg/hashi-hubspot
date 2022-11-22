import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { ZohoWalletDto } from './types';

@Controller('zoho')
export class ZohoController {
  constructor(private readonly zohoService: ZohoService) {}

  @Post('/getWalletStat/:chain')
  async getWalletStat(
    @Req() req,
    @Param('chain') chain: string,
    @Body() zohoWalletDto: ZohoWalletDto,
  ): Promise<any> {
    console.log('zohoWalletDto:', zohoWalletDto);

    return this.zohoService.getWalletStat(zohoWalletDto, chain);
  }

  @Post('/getTransaction/:chain')
  async getTransaction(
    @Req() req,
    @Param('chain') chain: string,
    @Body() zohoWalletDto: ZohoWalletDto,
  ): Promise<any> {
    return this.zohoService.getTransaction(zohoWalletDto, chain);
  }

  @Post('/wallet')
  async getWallet(@Req() req, @Body() body: ZohoWalletDto): Promise<any> {
    console.log('/wallet ZohoWalletDto:  ', body);

    return this.zohoService.getWalletAddress(
      body.companyId,
      body.userId,
      body.personId,
    );
    //return this.zohoService.create(wallet);
  }

  // @Get('/wallet')
  // async getWallet(@Req() req): Promise<any> {
  //   return this.zohoService.getWallet(req);
  // }
}
