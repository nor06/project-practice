import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from "rxjs/operators";

export interface LoginForm {
  email: string;
  password: string;
};

export interface User {
  name?: string;
  username?: string;
  email?: string;  // 🔥 Fixed Typo
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }

  login(loginForm: LoginForm) {  
    return this.http.post<any>('http://localhost:3000/users/login', {
      email: loginForm.email, 
      password: loginForm.password
    }).pipe(
      tap({
        next: (token) => {
          console.log('Token received:', token);
          localStorage.setItem('blog-token', token.access_token);
          alert('Login successful! Redirecting to localhost...');
        },
        error: () => {
          alert('Invalid email or password');
        }
      })
    );
}

  

  register(user: User) {
    return this.http.post<any>('/api/users', user).pipe(
      tap(user => console.log('Registered user:', user))
    );
  }
}
