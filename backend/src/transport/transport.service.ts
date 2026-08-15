import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransportService {
  constructor(private readonly prisma: PrismaService) {}

  private generateNumber(prefix: string) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-2026-${timestamp}${random}`;
  }

  // ── Vehicle Master ──────────────────────────────────────────────────────────

  async createVehicle(data: { registrationNumber: string; vehicleType?: string; makeModel: string; capacity?: number; fuelType?: string; purchaseDate?: string; insuranceExpiry?: string; fitnessExpiry?: string; pucExpiry?: string }) {
    const reg = data.registrationNumber.toUpperCase();
    const existing = await this.prisma.vehicle.findUnique({ where: { registrationNumber: reg } });
    if (existing) throw new ConflictException(`Vehicle '${reg}' already exists.`);

    return this.prisma.vehicle.create({
      data: {
        registrationNumber: reg,
        vehicleType: data.vehicleType || 'BUS',
        makeModel: data.makeModel,
        capacity: data.capacity || 40,
        fuelType: data.fuelType || 'DIESEL',
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
        fitnessExpiry: data.fitnessExpiry ? new Date(data.fitnessExpiry) : undefined,
        pucExpiry: data.pucExpiry ? new Date(data.pucExpiry) : undefined,
        status: 'ACTIVE',
      },
    });
  }

  async getVehicles() {
    let vehicles = await this.prisma.vehicle.findMany({
      include: {
        allotments: { where: { status: 'ACTIVE' }, include: { student: true } },
        documents: true,
        trips: { take: 5, orderBy: { tripDate: 'desc' } },
        _count: { select: { allotments: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { registrationNumber: 'asc' },
    });

    if (vehicles.length === 0) {
      const defaultVehicles = [
        { registrationNumber: 'GJ-01-AB-1001', makeModel: 'Tata Starbus Ultra (40 Seater)', capacity: 40, vehicleType: 'BUS', fuelType: 'DIESEL', insuranceExpiry: new Date('2027-04-01') },
        { registrationNumber: 'GJ-01-AB-1002', makeModel: 'Ashok Leyland Sunshine (50 Seater)', capacity: 50, vehicleType: 'BUS', fuelType: 'CNG', insuranceExpiry: new Date('2027-05-15') },
        { registrationNumber: 'GJ-01-AB-1003', makeModel: 'Force Traveller Mini Bus (26 Seater)', capacity: 26, vehicleType: 'MINI_BUS', fuelType: 'DIESEL', insuranceExpiry: new Date('2027-06-20') },
      ];
      for (const v of defaultVehicles) {
        await this.prisma.vehicle.create({ data: v });
      }
      vehicles = await this.prisma.vehicle.findMany({
        include: {
          allotments: { where: { status: 'ACTIVE' }, include: { student: true } },
          documents: true,
          trips: { take: 5, orderBy: { tripDate: 'desc' } },
          _count: { select: { allotments: { where: { status: 'ACTIVE' } } } },
        },
        orderBy: { registrationNumber: 'asc' },
      });
    }

    return vehicles;
  }

  // ── Drivers ─────────────────────────────────────────────────────────────────

  async createDriver(data: { driverName: string; contactNumber: string; licenseNumber: string; licenseType?: string; experienceYears?: number }) {
    const lic = data.licenseNumber.toUpperCase();
    const existing = await this.prisma.driverProfile.findUnique({ where: { licenseNumber: lic } });
    if (existing) throw new ConflictException(`Driver with license '${lic}' already registered.`);

    return this.prisma.driverProfile.create({
      data: {
        driverName: data.driverName,
        contactNumber: data.contactNumber,
        licenseNumber: lic,
        licenseType: data.licenseType || 'HEAVY_VEHICLE',
        experienceYears: data.experienceYears ?? 5,
        status: 'ACTIVE',
      },
    });
  }

  async getDrivers() {
    let drivers = await this.prisma.driverProfile.findMany({ orderBy: { driverName: 'asc' } });
    if (drivers.length === 0) {
      const defaultDrivers = [
        { driverName: 'Rameshwar Yadav', contactNumber: '+91 9876511111', licenseNumber: 'DL-GJ-2015-001234', experienceYears: 8 },
        { driverName: 'Bhagwan Das', contactNumber: '+91 9876511112', licenseNumber: 'DL-GJ-2018-005678', experienceYears: 6 },
      ];
      for (const d of defaultDrivers) {
        await this.prisma.driverProfile.create({ data: d });
      }
      drivers = await this.prisma.driverProfile.findMany({ orderBy: { driverName: 'asc' } });
    }
    return drivers;
  }

  // ── Routes & Stops ──────────────────────────────────────────────────────────

  async createRoute(data: { routeNumber: string; routeName: string; startPoint: string; endPoint: string; distanceKm?: number; estDurationMins?: number; monthlyFee?: number }) {
    const routeNo = data.routeNumber.toUpperCase();
    const existing = await this.prisma.transportRoute.findUnique({ where: { routeNumber: routeNo } });
    if (existing) throw new ConflictException(`Route '${routeNo}' already exists.`);

    return this.prisma.transportRoute.create({
      data: {
        routeNumber: routeNo,
        routeName: data.routeName,
        startPoint: data.startPoint,
        endPoint: data.endPoint,
        distanceKm: data.distanceKm || 25,
        estDurationMins: data.estDurationMins || 45,
        monthlyFee: data.monthlyFee || 2500,
        status: 'ACTIVE',
      },
    });
  }

  async getRoutes() {
    let routes = await this.prisma.transportRoute.findMany({
      include: {
        stops: { orderBy: { sequence: 'asc' } },
        _count: { select: { allotments: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { routeNumber: 'asc' },
    });

    if (routes.length === 0) {
      const defaultRoutes = [
        {
          routeNumber: 'R-01',
          routeName: 'Ahmedabad (ISKCON Circle) — Gandhinagar Campus',
          startPoint: 'ISKCON Cross Roads',
          endPoint: 'SSIU Gandhinagar Campus',
          distanceKm: 32,
          estDurationMins: 50,
          monthlyFee: 2800,
          stops: [
            { stopName: 'ISKCON Circle', sequence: 1, pickupTime: '07:15 AM', dropTime: '05:45 PM' },
            { stopName: 'Pakwan Cross Roads', sequence: 2, pickupTime: '07:25 AM', dropTime: '05:35 PM' },
            { stopName: 'Shivranjani Flyover', sequence: 3, pickupTime: '07:35 AM', dropTime: '05:25 PM' },
            { stopName: 'SSIU University Main Gate', sequence: 4, pickupTime: '08:15 AM', dropTime: '04:45 PM' },
          ],
        },
        {
          routeNumber: 'R-02',
          routeName: 'Gandhinagar (Sector 21) — SSIU Campus',
          startPoint: 'Sector 21 Bus Station',
          endPoint: 'SSIU Gandhinagar Campus',
          distanceKm: 18,
          estDurationMins: 30,
          monthlyFee: 2000,
          stops: [
            { stopName: 'Sector 21 Bus Station', sequence: 1, pickupTime: '07:45 AM', dropTime: '05:15 PM' },
            { stopName: 'Ch-0 Circle', sequence: 2, pickupTime: '08:00 AM', dropTime: '05:00 PM' },
            { stopName: 'SSIU University Main Gate', sequence: 3, pickupTime: '08:20 AM', dropTime: '04:45 PM' },
          ],
        },
      ];

      for (const r of defaultRoutes) {
        const created = await this.prisma.transportRoute.create({
          data: {
            routeNumber: r.routeNumber,
            routeName: r.routeName,
            startPoint: r.startPoint,
            endPoint: r.endPoint,
            distanceKm: r.distanceKm,
            estDurationMins: r.estDurationMins,
            monthlyFee: r.monthlyFee,
            status: 'ACTIVE',
          },
        });
        for (const s of r.stops) {
          await this.prisma.transportStop.create({
            data: {
              routeId: created.id,
              stopName: s.stopName,
              sequence: s.sequence,
              pickupTime: s.pickupTime,
              dropTime: s.dropTime,
              status: 'ACTIVE',
            },
          });
        }
      }

      routes = await this.prisma.transportRoute.findMany({
        include: {
          stops: { orderBy: { sequence: 'asc' } },
          _count: { select: { allotments: { where: { status: 'ACTIVE' } } } },
        },
        orderBy: { routeNumber: 'asc' },
      });
    }

    return routes;
  }

  // ── Applications ────────────────────────────────────────────────────────────

  async submitApplication(data: { studentId: string; routeId: string; stopId: string; academicYear?: string }) {
    const applicationNo = this.generateNumber('TRN-APP');
    return this.prisma.transportApplication.create({
      data: {
        applicationNo,
        studentId: data.studentId,
        routeId: data.routeId,
        stopId: data.stopId,
        academicYear: data.academicYear || '2026-27',
        status: 'SUBMITTED',
      },
      include: { student: true, route: true, stop: true },
    });
  }

  async getApplications(studentId?: string, status?: string) {
    return this.prisma.transportApplication.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
      },
      include: { student: true, route: true, stop: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveApplication(id: string, reviewerId?: string) {
    const app = await this.prisma.transportApplication.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found.');

    return this.prisma.transportApplication.update({
      where: { id },
      data: { status: 'APPROVED', reviewedBy: reviewerId, reviewedAt: new Date() },
    });
  }

  // ── Allotments & Passes ─────────────────────────────────────────────────────

  async allotTransport(data: { studentId: string; vehicleId: string; routeId: string; stopId: string; academicYear?: string }) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      include: { _count: { select: { allotments: { where: { status: 'ACTIVE' } } } } },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found.');
    if (vehicle._count.allotments >= vehicle.capacity) {
      throw new BadRequestException('Vehicle is already at maximum capacity.');
    }

    const existing = await this.prisma.transportAllotment.findFirst({
      where: { studentId: data.studentId, status: 'ACTIVE' },
    });
    if (existing) throw new ConflictException('Student already has an active transport allotment.');

    const allotmentNo = this.generateNumber('TRN-ALL');
    const passNo = this.generateNumber('TP');
    const validTo = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 6 months

    return this.prisma.$transaction(async (tx) => {
      const allotment = await tx.transportAllotment.create({
        data: {
          allotmentNo,
          studentId: data.studentId,
          vehicleId: data.vehicleId,
          routeId: data.routeId,
          stopId: data.stopId,
          academicYear: data.academicYear || '2026-27',
          status: 'ACTIVE',
        },
        include: { student: true, vehicle: true, route: true, stop: true },
      });

      const pass = await tx.transportPass.create({
        data: {
          passNo,
          allotmentId: allotment.id,
          studentId: data.studentId,
          validFrom: new Date(),
          validTo,
          verificationCode: `VER-TRN-${Date.now().toString(36).toUpperCase()}`,
          qrData: `SSIU-BUSPASS|${passNo}|${data.studentId}|${allotment.routeId}`,
          status: 'ACTIVE',
        },
      });

      return { allotment, pass };
    });
  }

  async getAllotments(studentId?: string, routeId?: string) {
    return this.prisma.transportAllotment.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(routeId ? { routeId } : {}),
      },
      include: { student: true, vehicle: true, route: true, stop: true, passes: true },
      orderBy: { allocatedDate: 'desc' },
    });
  }

  async getPasses(studentId?: string) {
    return this.prisma.transportPass.findMany({
      where: { ...(studentId ? { studentId } : {}) },
      include: { student: true, allotment: { include: { vehicle: true, route: true, stop: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  // ── Trips & Maintenance ─────────────────────────────────────────────────────

  async createTrip(data: { vehicleId: string; routeId: string; driverId?: string; tripDate: string; startTime: string; endTime?: string; tripType?: string }) {
    const tripNo = this.generateNumber('TRP');
    return this.prisma.transportTrip.create({
      data: {
        tripNo,
        vehicleId: data.vehicleId,
        routeId: data.routeId,
        driverId: data.driverId,
        tripDate: new Date(data.tripDate),
        startTime: data.startTime,
        endTime: data.endTime,
        tripType: data.tripType || 'PICKUP',
        status: 'SCHEDULED',
      },
      include: { vehicle: true, route: true, driver: true },
    });
  }

  async getTrips() {
    return this.prisma.transportTrip.findMany({
      include: { vehicle: true, route: true, driver: true },
      orderBy: { tripDate: 'desc' },
    });
  }

  async createMaintenance(data: { vehicleId: string; issue: string; priority?: string; estimatedCost?: number }) {
    const maintenanceNo = this.generateNumber('MNT-VEH');
    return this.prisma.vehicleMaintenance.create({
      data: {
        maintenanceNo,
        vehicleId: data.vehicleId,
        issue: data.issue,
        priority: data.priority || 'NORMAL',
        estimatedCost: data.estimatedCost,
        status: 'OPEN',
      },
      include: { vehicle: true },
    });
  }

  async getMaintenances() {
    return this.prisma.vehicleMaintenance.findMany({
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Complaints ──────────────────────────────────────────────────────────────

  async raiseComplaint(data: { studentId: string; routeId?: string; vehicleId?: string; description: string; priority?: string }) {
    const complaintNo = this.generateNumber('CMP-TRN');
    return this.prisma.transportComplaint.create({
      data: {
        complaintNo,
        studentId: data.studentId,
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        description: data.description,
        priority: data.priority || 'NORMAL',
        status: 'SUBMITTED',
      },
      include: { student: true, route: true, vehicle: true },
    });
  }

  async getComplaints(studentId?: string) {
    return this.prisma.transportComplaint.findMany({
      where: { ...(studentId ? { studentId } : {}) },
      include: { student: true, route: true, vehicle: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Dashboard Metrics ───────────────────────────────────────────────────────

  async getTransportDashboardMetrics() {
    const [
      totalVehicles,
      activeVehicles,
      totalRoutes,
      totalDrivers,
      totalAllotments,
      pendingApplications,
      openMaintenance,
    ] = await Promise.all([
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
      this.prisma.transportRoute.count(),
      this.prisma.driverProfile.count(),
      this.prisma.transportAllotment.count({ where: { status: 'ACTIVE' } }),
      this.prisma.transportApplication.count({ where: { status: 'SUBMITTED' } }),
      this.prisma.vehicleMaintenance.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      totalVehicles,
      activeVehicles,
      totalRoutes,
      totalDrivers,
      totalAllotments,
      pendingApplications,
      openMaintenance,
    };
  }
}
