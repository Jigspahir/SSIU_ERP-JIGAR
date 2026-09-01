import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUniversityDto } from './dto/create-university.dto';
import { CreateInstituteDto } from './dto/create-institute.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

@Injectable()
export class CoreMastersService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. University Master
  async getUniversities() {
    return this.prisma.university.findMany({
      include: {
        institutes: { select: { id: true, code: true, name: true, status: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async createUniversity(dto: CreateUniversityDto) {
    const existing = await this.prisma.university.findUnique({ where: { code: dto.code.trim().toUpperCase() } });
    if (existing) throw new BadRequestException(`University with code '${dto.code}' already exists.`);

    return this.prisma.university.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        tagline: dto.tagline,
        address: dto.address,
        website: dto.website,
        email: dto.email,
        phone: dto.phone,
        status: 'ACTIVE',
      },
    });
  }

  async updateUniversity(id: string, dto: Partial<CreateUniversityDto>) {
    const uni = await this.prisma.university.findUnique({ where: { id } });
    if (!uni) throw new NotFoundException('University not found.');

    return this.prisma.university.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim() : uni.name,
        tagline: dto.tagline !== undefined ? dto.tagline : uni.tagline,
        address: dto.address !== undefined ? dto.address : uni.address,
        website: dto.website !== undefined ? dto.website : uni.website,
        email: dto.email !== undefined ? dto.email : uni.email,
        phone: dto.phone !== undefined ? dto.phone : uni.phone,
      },
    });
  }

  // 2. Institutes
  async getInstitutes() {
    return this.prisma.institute.findMany({
      include: {
        university: { select: { code: true, name: true } },
        departments: { select: { id: true, code: true, name: true, status: true } },
        _count: { select: { students: true, faculty: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async createInstitute(dto: CreateInstituteDto) {
    const existing = await this.prisma.institute.findUnique({ where: { code: dto.code.trim().toUpperCase() } });
    if (existing) throw new BadRequestException(`Institute with code '${dto.code}' already exists.`);

    return this.prisma.institute.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        shortName: dto.shortName,
        universityId: dto.universityId,
        status: 'ACTIVE',
      },
    });
  }

  async updateInstitute(id: string, dto: Partial<CreateInstituteDto>) {
    const inst = await this.prisma.institute.findUnique({ where: { id } });
    if (!inst) throw new NotFoundException('Institute not found.');

    return this.prisma.institute.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim() : inst.name,
        shortName: dto.shortName !== undefined ? dto.shortName : inst.shortName,
      },
    });
  }

  // 3. Departments
  async getDepartments(instituteId?: string) {
    const where: any = {};
    if (instituteId) where.instituteId = instituteId;

    return this.prisma.department.findMany({
      where,
      include: {
        institute: { select: { code: true, name: true } },
        programs: true,
        _count: { select: { students: true, faculty: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({ where: { code: dto.code.trim().toUpperCase() } });
    if (existing) throw new BadRequestException(`Department with code '${dto.code}' already exists.`);

    return this.prisma.department.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        instituteId: dto.instituteId,
        status: 'ACTIVE',
      },
    });
  }

  async updateDepartment(id: string, dto: Partial<CreateDepartmentDto>) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException('Department not found.');

    return this.prisma.department.update({
      where: { id },
      data: { name: dto.name ? dto.name.trim() : department.name },
    });
  }

  // 4. Programs
  async getPrograms(departmentId?: string) {
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;

    return this.prisma.program.findMany({
      where,
      include: {
        department: { select: { code: true, name: true, instituteId: true } },
        subjects: true,
        _count: { select: { batches: true, subjects: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async createProgram(dto: CreateProgramDto) {
    const existing = await this.prisma.program.findUnique({ where: { code: dto.code.trim().toUpperCase() } });
    if (existing) throw new BadRequestException(`Program with code '${dto.code}' already exists.`);

    return this.prisma.program.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        degreeType: dto.degree || 'UG',
        durationYears: dto.durationYears,
        departmentId: dto.departmentId,
        status: 'ACTIVE',
      },
    });
  }

  async updateProgram(id: string, dto: Partial<CreateProgramDto>) {
    const program = await this.prisma.program.findUnique({ where: { id } });
    if (!program) throw new NotFoundException('Program not found.');

    return this.prisma.program.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim() : program.name,
        degreeType: dto.degree || program.degreeType,
        durationYears: dto.durationYears || program.durationYears,
      },
    });
  }

  // 5. Academic Years
  async getAcademicYears() {
    return this.prisma.academicYear.findMany({
      include: {
        batches: true,
        _count: { select: { batches: true } },
      },
      orderBy: { startYear: 'desc' },
    });
  }

  async createAcademicYear(dto: CreateAcademicYearDto) {
    const code = dto.yearCode?.trim() || `${dto.startYear}-${dto.endYear}`;
    const existing = await this.prisma.academicYear.findUnique({ where: { code } });
    if (existing) throw new BadRequestException(`Academic year '${code}' already exists.`);

    return this.prisma.academicYear.create({
      data: {
        code,
        startYear: dto.startYear || Number(code.split('-')[0]),
        endYear: dto.endYear || Number(code.split('-')[1]),
        isCurrent: !!dto.isCurrent,
        status: 'ACTIVE',
      },
    });
  }

  async updateAcademicYear(id: string, dto: Partial<CreateAcademicYearDto>) {
    const ay = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!ay) throw new NotFoundException('Academic year not found.');

    return this.prisma.academicYear.update({
      where: { id },
      data: {
        isCurrent: dto.isCurrent !== undefined ? dto.isCurrent : ay.isCurrent,
      },
    });
  }

  // 6. Subjects / Courses Master
  async getSubjects(departmentId?: string, programId?: string, semesterNumber?: number) {
    const where: any = {};
    if (programId) where.programId = programId;

    return this.prisma.subject.findMany({
      where,
      include: {
        program: { select: { code: true, name: true } },
        semester: { select: { name: true } },
      },
      orderBy: { code: 'asc' },
    });
  }

  async createSubject(dto: CreateSubjectDto) {
    const existing = await this.prisma.subject.findUnique({ where: { code: dto.code.trim().toUpperCase() } });
    if (existing) throw new BadRequestException(`Subject code '${dto.code}' already exists.`);

    return this.prisma.subject.create({
      data: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        credits: dto.credits,
        subjectType: dto.type || dto.subjectType || 'THEORY',
        programId: dto.programId,
        semesterId: dto.semesterId,
        status: 'ACTIVE',
      },
    });
  }

  async updateSubject(id: string, dto: Partial<CreateSubjectDto>) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundException('Subject not found.');

    return this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name ? dto.name.trim() : subject.name,
        credits: dto.credits !== undefined ? dto.credits : subject.credits,
        subjectType: dto.type || dto.subjectType || subject.subjectType,
      },
    });
  }

  // 7. Students Directory, Creation & Profile
  async getStudents(query: PaginationQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.instituteId) where.instituteId = query.instituteId;
    if (query.departmentId) where.departmentId = query.departmentId;

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { enrollmentNo: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          institute: { select: { code: true, name: true } },
          department: { select: { code: true, name: true } },
          batch: { select: { code: true } },
        },
        orderBy: { enrollmentNo: 'asc' },
      }),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getStudentById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        institute: true,
        department: true,
        batch: true,
        division: true,
        user: { select: { erpId: true, username: true, accountStatus: true } },
      },
    });

    if (!student) throw new NotFoundException('Student record not found.');
    return student;
  }

  async getStudentAcademicProfile(id: string) {
    const student = await this.getStudentById(id);

    const [subjects, courseTeachers, mentors] = await Promise.all([
      this.prisma.subject.findMany({
        where: { programId: student.batch.programId, status: 'ACTIVE' },
      }),
      this.prisma.studentFacultyMapping.findMany({
        where: { studentId: id, status: 'ACTIVE' },
        include: {
          faculty: { select: { employeeCode: true, firstName: true, lastName: true, designation: true, email: true } },
          subject: { select: { code: true, name: true, credits: true } },
        },
      }),
      this.prisma.studentMentorMapping.findMany({
        where: { studentId: id, status: 'ACTIVE' },
        include: {
          faculty: { select: { employeeCode: true, firstName: true, lastName: true, designation: true, email: true } },
          academicYear: { select: { code: true } },
        },
      }),
    ]);

    return {
      student,
      enrolledSubjects: subjects,
      assignedCourseTeachers: courseTeachers,
      assignedMentors: mentors,
    };
  }

  async createStudent(dto: CreateStudentDto) {
    const existing = await this.prisma.student.findFirst({
      where: { OR: [{ enrollmentNo: dto.enrollmentNo.trim() }, { email: dto.email.trim().toLowerCase() }] },
    });
    if (existing) throw new BadRequestException(`Student with enrollment '${dto.enrollmentNo}' or email '${dto.email}' already exists.`);

    return this.prisma.student.create({
      data: {
        erpId: `STU${String(Date.now()).slice(-6)}`,
        enrollmentNo: dto.enrollmentNo.trim(),
        firstName: dto.firstName?.trim() || dto.name?.trim() || 'Student',
        middleName: dto.middleName?.trim(),
        lastName: dto.lastName?.trim() || '',
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone,
        gender: dto.gender || 'Male',
        instituteId: dto.instituteId,
        departmentId: dto.departmentId,
        batchId: dto.batchId,
        currentDivisionId: dto.divisionId || dto.currentDivisionId,
        status: dto.status || 'ACTIVE',
      },
      include: {
        institute: { select: { code: true, name: true } },
        department: { select: { code: true, name: true } },
        batch: { select: { code: true } },
      },
    });
  }

  async updateStudent(id: string, dto: UpdateStudentDto, user?: any) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Student not found.');

    // Check if student identity is verified via DigiLocker
    const dlConn = await this.prisma.digiLockerConnection.findUnique({ where: { studentId: id } });
    const isDlVerified = dlConn && dlConn.status === 'CONNECTED';

    if (isDlVerified && user?.role === 'STUDENT') {
      const isNameModified = (dto.firstName && dto.firstName !== student.firstName) || (dto.lastName && dto.lastName !== student.lastName);
      if (isNameModified) {
        throw new BadRequestException('Student legal name is verified via DigiLocker and cannot be manually modified. Please update via issuing authority and synchronize DigiLocker.');
      }
    }

    return this.prisma.student.update({
      where: { id },
      data: {
        firstName: isDlVerified && user?.role === 'STUDENT' ? student.firstName : (dto.firstName || (dto.name ? dto.name.trim() : student.firstName)),
        lastName: isDlVerified && user?.role === 'STUDENT' ? student.lastName : (dto.lastName || student.lastName),
        email: dto.email ? dto.email.trim().toLowerCase() : student.email,
        phone: dto.phone !== undefined ? dto.phone : student.phone,
        currentDivisionId: dto.divisionId || dto.currentDivisionId || student.currentDivisionId,
        status: dto.status || student.status,
      },
    });
  }

  async bulkImportStudents(students: CreateStudentDto[]) {
    const results = [];
    for (const studentDto of students) {
      try {
        const created = await this.createStudent(studentDto);
        results.push({ success: true, enrollmentNo: studentDto.enrollmentNo, id: created.id });
      } catch (err: any) {
        results.push({ success: false, enrollmentNo: studentDto.enrollmentNo, error: err.message });
      }
    }
    return { total: students.length, results };
  }

  // 8. Faculty Directory, Creation & Profile
  async getFaculty(query: PaginationQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.instituteId) where.instituteId = query.instituteId;
    if (query.departmentId) where.departmentId = query.departmentId;

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { employeeCode: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { designation: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.faculty.count({ where }),
      this.prisma.faculty.findMany({
        where,
        skip,
        take: limit,
        include: {
          institute: { select: { code: true, name: true } },
          department: { select: { code: true, name: true } },
        },
        orderBy: { employeeCode: 'asc' },
      }),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getFacultyById(id: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: {
        institute: true,
        department: true,
        user: { select: { erpId: true, username: true, accountStatus: true } },
        facultySubjectMappings: {
          include: {
            subject: { select: { code: true, name: true, credits: true } },
            division: { select: { name: true } },
          },
        },
        studentMentorMappings: {
          include: {
            student: { select: { enrollmentNo: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!faculty) throw new NotFoundException('Faculty record not found.');
    return faculty;
  }

  async createFaculty(dto: CreateFacultyDto) {
    const existing = await this.prisma.faculty.findFirst({
      where: { OR: [{ employeeCode: dto.employeeCode.trim() }, { email: dto.email.trim().toLowerCase() }] },
    });
    if (existing) throw new BadRequestException(`Faculty with code '${dto.employeeCode}' or email '${dto.email}' already exists.`);

    return this.prisma.faculty.create({
      data: {
        erpId: `FAC${String(Date.now()).slice(-6)}`,
        employeeCode: dto.employeeCode.trim(),
        firstName: dto.firstName?.trim() || dto.name?.trim() || 'Faculty',
        middleName: dto.middleName?.trim(),
        lastName: dto.lastName?.trim() || '',
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone,
        designation: dto.designation || 'Assistant Professor',
        instituteId: dto.instituteId,
        departmentId: dto.departmentId,
        status: dto.status || 'ACTIVE',
      },
      include: {
        institute: { select: { code: true, name: true } },
        department: { select: { code: true, name: true } },
      },
    });
  }

  async updateFaculty(id: string, dto: Partial<CreateFacultyDto>) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id } });
    if (!faculty) throw new NotFoundException('Faculty not found.');

    return this.prisma.faculty.update({
      where: { id },
      data: {
        firstName: dto.firstName || (dto.name ? dto.name.trim() : faculty.firstName),
        lastName: dto.lastName || faculty.lastName,
        email: dto.email ? dto.email.trim().toLowerCase() : faculty.email,
        phone: dto.phone !== undefined ? dto.phone : faculty.phone,
        designation: dto.designation || faculty.designation,
        status: dto.status || faculty.status,
      },
    });
  }

  async bulkImportFaculty(facultyList: CreateFacultyDto[]) {
    const results = [];
    for (const facultyDto of facultyList) {
      try {
        const created = await this.createFaculty(facultyDto);
        results.push({ success: true, employeeCode: facultyDto.employeeCode, id: created.id });
      } catch (err: any) {
        results.push({ success: false, employeeCode: facultyDto.employeeCode, error: err.message });
      }
    }
    return { total: facultyList.length, results };
  }
}
