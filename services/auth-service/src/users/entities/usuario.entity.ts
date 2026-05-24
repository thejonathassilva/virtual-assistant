import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  PLATFORM_OWNER = 'platform_owner',
  ADMIN = 'admin',
  COZINHA = 'cozinha',
  GARCOM = 'garcom',
  CAIXA = 'caixa',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nome!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  cognito_sub?: string;

  @Column({ select: false, nullable: true })
  senha_hash?: string;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ type: 'uuid', nullable: true })
  restaurante_id?: string | null;

  @Column({ default: true })
  ativo!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
