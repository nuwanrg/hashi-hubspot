import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { TransactionModule } from './api/transaction.module';
import { StripeService } from './stripe/stripe.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TransactionModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, StripeService],
})
export class AppModule {}
