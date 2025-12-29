import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Image } from './entities/image.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ImagesService {
  private supabase: SupabaseClient;

  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.key');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 설정이 필요합니다.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadImage(
    userId: number,
    file: Express.Multer.File,
  ): Promise<Image> {
    if (!file) {
      throw new BadRequestException('파일이 필요합니다.');
    }

    // 파일 유효성 검사
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('지원하지 않는 이미지 형식입니다.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('파일 크기는 5MB를 초과할 수 없습니다.');
    }

    // 사용자 확인
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 파일명 생성 (고유한 파일명)
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Supabase Storage에 업로드
    const bucketName: string = this.configService.get<string>('supabase.bucketName') || 'uploads';
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`이미지 업로드 실패: ${error.message}`);
    }

    // Public URL 생성
    const bucketNameForUrl: string = this.configService.get<string>('supabase.bucketName') || 'uploads';
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(bucketNameForUrl).getPublicUrl(filePath);

    // DB에 이미지 정보 저장
    const image = this.imageRepository.create({
      userId,
      url: publicUrl,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    });

    return await this.imageRepository.save(image);
  }

  async deleteImage(userId: number, imageId: number): Promise<void> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, userId },
    });

    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }

    // Supabase Storage에서 파일 삭제
    const bucketName: string = this.configService.get<string>('supabase.bucketName') || 'uploads';
    const filePath = image.url.split('/').slice(-2).join('/'); // userId/filename 추출
    const { error } = await this.supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Supabase 파일 삭제 실패:', error);
      // DB는 삭제하되, Supabase 삭제 실패는 로그만 남김
    }

    // DB에서 이미지 정보 삭제
    await this.imageRepository.remove(image);
  }

  async getUserImages(userId: number): Promise<Image[]> {
    return await this.imageRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
