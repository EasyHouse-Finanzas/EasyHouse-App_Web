import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // IMPORTANTE

import { routes } from './app.routes';
import { jwtInterceptor } from './infrastructure/security/jwt.interceptor'; // IMPORTANTE

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])) // AQUÍ SE CONECTA EL INTERCEPTOR
  ]
};
