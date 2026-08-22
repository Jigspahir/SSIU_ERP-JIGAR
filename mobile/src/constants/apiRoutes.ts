export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
  },

  // Push Notifications & Tokens
  PUSH: {
    REGISTER_TOKEN: '/api/v1/push/register-token',
    CONFIG: '/api/v1/push/config',
    NOTIFICATIONS: '/api/v1/communications',
  },

  // Student Services
  STUDENT: {
    PROFILE: '/api/v1/student-services/profile',
    ATTENDANCE: '/api/v1/attendance/my',
    RESULTS: '/api/v1/exams/results',
    DIARY: '/api/v1/student-services/diary',
    DOCUMENTS: '/api/v1/documents/my',
    REQUESTS: '/api/v1/student-services/requests',
    CREATE_REQUEST: '/api/v1/student-services/requests',
  },

  // Parent Services
  PARENT: {
    LINKED_CHILDREN: '/api/v1/student-services/parent/children',
    CHILD_DETAILS: (id: string) => `/api/v1/student-services/parent/children/${id}`,
    CHILD_ATTENDANCE: (id: string) => `/api/v1/attendance/student/${id}`,
    CHILD_RESULTS: (id: string) => `/api/v1/exams/student/${id}/results`,
    CHILD_FEES: (id: string) => `/api/v1/fees/student/${id}`,
  },

  // PTM (Parent-Teacher Meeting)
  PTM: {
    SCHEDULES: '/api/v1/ptm/schedules',
    CONFIRM: (id: string) => `/api/v1/ptm/schedules/${id}/confirm`,
    RESCHEDULE: (id: string) => `/api/v1/ptm/schedules/${id}/reschedule`,
    FACULTY_SCHEDULES: '/api/v1/ptm/faculty/schedules',
    ADD_REMARKS: (id: string) => `/api/v1/ptm/schedules/${id}/remarks`,
  },

  // Faculty Services
  FACULTY: {
    ASSIGNED_STUDENTS: '/api/v1/academic-mapping/faculty/students',
    MARK_ATTENDANCE: '/api/v1/attendance/mark',
    PENDING_REQUESTS: '/api/v1/student-services/faculty/requests',
    RESPOND_REQUEST: (id: string) => `/api/v1/student-services/requests/${id}/respond`,
  },

  // Mentor Services
  MENTOR: {
    MENTEES: '/api/v1/mentor-assignment/mentees',
    ACADEMIC_RISK: '/api/ai/risk/mentees',
    ATTENDANCE_RISK: '/api/v1/attendance/risk/mentees',
  },
};
