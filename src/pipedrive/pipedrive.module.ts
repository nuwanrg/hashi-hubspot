import { Module } from '@nestjs/common';
import { PipedriveService } from './pipedrive.service';
import { PipedriveController } from './pipedrive.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './pipedrive.wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  providers: [PipedriveService],
  controllers: [PipedriveController],
})
export class PipedriveModule {}
