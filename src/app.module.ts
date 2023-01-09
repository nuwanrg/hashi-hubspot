import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { TransactionModule } from './api/transaction.module';
import { StripeService } from './stripe/stripe.service';
import { configService } from './config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    TransactionModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, StripeService],
})
export class AppModule {}
