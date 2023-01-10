import { Module } from '@nestjs/common';
import { BattleResolvers } from './battle.resolver';
import { BattleService } from './battle.service';

@Module({
  providers: [BattleService, BattleResolvers],
})
export class VideoModule {}
