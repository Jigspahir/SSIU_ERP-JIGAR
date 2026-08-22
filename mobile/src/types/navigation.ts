import { NavigatorScreenParams } from '@react-navigation/native';
import { ERPNotificationItem, StudentServiceRequest, PTMRecord } from './index';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  NotificationDetail: { notification: ERPNotificationItem };
  NotificationPreferences: undefined;
  CreateRequest: undefined;
  CreateComplaint: undefined;
  DocumentViewer: { title: string; fileUrl?: string; category?: string };
  RequestDetail: { request: StudentServiceRequest };
  PTMDetail: { ptm: PTMRecord };
};


export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ActivityTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
  MoreTab: undefined;
};

export type StudentStackParamList = {
  StudentHome: undefined;
  StudentAttendance: undefined;
  StudentAcademic: undefined;
  StudentExam: undefined;
  StudentDiary: undefined;
  StudentDocuments: undefined;
  StudentRequests: undefined;
  StudentPTM: undefined;
};

export type ParentStackParamList = {
  ParentHome: undefined;
  ParentAttendance: undefined;
  ParentAcademic: undefined;
  ParentPTM: undefined;
  ParentDiary: undefined;
  ParentFees: undefined;
  ParentRequests: undefined;
};

export type FacultyStackParamList = {
  FacultyHome: undefined;
  FacultyAttendance: undefined;
  FacultyPTM: undefined;
  FacultyRequests: undefined;
  FacultyAssignedStudents: undefined;
};

export type MentorStackParamList = {
  MentorHome: undefined;
  MentorMentees: undefined;
  MentorRisk: undefined;
  MentorPTM: undefined;
};
