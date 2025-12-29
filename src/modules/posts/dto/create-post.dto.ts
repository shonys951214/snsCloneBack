import { IsString, IsNotEmpty, IsArray, IsOptional, IsInt } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: '제목은 필수입니다.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '내용은 필수입니다.' })
  content: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  imageIds?: number[];
}
