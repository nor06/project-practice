import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: [null, [Validators.required]],
      username: [null, [Validators.required]],
      email: [null, [
        Validators.required,
        Validators.email,
        Validators.minLength(6)
      ]],
      password: [null, [
        Validators.required,
        Validators.minLength(3),
      ]],
      confirmPassword: [null, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }
    
    console.log('Submitting form:', this.registerForm.value);
    
    this.authService.register(this.registerForm.value).pipe(
      tap(() => this.router.navigate(['login']))  // 🔥 Changed map to tap to execute navigation
    ).subscribe();
  }
}
