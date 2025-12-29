export class TokenResponseDto {
  id: number;
  userId: number;
  refreshToken: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

