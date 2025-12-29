import { IsString, MinLength, MaxLength, IsOptional, MaxLength as MaxLengthValidator } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(50, { message: '닉네임은 최대 50자까지 가능합니다.' })
  nickname?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsString()
  @MaxLengthValidator(500, { message: '소개글은 최대 500자까지 가능합니다.' })
  bio?: string;
}
