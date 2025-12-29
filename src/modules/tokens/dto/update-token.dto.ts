import { PartialType } from '@nestjs/mapped-types';
import { CreateTokenDto } from './create-token.dto';
import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateTokenDto extends PartialType(CreateTokenDto) {
  @IsOptional()
  @IsBoolean()
  isRevoked?: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
