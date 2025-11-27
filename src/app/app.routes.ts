import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './presentation/layouts/auth-layout/auth-layout.component';
import { AppLayoutComponent } from './presentation/layouts/app-layout/app-layout.component';
import { LoginComponent } from './presentation/pages/login/login.component';
import { RegisterComponent } from './presentation/pages/register/register.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { ClientListComponent } from './presentation/pages/clients/client-list.component';
import { RealEstateListComponent } from './presentation/pages/real-estate/real-estate-list.component';
import { SimulatorFlowComponent } from './presentation/pages/simulator/simulator-flow.component';
import { ReportListComponent } from './presentation/pages/reports/report-list.component';
import { authGuard } from './infrastructure/security/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: ClientListComponent },
      { path: 'real-estate', component: RealEstateListComponent },
      { path: 'simulator', component: SimulatorFlowComponent },
      { path: 'reports', component: ReportListComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'auth/login' }
];
