import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function parseDateSafe(dateInput?: string | Date): Date | undefined {
  if (!dateInput) return undefined;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? undefined : dateInput;
  const str = String(dateInput).trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const parts = str.split('/');
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    const d = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    return isNaN(d.getTime()) ? undefined : d;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? undefined : d;
}

function normalizePriority(p?: string): string {
  if (!p) return 'NORMAL';
  const upper = p.trim().toUpperCase();
  if (['LOW', 'NORMAL', 'HIGH', 'URGENT'].includes(upper)) return upper;
  if (upper === 'MEDIUM') return 'NORMAL';
  return 'NORMAL';
}

@Injectable()
export class WorkManagementService {
  constructor(private readonly prisma: PrismaService) {}

  // ── 1. Dashboard Aggregation ─────────────────────────────────────────────

  async getWorkDashboard(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      todaysTasks,
      overdueTasks,
      upcomingTasks,
      todaysMeetings,
      upcomingMeetings,
      appointments,
      followUps,
      recentDiary,
      quickNotes,
    ] = await Promise.all([
      // Today's tasks
      this.prisma.workTask.findMany({
        where: { userId, dueDate: today, status: { not: 'COMPLETED' } },
        orderBy: { priority: 'desc' },
      }),
      // Overdue tasks
      this.prisma.workTask.findMany({
        where: { userId, dueDate: { lt: today }, status: { not: 'COMPLETED' } },
        orderBy: { dueDate: 'asc' },
      }),
      // Upcoming tasks (with next action dates)
      this.prisma.workTask.findMany({
        where: { userId, dueDate: { gt: today }, status: { not: 'COMPLETED' } },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      // Today's meetings
      this.prisma.personalMeeting.findMany({
        where: {
          meetingDate: today,
          OR: [{ organizerUserId: userId }, { participants: { some: { userId } } }],
        },
        orderBy: { startTime: 'asc' },
      }),
      // Upcoming meetings
      this.prisma.personalMeeting.findMany({
        where: {
          meetingDate: { gt: today },
          OR: [{ organizerUserId: userId }, { participants: { some: { userId } } }],
        },
        orderBy: { meetingDate: 'asc' },
        take: 5,
      }),
      // Appointments
      this.prisma.personalAppointment.findMany({
        where: { userId, appointmentDate: { gte: today }, status: 'SCHEDULED' },
        orderBy: { appointmentDate: 'asc' },
        take: 5,
      }),
      // Follow-ups
      this.prisma.workFollowUp.findMany({
        where: { userId, status: { in: ['PENDING', 'FOLLOW_UP_TODAY'] } },
        orderBy: { nextFollowUpDate: 'asc' },
        take: 5,
      }),
      // Recent Work Diary
      this.prisma.workDiary.findMany({
        where: { userId },
        orderBy: { workDate: 'desc' },
        take: 5,
      }),
      // Quick Notes
      this.prisma.personalNote.findMany({
        where: { userId },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      }),
    ]);

    // Calculate Summary Counts
    const [completedTasksCount, pendingTasksCount] = await Promise.all([
      this.prisma.workTask.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.workTask.count({ where: { userId, status: { in: ['TODO', 'IN_PROGRESS'] } } }),
    ]);

    return {
      todaysTasks,
      overdueTasks,
      upcomingTasks,
      todaysMeetings,
      upcomingMeetings,
      appointments,
      followUps,
      recentDiary,
      quickNotes,
      summary: {
        completed: completedTasksCount,
        pending: pendingTasksCount,
        overdue: overdueTasks.length,
        scheduledMeetings: todaysMeetings.length + upcomingMeetings.length,
      },
    };
  }

  // ── 2. Daily Work Diary ──────────────────────────────────────────────────

  async createDiaryEntry(userId: string, data: {
    workTitle: string;
    description?: string;
    category?: string;
    workDate: string;
    startTime?: string;
    endTime?: string;
    priority?: string;
    status?: string;
    relatedModule?: string;
    relatedPerson?: string;
    relatedDepartment?: string;
    relatedInstitute?: string;
    remarks?: string;
  }) {
    const safeWorkDate = parseDateSafe(data.workDate) || new Date();
    return this.prisma.workDiary.create({
      data: {
        userId,
        workTitle: data.workTitle,
        description: data.description,
        category: data.category || 'GENERAL',
        workDate: safeWorkDate,
        startTime: data.startTime,
        endTime: data.endTime,
        priority: normalizePriority(data.priority),
        status: data.status || 'COMPLETED',
        relatedModule: data.relatedModule,
        relatedPerson: data.relatedPerson,
        relatedDepartment: data.relatedDepartment,
        relatedInstitute: data.relatedInstitute,
        remarks: data.remarks,
      },
    });
  }

  async getDiaryEntries(userId: string, date?: string) {
    const safeDate = parseDateSafe(date);
    return this.prisma.workDiary.findMany({
      where: {
        userId,
        ...(safeDate ? { workDate: safeDate } : {}),
      },
      orderBy: { workDate: 'desc' },
    });
  }

  // ── 3. Task Management & Next Action ─────────────────────────────────────

  async createTask(userId: string, data: {
    title: string;
    description?: string;
    priority?: string;
    startDate?: string;
    dueDate?: string;
    assignedToUserId?: string;
    nextAction?: string;
    nextActionDate?: string;
    relatedModule?: string;
    relatedRecord?: string;
    remarks?: string;
  }) {
    const safeStartDate = parseDateSafe(data.startDate);
    const safeDueDate = parseDateSafe(data.dueDate) || new Date();
    const safeNextActionDate = parseDateSafe(data.nextActionDate);

    return this.prisma.workTask.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        priority: normalizePriority(data.priority),
        startDate: safeStartDate,
        dueDate: safeDueDate,
        status: 'TODO',
        assignedByUserId: userId,
        assignedToUserId: data.assignedToUserId || userId,
        nextAction: data.nextAction,
        nextActionDate: safeNextActionDate,
        relatedModule: data.relatedModule,
        relatedRecord: data.relatedRecord,
        remarks: data.remarks,
      },
    });
  }

  async getTasks(userId: string, status?: string, assignedToMe?: boolean) {
    return this.prisma.workTask.findMany({
      where: {
        ...(assignedToMe ? { assignedToUserId: userId } : { userId }),
        ...(status ? { status: status.toUpperCase() } : {}),
      },
      include: { delegations: true },
      orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
    });
  }

  async updateTaskStatus(userId: string, taskId: string, status: string, nextAction?: string, nextActionDate?: string) {
    const task = await this.prisma.workTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found.');
    if (task.userId !== userId && task.assignedToUserId !== userId) {
      throw new ForbiddenException('You are not authorized to update this task.');
    }

    const safeNextActionDate = parseDateSafe(nextActionDate);

    return this.prisma.workTask.update({
      where: { id: taskId },
      data: {
        status: status.toUpperCase(),
        ...(status.toUpperCase() === 'COMPLETED' ? { completedAt: new Date() } : {}),
        ...(nextAction ? { nextAction } : {}),
        ...(safeNextActionDate ? { nextActionDate: safeNextActionDate } : {}),
      },
    });
  }

  async delegateTask(userId: string, taskId: string, delegateToUserId: string, dueBy: string, reason?: string) {
    const task = await this.prisma.workTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found.');

    const safeDueBy = parseDateSafe(dueBy) || new Date();

    return this.prisma.$transaction(async (tx) => {
      await tx.taskDelegation.create({
        data: {
          taskId,
          delegatedBy: userId,
          delegatedTo: delegateToUserId,
          dueBy: safeDueBy,
          reason,
        },
      });

      return tx.workTask.update({
        where: { id: taskId },
        data: { assignedToUserId: delegateToUserId },
      });
    });
  }

  // ── 4. Meetings & Invitations ──────────────────────────────────────────────

  async createMeeting(userId: string, data: {
    title: string;
    meetingDate: string;
    startTime: string;
    endTime: string;
    location?: string;
    isOnline?: boolean;
    meetingLink?: string;
    agenda?: string;
    participantUserIds?: string[];
  }) {
    const safeMeetingDate = parseDateSafe(data.meetingDate) || new Date();
    return this.prisma.personalMeeting.create({
      data: {
        organizerUserId: userId,
        title: data.title,
        meetingDate: safeMeetingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        isOnline: data.isOnline || false,
        meetingLink: data.meetingLink,
        agenda: data.agenda,
        status: 'SCHEDULED',
        participants: {
          create: (data.participantUserIds || []).map((pUserId) => ({
            userId: pUserId,
            rsvp: pUserId === userId ? 'ACCEPTED' : 'PENDING',
          })),
        },
      },
      include: { participants: true },
    });
  }

  async getMeetings(userId: string) {
    return this.prisma.personalMeeting.findMany({
      where: {
        OR: [{ organizerUserId: userId }, { participants: { some: { userId } } }],
      },
      include: { participants: true },
      orderBy: { meetingDate: 'desc' },
    });
  }

  // ── 5. Appointments & Follow-ups ───────────────────────────────────────────

  async createAppointment(userId: string, data: {
    title: string;
    personName: string;
    purpose?: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    location?: string;
    contact?: string;
    notes?: string;
    reminderMinutes?: number;
  }) {
    const safeApptDate = parseDateSafe(data.appointmentDate) || new Date();
    return this.prisma.personalAppointment.create({
      data: {
        userId,
        title: data.title,
        personName: data.personName,
        purpose: data.purpose,
        appointmentDate: safeApptDate,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        contact: data.contact,
        notes: data.notes,
        reminderMinutes: data.reminderMinutes || 15,
        status: 'SCHEDULED',
      },
    });
  }

  async getAppointments(userId: string) {
    return this.prisma.personalAppointment.findMany({
      where: { userId },
      orderBy: { appointmentDate: 'desc' },
    });
  }

  async createFollowUp(userId: string, data: {
    subject: string;
    personName: string;
    relatedModule?: string;
    relatedRecord?: string;
    nextFollowUpDate: string;
    remarks?: string;
  }) {
    const safeNextFollowUpDate = parseDateSafe(data.nextFollowUpDate) || new Date();
    return this.prisma.workFollowUp.create({
      data: {
        userId,
        subject: data.subject,
        personName: data.personName,
        relatedModule: data.relatedModule,
        relatedRecord: data.relatedRecord,
        nextFollowUpDate: safeNextFollowUpDate,
        status: 'PENDING',
        remarks: data.remarks,
      },
    });
  }

  async getFollowUps(userId: string) {
    return this.prisma.workFollowUp.findMany({
      where: { userId },
      orderBy: { nextFollowUpDate: 'asc' },
    });
  }

  // ── 6. Personal Notes ──────────────────────────────────────────────────────

  async createNote(userId: string, data: { title: string; content: string; tags?: string; isPinned?: boolean }) {
    return this.prisma.personalNote.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        tags: data.tags,
        isPinned: data.isPinned || false,
        isPrivate: true,
      },
    });
  }

  async getNotes(userId: string, search?: string) {
    return this.prisma.personalNote.findMany({
      where: {
        userId,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { tags: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // ── 7. Calendar Aggregation ───────────────────────────────────────────────

  async getCalendarItems(userId: string) {
    const [tasks, meetings, appointments, followUps] = await Promise.all([
      this.prisma.workTask.findMany({ where: { userId } }),
      this.prisma.personalMeeting.findMany({
        where: { OR: [{ organizerUserId: userId }, { participants: { some: { userId } } }] },
      }),
      this.prisma.personalAppointment.findMany({ where: { userId } }),
      this.prisma.workFollowUp.findMany({ where: { userId } }),
    ]);

    return {
      tasks: tasks.map((t) => ({ id: t.id, title: t.title, date: t.dueDate, type: 'TASK', status: t.status })),
      meetings: meetings.map((m) => ({ id: m.id, title: m.title, date: m.meetingDate, type: 'MEETING', status: m.status })),
      appointments: appointments.map((a) => ({ id: a.id, title: a.title, date: a.appointmentDate, type: 'APPOINTMENT', status: a.status })),
      followUps: followUps.map((f) => ({ id: f.id, title: f.subject, date: f.nextFollowUpDate, type: 'FOLLOW_UP', status: f.status })),
    };
  }
}
