import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

export interface LoginForm {
  email: string;
  password: string;
}

export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;  // ✅ FIXED typo here
  password?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }

  login(loginForm: LoginForm) {
    return this.http.post<any>('http://localhost:3000/users/login', { email: loginForm.email, password: loginForm.password }).pipe(
      map((response) => {
        console.log('Response:', response);
        if (response && response.access_token) {
          localStorage.setItem('blog-token', response.access_token);
        }
        return response;
      })
    );
  }

  register(user: User) {
    return this.http.post<any>('http://localhost:3000/users', user).pipe(
      tap(user => console.log(user)),
      map(user => user)
    );
  }
}
