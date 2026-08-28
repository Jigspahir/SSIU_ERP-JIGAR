export type FeedbackCategoryType = 
  | 'SUBJECT'
  | 'FACULTY'
  | 'MENTOR'
  | 'HOD'
  | 'HOI'
  | 'CAMPUS'
  | 'GENERAL_UNIVERSITY';

export type CampusFacilityCategory = 
  | 'CAMPUS_INFRASTRUCTURE'
  | 'CLASSROOMS'
  | 'LABORATORIES'
  | 'LIBRARY'
  | 'HOSTEL'
  | 'FOOD_CAFETERIA'
  | 'TRANSPORT'
  | 'SPORTS_FACILITIES'
  | 'CLEANLINESS'
  | 'SECURITY'
  | 'WIFI_INTERNET'
  | 'PARKING'
  | 'STUDENT_SERVICES'
  | 'OTHER';

export type SuggestionCategory = 
  | 'ACADEMIC'
  | 'TEACHING'
  | 'CAMPUS'
  | 'INFRASTRUCTURE'
  | 'TECHNOLOGY'
  | 'STUDENT_SERVICES'
  | 'HOSTEL'
  | 'TRANSPORT'
  | 'EVENTS'
  | 'CLUBS'
  | 'LIBRARY'
  | 'SPORTS'
  | 'LABORATORY'
  | 'ADMINISTRATION'
  | 'CAFETERIA'
  | 'OTHER';

export type FeedbackStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVIEWED'
  | 'ACKNOWLEDGED'
  | 'ACTION_REQUIRED'
  | 'RESOLVED'
  | 'CLOSED';

export type SuggestionStatus = 
  | 'SUBMITTED'
  | 'ACKNOWLEDGED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'ACTION_REQUIRED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export interface FeedbackRatingItem {
  criterion: string;
  rating: number; // 1 to 5
}

export interface DetailedStudentFeedback {
  id: string;
  feedbackNo: string; // FDB/2026/000001
  studentId: string;
  studentName?: string; // Hidden in UI when isAnonymous = true or in faculty view
  studentEnrollmentNo?: string;
  isAnonymous: boolean;
  
  category: FeedbackCategoryType;
  campusFacilityCategory?: CampusFacilityCategory;
  
  // Context targets
  instituteId: string;
  instituteName?: string;
  departmentId: string;
  departmentName?: string;
  programId?: string;
  programName?: string;
  academicYearId: string;
  academicYear?: string;
  semesterId?: string;
  semesterNumber?: number;
  
  // Target entities
  subjectId?: string;
  subjectCode?: string;
  subjectName?: string;
  facultyId?: string;
  facultyEmployeeId?: string;
  facultyName?: string;
  mentorId?: string;
  mentorName?: string;
  hodId?: string;
  hodName?: string;
  hoiId?: string;
  hoiName?: string;

  // 5 Explicit Teaching Evaluation Ratings (1 to 5 Stars)
  teachingClarity: number;
  communication: number;
  subjectKnowledge: number;
  doubtResolution: number;
  studentEngagement: number;

  // Full Criteria map & Overall calculated rating
  ratings: Record<string, number>;
  overallRating: number; // 1 to 5 (average of metrics)
  
  positiveFeedback?: string;
  improvementSuggestion?: string;
  comments?: string;
  suggestions?: string;
  attachmentUrls?: string[];

  status: FeedbackStatus;
  adminRemarks?: string;
  reviewedByUserId?: string;
  reviewedByName?: string;
  reviewedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface StudentSuggestionItem {
  id: string;
  suggestionNo: string; // SUG/2026/000001
  studentId: string;
  studentName?: string;
  studentEnrollmentNo?: string;
  isAnonymous: boolean;

  category: SuggestionCategory;
  title: string;
  description: string;
  expectedImprovement?: string;
  attachmentUrl?: string;

  departmentId?: string;
  departmentName?: string;
  instituteId?: string;

  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: SuggestionStatus;
  assignedDepartment?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  adminResponse?: string;
  actionTaken?: string;
  resolvedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface FeedbackAuditLogItem {
  id: string;
  feedbackId?: string;
  feedbackNo?: string;
  suggestionId?: string;
  suggestionNo?: string;
  user: string;
  role: string;
  action: 'FEEDBACK_SUBMITTED' | 'FEEDBACK_REVIEWED' | 'STATUS_CHANGED' | 'SUGGESTION_UPDATED' | 'FEEDBACK_EXPORTED' | 'FEEDBACK_PRINTED';
  oldValue?: string;
  newValue?: string;
  details: string;
  timestamp: string;
}

export interface FeedbackConfiguration {
  allowAnonymousFeedback: boolean;
  allowAnonymousSuggestions: boolean;
  frequencyLimits: {
    subjectFeedbackPerSemester: number;
    facultyFeedbackPerSemester: number;
    mentorFeedbackPerSemester: number;
    hodFeedbackPerSemester: number;
    hoiFeedbackPerSemester: number;
    campusFeedbackPerMonth: number;
  };
  ratingLabels: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
}
