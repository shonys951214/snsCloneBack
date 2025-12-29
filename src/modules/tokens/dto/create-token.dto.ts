import { IsString, IsInt, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class CreateTokenDto {
  @IsInt()
  userId: number;

  @IsString()
  refreshToken: string;

  @IsOptional()
  @IsBoolean()
  isRevoked?: boolean;

  @IsDateString()
  expiresAt: string;
}
