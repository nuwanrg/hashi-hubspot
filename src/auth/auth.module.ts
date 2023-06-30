import { HttpModule, HttpService } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UserModule } from 'src/users/user.module';
import { UserService } from 'src/users/user.service';
import { AuthService } from './auth.service';

@Module({
  imports: [HttpModule, UserModule],
  providers: [UserService, AuthService],
})
export class AuthModule {}
