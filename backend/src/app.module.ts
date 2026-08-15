import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { RbacModule } from './rbac/rbac.module';
import { CoreMastersModule } from './core-masters/core-masters.module';
import { WorkflowModule } from './workflow/workflow.module';
import { AcademicMappingModule } from './academic-mapping/academic-mapping.module';
// University Attendance Management & Analytics Engine
import { AttendanceModule } from './attendance/attendance.module';
// Backend 7 — Examination & Fees
import { ExamModule } from './exam/exam.module';
import { FeesModule } from './fees/fees.module';
// Store, Purchase & Assets
import { StoreModule } from './store/store.module';
import { PurchaseModule } from './purchase/purchase.module';
import { AssetsModule } from './assets/assets.module';
// Backend 8 — HR & Campus Operations
import { HrModule } from './hr/hr.module';
import { HostelModule } from './hostel/hostel.module';
import { TransportModule } from './transport/transport.module';
import { LibraryModule } from './library/library.module';
import { ItHelpdeskModule } from './it-helpdesk/it-helpdesk.module';
import { CampusServicesModule } from './campus-services/campus-services.module';
// Backend 10 — Research, Innovation, Incubation, Placement & Alumni
import { ResearchModule } from './research/research.module';
import { InnovationModule } from './innovation/innovation.module';
import { IncubationModule } from './incubation/incubation.module';
import { PlacementModule } from './placement/placement.module';
import { AlumniModule } from './alumni/alumni.module';
// Backend 11 — IQAC, NAAC, Compliance & University Governance
import { IqacModule } from './iqac/iqac.module';
import { NaacModule } from './naac/naac.module';
import { ComplianceModule } from './compliance/compliance.module';
import { GovernanceModule } from './governance/governance.module';
// Backend 12 — Reports, Analytics, Search & Audit
import { ReportsModule } from './reports/reports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { AuditModule } from './audit/audit.module';
// SSIU Actual Organogram & Authority Engine
import { OrganogramModule } from './organogram/organogram.module';
// Personal Work Diary & Work Management
import { WorkManagementModule } from './work-management/work-management.module';
// University Communication & Official Correspondence
import { CommunicationModule } from './communication/communication.module';
// Digital Student Service Desk & Certificates
import { StudentServicesModule } from './student-services/student-services.module';
// Admission & Enrollment Management
import { AdmissionModule } from './admission/admission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    RbacModule,
    CoreMastersModule,
    WorkflowModule,
    AcademicMappingModule,
    AttendanceModule,
    // Backend 7
    ExamModule,
    FeesModule,
    // Store, Purchase, Assets
    StoreModule,
    PurchaseModule,
    AssetsModule,
    // Backend 8 Operations
    HrModule,
    HostelModule,
    TransportModule,
    LibraryModule,
    ItHelpdeskModule,
    CampusServicesModule,
    // Backend 10
    ResearchModule,
    InnovationModule,
    IncubationModule,
    PlacementModule,
    AlumniModule,
    // Backend 11 Governance & IQAC
    IqacModule,
    NaacModule,
    ComplianceModule,
    GovernanceModule,
    // Backend 12 Reporting, Analytics, Search & Audit
    ReportsModule,
    AnalyticsModule,
    SearchModule,
    AuditModule,
    // SSIU Organogram
    OrganogramModule,
    // Personal Work Diary & Management
    WorkManagementModule,
    // University Communication
    CommunicationModule,
    // Digital Student Service Desk
    StudentServicesModule,
    // Admission & Enrollment
    AdmissionModule,
  ],
})
export class AppModule {}
