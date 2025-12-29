import { IsInt } from 'class-validator';

export class CreatePostimageDto {
  @IsInt()
  postId: number;

  @IsInt()
  imageId: number;
}
