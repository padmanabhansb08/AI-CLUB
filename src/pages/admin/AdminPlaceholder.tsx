import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';

interface AdminPlaceholderProps {
  title: string;
}

export const AdminPlaceholder: React.FC<AdminPlaceholderProps> = ({ title }) => {
  return (
    <AdminLayout pageTitle={title}>
      <div className="admin-section">
        <p className="text-secondary mb-6">This section is currently in development.</p>
        
        <div className="empty-state">
          <div className="empty-icon">🚧</div>
          <h3>{title} Foundation</h3>
          <p>Read-only foundation layer established. Management functionality will be built in the next phase.</p>
        </div>
      </div>
    </AdminLayout>
  );
};
