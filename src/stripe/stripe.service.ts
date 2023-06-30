import { Injectable, Req, Res } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  STRIPE_HASHI_PRICE = process.env.STRIPE_HASHI_PRICE;
  private stripe;

  constructor() {
    console.log('STRIPE_HASHI_PRICE: ', this.STRIPE_HASHI_PRICE);
    this.stripe = new Stripe(
      '#',
      //''#,
      {
        apiVersion: '2022-08-01',
      },
    );
  }

  async checkout(@Req() req, @Res() res) {
    //console.log('req from hubspot: ', req);
    // console.log('authorization code from hubspot: ', req.query.code);
    // console.log('sessionID: ', req.sessionID);
    // console.log('STRIPE_HASHI_PRICE: ', this.STRIPE_HASHI_PRICE);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1MK3KjALa3pUXDKnwqRxaen5',
          //price: 'price_1MOZvyALa3pUXDKnC6775JCT',
          quantity: 1,
        },
      ],
      success_url: 'https://app.hubspot.com/login',
      cancel_url: 'https://app.hubspot.com/login',
      subscription_data: {
        trial_period_days: 15,
        metadata: {
          code: req.query.code, //code passed from hubspot
          sessionID: req.sessionID,
          hubspotCustomerID: 'test',
        },
      },
    });
    //console.log('session : ', session);
    res.redirect(session.url);
  }

  async checkSubscription(): Promise<Boolean> {
    return false;
  }
}
