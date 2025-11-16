import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './presentation/layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './presentation/pages/login/login.component';

export const routes: Routes = [

  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
];
