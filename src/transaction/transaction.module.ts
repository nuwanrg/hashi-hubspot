import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';

@Module({
  imports: [],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
