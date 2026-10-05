import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

interface PlaceholderProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderProps> = ({ title }) => {
  return (
    <DashboardLayout pageTitle={title}>
      <div className="placeholder-content">
        <h3>{title}</h3>
        <p>This module is currently under development.</p>
        <div className="placeholder-icon">🚧</div>
      </div>
    </DashboardLayout>
  );
};
