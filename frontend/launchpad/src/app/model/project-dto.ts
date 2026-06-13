export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface ProjectModel {
  id: string;
  name: string;
  description: string;
  owner_id: string | null;
  created_at: string;
}

export interface MemberModel {
  user_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  role: string;
  joined_at: string;
}
