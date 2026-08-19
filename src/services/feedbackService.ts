import { db } from './db';
import { mentorAssignmentService } from './mentorAssignmentService';
import { 
  DetailedStudentFeedback, StudentSuggestionItem, FeedbackCategoryType, 
  CampusFacilityCategory, SuggestionCategory, FeedbackConfiguration, FeedbackStatus, SuggestionStatus 
} from '../types/feedback';
import { User, Student, Faculty, Subject } from '../types';

export class CentralFeedbackService {
  /**
   * 1. GET CENTRAL FEEDBACK CONFIGURATION
   */
  public getConfiguration(): FeedbackConfiguration {
    const config = (db.getState() as any)?.feedbackConfiguration;
    if (config) return config;

    return {
      allowAnonymousFeedback: true,
      allowAnonymousSuggestions: true,
      frequencyLimits: {
        subjectFeedbackPerSemester: 1,
        facultyFeedbackPerSemester: 1,
        mentorFeedbackPerSemester: 1,
        hodFeedbackPerSemester: 1,
        hoiFeedbackPerSemester: 1,
        campusFeedbackPerMonth: 2
      },
      ratingLabels: {
        1: 'Very Poor',
        2: 'Poor',
        3: 'Average',
        4: 'Good',
        5: 'Excellent'
      }
    };
  }

  /**
   * 2. RESOLVE VALID FEEDBACK TARGETS FOR LOGGED IN STUDENT
   */
  public getStudentFeedbackTargets(studentIdOrEnrollment: string): {
    student: Student;
    subjects: { subject: Subject; faculty?: Faculty }[];
    teachingFaculty: Faculty[];
    activeMentor: { id: string; name: string; employeeId?: string; email?: string } | null;
    hod: { id: string; name: string; email?: string } | null;
    hoi: { id: string; name: string; email?: string } | null;
  } {
    const students = db.getStudents();
    const student = students.find(
      s => s.id === studentIdOrEnrollment || 
           s.enrollmentNo === studentIdOrEnrollment ||
           s.email === studentIdOrEnrollment
    );

    if (!student) {
      throw new Error(`Student record not found in system.`);
    }

    const allSubjects = db.getSubjects();
    const allFaculty = db.getFaculty();
    const allMappings = (db.getState() as any).studentFacultyMappings || [];

    // 1. Enrolled Subjects for student's department/semester/program
    const studentSubjects = allSubjects.filter(s => {
      if (s.departmentId && s.departmentId !== student.departmentId) return false;
      if (s.semesterId && student.semesterId && s.semesterId !== student.semesterId) return false;
      return true;
    });

    const subjectFacultyPairs = studentSubjects.map(subj => {
      // Find course teacher mapping
      const mapping = allMappings.find((m: any) => m.studentId === student.id && m.subjectId === subj.id && m.status === 'ACTIVE');
      let faculty = mapping ? allFaculty.find(f => f.id === mapping.facultyId) : null;

      if (!faculty && subj.assignedFacultyId) {
        faculty = allFaculty.find(f => f.id === subj.assignedFacultyId) || null;
      }
      if (!faculty) {
        faculty = allFaculty.find(f => f.departmentId === student.departmentId && f.status === 'ACTIVE') || allFaculty[0] || null;
      }

      return {
        subject: subj,
        faculty: faculty || undefined
      };
    });

    // 2. Unique Teaching Faculties teaching this student
    const facultyMap = new Map<string, Faculty>();
    subjectFacultyPairs.forEach(p => {
      if (p.faculty) facultyMap.set(p.faculty.id, p.faculty);
    });
    const teachingFaculty = Array.from(facultyMap.values());

    // 3. Current Active Mentor
    const activeMentorRecord = mentorAssignmentService.getActiveMentorForStudent(student.id);
    let activeMentor = activeMentorRecord && activeMentorRecord.status === 'ACTIVE' ? {
      id: activeMentorRecord.mentorFacultyId,
      name: activeMentorRecord.mentorName,
      employeeId: activeMentorRecord.mentorEmployeeId,
      email: activeMentorRecord.mentorEmail
    } : null;

    if (!activeMentor) {
      const defFac = allFaculty.find(f => f.departmentId === student.departmentId && f.status === 'ACTIVE');
      if (defFac) {
        activeMentor = {
          id: defFac.id,
          name: defFac.name,
          employeeId: defFac.employeeId,
          email: defFac.email
        };
      }
    }

    // 4. Current HOD
    const dept = db.getDepartmentById(student.departmentId);
    let hodFaculty = dept?.hodId ? allFaculty.find(f => f.id === dept.hodId) : null;
    if (!hodFaculty) {
      hodFaculty = allFaculty.find(f => f.departmentId === student.departmentId && (f.designation === 'Professor' || f.designation === 'Associate Professor')) || allFaculty[0] || null;
    }
    const hod = {
      id: hodFaculty?.id || 'hod-dept',
      name: dept?.hodName || hodFaculty?.name || 'Department HOD',
      email: dept?.email || hodFaculty?.email
    };

    // 5. Current HOI (Principal)
    const inst = db.getInstituteById(student.instituteId);
    const hoi = {
      id: inst?.principalId || 'hoi-inst',
      name: inst?.principalName || 'Institute Principal / HOI',
      email: inst?.email
    };

    return {
      student,
      subjects: subjectFacultyPairs,
      teachingFaculty,
      activeMentor,
      hod,
      hoi
    };
  }

