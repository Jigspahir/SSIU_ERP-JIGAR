import { Module } from '@nestjs/common';
import { FeesController } from './fees.controller';
import { FeesService } from './fees.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  controllers: [FeesController],
  providers: [FeesService],
  exports: [FeesService],
})
export class FeesModule {}
