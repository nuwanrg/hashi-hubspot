import { Injectable, Req, Res } from '@nestjs/common';
import Stripe from 'stripe';
import { Cart } from './Cart.model';

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
          /* price_data: {
            currency: 'usd',
            product_data: {
              name: 'Hashi',
            },
            unit_amount: 2000,
          },*/
          price: 'price_1LnJWaALa3pUXDKn9sy09cnl',
          quantity: 1,
        },
      ],
      success_url: 'http://hashibridge.com',
      cancel_url: 'http://hashibridge.com',
      subscription_data: {
        metadata: {
          code: req.query.code,
        },
      },
    });
    console.log('session : ', session);
    res.redirect(session.url);
  }
}
