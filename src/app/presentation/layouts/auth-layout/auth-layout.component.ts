import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet], // ¡Importante para que las rutas hijas (Login) se muestren!
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent {
  // Por ahora, el layout no necesita lógica, solo mostrar el contenido.
}
