import { Controller, Post, Get, Delete, Body, Param, Query } from '@nestjs/common';
import { InstagramParsingService } from './instagram-parsing.service';
import { InstagramParsingDto } from './dto/instagram-parsing.dto';

@Controller('instagram-parsing')
export class InstagramParsingController {
  constructor(private readonly instagramParsingService: InstagramParsingService) {}

  @Post('parse')
  async parseComments(@Body() parsingDto: InstagramParsingDto) {
    return this.instagramParsingService.parseInstagramComments(parsingDto);
  }

  @Get('comments')
  async getAllComments() {
    return this.instagramParsingService.getAllComments();
  }

  @Get('comments/by-url')
  async getCommentsByUrl(@Query('url') postUrl: string) {
    return this.instagramParsingService.getCommentsByPostUrl(postUrl);
  }

  @Delete('comments/by-url')
  async deleteCommentsByUrl(@Query('url') postUrl: string) {
    await this.instagramParsingService.deleteCommentsByPostUrl(postUrl);
    return { message: `Коментарі для поста ${postUrl} успішно видалено` };
  }
}
