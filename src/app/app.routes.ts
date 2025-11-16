import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './presentation/layouts/auth-layout/auth-layout.component';
import { AppLayoutComponent } from './presentation/layouts/app-layout/app-layout.component';
import { LoginComponent } from './presentation/pages/login/login.component';
import { RegisterComponent } from './presentation/pages/register/register.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';

export const routes: Routes = [

  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  {
    path: 'app',
    component: AppLayoutComponent,
    children: [
      { path: 'inicio', component: DashboardComponent },
      { path: 'clientes', component: DashboardComponent },
      { path: 'unidades', component: DashboardComponent },
      { path: 'simulador', component: DashboardComponent },
      { path: 'reportes', component: DashboardComponent },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
