import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/entities/user.entity';
import { Token } from '../modules/tokens/entities/token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, nickname } = registerDto;

    try {
      // 이메일 중복 확인
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }

      // 닉네임 중복 확인
      const existingNickname = await this.userRepository.findOne({
        where: { nickname },
      });
      if (existingNickname) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }

      // 비밀번호 해시
      const hashedPassword = await bcrypt.hash(password, 10);

      // 사용자 생성
      const user = this.userRepository.create({
        email,
        password: hashedPassword,
        nickname,
      });

      const savedUser = await this.userRepository.save(user);

      // 저장 확인
      if (!savedUser || !savedUser.id) {
        throw new Error('사용자 저장에 실패했습니다.');
      }

      // DB에 실제로 저장되었는지 재확인
      const verifyUser = await this.userRepository.findOne({
        where: { id: savedUser.id },
      });
      if (!verifyUser) {
        throw new Error('사용자 저장 검증에 실패했습니다.');
      }

      console.log(
        '회원가입 성공 - 사용자 ID:',
        savedUser.id,
        '이메일:',
        savedUser.email,
      );

      // 토큰 생성
      const tokens = await this.generateTokens(savedUser.id);

      return {
        ...tokens,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          nickname: savedUser.nickname,
          profileImage: savedUser.profileImage || '',
        },
      };
    } catch (err) {
      // ConflictException은 그대로 전달
      if (err instanceof ConflictException) {
        throw err;
      }

      // 기타 에러는 로깅 후 재던지기
      console.error('회원가입 에러:', err);
      throw new ConflictException(
        err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.',
      );
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    console.log('로그인 시도 - 이메일:', email);

    // 사용자 찾기
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      console.log('로그인 실패 - 사용자를 찾을 수 없음:', email);
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    console.log('사용자 찾음 - ID:', user.id, '이메일:', user.email);

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('로그인 실패 - 비밀번호 불일치');
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    console.log('로그인 성공 - 사용자 ID:', user.id);

    // 토큰 생성
    const tokens = await this.generateTokens(user.id);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage || '',
      },
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    const { refreshToken } = refreshTokenDto;

    // Refresh Token 검증
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // DB에서 토큰 확인
      const tokenRecord = await this.tokenRepository.findOne({
        where: {
          refreshToken,
          userId: payload.sub,
          isRevoked: false,
        },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }

      // 새로운 Access Token 생성
      const accessToken = await this.generateAccessToken(payload.sub);

      return { accessToken };
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  async logout(userId: number, refreshToken: string): Promise<void> {
    // Refresh Token 무효화
    await this.tokenRepository.update(
      {
        userId,
        refreshToken,
      },
      {
        isRevoked: true,
      },
    );
  }

  private async generateTokens(userId: number): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);

    // Refresh Token을 DB에 저장
    const expiresAt = new Date();
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    expiresAt.setDate(
      expiresAt.getDate() + parseInt(refreshExpiresIn.replace('d', '')),
    );

    await this.tokenRepository.save({
      userId,
      refreshToken,
      expiresAt,
      isRevoked: false,
    });

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(userId: number): Promise<string> {
    const payload = { sub: userId };
    const secret =
      this.configService.get<string>('jwt.secret') || 'default-secret';
    const expiresIn = this.configService.get<string>('jwt.expiresIn') || '15m';
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresIn as any,
    });
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    const payload = { sub: userId };
    const secret =
      this.configService.get<string>('jwt.refreshSecret') ||
      'default-refresh-secret';
    const expiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresIn as any,
    });
  }
}
