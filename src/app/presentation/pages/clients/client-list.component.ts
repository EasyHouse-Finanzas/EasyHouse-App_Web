import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../infrastructure/services/mock-data.service';
import { Client } from '../../../domain/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  isModalOpen = false;
  clientForm: FormGroup;
  isLoading = false;

  constructor(
    private dataService: MockDataService,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      fecha_nacimiento: ['', Validators.required],
      ocupacion: ['', Validators.required],
      ingresos_mensuales: [0, [Validators.required, Validators.min(0)]],
      usuario_id: [1]
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {
    this.isLoading = true;
    this.dataService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando clientes:', err);
        this.isLoading = false;
      }
    });
  }


  openModal() {
    this.isModalOpen = true;
    this.clientForm.reset({ ingresos_mensuales: 0, usuario_id: 1 });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveClient() {
    if (this.clientForm.valid) {
      const newClient: Client = this.clientForm.value;
      this.dataService.addClient(newClient).subscribe(() => {
        this.loadClients();
        this.closeModal();
      });
    } else {
      this.clientForm.markAllAsTouched();
    }
  }

  deleteClient(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
      this.dataService.deleteClient(id).subscribe(() => {
        this.loadClients(); // Recargamos la tabla
      });
    }
  }
}
