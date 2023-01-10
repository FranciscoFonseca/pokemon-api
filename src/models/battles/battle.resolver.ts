import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Video, Chat } from '../../graphql';
import { VideoGuard } from './battle.guard';
import { VideoService } from './battle.service';
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

  @Query()
  lobby(id: number) {
    return id;
  }
  @Mutation()
  createLobby() {
    const chatRoomId = chooseRandomChatRoom();
    return chatRoomId;
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
  @Subscription()
  lobbyCreated(id: number) {
    const channel = `messageAdded${id}`;
    const subscription = this.pubSub.asyncIterator(channel);

    let subscriberCount = 0;
    const subscriberFunction = () => {
      subscriberCount++;
      if (subscriberCount > 2) {
        // Return an error or simply do not add the new subscriber
        throw new Error('The lobby is full');
      }
    };
    return this.pubSub.asyncIterator('LOBBY_CREATED');
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
