import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // 환경 변수 확인 및 로깅 (디버깅용)
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const dbUsername = process.env.DB_USERNAME || 'root';
  const dbDatabase = process.env.DB_DATABASE || 'sns';

  // 프로덕션 환경에서 환경 변수 확인
  if (process.env.NODE_ENV === 'production') {
    console.log('Database Config:', {
      host: dbHost,
      port: dbPort,
      username: dbUsername,
      database: dbDatabase,
      hasPassword: !!process.env.DB_PASSWORD,
    });
  }

  return {
    type: 'mysql',
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: process.env.DB_PASSWORD || '',
    database: dbDatabase,
    entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    timezone: '+09:00',
    // MySQL2에서 지원하는 연결 옵션만 사용
    extra: {
      connectionLimit: 10,
      connectTimeout: 60000, // 60초 (MySQL2에서 지원)
      // SSL 연결이 필요한 경우 (외부 MySQL 서비스 사용 시)
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : false,
    },
    // 재시도 옵션
    retryAttempts: 10,
    retryDelay: 3000, // 3초
  };
});
