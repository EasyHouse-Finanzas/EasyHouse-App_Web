import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../../infrastructure/services/client.service';
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
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  constructor() {
    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      birthDate: ['', Validators.required],
      occupation: ['', Validators.required],
      monthlyIncome: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {
    this.isLoading = true;
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error obteniendo clientes del backend:', err);
        this.isLoading = false;
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.clientForm.reset({ monthlyIncome: 0 });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveClient() {
    if (this.clientForm.valid) {
      this.isLoading = true;
      const formData = this.clientForm.value;
      const isoDate = new Date(formData.birthDate).toISOString();

      const newClient: Client = {
        ...formData,
        birthDate: isoDate,
        userId: ''
      };

      this.clientService.createClient(newClient).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error guardando cliente en backend:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.clientForm.markAllAsTouched();
    }
  }
}
