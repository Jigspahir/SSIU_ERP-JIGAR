import { Module } from '@nestjs/common';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  controllers: [ResearchController],
  providers: [ResearchService],
  exports: [ResearchService],
})
export class ResearchModule {}
