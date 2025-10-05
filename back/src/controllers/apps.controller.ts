import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppsService } from '../services/apps.service';

@Controller('apps')
export class AppsController {
  constructor(private appsService: AppsService) {}

  @Get()
  async getAllApps(
    @Query('platform') platform?: string,
    @Query('category') category?: string
  ) {
    return this.appsService.findAll(platform, category);
  }

  @Get(':id')
  async getAppById(@Param('id') id: string) {
    return this.appsService.findById(parseInt(id));
  }

  @Get('platform/:platform/app/:appId')
  async getAppByPlatformAndId(
    @Param('platform') platform: string,
    @Param('appId') appId: string
  ) {
    return this.appsService.findByPlatformAndAppId(platform, appId);
  }
}
