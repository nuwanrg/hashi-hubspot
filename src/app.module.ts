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
import { PipedriveModule } from './pipedrive/pipedrive.module';
import { ZohoModule } from './zoho/zoho.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './pipedrive/pipedrive.wallet.entity';
import { OauthModule } from './oauth/oauth.module';
import { UsersModule } from './users/users.module';
import { ZohoWallet } from './zoho/zoho.wallet.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'pipedrive.c3fswzqpyf9j.us-east-1.rds.amazonaws.com',
      port: 5432,
      username: 'postgres',
      password: 'postgres123#',
      database: 'postgres',
      entities: [Wallet, ZohoWallet],
      synchronize: true,
    }),
    TransactionModule,
    StripeModule,
    PipedriveModule,
    OauthModule,
    UsersModule,
    ZohoModule,
  ],
  controllers: [AppController, TransactionController, AuthController],
  providers: [AppService, TransactionService, StripeService],
})
export class AppModule {}
