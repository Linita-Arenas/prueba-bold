import { Component } from '@angular/core';
import { TransactionsService } from '../helpers/services/transactions.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-date-range-selector',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './date-range-selector.component.html',
  styleUrl: './date-range-selector.component.scss'
})
export class DateRangeSelectorComponent {
  state: number = 3;
  filters = Array(3).fill(false);
  filterList: string[] = ['PAYMENT_LINK', 'TERMINAL', 'ALL'];
  dataSource = new MatTableDataSource<any>();

  constructor(private transactionsService: TransactionsService) { }

  ngOnInit() {
    this.state = 3;
    this.loadData('month', this.state); // Carga los datos para "Agosto" al iniciar el componente.
    // Cargar el estado de los filtros desde localStorage
    this.applyFilters();
    const savedFilters = localStorage.getItem('filters');
    if (savedFilters) {
      this.filters = JSON.parse(savedFilters);
    }
  }

  loadData(date: any, state: number) {
    if (this.state === state) this.state = 0
    else this.state = state
    this.transactionsService.changesDateSelected(date);
    localStorage.setItem('filters', JSON.stringify(this.filters));
  }

  applyFilters() {
    console.log('Filtros aplicados:', this.filters);
    let filterList: string[] = [];
    this.filters.forEach((el, idx) => {
      if (el) filterList.push(this.filterList[idx]);
    });
    console.log(filterList);

    // Guardar el estado de los filtros en localStorage
    localStorage.setItem('filters', JSON.stringify(this.filters));

    /* this.transactionsService.changesDateSelected(filterList); */
    this.transactionsService.filterTransactions(filterList).subscribe((response) => {
      this.dataSource.data = response;
    });
  }


}
