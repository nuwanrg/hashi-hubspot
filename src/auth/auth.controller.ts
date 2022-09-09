import { Controller, Get, Param, Req, Res } from '@nestjs/common';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

// Scopes for this app will default to `crm.objects.contacts.read`
// To request others, set the SCOPE environment variable instead
let SCOPES = 'crm.objects.contacts.read';
/*if (process.env.SCOPE) {
    SCOPES = (process.env.SCOPE.split(/ |, ?|%20/)).join(' ');
}*/

// On successful install, users will be redirected to /oauth-callback
//const REDIRECT_URI = `http://localhost:${PORT}/oauthcallback`;
//const REDIRECT_URI = `https://muffintech.xyz/auth/oauthcallback`;
const REDIRECT_URI = `https://muffinwallet.xyz/auth/oauthcallback`;

// Step 1
// Build the authorization URL to redirect a user
// to when they choose to install the app
const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
  `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page

@Controller('auth')
export class AuthController {
  constructor() {}

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
    console.log("===> Step 1: Redirecting user to your app's OAuth URL");
    res.redirect(authUrl);
    console.log('===> Step 2: User is being prompted for consent by HubSpot');
  }

  @Get('/oauthcallback')
  async oauthcallback(@Req() req, @Res() res): Promise<any> {
    console.log(' oauthcallback req ', req.query);
    if (req.query.code) {
      console.log('       > Received an authorization token');
    }
    const authCodeProof = {
      grant_type: 'authorization_code',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code: req.query.code,
    };
    // Step 4
    // Exchange the authorization code for an access token and refresh token
    console.log(
      '===> Step 4: Exchanging authorization code for an access token and refresh token',
    );
    const token = await exchangeForTokens(req.sessionID, authCodeProof);
    console.log('token ', token);
    if (token.message) {
      return res.redirect(`/error?msg=${token.message}`);
    }

    // Once the tokens have been retrieved, use them to make a query
    // to the HubSpot API
    res.redirect(
      'https://app.hubspot.com/dashboard-library/22582686',
      //`/transaction/getBalance/eth/0x1dafF752b4218a759B86FFb48a5B22086eA9F445`,
    );
  }
}

const NodeCache = require('node-cache');
const request = require('request-promise-native');
const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });
const exchangeForTokens = async (userId, exchangeProof) => {
  try {
    const responseBody = await request.post(
      'https://api.hubapi.com/oauth/v1/token',
      {
        form: exchangeProof,
      },
    );
    // Usually, this token data should be persisted in a database and associated with
    // a user identity.
    const tokens = JSON.parse(responseBody);
    // refreshTokenStore[userId] = tokens.refresh_token;
    // accessTokenCache.set(
    //   userId,
    //   tokens.access_token,
    //   Math.round(tokens.expires_in * 0.75),
    // );

    console.log('       > Received an access token and refresh token');
    return tokens.access_token;
  } catch (e) {
    console.error(
      `       > Error exchanging ${exchangeProof.grant_type} for access token`,
    );
    return JSON.parse(e.response.body);
  }
};
