import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService } from '../../../infrastructure/services/mock-data.service';
import { RealEstate } from '../../../domain/models/real-estate.model';

@Component({
  selector: 'app-real-estate-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './real-estate-list.component.html'
})
export class RealEstateListComponent implements OnInit {
  houses: RealEstate[] = [];
  isModalOpen = false;
  houseForm: FormGroup;
  isLoading = false;

  constructor(
    private dataService: MockDataService,
    private fb: FormBuilder
  ) {
    this.houseForm = this.fb.group({
      proyecto: ['', Validators.required],
      codigo_inmueble: ['', Validators.required],
      area_total: [0, [Validators.required, Validators.min(1)]],
      area_techada: [0, [Validators.required, Validators.min(1)]],
      ubicacion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadHouses();
  }

  loadHouses() {
    this.isLoading = true;
    this.dataService.getHouses().subscribe({
      next: (data) => {
        this.houses = data;
        this.isLoading = false;
      },
      error: (e) => {
        console.error(e);
        this.isLoading = false;
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.houseForm.reset({ area_total: 0, area_techada: 0, precio: 0 });
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveHouse() {
    if (this.houseForm.valid) {
      const newHouse: RealEstate = this.houseForm.value;
      this.dataService.addHouse(newHouse).subscribe(() => {
        this.loadHouses();
        this.closeModal();
      });
    } else {
      this.houseForm.markAllAsTouched();
    }
  }
}
