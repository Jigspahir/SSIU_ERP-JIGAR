import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentFeedbackPage } from './StudentFeedbackPage';
import { AdminFeedbackDashboardPage } from './AdminFeedbackDashboardPage';

export const FeedbackPage: React.FC = () => {
  const { role } = useAuth();

  if (role === 'STUDENT') {
    return <StudentFeedbackPage />;
  }

  return <AdminFeedbackDashboardPage />;
};

export default FeedbackPage;
