import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostimagesService } from './postimages.service';
import { CreatePostimageDto } from './dto/create-postimage.dto';
import { UpdatePostimageDto } from './dto/update-postimage.dto';

@Controller('postimages')
export class PostimagesController {
  constructor(private readonly postimagesService: PostimagesService) {}

  @Post()
  create(@Body() createPostimageDto: CreatePostimageDto) {
    return this.postimagesService.create(createPostimageDto);
  }

  @Get()
  findAll() {
    return this.postimagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postimagesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostimageDto: UpdatePostimageDto) {
    return this.postimagesService.update(+id, updatePostimageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postimagesService.remove(+id);
  }
}
