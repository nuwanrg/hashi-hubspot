import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/model/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userDto: User): Promise<User> {
    const user = await this.usersRepository.save(userDto);
    return user;
  }

  async findOneHubId(hub_id: string): Promise<User> {
    return await this.usersRepository.findOneBy({ hub_id: hub_id });
  }

  async findOnesubscriptionId(subscriptionId: string): Promise<User> {
    return await this.usersRepository.findOneBy({
      subscriptionId: subscriptionId,
    });
  }

  async update(userDto: User): Promise<User> {
    await this.usersRepository.update(userDto.id, userDto);
    return userDto;
  }
}
