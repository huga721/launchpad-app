import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { ProjectModel } from '../model/project-dto';
import { ProjectService } from '../services/project/project.service';
import { TaskService } from '../services/task/task.service';
import { TaskCreate, TaskModel, TaskPriority, TaskStatus } from '../model/task-dto';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NavbarComponent, NgIf, NgFor, NgClass, ReactiveFormsModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {

  activeProject: ProjectModel | null = null;
  tasks: TaskModel[] = [];
  loading = false;
  showAddTaskModal = false;
  addingToStatus: TaskStatus = 'backlog';

  addTaskForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    priority: new FormControl<TaskPriority>('medium'),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
  });

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    this.projectService.activeProject$.subscribe(project => {
      this.activeProject = project;
      if (project) this.loadTasks(project.id);
      else this.tasks = [];
    });
  }

  loadTasks(projectId: string): void {
    this.loading = true;
    this.taskService.getTasks(projectId).subscribe({
      next: (tasks) => { this.tasks = tasks; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  tasksByStatus(status: TaskStatus): TaskModel[] {
    return this.tasks.filter(t => t.status === status);
  }

  openAddTask(status: TaskStatus): void {
    this.addingToStatus = status;
    this.addTaskForm.reset({ priority: 'medium' });
    this.showAddTaskModal = true;
  }

  closeModal(): void {
    this.showAddTaskModal = false;
  }

  submitAddTask(): void {
    if (!this.activeProject || this.addTaskForm.invalid) return;

    const body: TaskCreate = {
      title: this.addTaskForm.value.title ?? '',
      description: this.addTaskForm.value.description ?? undefined,
      status: this.addingToStatus,
      priority: (this.addTaskForm.value.priority as TaskPriority) ?? 'medium',
      start_date: this.addTaskForm.value.start_date ?? undefined,
      end_date: this.addTaskForm.value.end_date ?? undefined,
      assignee_ids: [],
      label_ids: [],
    };

    this.taskService.createTask(this.activeProject.id, body).subscribe({
      next: (task) => {
        this.tasks = [...this.tasks, task];
        this.closeModal();
      },
      error: (err) => console.error('Blad tworzenia taska', err)
    });
  }

  deleteTask(task: TaskModel, event: Event): void {
    event.stopPropagation();
    if (!this.activeProject) return;
    this.taskService.deleteTask(this.activeProject.id, task.id).subscribe({
      next: () => { this.tasks = this.tasks.filter(t => t.id !== task.id); }
    });
  }

  moveTask(task: TaskModel, newStatus: TaskStatus): void {
    if (!this.activeProject || task.status === newStatus) return;
    this.taskService.updateTaskStatus(this.activeProject.id, task.id, { status: newStatus }).subscribe({
      next: (updated) => {
        this.tasks = this.tasks.map(t => t.id === updated.id ? updated : t);
      }
    });
  }

  priorityClass(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      critical: 'priority-critical',
    };
    return map[priority];
  }

  priorityLabel(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      low: 'Niski',
      medium: 'Sredni',
      high: 'Wysoki',
      critical: 'Krytyczny',
    };
    return map[priority];
  }
}
