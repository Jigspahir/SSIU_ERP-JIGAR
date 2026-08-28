import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StudentFeedbackPage } from './StudentFeedbackPage';
import { AdminFeedbackDashboardPage } from './AdminFeedbackDashboardPage';

export interface FeedbackPageProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ activeTab, setActiveTab }) => {
  const { role } = useAuth();

  if (role === 'STUDENT') {
    return <StudentFeedbackPage activeSubTab={activeTab} onTabChange={setActiveTab} />;
  }

  return <AdminFeedbackDashboardPage />;
};

export default FeedbackPage;