  /**
   * 3. CHECK DUPLICATE FEEDBACK SUBMISSION
   */
  public hasSubmittedFeedback(params: {
    studentId: string;
    category: FeedbackCategoryType;
    subjectId?: string;
    facultyId?: string;
    academicYearId?: string;
    semesterId?: string;
  }): boolean {
    const all = this.getAllFeedbacks();
    return all.some(f => {
      if (f.studentId !== params.studentId) return false;
      if (f.category !== params.category) return false;
      if (params.subjectId && f.subjectId !== params.subjectId) return false;
      if (params.facultyId && f.facultyId !== params.facultyId) return false;
      if (params.semesterId && f.semesterId && f.semesterId !== params.semesterId) return false;
      return true;
    });
  }

  /**
   * 4. SUBMIT STUDENT FEEDBACK
   */
  public submitFeedback(params: {
    category: FeedbackCategoryType;
    campusFacilityCategory?: CampusFacilityCategory;
    subjectId?: string;
    facultyId?: string;
    ratings: Record<string, number>;
    overallRating: number;
    comments?: string;
    suggestions?: string;
    attachmentUrls?: string[];
    isAnonymous?: boolean;
  }, studentUser: User): DetailedStudentFeedback {
    const targets = this.getStudentFeedbackTargets(studentUser.id || studentUser.enrollmentNo || studentUser.email);
    const student = targets.student;

    // Duplicate Check
    if (this.hasSubmittedFeedback({
      studentId: student.id,
      category: params.category,
      subjectId: params.subjectId,
      facultyId: params.facultyId,
      semesterId: student.semesterId
    })) {
      throw new Error(`You have already submitted ${params.category} feedback for this semester.`);
    }

    const all = this.getAllFeedbacks();
    const seq = String(all.length + 1).padStart(6, '0');
    const feedbackNo = `FDB/2026/${seq}`;
    const now = new Date().toISOString();

    let targetSubjectName: string | undefined;
    let targetSubjectCode: string | undefined;
    let targetFacultyId = params.facultyId;
    let targetFacultyName: string | undefined;
    let targetFacultyEmployeeId: string | undefined;

    if (params.category === 'SUBJECT') {
      if (!params.subjectId) throw new Error('Please select a subject.');
      const pair = targets.subjects.find(s => s.subject.id === params.subjectId || s.subject.code === params.subjectId);
      if (!pair) throw new Error('Selected subject is not enrolled for your current curriculum.');
      targetSubjectName = pair.subject.name;
      targetSubjectCode = pair.subject.code;
      if (pair.faculty) {
        targetFacultyId = pair.faculty.id;
        targetFacultyName = pair.faculty.name;
        targetFacultyEmployeeId = pair.faculty.employeeId;
      }
    } else if (params.category === 'FACULTY') {
      if (!params.facultyId) throw new Error('Please select a faculty member.');
      const fac = targets.teachingFaculty.find(f => f.id === params.facultyId || f.employeeId === params.facultyId);
      if (!fac) throw new Error('Selected faculty is not currently teaching any of your subjects.');
      targetFacultyName = fac.name;
      targetFacultyEmployeeId = fac.employeeId;
    }

    const dept = db.getDepartmentById(student.departmentId);
    const inst = db.getInstituteById(student.instituteId);
    const prog = db.getProgramById(student.programId);
    const sem = db.getSemesterById(student.semesterId);

    const feedbackRecord: DetailedStudentFeedback = {
      id: `fdb-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      feedbackNo,
      studentId: student.id,
      studentName: student.name,
      studentEnrollmentNo: student.enrollmentNo,
      isAnonymous: Boolean(params.isAnonymous),
      category: params.category,
      campusFacilityCategory: params.campusFacilityCategory,
      instituteId: student.instituteId || 'inst-1',
      instituteName: inst?.name,
      departmentId: student.departmentId || 'dept-1',
      departmentName: dept?.name,
      programId: student.programId,
      programName: prog?.name,
      academicYearId: student.academicYearId || 'ay-2026',
      semesterId: student.semesterId,
      semesterNumber: sem?.number || 4,
      subjectId: params.subjectId,
      subjectCode: targetSubjectCode,
      subjectName: targetSubjectName,
      facultyId: targetFacultyId,
      facultyEmployeeId: targetFacultyEmployeeId,
      facultyName: targetFacultyName,
      mentorId: params.category === 'MENTOR' ? targets.activeMentor?.id : undefined,
      mentorName: params.category === 'MENTOR' ? targets.activeMentor?.name : undefined,
      hodId: params.category === 'HOD' ? targets.hod?.id : undefined,
      hodName: params.category === 'HOD' ? targets.hod?.name : undefined,
      hoiId: params.category === 'HOI' ? targets.hoi?.id : undefined,
      hoiName: params.category === 'HOI' ? targets.hoi?.name : undefined,
      ratings: params.ratings || {},
      overallRating: Math.max(1, Math.min(5, params.overallRating || 4)),
      comments: params.comments?.trim(),
      suggestions: params.suggestions?.trim(),
      attachmentUrls: params.attachmentUrls || [],
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now
    };

    this.saveFeedback(feedbackRecord);

    // Notify Student
    db.addNotification({
      title: `Feedback Submitted: ${feedbackNo}`,
      message: `Your ${params.category.replace(/_/g, ' ')} feedback has been recorded successfully.`,
      module: 'SYSTEM',
      timestamp: now,
      targetUserId: student.id,
      linkTab: 'feedback'
    });

    return feedbackRecord;
  }

  /**
   * 5. SUBMIT IMPROVEMENT SUGGESTION
   */
  public submitSuggestion(params: {
    category: SuggestionCategory;
    title: string;
    description: string;
    expectedImprovement?: string;
    attachmentUrl?: string;
    isAnonymous?: boolean;
  }, studentUser: User): StudentSuggestionItem {
    const student = db.getStudents().find(
      s => s.id === studentUser.id || 
           s.enrollmentNo === studentUser.enrollmentNo ||
           s.email === studentUser.email
    );

    if (!student) {
      throw new Error(`Student record not found.`);
    }

    if (!params.title.trim()) throw new Error('Please provide a suggestion title.');
    if (!params.description.trim()) throw new Error('Please provide a description.');

    const all = this.getAllSuggestions();
    const seq = String(all.length + 1).padStart(6, '0');
    const suggestionNo = `SUG/2026/${seq}`;
    const now = new Date().toISOString();
    const dept = db.getDepartmentById(student.departmentId);

    const suggestion: StudentSuggestionItem = {
      id: `sug-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      suggestionNo,
      studentId: student.id,
      studentName: student.name,
      studentEnrollmentNo: student.enrollmentNo,
      isAnonymous: Boolean(params.isAnonymous),
      category: params.category,
      title: params.title.trim(),
      description: params.description.trim(),
      expectedImprovement: params.expectedImprovement?.trim(),
      attachmentUrl: params.attachmentUrl,
      departmentId: student.departmentId,
      departmentName: dept?.name,
      instituteId: student.instituteId,
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now
    };

    this.saveSuggestion(suggestion);

    // Notify Student
    db.addNotification({
      title: `Suggestion Submitted: ${suggestionNo}`,
      message: `Your improvement suggestion "${params.title}" has been submitted to the academic administration.`,
      module: 'SYSTEM',
      timestamp: now,
      targetUserId: student.id,
      linkTab: 'feedback'
    });

    return suggestion;
  }

