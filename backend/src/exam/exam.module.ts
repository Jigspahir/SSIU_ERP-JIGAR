import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
