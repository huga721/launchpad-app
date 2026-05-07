export type TaskStatus = 'backlog' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskAssignee {
  id: string;
  full_name: string;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface TaskModel {
  id: string;
  title: string;
  description: string | null;
  project_id: string;
  creator_id: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  assignees: TaskAssignee[];
  labels: TaskLabel[];
}

export interface TaskCreate {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  start_date?: string;
  end_date?: string;
  assignee_ids: string[];
  label_ids: string[];
}

export interface TaskStatusUpdate {
  status: TaskStatus;
}
