import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { User } from 'src/model/user.entity';
import { StripeService } from 'src/stripe/stripe.service';
import { UserService } from 'src/users/user.service';
import { AuthService } from './auth.service';

const CLIENT_ID = `ce607184-ce86-4b4b-94a6-70df880a9e4f`;
const CLIENT_SECRET = `9ea10303-cc39-418c-bd22-4f19641e1388`;

// Scopes for this app will default to `crm.objects.contacts.read`
// To request others, set the SCOPE environment variable instead
let SCOPES = `crm.objects.contacts.read`;
//if (process.env.SCOPE) {
//SCOPES = process.env.SCOPE.split(/ |, ?|%20/).join(' ');
//}

// On successful install, users will be redirected to /oauth-callback
//const REDIRECT_URI = `http://localhost:${PORT}/oauthcallback`;
const REDIRECT_URI = `https://muffinwallet.xyz/hub/oauthcallback`;

const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

const NodeCache = require('node-cache');
const request = require('request-promise-native');
const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });

@Controller('hub')
export class AuthController {
  constructor(
    private stripeService: StripeService,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  //================================//
  //   Running the OAuth 2.0 Flow   //
  //================================//

  // Redirect the user from the installation page tos
  // the authorization URL
  @Get('/install')
  async install(@Res() res): Promise<any> {
    console.log('');
    console.log('=== Initiating OAuth 2.0 flow with HubSpot ===');
    console.log('');
    console.log(
      "===> Step 1: Redirecting user to your app's OAuth URL",
      authUrl,
    );
    res.redirect(authUrl);
    // console.log('===> Step 2: User is being prompted for consent by HubSpot');
  }

  // Step 2
  // The user is prompted to give the app access to the requested
  // resources. This is all done by HubSpot, so no work is necessary
  // on the app's end

  // Step 3
  // Receive the authorization code from the OAuth 2.0 Server,
  // and process it based on the query parameters that are passed

  @Get('/oauthcallback') //call from hubspot
  async oauthcallback(@Req() req, @Res() res): Promise<any> {
    await this.stripeService.checkout(req, res);
  }

  @Post('/stripecallback') //call from stripe
  async stripecallback(@Req() req, @Res() res): Promise<any> {
    if (req.body.type == 'customer.subscription.deleted') {
      const subscriptionId = req.body.data.object.id;
      const user: User = await this.userService.findOnesubscriptionId(
        subscriptionId,
      );
      console.log('update subscription status user found : ', user);
      user.payment_status = req.body.data.object.status;
      return this.userService.update(user);
    } else {
      return this.authService.authenticate(req, res);
    }
  }
}
