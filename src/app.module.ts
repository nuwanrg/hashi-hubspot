import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { TransactionController } from './api/transaction.controller';
import { TransactionModule } from './api/transaction.module';
import { TransactionService } from './api/transaction.service';
import { StripeService } from './stripe/stripe.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TransactionModule,
  ],
  controllers: [AppController, TransactionController, AuthController],
  providers: [AppService, TransactionService, StripeService],
})
export class AppModule {}
