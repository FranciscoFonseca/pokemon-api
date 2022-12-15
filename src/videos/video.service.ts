import { Injectable } from '@nestjs/common';
import { Video, User } from '../graphql';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class VideoService {
  private readonly videos: Video[] = [];

  create(videoDto: CreateVideoDto): Video {
    const listSize: number = this.videos.length + 1;
    const video: Video = new Video();
    video.id = listSize.toString();
    video.title = videoDto.title;
    video.url = videoDto.url;
    const author: User = {
      id: videoDto.userId,
      name: 'Author ' + videoDto.userId,
    };
    video.author = author;
    this.videos.push(video);
    return video;
  }

  findAll(): Video[] {
    return this.videos;
  }
}
