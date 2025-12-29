import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Image } from '../../images/entities/image.entity';

@Index('postId', ['postId'], {})
@Index('imageId', ['imageId'], {})
@Entity('postimages')
export class PostImage {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('int', { name: 'postId' })
  postId: number;

  @Column('int', { name: 'imageId' })
  imageId: number;

  @ManyToOne(() => Post, (post) => post.postImages, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'postId', referencedColumnName: 'id' }])
  post: Post;

  @ManyToOne(() => Image, (image) => image.postImages, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'imageId', referencedColumnName: 'id' }])
  image: Image;
}
