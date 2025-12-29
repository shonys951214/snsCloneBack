import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostimagesService } from './postimages.service';
import { PostimagesController } from './postimages.controller';
import { PostImage } from './entities/postimage.entity';
import { Post } from '../posts/entities/post.entity';
import { Image } from '../images/entities/image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostImage, Post, Image])],
  controllers: [PostimagesController],
  providers: [PostimagesService],
  exports: [PostimagesService],
})
export class PostimagesModule {}
