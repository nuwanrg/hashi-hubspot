import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, HttpModule],
  providers: [UsersService],
})
export class AuthModule {}
