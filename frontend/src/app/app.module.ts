import { BrowserModule } from '@angular/platform-browser';
 import { NgModule } from '@angular/core';
 
 import { AppRoutingModule } from './app-routing.module';
 import { AppComponent } from './app.component';
 import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 import {MatToolbarModule} from '@angular/material/toolbar';
 import { LoginComponent } from './components/login/login.component';
 import { RegisterComponent } from './components/register/register.component';
 import { HttpClientModule } from '@angular/common/http';
 
 @NgModule({
   declarations: [
     AppComponent,
     LoginComponent,
     RegisterComponent
   ],
   imports: [
     BrowserModule,
     AppRoutingModule,
     BrowserAnimationsModule,
     MatToolbarModule,
     HttpClientModule
   ],
   providers: [],
   bootstrap: [AppComponent]
 })
 export class AppModule { }