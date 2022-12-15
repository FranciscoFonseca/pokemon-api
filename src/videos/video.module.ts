import { Module } from '@nestjs/common';
import { VideoResolvers } from './video.resolver';
import { VideoService } from './video.service';

@Module({
  providers: [VideoService, VideoResolvers],
})
export class VideoModule {}
