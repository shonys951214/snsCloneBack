import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'sns_db',
  entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  timezone: '+09:00',
  // 연결 옵션 추가 (Render 배포 환경 대응)
  extra: {
    connectionLimit: 10,
    connectTimeout: 60000, // 60초
    acquireTimeout: 60000,
    timeout: 60000,
    // SSL 연결이 필요한 경우 (외부 MySQL 서비스 사용 시)
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false,
    } : false,
  },
  // 재시도 옵션
  retryAttempts: 10,
  retryDelay: 3000, // 3초
}));
