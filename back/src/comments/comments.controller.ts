import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  findAll(@Query('store') store?: 'playstore' | 'appstore' | 'googlemaps') {
    if (store) {
      return this.commentsService.findByStore(store);
    }
    return this.commentsService.findAll();
  }

  @Get('app/:appId')
  findByAppId(@Param('appId') appId: string) {
    return this.commentsService.findByAppId(appId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(+id);
  }

  @Delete('clear/test')
  clearTestComments() {
    return this.commentsService.clearTestComments();
  }

  @Delete('clear/all')
  clearAllComments() {
    return this.commentsService.clearAllComments();
  }

  @Delete('clear/invalid')
  clearInvalidComments() {
    return this.commentsService.clearInvalidComments();
  }
}
