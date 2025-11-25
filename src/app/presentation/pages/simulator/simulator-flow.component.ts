import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simulator-flow',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-800">Simulador de Crédito</h1>
      <p class="text-gray-600 mt-2">Aquí irá el flujo de 4 pasos (Stepper).</p>
    </div>
  `
})
export class SimulatorFlowComponent {}