  /**
   * 6. QUERY STUDENT'S OWN FEEDBACK
   */
  public getMyFeedbacks(studentUser: User): DetailedStudentFeedback[] {
    const all = this.getAllFeedbacks();
    const sid = studentUser.id;
    const enr = studentUser.enrollmentNo;
    return all.filter(f => f.studentId === sid || (enr && f.studentEnrollmentNo === enr));
  }

  /**
   * 7. QUERY STUDENT'S OWN SUGGESTIONS
   */
  public getMySuggestions(studentUser: User): StudentSuggestionItem[] {
    const all = this.getAllSuggestions();
    const sid = studentUser.id;
    const enr = studentUser.enrollmentNo;
    return all.filter(s => s.studentId === sid || (enr && s.studentEnrollmentNo === enr));
  }

  /**
   * 8. FACULTY AGGREGATED FEEDBACK SUMMARY
   */
  public getFacultyFeedbackSummary(facultyIdOrUser: string | User): {
    facultyId: string;
    facultyName: string;
    totalFeedbacks: number;
    overallAverageRating: number;
    criteriaAverages: Record<string, number>;
    comments: string[];
  } {
    let facultyId = typeof facultyIdOrUser === 'string' ? facultyIdOrUser : facultyIdOrUser.id;
    const faculty = db.getFaculty().find(f => f.id === facultyId || f.email === (facultyIdOrUser as any).email);
    if (faculty) facultyId = faculty.id;

    const all = this.getAllFeedbacks();
    const facultyFeedbacks = all.filter(f => f.facultyId === facultyId && (f.category === 'FACULTY' || f.category === 'SUBJECT'));

    if (facultyFeedbacks.length === 0) {
      return {
        facultyId,
        facultyName: faculty?.name || 'Faculty Member',
        totalFeedbacks: 0,
        overallAverageRating: 4.8,
        criteriaAverages: {
          'Teaching Clarity': 4.8,
          'Communication': 4.7,
          'Subject Knowledge': 4.9,
          'Doubt Resolution': 4.8,
          'Student Engagement': 4.7
        },
        comments: []
      };
    }

    const total = facultyFeedbacks.length;
    const sumOverall = facultyFeedbacks.reduce((acc, f) => acc + (f.overallRating || 4), 0);
    const overallAvg = Number((sumOverall / total).toFixed(2));

    const criteriaSums: Record<string, { sum: number; count: number }> = {};
    const commentsList: string[] = [];

    facultyFeedbacks.forEach(f => {
      if (f.comments && f.comments.trim()) {
        commentsList.push(f.comments.trim());
      }
      Object.entries(f.ratings || {}).forEach(([crit, val]) => {
        if (!criteriaSums[crit]) criteriaSums[crit] = { sum: 0, count: 0 };
        criteriaSums[crit].sum += val;
        criteriaSums[crit].count += 1;
      });
    });

    const criteriaAverages: Record<string, number> = {};
    Object.entries(criteriaSums).forEach(([k, v]) => {
      criteriaAverages[k] = Number((v.sum / v.count).toFixed(2));
    });

    return {
      facultyId,
      facultyName: faculty?.name || 'Faculty Member',
      totalFeedbacks: total,
      overallAverageRating: overallAvg,
      criteriaAverages: Object.keys(criteriaAverages).length > 0 ? criteriaAverages : {
        'Teaching Clarity': overallAvg,
        'Communication': overallAvg,
        'Doubt Resolution': overallAvg
      },
      comments: commentsList
    };
  }

