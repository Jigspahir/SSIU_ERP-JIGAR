import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostelService {
  constructor(private readonly prisma: PrismaService) {}

  private generateNumber(prefix: string) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-2026-${timestamp}${random}`;
  }

  // ── Hostel, Room & Bed Master ───────────────────────────────────────────────

  async createHostel(data: { code: string; name: string; hostelType?: string; gender?: string; capacity?: number; location?: string; wardenName?: string; wardenPhone?: string; wardenEmail?: string }) {
    const existing = await this.prisma.hostel.findUnique({ where: { code: data.code.toUpperCase() } });
    if (existing) throw new ConflictException(`Hostel with code '${data.code}' already exists.`);

    return this.prisma.hostel.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        hostelType: data.hostelType || 'STANDARD',
        gender: data.gender || 'BOYS',
        capacity: data.capacity || 100,
        location: data.location,
        wardenName: data.wardenName,
        wardenPhone: data.wardenPhone,
        wardenEmail: data.wardenEmail,
      },
    });
  }

  async getHostels() {
    let hostels = await this.prisma.hostel.findMany({
      include: {
        rooms: {
          include: { beds: true },
        },
        _count: { select: { rooms: true, allotments: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { name: 'asc' },
    });

    if (hostels.length === 0) {
      const defaultHostels = [
        { code: 'BH-1', name: 'Vivekananda Boys Hostel (Block A)', gender: 'BOYS', capacity: 150, wardenName: 'Dr. Suresh Patel', wardenPhone: '+91 9876500001' },
        { code: 'GH-1', name: 'Gargi Girls Hostel (Block B)', gender: 'GIRLS', capacity: 120, wardenName: 'Dr. Meena Shah', wardenPhone: '+91 9876500002' },
        { code: 'IH-1', name: 'Sarabhai International Hostel', gender: 'CO_ED', capacity: 80, wardenName: 'Prof. Rajesh Sharma', wardenPhone: '+91 9876500003' },
      ];
      for (const h of defaultHostels) {
        const created = await this.prisma.hostel.create({ data: h });
        for (let r = 101; r <= 105; r++) {
          const room = await this.prisma.hostelRoom.create({
            data: {
              hostelId: created.id,
              roomNumber: String(r),
              floor: 1,
              capacity: 2,
              roomType: 'AC',
              facilities: 'Attached Washroom, Study Table, AC, Balcony',
              status: 'AVAILABLE',
            },
          });
          await this.prisma.hostelBed.createMany({
            data: [
              { roomId: room.id, bedNumber: `${r}-A`, status: 'AVAILABLE' },
              { roomId: room.id, bedNumber: `${r}-B`, status: 'AVAILABLE' },
            ],
          });
        }
      }
      hostels = await this.prisma.hostel.findMany({
        include: {
          rooms: {
            include: { beds: true },
          },
          _count: { select: { rooms: true, allotments: { where: { status: 'ACTIVE' } } } },
        },
        orderBy: { name: 'asc' },
      });
    }

    return hostels;
  }

  async createRoom(data: { hostelId: string; roomNumber: string; floor?: number; capacity?: number; roomType?: string; facilities?: string }) {
    const hostel = await this.prisma.hostel.findUnique({ where: { id: data.hostelId } });
    if (!hostel) throw new NotFoundException('Hostel not found.');

    const room = await this.prisma.hostelRoom.create({
      data: {
        hostelId: data.hostelId,
        roomNumber: data.roomNumber,
        floor: data.floor || 1,
        capacity: data.capacity || 2,
        roomType: data.roomType || 'NON_AC',
        facilities: data.facilities,
        status: 'AVAILABLE',
      },
    });

    for (let b = 1; b <= (data.capacity || 2); b++) {
      await this.prisma.hostelBed.create({
        data: {
          roomId: room.id,
          bedNumber: `${data.roomNumber}-${String.fromCharCode(64 + b)}`,
          status: 'AVAILABLE',
        },
      });
    }

    return room;
  }

  async getRooms(hostelId?: string) {
    return this.prisma.hostelRoom.findMany({
      where: { ...(hostelId ? { hostelId } : {}) },
      include: { hostel: true, beds: true, allotments: { where: { status: 'ACTIVE' }, include: { student: true } } },
      orderBy: { roomNumber: 'asc' },
    });
  }

  // ── Hostel Applications ─────────────────────────────────────────────────────

  async submitApplication(data: { studentId: string; academicYear?: string; programId?: string; preferredHostelId?: string; roomPreference?: string; reason?: string }) {
    const applicationNo = this.generateNumber('HST-APP');
    return this.prisma.hostelApplication.create({
      data: {
        applicationNo,
        studentId: data.studentId,
        academicYear: data.academicYear || '2026-27',
        programId: data.programId,
        preferredHostelId: data.preferredHostelId,
        roomPreference: data.roomPreference || 'NON_AC',
        reason: data.reason,
        status: 'SUBMITTED',
      },
      include: { student: true },
    });
  }

  async getApplications(studentId?: string, status?: string) {
    return this.prisma.hostelApplication.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
      },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveApplication(id: string, reviewerId?: string) {
    const app = await this.prisma.hostelApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Hostel application not found.');

    return this.prisma.hostelApplication.update({
      where: { id },
      data: { status: 'APPROVED', reviewedBy: reviewerId, reviewedAt: new Date() },
    });
  }

  // ── Room / Bed Allotment & Transfer ─────────────────────────────────────────

  async allotBed(data: { studentId: string; hostelId: string; roomId: string; bedId: string; academicYear?: string; expectedCheckout?: string; remarks?: string }) {
    const bed = await this.prisma.hostelBed.findUnique({ where: { id: data.bedId } });
    if (!bed) throw new NotFoundException('Hostel Bed not found.');
    if (bed.status !== 'AVAILABLE') throw new BadRequestException('Bed is already occupied or under maintenance.');

    const existingAllotment = await this.prisma.hostelAllotment.findFirst({
      where: { studentId: data.studentId, status: 'ACTIVE' },
    });
    if (existingAllotment) throw new ConflictException('Student already has an active bed allotment.');

    const allotmentNo = this.generateNumber('HST-ALL');

    return this.prisma.$transaction(async (tx) => {
      const allotment = await tx.hostelAllotment.create({
        data: {
          allotmentNo,
          studentId: data.studentId,
          hostelId: data.hostelId,
          roomId: data.roomId,
          bedId: data.bedId,
          academicYear: data.academicYear || '2026-27',
          checkInDate: new Date(),
          expectedCheckout: data.expectedCheckout ? new Date(data.expectedCheckout) : undefined,
          status: 'ACTIVE',
          remarks: data.remarks,
        },
        include: { student: true, hostel: true, room: true, bed: true },
      });

      await tx.hostelBed.update({
        where: { id: data.bedId },
        data: { status: 'OCCUPIED' },
      });

      return allotment;
    });
  }

  async getAllotments(studentId?: string, hostelId?: string) {
    return this.prisma.hostelAllotment.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(hostelId ? { hostelId } : {}),
      },
      include: { student: true, hostel: true, room: true, bed: true },
      orderBy: { allottedDate: 'desc' },
    });
  }

  async transferBed(allotmentId: string, toBedId: string, reason: string, approvedBy?: string) {
    const allotment = await this.prisma.hostelAllotment.findUnique({ where: { id: allotmentId } });
    if (!allotment) throw new NotFoundException('Allotment not found.');

    const targetBed = await this.prisma.hostelBed.findUnique({ where: { id: toBedId }, include: { room: true } });
    if (!targetBed || targetBed.status !== 'AVAILABLE') throw new BadRequestException('Target bed is not available.');

    const transferNo = this.generateNumber('TRF-HST');

    return this.prisma.$transaction(async (tx) => {
      await tx.hostelBed.update({ where: { id: allotment.bedId }, data: { status: 'AVAILABLE' } });
      await tx.hostelBed.update({ where: { id: toBedId }, data: { status: 'OCCUPIED' } });

      await tx.hostelTransfer.create({
        data: {
          transferNo,
          allotmentId,
          fromBedId: allotment.bedId,
          toBedId,
          reason,
          approvedBy,
          status: 'COMPLETED',
        },
      });

      return tx.hostelAllotment.update({
        where: { id: allotmentId },
        data: {
          bedId: toBedId,
          roomId: targetBed.roomId,
          hostelId: targetBed.room.hostelId,
        },
        include: { room: true, bed: true },
      });
    });
  }

  async vacateBed(allotmentId: string, remarks?: string) {
    const allotment = await this.prisma.hostelAllotment.findUnique({ where: { id: allotmentId } });
    if (!allotment) throw new NotFoundException('Allotment not found.');

    return this.prisma.$transaction(async (tx) => {
      await tx.hostelBed.update({ where: { id: allotment.bedId }, data: { status: 'AVAILABLE' } });

      await tx.hostelCheckInOut.create({
        data: {
          allotmentId,
          actionType: 'CHECK_OUT',
          roomInspection: 'GOOD',
          noDuesCleared: true,
          remarks,
        },
      });

      return tx.hostelAllotment.update({
        where: { id: allotmentId },
        data: { status: 'VACATED', vacatedDate: new Date(), remarks },
      });
    });
  }

  // ── Outpass / Leave Management ──────────────────────────────────────────────

  async requestOutpass(data: { studentId: string; fromDate: string; toDate: string; purpose: string; destination: string; contactNumber: string; guardianContact?: string }) {
    const outpassNo = this.generateNumber('OUT');
    const verificationCode = `VER-${Date.now().toString(36).toUpperCase()}`;

    return this.prisma.outpassRequest.create({
      data: {
        outpassNo,
        studentId: data.studentId,
        fromDate: new Date(data.fromDate),
        toDate: new Date(data.toDate),
        purpose: data.purpose,
        destination: data.destination,
        contactNumber: data.contactNumber,
        guardianContact: data.guardianContact,
        verificationCode,
        qrData: `SSIU-OUTPASS|${outpassNo}|${data.studentId}|${verificationCode}`,
        status: 'PENDING',
      },
      include: { student: true },
    });
  }

  async getOutpasses(studentId?: string, status?: string) {
    return this.prisma.outpassRequest.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
      },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveOutpass(id: string, approvedBy?: string) {
    return this.prisma.outpassRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy, approvedAt: new Date() },
    });
  }

  // ── Visitors ────────────────────────────────────────────────────────────────

  async logVisitor(data: { visitorName: string; studentId: string; hostelId: string; relation: string; purpose: string; contactPhone: string }) {
    return this.prisma.hostelVisitor.create({
      data: {
        visitorName: data.visitorName,
        studentId: data.studentId,
        hostelId: data.hostelId,
        relation: data.relation,
        purpose: data.purpose,
        contactPhone: data.contactPhone,
        status: 'CHECKED_IN',
      },
      include: { hostel: true },
    });
  }

  async getVisitors(hostelId?: string) {
    return this.prisma.hostelVisitor.findMany({
      where: { ...(hostelId ? { hostelId } : {}) },
      include: { hostel: true },
      orderBy: { checkInTime: 'desc' },
    });
  }

  async checkoutVisitor(id: string) {
    return this.prisma.hostelVisitor.update({
      where: { id },
      data: { status: 'CHECKED_OUT', checkOutTime: new Date() },
    });
  }

  // ── Complaints & Maintenance ────────────────────────────────────────────────

  async raiseComplaint(data: { studentId: string; hostelId: string; roomId?: string; category: string; description: string; priority?: string }) {
    const complaintNo = this.generateNumber('CMP-HST');
    return this.prisma.hostelComplaint.create({
      data: {
        complaintNo,
        studentId: data.studentId,
        hostelId: data.hostelId,
        roomId: data.roomId,
        category: data.category,
        description: data.description,
        priority: data.priority || 'NORMAL',
        status: 'SUBMITTED',
      },
      include: { student: true, hostel: true },
    });
  }

  async getComplaints(studentId?: string, hostelId?: string) {
    return this.prisma.hostelComplaint.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(hostelId ? { hostelId } : {}),
      },
      include: { student: true, hostel: true, room: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveComplaint(id: string, resolution: string, assignedTo?: string) {
    return this.prisma.hostelComplaint.update({
      where: { id },
      data: { status: 'RESOLVED', resolution, assignedTo, updatedAt: new Date() },
    });
  }

  // ── Mess & Meal Menus ───────────────────────────────────────────────────────

  async getMesses() {
    let messes = await this.prisma.mess.findMany({
      include: { menus: true, _count: { select: { enrollments: true } } },
      orderBy: { name: 'asc' },
    });

    if (messes.length === 0) {
      const defaultMess = await this.prisma.mess.create({
        data: {
          code: 'CENTRAL-MESS',
          name: 'University Central Dining Hall',
          capacity: 350,
          cateringBy: 'SSIU Hospitality & Food Services',
          status: 'ACTIVE',
        },
      });

      const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
      for (const d of days) {
        await this.prisma.messMenu.createMany({
          data: [
            { messId: defaultMess.id, dayOfWeek: d, mealType: 'BREAKFAST', items: 'Poha, Idli-Sambhar, Upma, Tea/Coffee, Banana' },
            { messId: defaultMess.id, dayOfWeek: d, mealType: 'LUNCH', items: 'Dal Tadka, Steamed Rice, Roti, Seasonal Sabzi, Paneer, Salad, Papad' },
            { messId: defaultMess.id, dayOfWeek: d, mealType: 'SNACKS', items: 'Tea, Biscuits, Samosa / Pakoda' },
            { messId: defaultMess.id, dayOfWeek: d, mealType: 'DINNER', items: 'Kadhi Khichdi, Gujarati Dal, Phulka Roti, Bhindi Masala, Sweet Gulab Jamun' },
          ],
        });
      }

      messes = await this.prisma.mess.findMany({
        include: { menus: true, _count: { select: { enrollments: true } } },
        orderBy: { name: 'asc' },
      });
    }

    return messes;
  }

  async enrollInMess(data: { studentId: string; messId: string; planType?: string; dietType?: string }) {
    return this.prisma.messEnrollment.create({
      data: {
        studentId: data.studentId,
        messId: data.messId,
        planType: data.planType || 'MONTHLY',
        dietType: data.dietType || 'VEG',
        status: 'ACTIVE',
      },
      include: { mess: true, student: true },
    });
  }

  // ── Hostel Dashboard KPIs ───────────────────────────────────────────────────

  async getHostelDashboardMetrics() {
    const [
      totalHostels,
      totalRooms,
      totalBeds,
      occupiedBeds,
      pendingApplications,
      activeOutpasses,
      pendingComplaints,
    ] = await Promise.all([
      this.prisma.hostel.count(),
      this.prisma.hostelRoom.count(),
      this.prisma.hostelBed.count(),
      this.prisma.hostelBed.count({ where: { status: 'OCCUPIED' } }),
      this.prisma.hostelApplication.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.outpassRequest.count({ where: { status: 'APPROVED' } }),
      this.prisma.hostelComplaint.count({ where: { status: 'SUBMITTED' } }),
    ]);

    return {
      totalHostels,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      pendingApplications,
      activeOutpasses,
      pendingComplaints,
    };
  }
}
