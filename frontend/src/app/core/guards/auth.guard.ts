import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/security/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard - checking authentication status...');
  
  // Check if user is logged in
  const isLoggedIn = authService.isLoggedIn();
  console.log('AuthGuard - isLoggedIn:', isLoggedIn);
  
  if (isLoggedIn) {
    console.log('AuthGuard - user is authenticated, allowing access');
    return true;
  } else {
    console.log('AuthGuard - user is not authenticated, redirecting to login');
    router.navigate(['/login']);
    return false;
  }
}; 