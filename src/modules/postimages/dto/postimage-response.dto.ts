export class PostimageResponseDto {
  id: number;
  postId: number;
  imageId: number;
  post?: {
    id: number;
    title: string;
  };
  image?: {
    id: number;
    url: string;
  };
}

