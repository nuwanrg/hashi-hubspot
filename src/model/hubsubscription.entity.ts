import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'hubspotSubscription' })
export class HubsubscriptionEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 300 })
  user: string;

  @Column({ type: 'varchar', length: 300 })
  subscriptionId: string;
}