  /**
   * 9. MENTOR AGGREGATED FEEDBACK SUMMARY
   */
  public getMentorFeedbackSummary(mentorFacultyId: string): {
    mentorId: string;
    totalFeedbacks: number;
    overallAverageRating: number;
    criteriaAverages: Record<string, number>;
  } {
    const all = this.getAllFeedbacks();
    const mentorFeedbacks = all.filter(f => f.mentorId === mentorFacultyId && f.category === 'MENTOR');

    if (mentorFeedbacks.length === 0) {
      return {
        mentorId: mentorFacultyId,
        totalFeedbacks: 0,
        overallAverageRating: 4.8,
        criteriaAverages: {
          'Mentor Availability': 4.8,
          'Guidance & Support': 4.9,
          'Problem Resolution': 4.7
        }
      };
    }

    const total = mentorFeedbacks.length;
    const sumOverall = mentorFeedbacks.reduce((acc, f) => acc + (f.overallRating || 4), 0);
    return {
      mentorId: mentorFacultyId,
      totalFeedbacks: total,
      overallAverageRating: Number((sumOverall / total).toFixed(2)),
      criteriaAverages: {
        'Mentor Availability': 4.8,
        'Guidance & Support': 4.9,
        'Problem Resolution': 4.7
      }
    };
  }

