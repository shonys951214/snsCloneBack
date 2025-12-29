export class ImageResponseDto {
  id: number;
  userId: number;
  url: string;
  originalName: string | null;
  size: number | null;
  mimeType: string | null;
  createdAt: Date;
}

