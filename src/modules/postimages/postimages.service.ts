import { Injectable } from '@nestjs/common';
import { CreatePostimageDto } from './dto/create-postimage.dto';
import { UpdatePostimageDto } from './dto/update-postimage.dto';

@Injectable()
export class PostimagesService {
  create(createPostimageDto: CreatePostimageDto) {
    return 'This action adds a new postimage';
  }

  findAll() {
    return `This action returns all postimages`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postimage`;
  }

  update(id: number, updatePostimageDto: UpdatePostimageDto) {
    return `This action updates a #${id} postimage`;
  }

  remove(id: number) {
    return `This action removes a #${id} postimage`;
  }
}
