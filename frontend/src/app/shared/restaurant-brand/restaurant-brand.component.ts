import { Component, Input, inject } from '@angular/core';
import { EmpresaBrandStore } from '../../core/services/empresa-brand.store';
import { MATERIAL_IMPORTS } from '../material';

@Component({
  selector: 'app-restaurant-brand',
  standalone: true,
  imports: [...MATERIAL_IMPORTS],
  templateUrl: './restaurant-brand.component.html',
  styleUrl: './restaurant-brand.component.scss',
})
export class RestaurantBrandComponent {
  readonly brand = inject(EmpresaBrandStore);

  /** sm | md | lg */
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() subtitle = '';
  @Input() centered = false;

  constructor() {
    this.brand.ensureLoaded();
  }
}
