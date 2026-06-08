import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass, DatePipe, NgTemplateOutlet } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { ManagementComponent } from '../management/management.component';
import { ProjectModel, MemberModel } from '../model/project-dto';
import { ProjectService } from '../services/project/project.service';
import { TaskService } from '../services/task/task.service';
import { LabelService } from '../services/label/label.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { TaskCreate, TaskModel, TaskPriority, TaskStatus, TaskFilters, TaskUpdate } from '../model/task-dto';
import { LabelModel } from '../model/label-dto';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NavbarComponent, NgIf, NgFor, NgClass, DatePipe, NgTemplateOutlet, ReactiveFormsModule, FormsModule, ManagementComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {

  activeProject: ProjectModel | null = null;
  tasks: TaskModel[] = [];
  members: MemberModel[] = [];
  labels: LabelModel[] = [];
  currentUserId = '';

  loading = false;
  activeTab: 'kanban' | 'management' = 'kanban';

  // Task modal
  showTaskModal = false;
  editingTask: TaskModel | null = null;
  addingToStatus: TaskStatus = 'backlog';

  // Label modal
  showLabelModal = false;

  // Drag & Drop
  draggedTask: TaskModel | null = null;

  // Filters
  filterPriority = '';
  filterAssignee = '';
  filterLabel = '';
  filterOnlyMy = false;

  taskForm = new FormGroup({
    title:        new FormControl('', [Validators.required]),
    description:  new FormControl(''),
    priority:     new FormControl<TaskPriority>('medium'),
    start_date:   new FormControl(''),
    end_date:     new FormControl(''),
    assignee_ids: new FormControl<string[]>([]),
    label_ids:    new FormControl<string[]>([]),
  });

  labelForm = new FormGroup({
    name:  new FormControl('', [Validators.required]),
    color: new FormControl('#3b82f6', [Validators.required]),
  });

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private labelService: LabelService,
    private authService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe({ next: u => this.currentUserId = u.id });
    this.projectService.activeProject$.subscribe(project => {
      this.activeProject = project;
      if (project) { this.loadAll(project.id); }
      else { this.tasks = []; this.members = []; this.labels = []; }
    });
  }

  loadAll(projectId: string): void {
    this.loading = true;
    this.taskService.getTasks(projectId).subscribe({
      next: t => { this.tasks = t; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.projectService.getMembers(projectId).subscribe({
      next: m => this.members = m,
      error: () => {}
    });
    this.labelService.getLabels(projectId).subscribe({
      next: l => this.labels = l,
      error: () => {}
    });
  }

  onTabChanged(tab: 'kanban' | 'management'): void {
    this.activeTab = tab;
  }

  // ── Filters ────────────────────────────────────────────────
  applyFilters(): void {
    if (!this.activeProject) return;
    const f: TaskFilters = {};
    if (this.filterPriority) f.priority = this.filterPriority as TaskPriority;
    if (this.filterAssignee) f.assignee_id = this.filterAssignee;
    if (this.filterLabel)    f.label_id = this.filterLabel;
    if (this.filterOnlyMy)   f.only_my = true;
    this.taskService.getTasks(this.activeProject.id, f).subscribe(t => this.tasks = t);
  }

  resetFilters(): void {
    this.filterPriority = '';
    this.filterAssignee = '';
    this.filterLabel = '';
    this.filterOnlyMy = false;
    if (this.activeProject) this.loadAll(this.activeProject.id);
  }

  // ── Tasks by column ────────────────────────────────────────
  tasksByStatus(status: TaskStatus): TaskModel[] {
    return this.tasks.filter(t => t.status === status);
  }

  // ── Open add modal ─────────────────────────────────────────
  openAddTask(status: TaskStatus): void {
    this.editingTask = null;
    this.addingToStatus = status;
    this.taskForm.reset({ priority: 'medium', assignee_ids: [], label_ids: [] });
    this.showTaskModal = true;
  }

  // ── Open edit modal ────────────────────────────────────────
  openEditTask(task: TaskModel, event: Event): void {
    event.stopPropagation();
    this.editingTask = task;
    this.taskForm.patchValue({
      title:        task.title,
      description:  task.description ?? '',
      priority:     task.priority,
      start_date:   task.start_date ? task.start_date.substring(0, 10) : '',
      end_date:     task.end_date   ? task.end_date.substring(0, 10)   : '',
      assignee_ids: task.assignees.map(a => a.id),
      label_ids:    task.labels.map(l => l.id),
    });
    this.showTaskModal = true;
  }

  closeModal(): void {
    this.showTaskModal = false;
    this.editingTask = null;
  }

  submitTask(): void {
    if (!this.activeProject || this.taskForm.invalid) return;
    const v = this.taskForm.value;

    if (this.editingTask) {
      const body: TaskUpdate = {
        title:        v.title        ?? undefined,
        description:  v.description  ?? undefined,
        priority:     (v.priority as TaskPriority) ?? undefined,
        start_date:   v.start_date || null,
        end_date:     v.end_date   || null,
        assignee_ids: v.assignee_ids ?? [],
        label_ids:    v.label_ids    ?? [],
      };
      this.taskService.updateTask(this.activeProject.id, this.editingTask.id, body).subscribe({
        next: updated => {
          this.tasks = this.tasks.map(t => t.id === updated.id ? updated : t);
          this.closeModal();
        }
      });
    } else {
      const body: TaskCreate = {
        title:        v.title    ?? '',
        description:  v.description ?? undefined,
        status:       this.addingToStatus,
        priority:     (v.priority as TaskPriority) ?? 'medium',
        start_date:   v.start_date ?? undefined,
        end_date:     v.end_date   ?? undefined,
        assignee_ids: v.assignee_ids ?? [],
        label_ids:    v.label_ids    ?? [],
      };
      this.taskService.createTask(this.activeProject.id, body).subscribe({
        next: task => { this.tasks = [...this.tasks, task]; this.closeModal(); }
      });
    }
  }

  deleteTask(task: TaskModel, event: Event): void {
    event.stopPropagation();
    if (!this.activeProject || !confirm(`Usunąć "${task.title}"?`)) return;
    this.taskService.deleteTask(this.activeProject.id, task.id).subscribe({
      next: () => { this.tasks = this.tasks.filter(t => t.id !== task.id); }
    });
  }

  moveTask(task: TaskModel, newStatus: TaskStatus): void {
    if (!this.activeProject || task.status === newStatus) return;
    this.taskService.updateTaskStatus(this.activeProject.id, task.id, { status: newStatus }).subscribe({
      next: updated => { this.tasks = this.tasks.map(t => t.id === updated.id ? updated : t); }
    });
  }

  // ── Drag & Drop ────────────────────────────────────────────
  onDragStart(task: TaskModel, event: DragEvent): void {
    this.draggedTask = task;
    event.dataTransfer?.setData('text/plain', task.id);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('drag-over');
  }

  onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
  }

  onDrop(status: TaskStatus, event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');
    if (this.draggedTask && this.draggedTask.status !== status) {
      this.moveTask(this.draggedTask, status);
    }
    this.draggedTask = null;
  }

  onDragEnd(): void { this.draggedTask = null; }

  // ── Assignee helpers ───────────────────────────────────────
  isAssigneeSelected(userId: string): boolean {
    return (this.taskForm.value.assignee_ids ?? []).includes(userId);
  }

  toggleAssignee(userId: string): void {
    const cur = [...(this.taskForm.value.assignee_ids ?? [])];
    const idx = cur.indexOf(userId);
    if (idx >= 0) cur.splice(idx, 1); else cur.push(userId);
    this.taskForm.patchValue({ assignee_ids: cur });
  }

  // ── Label helpers ──────────────────────────────────────────
  isLabelSelected(labelId: string): boolean {
    return (this.taskForm.value.label_ids ?? []).includes(labelId);
  }

  toggleLabel(labelId: string): void {
    const cur = [...(this.taskForm.value.label_ids ?? [])];
    const idx = cur.indexOf(labelId);
    if (idx >= 0) cur.splice(idx, 1); else cur.push(labelId);
    this.taskForm.patchValue({ label_ids: cur });
  }

  // ── Label CRUD ─────────────────────────────────────────────
  openLabelModal(): void {
    this.labelForm.reset({ color: '#3b82f6' });
    this.showLabelModal = true;
  }

  closeLabelModal(): void { this.showLabelModal = false; }

  submitLabel(): void {
    if (!this.activeProject || this.labelForm.invalid) return;
    this.labelService.createLabel(this.activeProject.id, {
      name:  this.labelForm.value.name  ?? '',
      color: this.labelForm.value.color ?? '#3b82f6',
    }).subscribe({
      next: l => { this.labels = [...this.labels, l]; this.closeLabelModal(); }
    });
  }

  deleteLabel(label: LabelModel, event: Event): void {
    event.stopPropagation();
    if (!this.activeProject || !confirm(`Usunąć etykietę "${label.name}"?`)) return;
    this.labelService.deleteLabel(this.activeProject.id, label.id).subscribe({
      next: () => { this.labels = this.labels.filter(l => l.id !== label.id); }
    });
  }

  // ── Display helpers ────────────────────────────────────────
  priorityClass(priority: TaskPriority): string {
    return { low: 'pr-low', medium: 'pr-medium', high: 'pr-high', critical: 'pr-critical' }[priority];
  }

  priorityLabel(priority: TaskPriority): string {
    return { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }[priority];
  }

  isOverdue(task: TaskModel): boolean {
    if (!task.end_date || task.status === 'done') return false;
    return new Date(task.end_date) < new Date();
  }
}
