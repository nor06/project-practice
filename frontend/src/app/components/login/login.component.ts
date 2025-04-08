import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication-service/authentication.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(3)])
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value).pipe(
      map((token) => {
        console.log('Login Successful, Token:', token); // Check the token received
        this.router.navigate(['users']);
      })
    ).subscribe(
      response => {
        // Handle successful login if needed
      },
      error => {
        console.error('Login Error:', error); // Handle login errors
      }
    );
  }
}
