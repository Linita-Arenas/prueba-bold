import { Component } from '@angular/core';

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  imports: [],
  templateUrl: './filter-modal.component.html',
  styleUrl: './filter-modal.component.scss'
})

export class FilterModalComponent {
  filters: string[] = [];

  toggleFilter(filter: string) {
    const index = this.filters.indexOf(filter);
    if (index > -1) {
      this.filters.splice(index, 1);
    } else {
      this.filters.push(filter);
    }
    // Actualizar la tabla con los filtros aplicados
  }
}
