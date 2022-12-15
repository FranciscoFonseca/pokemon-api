import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Video, Chat } from '../graphql';
import { VideoGuard } from './video.guard';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { from } from 'rxjs';
const chats: { id: number; from: string; message: string }[] = [];
const CHAT_CHANNEL = 'CHAT_CHANNEL';
@Resolver('Video')
export class VideoResolvers {
  private pubSub: PubSub;

  constructor(private readonly videoService: VideoService) {
    this.pubSub = new PubSub();
  }

  @Query()
  @UseGuards(VideoGuard)
  async videos() {
    return this.videoService.findAll();
  }

  @Query()
  chats(root: any, args: any, context: any) {
    return this.chats;
  }

  @Mutation('sendMessage')
  async sendMessage(from: any, message: any) {
    const chat = {
      id: chats.length + 1,
      from: message.from,
      message: message.message,
    };
    console.log(chats);
    console.log(from, message);
    chats.push(chat);
    this.pubSub.publish('CHAT_CHANNEL', { messageSent: chat });

    return chat;
  }

  @Mutation('createVideo')
  async create(@Args('input') args: CreateVideoDto): Promise<Video> {
    const video = await this.videoService.create(args);
    this.pubSub.publish('videoAdded', { videoAdded: video });
    return video;
  }

  @Subscription((returns) => Video, {})
  videoAdded() {
    return this.pubSub.asyncIterator('videoAdded');
  }
  @Subscription((returns) => Chat, {})
  messageSent() {
    return this.pubSub.asyncIterator('CHAT_CHANNEL');
  }
}
