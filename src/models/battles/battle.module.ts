import { Module } from '@nestjs/common';
import { VideoResolvers } from './battle.resolver';
import { VideoService } from './battle.service';

@Module({
  providers: [VideoService, VideoResolvers],
})
export class VideoModule {}
