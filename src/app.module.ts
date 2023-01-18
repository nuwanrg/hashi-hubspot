import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { TransactionModule } from './api/transaction.module';
import { StripeService } from './stripe/stripe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getEnvPath } from './common/env.helper';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { User } from './model/user.entity';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { HttpModule } from '@nestjs/axios';

const envFilePath: string = getEnvPath(`${__dirname}/environments`);

const entities =
  process.env.NODE_ENV === 'dev'
    ? join(__dirname, '../**/**.entity{.ts,.js}')
    : 'dist/**/*.entity{ .ts,.js}';

console.log('entities', entities);

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        entities: [User],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TransactionModule,
    AuthModule,
    UsersModule,
    HttpModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, StripeService, UsersService, AuthService],
})
export class AppModule {}
