import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Param,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { OauthService } from './oauth/oauth.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private oauthService: OauthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(AuthGuard('local'))
  @Post('oauth/login')
  async login(@Request() req) {
    return this.oauthService.login(req.user);
  }

  @Get('oauth/auth/:client_id/:redirect_uri/:response_type/:state')
  async auth(
    @Request() req,
    @Res() res,
    @Param('redirect_uri') redirect_uri: string,
  ) {
    //console.log('zoho req : ', req);
    console.log('zoho redirect_uri : ', redirect_uri);
    res.redirect(redirect_uri);
    return this.oauthService.auth(req);
  }
}
