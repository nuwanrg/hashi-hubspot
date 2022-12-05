import { Injectable, Req, Res } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-08-01',
    });
  }

  async checkout(@Req() req, @Res() res) {
    //console.log(this.stripe.VERSION);
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          //price: 'price_1Ll4ggALa3pUXDKn1pzTPPzm', // prod
          price: 'price_1LnJWaALa3pUXDKn9sy09cnl', // test
          quantity: 1,
        },
      ],
      success_url: 'https://app.hubspot.com/login',
      cancel_url: 'https://app.hubspot.com/login',
      subscription_data: {
        metadata: {
          code: req.query.code, //code passed from hubspot
          sessionID: req.sessionID,
        },
      },
    });
    console.log('session : ', session);
    res.redirect(session.url);
  }
}
