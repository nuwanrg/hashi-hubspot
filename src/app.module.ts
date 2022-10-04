import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { TransactionController } from './transaction/transaction.controller';
import { TransactionModule } from './transaction/transaction.module';
import { TransactionService } from './transaction/transaction.service';
import { StripeModule } from './stripe/stripe.module';
import { StripeService } from './stripe/stripe.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TransactionModule,
    StripeModule,
  ],
  controllers: [AppController, TransactionController, AuthController],
  providers: [AppService, TransactionService, StripeService],
})
export class AppModule {}
