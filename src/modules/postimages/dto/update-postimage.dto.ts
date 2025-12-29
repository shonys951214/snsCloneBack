import { PartialType } from '@nestjs/mapped-types';
import { CreatePostimageDto } from './create-postimage.dto';
import { IsOptional, IsInt } from 'class-validator';

export class UpdatePostimageDto extends PartialType(CreatePostimageDto) {
  @IsOptional()
  @IsInt()
  postId?: number;

  @IsOptional()
  @IsInt()
  imageId?: number;
}
