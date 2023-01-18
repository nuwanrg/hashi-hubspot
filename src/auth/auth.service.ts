import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { User } from 'src/model/user.entity';
import { StripeService } from 'src/stripe/stripe.service';
import { UsersService } from 'src/users/users.service';

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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private httpService: HttpService,
  ) {}

  async authenticate(@Req() req, @Res() res): Promise<any> {
    // const code = req.body.data.object.lines.data[0].metadata.code;
    // const sessionID = req.body.data.object.lines.data[0].metadata.sessionID;

    const code = req.body.data.object.metadata.code;
    const sessionID = req.body.data.object.metadata.sessionID;

    console.log('code, sessionID : ', code, sessionID);

    // Received a user authorization code, so now combine that with the other
    // required values and exchange both for an access token and a refresh token

    if (code) {
      console.log('       > Received an authorization token');
      const authCodeProof = {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      };

      // Step 4
      // Exchange the authorization code for an access token and refresh token
      console.log(
        '===> Step 4: Exchanging authorization code for an access token and refresh token req.sessionID: ',
        sessionID,
      );
      const token = await this.exchangeForTokens(sessionID, authCodeProof);

      console.log('token.access_token : ', token.access_token);

      const accountinfo = await this.httpService.axiosRef.get(
        `https://api.hubapi.com/oauth/access-tokens/${token.access_token}`,
      );
      console.log('response : ', accountinfo);

      if (token.message) {
        return res.redirect(`/error?msg=${token.message}`);
      }

      await this.createWalletAddr(token.access_token);

      // save customer
      const user: User = new User();
      user.subscriptionId = req.body.data.object.id;
      this.usersService.create(user);

      res.json({ success: true });

      // Once the tokens have been retrieved, use them to make a query
      // to the HubSpot API
      //res.redirect(`/`);
    }
    console.log('After stripe payment is done: ');
  }

  //@Post('/con') // call from stripe
  async createWalletAddr(token: string): Promise<any> {
    console.log('token ', token);

    //create Ethereum Wallet Address
    const hubspot = require('@hubspot/api-client');
    const hubspotClient = new hubspot.Client({
      accessToken: token,
    });

    const PropertyCreate = {
      name: 'eth_address',
      label: 'ETH Wallet Address',
      type: 'string',
      fieldType: 'text',
      groupName: 'contactinformation',
      options: [],
      displayOrder: 2,
      hasUniqueValue: false,
      hidden: false,
      formField: true,
    };

    const objectType = 'contact';

    try {
      const apiResponse = await hubspotClient.crm.properties.coreApi.create(
        objectType,
        PropertyCreate,
      );
      //console.log(JSON.stringify(apiResponse.body, null, 2));
    } catch (e) {
      e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e);
    }

    //Creat BTC Wallet
    const BTCPropertyCreate = {
      name: 'btc_address',
      label: 'BTC Wallet Address',
      type: 'string',
      fieldType: 'text',
      groupName: 'contactinformation',
      options: [],
      displayOrder: 2,
      hasUniqueValue: false,
      hidden: false,
      formField: true,
    };

    try {
      const apiResponse = await hubspotClient.crm.properties.coreApi.create(
        objectType,
        BTCPropertyCreate,
      );
      //console.log(JSON.stringify(apiResponse.body, null, 2));
    } catch (e) {
      e.message === 'HTTP request failed'
        ? console.error(JSON.stringify(e.response, null, 2))
        : console.error(e);
    }
    //end of custom property creation
  }

  exchangeForTokens = async (userId, exchangeProof) => {
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

      console.log('tokens : ', tokens);
      refreshTokenStore[userId] = tokens.refresh_token;
      accessTokenCache.set(
        userId,
        tokens.access_token,
        Math.round(tokens.expires_in * 0.75),
      );

      console.log(
        '       > Received an access token and refresh token',
        tokens,
      );
      return tokens;
    } catch (e) {
      console.error(
        `Error exchanging ${exchangeProof.grant_type} for access token`,
      );
      return JSON.parse(e.response.body);
    }
  };

  refreshAccessToken = async (userId) => {
    const refreshTokenProof = {
      grant_type: 'refresh_token',
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      refresh_token: refreshTokenStore[userId],
    };
    return await this.exchangeForTokens(userId, refreshTokenProof);
  };

  getAccessToken = async (userId) => {
    // If the access token has expired, retrieve
    // a new one using the refresh token
    if (!accessTokenCache.get(userId)) {
      console.log('Refreshing expired access token');
      await this.refreshAccessToken(userId);
    }
    return accessTokenCache.get(userId);
  };
}
