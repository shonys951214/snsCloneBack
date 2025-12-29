import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL || '',
  key: process.env.SUPABASE_KEY || '',
  bucketName: process.env.SUPABASE_BUCKET_NAME || 'uploads',
}));

