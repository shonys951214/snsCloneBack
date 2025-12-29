import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PostImage } from '../../postimages/entities/postimage.entity';

@Index('userId', ['userId'], {})
@Entity('images')
export class Image {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('text', { name: 'url' })
  url: string;

  @Column('varchar', { name: 'originalName', nullable: true, length: 255 })
  originalName: string | null;

  @Column('int', { name: 'size', nullable: true })
  size: number | null;

  @Column('varchar', { name: 'mimeType', nullable: true, length: 100 })
  mimeType: string | null;

  @Column('datetime', {
    name: 'createdAt',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date | null;

  @ManyToOne(() => User, (users) => users.images, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'id' }])
  user: User;

  @OneToMany(() => PostImage, (postImage) => postImage.image)
  postImages: PostImage[];
}
