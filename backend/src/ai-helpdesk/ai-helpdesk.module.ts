import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { FeesModule } from '../fees/fees.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { ExamModule } from '../exam/exam.module';
import { DocumentsModule } from '../documents/documents.module';
import { AiHelpdeskController } from './ai-helpdesk.controller';
import { AiHelpdeskService } from './ai-helpdesk.service';
import { StudentToolsDispatcher } from './tools/student-tools.dispatcher';
import { AiRateLimitGuard } from './guards/ai-rate-limit.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    FeesModule,
    AttendanceModule,
    ExamModule,
    DocumentsModule,
  ],
  controllers: [AiHelpdeskController],
  providers: [
    AiHelpdeskService,
    StudentToolsDispatcher,
    AiRateLimitGuard,
  ],
  exports: [AiHelpdeskService, StudentToolsDispatcher],
})
export class AiHelpdeskModule {}
