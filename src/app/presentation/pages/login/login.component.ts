import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  // Importamos RouterLink para poder usar [routerLink] en el HTML
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // Aún no necesitamos lógica. ¡Solo diseño!
}
