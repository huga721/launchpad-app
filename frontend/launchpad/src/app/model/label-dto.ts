export interface LabelModel {
  id: string;
  name: string;
  color: string;
  project_id: string;
}

export interface LabelCreate {
  name: string;
  color: string;
}

export interface LabelUpdate {
  name?: string;
  color?: string;
}
