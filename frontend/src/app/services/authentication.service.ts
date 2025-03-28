import { Injectable } from '@angular/core';
 import {HttpClient} from '@angular/common/http';
 import { map } from "rxjs/operators";
 
 @Injectable({
   providedIn: 'root'
 })
 export class AuthenticationService {
 
   constructor(private http: HttpClient) { }
 
   login(email: string, password: string) {  
 
     return this.http.post<any>('http://localhost:3000/users/login', {email, password}).pipe(
       map((token) => {
         console.log('token');
         localStorage.setItem('blog-token', token.access_token);
         return token;
       })
     )
 
   }
 }