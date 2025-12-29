import { IsString, IsInt, IsOptional, IsUrl } from 'class-validator';

export class CreateImageDto {
  @IsInt()
  userId: number;

  @IsUrl()
  url: string;

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
