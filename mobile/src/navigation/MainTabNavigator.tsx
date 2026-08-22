import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Home,
  Activity,
  Bell,
  User as UserIcon,
  Menu,
  BookOpen,
  CalendarCheck,
  Award,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { THEME } from '../constants/theme';
import { MainTabParamList } from '../types/navigation';

// Role Home Screens
import { StudentHomeScreen } from '../screens/student/StudentHomeScreen';
import { StudentAttendanceScreen } from '../screens/student/StudentAttendanceScreen';
import { StudentAcademicScreen } from '../screens/student/StudentAcademicScreen';
import { StudentExamScreen } from '../screens/student/StudentExamScreen';
import { StudentDiaryScreen } from '../screens/student/StudentDiaryScreen';
import { StudentDocumentsScreen } from '../screens/student/StudentDocumentsScreen';
import { StudentRequestsScreen } from '../screens/student/StudentRequestsScreen';

import { StudentAssignmentsScreen } from '../screens/student/StudentAssignmentsScreen';
import { StudentPTMScreen } from '../screens/student/StudentPTMScreen';
import { StudentProfileScreen } from '../screens/student/StudentProfileScreen';

import { ParentHomeScreen } from '../screens/parent/ParentHomeScreen';
import { ParentPTMScreen } from '../screens/parent/ParentPTMScreen';
import { ParentAcademicScreen } from '../screens/parent/ParentAcademicScreen';
import { ParentFeesScreen } from '../screens/parent/ParentFeesScreen';

import { FacultyHomeScreen } from '../screens/faculty/FacultyHomeScreen';
import { FacultyAttendanceScreen } from '../screens/faculty/FacultyAttendanceScreen';
import { FacultyPTMScreen } from '../screens/faculty/FacultyPTMScreen';
import { FacultyRequestsScreen } from '../screens/faculty/FacultyRequestsScreen';
import { FacultyStudentsScreen } from '../screens/faculty/FacultyStudentsScreen';
import { FacultyAssignmentsScreen } from '../screens/faculty/FacultyAssignmentsScreen';
import { FacultyExamScreen } from '../screens/faculty/FacultyExamScreen';

import { MentorHomeScreen } from '../screens/mentor/MentorHomeScreen';
import { MentorMenteesScreen } from '../screens/mentor/MentorMenteesScreen';
import { MentorRiskScreen } from '../screens/mentor/MentorRiskScreen';
import { MentorCounselingScreen } from '../screens/mentor/MentorCounselingScreen';
import { MentorDocVerificationScreen } from '../screens/mentor/MentorDocVerificationScreen';

import { AdminOverviewScreen } from '../screens/admin/AdminOverviewScreen';
import { NotificationsScreen } from '../screens/common/NotificationsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';
import { SettingsScreen } from '../screens/common/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator();

const HomeStackNavigator: React.FC = () => {
  const { activeRole } = useAuth();

  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      {activeRole === 'PARENT' ? (
        <>
          <HomeStack.Screen name="ParentHome" component={ParentHomeScreen} />
          <HomeStack.Screen name="ParentPTM" component={ParentPTMScreen} />
          <HomeStack.Screen name="ParentAcademic" component={ParentAcademicScreen} />
          <HomeStack.Screen name="ParentFees" component={ParentFeesScreen} />
          <HomeStack.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
          <HomeStack.Screen name="StudentDiary" component={StudentDiaryScreen} />
        </>
      ) : activeRole === 'FACULTY' ? (
        <>
          <HomeStack.Screen name="FacultyHome" component={FacultyHomeScreen} />
          <HomeStack.Screen name="FacultyAttendance" component={FacultyAttendanceScreen} />
          <HomeStack.Screen name="FacultyStudents" component={FacultyStudentsScreen} />
          <HomeStack.Screen name="FacultyAssignments" component={FacultyAssignmentsScreen} />
          <HomeStack.Screen name="FacultyExam" component={FacultyExamScreen} />
          <HomeStack.Screen name="FacultyPTM" component={FacultyPTMScreen} />
          <HomeStack.Screen name="FacultyRequests" component={FacultyRequestsScreen} />
          <HomeStack.Screen name="StudentProfile" component={StudentProfileScreen} />
          <HomeStack.Screen name="StudentDiary" component={StudentDiaryScreen} />
        </>
      ) : activeRole === 'MENTOR' ? (
        <>
          <HomeStack.Screen name="MentorHome" component={MentorHomeScreen} />
          <HomeStack.Screen name="MentorMentees" component={MentorMenteesScreen} />
          <HomeStack.Screen name="MentorRisk" component={MentorRiskScreen} />
          <HomeStack.Screen name="MentorCounseling" component={MentorCounselingScreen} />
          <HomeStack.Screen name="MentorDocVerify" component={MentorDocVerificationScreen} />
          <HomeStack.Screen name="FacultyRequests" component={FacultyRequestsScreen} />
          <HomeStack.Screen name="FacultyPTM" component={FacultyPTMScreen} />
          <HomeStack.Screen name="StudentProfile" component={StudentProfileScreen} />
          <HomeStack.Screen name="StudentDiary" component={StudentDiaryScreen} />
        </>
      ) : activeRole === 'STUDENT' ? (

        <>
          <HomeStack.Screen name="StudentHome" component={StudentHomeScreen} />
          <HomeStack.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
          <HomeStack.Screen name="StudentAcademic" component={StudentAcademicScreen} />
          <HomeStack.Screen name="StudentExam" component={StudentExamScreen} />
          <HomeStack.Screen name="StudentAssignments" component={StudentAssignmentsScreen} />
          <HomeStack.Screen name="StudentPTM" component={StudentPTMScreen} />
          <HomeStack.Screen name="StudentDiary" component={StudentDiaryScreen} />
          <HomeStack.Screen name="StudentDocuments" component={StudentDocumentsScreen} />
          <HomeStack.Screen name="StudentRequests" component={StudentRequestsScreen} />
          <HomeStack.Screen name="StudentProfile" component={StudentProfileScreen} />
        </>
      ) : (
        <HomeStack.Screen name="AdminHome" component={AdminOverviewScreen} />
      )}
    </HomeStack.Navigator>
  );
};


export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.accent,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: THEME.colors.primary,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: THEME.typography.weights.semibold,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="ActivityTab"
        component={StudentAttendanceScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ color, size }) => <Activity size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <UserIcon size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => <Menu size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
