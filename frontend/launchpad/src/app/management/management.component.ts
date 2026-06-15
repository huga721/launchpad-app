import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { AdminService } from '../services/admin/admin.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { UserResponse } from '../model/admin-dto';

const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value ?? '';
  const confirmPassword = control.get('confirmPassword')?.value ?? '';
  if (!password && !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

const editPasswordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value ?? '';
  const confirmPassword = control.get('confirmPassword')?.value ?? '';
  if (!password && !confirmPassword) return null;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

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
  showDeleteModal = false;

  selectedUser: UserResponse | null = null;
  userToDelete: UserResponse | null = null;

  addSubmitted = false;
  editSubmitted = false;

  addUserForm = new FormGroup({
    full_name:       new FormControl('', [Validators.required]),
    email:           new FormControl('', [Validators.required, Validators.email]),
    password:        new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
    role:            new FormControl('user', [Validators.required]),
  }, { validators: passwordMatchValidator });

  editUserForm = new FormGroup({
    full_name:       new FormControl('', [Validators.required]),
    role:            new FormControl('user', [Validators.required]),
    password:        new FormControl(''),
    confirmPassword: new FormControl(''),
  }, { validators: editPasswordMatchValidator });

  constructor(private adminService: AdminService, private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe(me => { this.currentUserId = me.id; });
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: users => { this.users = users; this.loading = false; },
      error: () => { this.loading = false; this.errorMsg = 'Nie udało się załadować użytkowników.'; }
    });
  }

  openAddModal(): void {
    this.addSubmitted = false;
    this.addUserForm.reset({ full_name: '', email: '', password: '', confirmPassword: '', role: 'user' });
    this.errorMsg = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.errorMsg = '';
    this.addSubmitted = false;
  }

  submitAddUser(): void {
    this.addSubmitted = true;
    this.addUserForm.markAllAsTouched();
    if (this.addUserForm.invalid) return;
    this.errorMsg = '';
    this.adminService.createUser({
      full_name: this.addUserForm.value.full_name ?? '',
      email:     this.addUserForm.value.email     ?? '',
      password:  this.addUserForm.value.password  ?? '',
      role:      this.addUserForm.value.role       ?? 'user',
    }).subscribe({
      next: user => { this.users = [...this.users, user]; this.closeAddModal(); },
      error: err => { this.errorMsg = this.parseError(err, 'Nie udało się utworzyć użytkownika.'); }
    });
  }

  get addPasswordMismatch(): boolean {
    return !!this.addUserForm.errors?.['passwordMismatch'] && this.addSubmitted;
  }

  openEditModal(user: UserResponse): void {
    this.editSubmitted = false;
    this.selectedUser = user;
    this.editUserForm.reset({ full_name: user.full_name, role: user.role, password: '', confirmPassword: '' });
    this.errorMsg = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.errorMsg = '';
    this.editSubmitted = false;
  }

  submitEditUser(): void {
    this.editSubmitted = true;
    this.editUserForm.markAllAsTouched();
    if (!this.selectedUser || this.editUserForm.invalid) return;
    this.errorMsg = '';

    const body: Record<string, unknown> = {
      full_name: this.editUserForm.value.full_name ?? undefined,
      role:      this.editUserForm.value.role      ?? undefined,
    };
    if (this.editUserForm.value.password) {
      body['password'] = this.editUserForm.value.password;
    }

    this.adminService.updateUser(this.selectedUser.id, body).subscribe({
      next: updated => {
        this.users = this.users.map(u => u.id === updated.id ? updated : u);
        this.closeEditModal();
      },
      error: err => { this.errorMsg = this.parseError(err, 'Nie udało się zaktualizować użytkownika.'); }
    });
  }

  get editPasswordMismatch(): boolean {
    const password = this.editUserForm.get('password')?.value ?? '';
    const confirmPassword = this.editUserForm.get('confirmPassword')?.value ?? '';
    if (!password || !confirmPassword) return false;
    return password !== confirmPassword;
  }

  openDeleteModal(user: UserResponse): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDeleteUser(): void {
    if (!this.userToDelete) return;
    this.adminService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        this.closeDeleteModal();
      },
      error: err => {
        this.errorMsg = this.parseError(err, 'Nie udało się usunąć użytkownika.');
        this.closeDeleteModal();
      }
    });
  }

  toggleActive(user: UserResponse): void {
    const action = user.is_active ? 'zablokować' : 'odblokować';
    if (!confirm(`Czy na pewno chcesz ${action} użytkownika ${user.full_name}?`)) return;
    this.adminService.updateUser(user.id, { is_active: !user.is_active }).subscribe({
      next: updated => { this.users = this.users.map(u => u.id === updated.id ? updated : u); },
      error: err => { this.errorMsg = this.parseError(err, 'Nie udało się zmienić statusu użytkownika.'); }
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('pl-PL');
  }

  private parseError(err: { status?: number; error?: { detail?: unknown } }, fallback: string): string {
    if (err.status === 422) return 'Nieprawidłowe dane wejściowe.';
    const detail = err.error?.detail;
    if (typeof detail === 'string') return detail;
    return fallback;
  }
}
