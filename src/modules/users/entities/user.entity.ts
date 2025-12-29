import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Image } from '../../images/entities/image.entity';
import { Post } from '../../posts/entities/post.entity';
import { Token } from '../../tokens/entities/token.entity';

@Index('email', ['email'], { unique: true })
@Index('nickname', ['nickname'], { unique: true })
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'email', unique: true, length: 255 })
  email: string;

  @Column('varchar', { name: 'password', length: 255 })
  password: string;

  @Column('varchar', { name: 'nickname', unique: true, length: 50 })
  nickname: string;

  @Column('datetime', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @Column('datetime', {
    name: 'updatedAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date | null;

  @Column('varchar', {
    name: 'profileImage',
    nullable: true,
    length: 500,
    default: () =>
      "'https://eafpdayrnocflxjptkrm.supabase.co/storage/v1/object/public/uploads/defaultProfile.png'",
  })
  profileImage: string | null;

  @Column('text', {
    name: 'bio',
    nullable: true,
  })
  bio: string | null;

  @OneToMany(() => Image, (images) => images.user)
  images: Image[];

  @OneToMany(() => Post, (posts) => posts.user)
  posts: Post[];

  @OneToMany(() => Token, (tokens) => tokens.user)
  tokens: Token[];
}
