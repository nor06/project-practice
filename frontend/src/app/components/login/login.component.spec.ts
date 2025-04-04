<h1 style="text-align: center;">
    Login Page
</h1>
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
    <div class="container">
        <mat-form-field>
            <input matInput placeholder="Email" formControlName="email">
            <mat-hint *ngIf="loginForm.controls.email.errors">Email is required</mat-hint>
        </mat-form-field>
        <mat-form-field>
            <input matInput type="password" placeholder="Password" formControlName="password">
            <mat-hint *ngIf="loginForm.controls.password.errors">Password is required</mat-hint>
        </mat-form-field>
        <button mat-flat-button color="primary" [disabled]="!loginForm.valid" type="submit">Login</button>
    </div>
</form>