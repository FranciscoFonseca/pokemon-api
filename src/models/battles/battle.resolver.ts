import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import Bull from 'bull';
import { PubSub } from 'graphql-subscriptions';
import { Video, Chat } from '../../graphql';
import { VideoGuard } from './battle.guard';
import { BattleService } from './battle.service';
import { CreateVideoDto } from './dto/create-video.dto';

interface Subscriber {
  id: string;
  socket: WebSocket;
  partnerId?: string;
}

interface ChatRoom {
  id: string;
  subscribers: Subscriber[];
  messageQueue: Bull.Queue<{ message: string; userId?: string }>;
}
const chatRooms = new Map<string, ChatRoom>();
const chats: { id: number; from: string; message: string }[] = [];
const generateRandomId = () => {
  return Math.random().toString(36).substr(2, 9);
};
@Resolver('Video')
export class BattleResolvers {
  private pubSub: PubSub;

  constructor(private readonly battleService: BattleService) {
    this.pubSub = new PubSub();
  }

  private createChatRoom(): ChatRoom {
    // Generate random id
    const generateRandomId = () => {
      return Math.random().toString(36).substr(2, 9);
    };
    // Generate a new chat room
    const id = generateRandomId();
    const messageQueue = new Bull('message-queue-' + id);
    messageQueue.process(async (job) => {
      // Send the message to all subscribers
      const subscribers = chatRooms.get(id).subscribers;
      subscribers.forEach((subscriber) => {
        if (subscriber.partnerId === job.data.userId) {
          subscriber.socket.send(job.data.message);
        }
      });
    });
    const newChatRoom: ChatRoom = {
      id,
      subscribers: [],
      messageQueue,
    };
    chatRooms.set(id, newChatRoom);
    return newChatRoom;
  }
  addSubscriber = (chatRoomId: string, subscriber: Subscriber): boolean => {
    const chatRoom = chatRooms.get(chatRoomId);
    if (!chatRoom) {
      return false;
    }
    if (chatRoom.subscribers.length < 2) {
      chatRoom.subscribers.push(subscriber);
      return true;
    }
    return false;
  };

  removeSubscriber = (chatRoomId: string, subscriberId: string) => {
    const chatRoom = chatRooms.get(chatRoomId);
    if (!chatRoom) {
      return false;
    }
    chatRoom.subscribers = chatRoom.subscribers.filter(
      (subscriber) => subscriber.id !== subscriberId,
    );
    return true;
  };
  addMessage = (chatRoomId: string, message: string, userId?: string) => {
    const chatRoom = chatRooms.get(chatRoomId);
    if (!chatRoom) {
      return false;
    }
    chatRoom.messageQueue.add({ message, userId });
    return true;
  };

  @Mutation(() => Promise<Boolean>)
  async joinChatRoom(
    @Args('subscriber') subscriber: Subscriber,
  ): Promise<boolean> {
    let chatRoom: ChatRoom;
    // check for available room
    for (const [key, value] of chatRooms) {
      if (value.subscribers.length < 2) {
        chatRoom = value;
        break;
      }
    }
    // if no room available create one
    if (!chatRoom) {
      chatRoom = this.createChatRoom();
    }

    if (chatRoom.subscribers.length < 2) {
      // if there is only one subscriber, add the new subscriber
      chatRoom.subscribers.push(subscriber);
      // check if there are two subscribers, and match them
      if (chatRoom.subscribers.length === 2) {
        chatRoom.subscribers[0].partnerId = chatRoom.subscribers[1].id;
        chatRoom.subscribers[1].partnerId = chatRoom.subscribers[0].id;
      }
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  @Query()
  @UseGuards(VideoGuard)
  async videos() {
    return this.battleService.findAll();
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
    const video = await this.battleService.create(args);
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
