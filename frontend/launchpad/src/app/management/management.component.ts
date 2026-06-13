import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../services/admin/admin.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { UserResponse } from '../model/admin-dto';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ReactiveFormsModule],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css'
})
export class ManagementComponent implements OnInit {

  users: UserResponse[] = [];
  loading = false;
  errorMsg = '';
  currentUserId = '';

  showAddModal = false;
  showEditModal = false;
  selectedUser: UserResponse | null = null;

  addUserForm = new FormGroup({
    full_name: new FormControl('', [Validators.required]),
    email:     new FormControl('', [Validators.required, Validators.email]),
    password:  new FormControl('', [Validators.required, Validators.minLength(6)]),
    role:      new FormControl('user', [Validators.required]),
  });

  editUserForm = new FormGroup({
    full_name: new FormControl('', [Validators.required]),
    role:      new FormControl('user', [Validators.required]),
    password:  new FormControl(''),
  });

  constructor(private adminService: AdminService, private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe(me => { this.currentUserId = me.id; });
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: users => { this.users = users; this.loading = false; },
      error: () => { this.loading = false; this.errorMsg = 'Failed to load users.'; }
    });
  }

  openAddModal(): void {
    this.addUserForm.reset({
      full_name: '',
      email:     '',
      password:  '',
      role:      'user',
    });
    this.errorMsg = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.errorMsg = '';
  }

  submitAddUser(): void {
    if (this.addUserForm.invalid) return;
    this.errorMsg = '';
    this.adminService.createUser({
      full_name: this.addUserForm.value.full_name ?? '',
      email:     this.addUserForm.value.email     ?? '',
      password:  this.addUserForm.value.password  ?? '',
      role:      this.addUserForm.value.role       ?? 'user',
    }).subscribe({
      next: user => { this.users = [...this.users, user]; this.closeAddModal(); },
      error: err => { this.errorMsg = this.parseError(err, 'Failed to create user.'); }
    });
  }

  openEditModal(user: UserResponse): void {
    this.selectedUser = user;
    this.editUserForm.reset({
      full_name: user.full_name,
      role:      user.role,
      password:  '',
    });
    this.errorMsg = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.errorMsg = '';
  }

  submitEditUser(): void {
    if (!this.selectedUser || this.editUserForm.invalid) return;
    this.errorMsg = '';
    const body: any = {
      full_name: this.editUserForm.value.full_name ?? undefined,
      role:      this.editUserForm.value.role      ?? undefined,
    };
    if (this.editUserForm.value.password) body.password = this.editUserForm.value.password;

    this.adminService.updateUser(this.selectedUser.id, body).subscribe({
      next: updated => {
        this.users = this.users.map(u => u.id === updated.id ? updated : u);
        this.closeEditModal();
      },
      error: err => { this.errorMsg = this.parseError(err, 'Failed to update user.'); }
    });
  }

  deleteUser(user: UserResponse): void {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${user.full_name}? Tej operacji nie można cofnąć.`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => { this.users = this.users.filter(u => u.id !== user.id); },
      error: err => { this.errorMsg = this.parseError(err, 'Failed to delete user.'); }
    });
  }

  toggleActive(user: UserResponse): void {
    const action = user.is_active ? 'zablokować' : 'odblokować';
    if (!confirm(`Czy na pewno chcesz ${action} użytkownika ${user.full_name}?`)) return;
    this.adminService.updateUser(user.id, { is_active: !user.is_active }).subscribe({
      next: updated => { this.users = this.users.map(u => u.id === updated.id ? updated : u); },
      error: err => { this.errorMsg = this.parseError(err, 'Failed to update user status.'); }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pl-PL');
  }

  private parseError(err: { status?: number; error?: { detail?: unknown } }, fallback: string): string {
    if (err.status === 422) return 'Invalid input data.';
    const detail = err.error?.detail;
    if (typeof detail === 'string') return detail;
    return fallback;
  }
}
