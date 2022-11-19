import { Module } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { ZohoController } from './zoho.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZohoWallet } from './zoho.wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ZohoWallet])],
  providers: [ZohoService],
  controllers: [ZohoController],
})
export class ZohoModule {}
