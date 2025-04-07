import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../authentication-service/authentication.service';

export interface UserData {
  items: User[],
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  }, 
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  }
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  findAll(page: number, size: number): Observable<UserData> {
    let params = new HttpParams();
  
    params = params.append('page', String(page));
    params = params.append('limit', String(size));
  
    return this.http.get<UserData>('http://localhost:3000/users', { params }).pipe(
      map((userData) => userData),
      catchError(err => throwError(() => err)) // ✅ updated for RxJS v7+
    );
  }
  
}