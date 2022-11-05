import { Controller, Get, Request, Post, UseGuards } from '@nestjs/common';
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

  @Post('oauth/auth')
  async auth(@Request() req) {
    return this.oauthService.auth(req);
  }
}
