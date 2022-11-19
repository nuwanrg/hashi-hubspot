import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class ZohoWallet {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  walletAddress: string;

  @Column()
  userId: string;

  @Column()
  companyId: string;

  @Column()
  personId: string;
}
