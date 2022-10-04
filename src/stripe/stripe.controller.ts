import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Cart } from './Cart.model';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}
  @Post()
  checkout(@Req() req, @Res() res, @Body() body: { cart: Cart }) {
    console.log(body);
    return this.stripeService.checkout(req, res);
    try {
    } catch (error) {
      return error;
    }
  }
}
