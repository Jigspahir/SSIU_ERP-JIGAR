import { Module } from '@nestjs/common';
import { CoreMastersService } from './core-masters.service';
import { CoreMastersController } from './core-masters.controller';

@Module({
  controllers: [CoreMastersController],
  providers: [CoreMastersService],
  exports: [CoreMastersService],
})
export class CoreMastersModule {}