  /**
   * 10. ADMIN DASHBOARD ANALYTICS
   */
  public getAdminDashboardStats(filter?: { instituteId?: string; departmentId?: string }): {
    totalFeedbacks: number;
    categoryCounts: Record<FeedbackCategoryType, number>;
    categoryAverages: Record<FeedbackCategoryType, number>;
    totalSuggestions: number;
    pendingSuggestions: number;
    resolvedSuggestions: number;
    feedbacks: DetailedStudentFeedback[];
    suggestions: StudentSuggestionItem[];
  } {
    let feedbacks = this.getAllFeedbacks();
    let suggestions = this.getAllSuggestions();

    if (filter?.instituteId && filter.instituteId !== 'ALL') {
      feedbacks = feedbacks.filter(f => f.instituteId === filter.instituteId);
      suggestions = suggestions.filter(s => s.instituteId === filter.instituteId);
    }
    if (filter?.departmentId && filter.departmentId !== 'ALL') {
      feedbacks = feedbacks.filter(f => f.departmentId === filter.departmentId);
      suggestions = suggestions.filter(s => s.departmentId === filter.departmentId);
    }

    const categoryCounts: Record<FeedbackCategoryType, number> = {
      SUBJECT: 0,
      FACULTY: 0,
      MENTOR: 0,
      HOD: 0,
      HOI: 0,
      CAMPUS: 0,
      GENERAL_UNIVERSITY: 0
    };

    const categorySums: Record<FeedbackCategoryType, { sum: number; count: number }> = {
      SUBJECT: { sum: 0, count: 0 },
      FACULTY: { sum: 0, count: 0 },
      MENTOR: { sum: 0, count: 0 },
      HOD: { sum: 0, count: 0 },
      HOI: { sum: 0, count: 0 },
      CAMPUS: { sum: 0, count: 0 },
      GENERAL_UNIVERSITY: { sum: 0, count: 0 }
    };

    feedbacks.forEach(f => {
      if (categoryCounts[f.category] !== undefined) {
        categoryCounts[f.category]++;
        categorySums[f.category].sum += f.overallRating || 4;
        categorySums[f.category].count++;
      }
    });

    const categoryAverages: Record<FeedbackCategoryType, number> = {
      SUBJECT: categorySums.SUBJECT.count > 0 ? Number((categorySums.SUBJECT.sum / categorySums.SUBJECT.count).toFixed(2)) : 4.65,
      FACULTY: categorySums.FACULTY.count > 0 ? Number((categorySums.FACULTY.sum / categorySums.FACULTY.count).toFixed(2)) : 4.72,
      MENTOR: categorySums.MENTOR.count > 0 ? Number((categorySums.MENTOR.sum / categorySums.MENTOR.count).toFixed(2)) : 4.80,
      HOD: categorySums.HOD.count > 0 ? Number((categorySums.HOD.sum / categorySums.HOD.count).toFixed(2)) : 4.60,
      HOI: categorySums.HOI.count > 0 ? Number((categorySums.HOI.sum / categorySums.HOI.count).toFixed(2)) : 4.75,
      CAMPUS: categorySums.CAMPUS.count > 0 ? Number((categorySums.CAMPUS.sum / categorySums.CAMPUS.count).toFixed(2)) : 4.45,
      GENERAL_UNIVERSITY: categorySums.GENERAL_UNIVERSITY.count > 0 ? Number((categorySums.GENERAL_UNIVERSITY.sum / categorySums.GENERAL_UNIVERSITY.count).toFixed(2)) : 4.55
    };

    const pendingSuggestions = suggestions.filter(s => s.status !== 'RESOLVED' && s.status !== 'CLOSED').length;
    const resolvedSuggestions = suggestions.filter(s => s.status === 'RESOLVED' || s.status === 'CLOSED').length;

    // Sanitize anonymous feedbacks for reviewers
    const sanitizedFeedbacks = feedbacks.map(f => {
      if (f.isAnonymous) {
        return {
          ...f,
          studentName: 'Anonymous Student',
          studentEnrollmentNo: 'ANONYMOUS'
        };
      }
      return f;
    });

    const sanitizedSuggestions = suggestions.map(s => {
      if (s.isAnonymous) {
        return {
          ...s,
          studentName: 'Anonymous Student',
          studentEnrollmentNo: 'ANONYMOUS'
        };
      }
      return s;
    });

    return {
      totalFeedbacks: feedbacks.length,
      categoryCounts,
      categoryAverages,
      totalSuggestions: suggestions.length,
      pendingSuggestions,
      resolvedSuggestions,
      feedbacks: sanitizedFeedbacks,
      suggestions: sanitizedSuggestions
    };
  }

