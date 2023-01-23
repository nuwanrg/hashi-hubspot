import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 300 })
  user: string;

  @Column({ type: 'varchar', length: 300 })
  subscriptionId: string;

  @Column({ type: 'varchar', length: 300 })
  expires_in: string;

  @Column({ type: 'varchar', length: 300 })
  hub_id: string;

  @Column({ type: 'varchar', length: 300 })
  user_id: string;

  @Column({ type: 'varchar', length: 300 })
  app_id: string;
}
