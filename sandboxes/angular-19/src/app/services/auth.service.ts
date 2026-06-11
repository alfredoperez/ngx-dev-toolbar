import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Simulates an authentication/authorization service.
 * In a real app, this would fetch permissions from your backend.
 */
export interface UserPermission {
  id: string;
  name: string;
  granted: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Simulates permissions coming from your backend/auth provider
  private permissions$ = new BehaviorSubject<UserPermission[]>([
    { id: 'can-add-users', name: 'Add Users', granted: false },
    { id: 'can-add-permissions', name: 'Add Permissions', granted: false },
    { id: 'can-manage-comments', name: 'Manage Comments', granted: true },
    { id: 'can-view-dashboard', name: 'View Dashboard', granted: false },
    { id: 'can-admin', name: 'Admin Access', granted: false },
  ]);

  getPermissions(): Observable<UserPermission[]> {
    return this.permissions$.asObservable();
  }
}
