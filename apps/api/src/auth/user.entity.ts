import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AiConversation } from '../ia-juridica/ai-conversation.entity';

export type UserRole = 'admin' | 'abogado' | 'asistente' | 'cliente';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'int', default: 0 })
  tokenVersion!: number;

  @Column({ type: 'varchar', length: 20, default: 'cliente' })
  role!: UserRole;

  @OneToMany(() => AiConversation, (conversation) => conversation.user)
  aiConversations!: AiConversation[];
}