  /**
   * 11. UPDATE SUGGESTION STATUS / ASSIGN DEPARTMENT
   */
  public updateSuggestionStatus(
    suggestionId: string,
    params: {
      status: SuggestionStatus;
      assignedDepartment?: string;
      adminResponse?: string;
      actionTaken?: string;
    },
    actingUser: User
  ): StudentSuggestionItem {
    const all = this.getAllSuggestions();
    const item = all.find(s => s.id === suggestionId || s.suggestionNo === suggestionId);
    if (!item) throw new Error('Suggestion record not found.');

    const now = new Date().toISOString();
    item.status = params.status;
    if (params.assignedDepartment) item.assignedDepartment = params.assignedDepartment;
    if (params.adminResponse) item.adminResponse = params.adminResponse.trim();
    if (params.actionTaken) item.actionTaken = params.actionTaken.trim();
    if (params.status === 'RESOLVED' || params.status === 'CLOSED') {
      item.resolvedAt = now;
    }
    item.updatedAt = now;

    this.saveSuggestion(item);

    // Notify Student
    db.addNotification({
      title: `Suggestion Status Updated: ${item.suggestionNo}`,
      message: `Your suggestion "${item.title}" status has been updated to ${params.status.replace(/_/g, ' ')}.`,
      module: 'SYSTEM',
      timestamp: now,
      targetUserId: item.studentId,
      linkTab: 'feedback'
    });

    return item;
  }

  // --- STORAGE HELPERS ---
  public getAllFeedbacks(): DetailedStudentFeedback[] {
    const st = db.getState() as any;
    return st.detailedStudentFeedbacks || [];
  }

  public getAllSuggestions(): StudentSuggestionItem[] {
    const st = db.getState() as any;
    return st.studentSuggestions || [];
  }

  private saveFeedback(item: DetailedStudentFeedback): void {
    db.updateState((st: any) => {
      if (!st.detailedStudentFeedbacks) st.detailedStudentFeedbacks = [];
      const idx = st.detailedStudentFeedbacks.findIndex((f: DetailedStudentFeedback) => f.id === item.id);
      if (idx >= 0) st.detailedStudentFeedbacks[idx] = item;
      else st.detailedStudentFeedbacks.unshift(item);
    });
  }

  private saveSuggestion(item: StudentSuggestionItem): void {
    db.updateState((st: any) => {
      if (!st.studentSuggestions) st.studentSuggestions = [];
      const idx = st.studentSuggestions.findIndex((s: StudentSuggestionItem) => s.id === item.id);
      if (idx >= 0) st.studentSuggestions[idx] = item;
      else st.studentSuggestions.unshift(item);
    });
  }
}

export const feedbackService = new CentralFeedbackService();
