import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 300 })
  user: string;

  @Column({ type: 'varchar', length: 300 })
  subscriptionId: string;

  //  email
}
