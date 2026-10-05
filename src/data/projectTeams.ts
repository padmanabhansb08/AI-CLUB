export interface ProjectTeamMember {
  member_id: string;
  full_name: string;
  register_number: string;
  department: string;
  class_section: string;
  year: number;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface ProjectTeam {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  max_members: number | null;
  created_by: string;
  status: 'forming' | 'active' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
  member_count: string;
  members?: ProjectTeamMember[];
  currentStudentMembership?: 'leader' | 'member' | null;
  
  // These are populated in "My Teams" view
  project_title?: string;
  role?: 'leader' | 'member';
}
