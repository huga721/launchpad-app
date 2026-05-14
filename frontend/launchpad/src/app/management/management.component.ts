import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../services/admin/admin.service';
import { UserResponse } from '../model/admin-dto';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css'
})
export class ManagementComponent implements OnInit {

  users: UserResponse[] = [];
  loading = false;
  showAddModal = false;
  showResetModal = false;
  selectedUser: UserResponse | null = null;

  addUserForm = new FormGroup({
    full_name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl('user', [Validators.required]),
  });

  resetPasswordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (users: UserResponse[]) => { this.users = users; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  deleteUser(user: UserResponse): void {
    if (!confirm(`Usuń użytkownika ${user.full_name}?`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => { this.users = this.users.filter(u => u.id !== user.id); }
    });
  }

  openAddModal(): void {
    this.addUserForm.reset({ role: 'user' });
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  submitAddUser(): void {
    if (this.addUserForm.invalid) return;
    this.adminService.createUser({
      full_name: this.addUserForm.value.full_name ?? '',
      email: this.addUserForm.value.email ?? '',
      password: this.addUserForm.value.password ?? '',
      role: this.addUserForm.value.role ?? 'user',
    }).subscribe({
      next: (user: UserResponse) => {
        this.users = [...this.users, user];
        this.closeAddModal();
      }
    });
  }

  openResetModal(user: UserResponse): void {
    this.selectedUser = user;
    this.resetPasswordForm.reset();
    this.showResetModal = true;
  }

  closeResetModal(): void {
    this.showResetModal = false;
    this.selectedUser = null;
  }

  submitResetPassword(): void {
    if (!this.selectedUser || this.resetPasswordForm.invalid) return;
    this.adminService.updateUser(this.selectedUser.id, {
      password: this.resetPasswordForm.value.password ?? ''
    }).subscribe({
      next: () => { this.closeResetModal(); }
    });
  }
}
