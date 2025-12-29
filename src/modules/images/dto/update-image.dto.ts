import { PartialType } from '@nestjs/mapped-types';
import { CreateImageDto } from './create-image.dto';
import { IsOptional, IsString, IsInt, IsUrl } from 'class-validator';

export class UpdateImageDto extends PartialType(CreateImageDto) {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  originalName?: string;

  @IsOptional()
  @IsInt()
  size?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;
}
