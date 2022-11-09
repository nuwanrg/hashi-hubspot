import {
  Controller,
  Get,
  Request,
  Post,
  UseGuards,
  Param,
  Res,
  Query,
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

  @Get('oauth/auth')
  async auth(@Request() req, @Res() res, @Query() query) {
    //console.log('zoho req : ', req);
    console.log('zoho query : ', query);
    const redirect_uri =
      query.redirect_uri +
      //'?state=PORTAL-nuwan2-US-570258b31c1b111fe6f936cac564982d55e459daf6985e2633367b0503a1373b98a995a7c54902f25a5cbef627567d86-nuwan2' +
      query.state +
      '&code=pU2DHOWjSCVh6NJKi1ClhBYNKfuqbZVT';
    res.redirect(redirect_uri);
    //return this.oauthService.auth(req);
    //return 'success';
  }

  @Get('oauth/token')
  token(@Request() req, @Res() res, @Query() query): string {
    //console.log('zoho req : ', req);
    console.log('zoho query get : ', query);
    return res.json({ success: true });
  }

  @Post('oauth/token')
  token2(@Request() req, @Res() res, @Query() query): Promise<any> {
    //console.log('zoho req : ', req);
    console.log('zoho query post: ', query);
    return res.json({
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0ODUxNDA5ODQsImlhdCI6MTQ4NTEzNzM4NCwiaXNzIjoiYWNtZS5jb20iLCJzdWIiOiIyOWFjMGMxOC0wYjRhLTQyY2YtODJmYy0wM2Q1NzAzMThhMWQiLCJhcHBsaWNhdGlvbklkIjoiNzkxMDM3MzQtOTdhYi00ZDFhLWFmMzctZTAwNmQwNWQyOTUyIiwicm9sZXMiOltdfQ.Mp0Pcwsz5VECK11Kf2ZZNF_SMKu5CgBeLN9ZOP04kZo',
      refresh_token: 'ze9fi6Y9sMSf3yWp3aaO2w7AMav2MFdiMIi2GObrAi-i3248oo0jTQ',
      token_type: 'Bearer',
      expires_in: 3600000,
    });
  }
}
