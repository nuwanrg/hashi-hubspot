import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  walletAddress: string;

  @Column()
  userId: number;

  @Column()
  companyId: number;

  @Column()
  personId: number;
}
