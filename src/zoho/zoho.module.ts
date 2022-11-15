import { Module } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { ZohoController } from './zoho.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './zoho.wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  providers: [ZohoService],
  controllers: [ZohoController],
})
export class ZohoModule {}
