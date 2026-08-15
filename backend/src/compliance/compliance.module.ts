import { Module } from '@nestjs/common';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [PrismaModule, RbacModule],
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
