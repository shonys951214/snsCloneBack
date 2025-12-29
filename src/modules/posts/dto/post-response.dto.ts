export class PostResponseDto {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: number;
    url: string;
    originalName: string | null;
  }[];
  user: {
    id: number;
    nickname: string;
    profileImage: string;
  };
}

