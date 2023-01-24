import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { UserService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Module({
  imports: [HttpModule, UsersModule],
  providers: [UserService, AuthService],
})
export class AuthModule {}
