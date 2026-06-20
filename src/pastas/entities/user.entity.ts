import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('auth_user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 150 })
  username: string;

  @Column({ length: 254, nullable: true })
  email: string;
}
