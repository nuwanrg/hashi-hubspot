import { DynamicModule, Module } from '@nestjs/common';
import { Stripe } from 'stripe';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  controllers: [StripeController],
  providers: [StripeService]
})
export class StripeModule {
  static forRoot(apiKey: string, config: Stripe.StripeConfig): DynamicModule {
    const stripe = new Stripe(apiKey, config);
    return {
      module: StripeModule,
    };
  }
}
