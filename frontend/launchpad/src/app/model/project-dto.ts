export interface CreateProjectRequest {
  name: string
  description: string
}

export interface ProjectModel {
  id: string
  name: string
  description: string
  ownerId: string
  createdAt: number
}
