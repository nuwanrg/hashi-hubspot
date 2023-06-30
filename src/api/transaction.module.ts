import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UserModule } from 'src/users/user.module';
import { UserService } from 'src/users/user.service';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [UserModule, HttpModule],
  controllers: [TransactionController],
  providers: [UserService, TransactionService],
  exports: [],
})
export class TransactionModule {}
