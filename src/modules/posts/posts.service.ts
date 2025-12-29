import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Post } from './entities/post.entity';
import { PostImage } from '../postimages/entities/postimage.entity';
import { Image } from '../images/entities/image.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostsService {
  private supabase: SupabaseClient;

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostImage)
    private postImageRepository: Repository<PostImage>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('supabase.url');
    const supabaseKey = this.configService.get<string>('supabase.key');

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async create(
    userId: number,
    createPostDto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const { title, content, imageIds } = createPostDto;

    // 게시글 생성
    const post = this.postRepository.create({
      userId,
      title,
      content,
    });
    const savedPost = await this.postRepository.save(post);

    // 이미지 연결
    if (imageIds && imageIds.length > 0) {
      // 이미지 소유권 확인
      const images = await this.imageRepository.find({
        where: {
          id: In(imageIds),
          userId,
        },
      });

      if (images.length !== imageIds.length) {
        throw new BadRequestException(
          '일부 이미지를 찾을 수 없거나 권한이 없습니다.',
        );
      }

      // PostImage 생성
      const postImages = imageIds.map((imageId) =>
        this.postImageRepository.create({
          postId: savedPost.id,
          imageId,
        }),
      );
      await this.postImageRepository.save(postImages);
    }

    return this.findOne(savedPost.id);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    userId?: number,
  ): Promise<{
    posts: PostResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const whereCondition = userId ? { userId } : {};
    
    const [posts, total] = await this.postRepository.findAndCount({
      where: whereCondition,
      relations: ['user', 'postImages', 'postImages.image'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const postDtos = posts.map((post) => this.mapToPostResponseDto(post));

    return {
      posts: postDtos,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<PostResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'postImages', 'postImages.image'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return this.mapToPostResponseDto(post);
  }

  async update(
    userId: number,
    id: number,
    updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    // 게시글 업데이트
    if (updatePostDto.title !== undefined) {
      post.title = updatePostDto.title;
    }
    if (updatePostDto.content !== undefined) {
      post.content = updatePostDto.content;
    }
    await this.postRepository.save(post);

    // 이미지 업데이트
    if (updatePostDto.imageIds !== undefined) {
      // 기존 PostImage 삭제
      await this.postImageRepository.delete({ postId: id });

      // 새로운 이미지 연결
      if (updatePostDto.imageIds.length > 0) {
        const images = await this.imageRepository.find({
          where: {
            id: In(updatePostDto.imageIds),
            userId,
          },
        });

        if (images.length !== updatePostDto.imageIds.length) {
          throw new BadRequestException(
            '일부 이미지를 찾을 수 없거나 권한이 없습니다.',
          );
        }

        const postImages = updatePostDto.imageIds.map((imageId) =>
          this.postImageRepository.create({
            postId: id,
            imageId,
          }),
        );
        await this.postImageRepository.save(postImages);
      }
    }

    return this.findOne(id);
  }

  async remove(userId: number, id: number): Promise<void> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['postImages', 'postImages.image'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('게시글을 삭제할 권한이 없습니다.');
    }

    // 게시글에 연결된 이미지들을 Supabase Storage에서 삭제
    if (post.postImages && post.postImages.length > 0 && this.supabase) {
      const bucketName: string =
        this.configService.get<string>('supabase.bucketName') || 'uploads';

      for (const postImage of post.postImages) {
        const image = postImage.image;
        if (image && image.url) {
          try {
            // URL에서 파일 경로 추출 (userId/filename 형식)
            const urlParts = image.url.split('/');
            const filePath = urlParts.slice(-2).join('/'); // 마지막 2개 요소 (userId/filename)

            const { error } = await this.supabase.storage
              .from(bucketName)
              .remove([filePath]);

            if (error) {
              console.error(
                `Supabase 파일 삭제 실패 (imageId: ${image.id}):`,
                error,
              );
              // 에러가 발생해도 계속 진행 (DB는 삭제)
            }
          } catch (error) {
            console.error(
              `이미지 삭제 중 오류 발생 (imageId: ${image.id}):`,
              error,
            );
          }
        }
      }
    }

    // DB에서 게시글 삭제 (CASCADE로 연결된 PostImage와 Image도 삭제됨)
    await this.postRepository.remove(post);
  }

  private mapToPostResponseDto(post: Post): PostResponseDto {
    return {
      id: post.id,
      userId: post.userId,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt || new Date(),
      updatedAt: post.updatedAt || new Date(),
      images:
        post.postImages?.map((postImage) => ({
          id: postImage.image.id,
          url: postImage.image.url,
          originalName: postImage.image.originalName,
        })) || [],
      user: {
        id: post.user.id,
        nickname: post.user.nickname,
        profileImage: post.user.profileImage || '',
      },
    };
  }
}
