import { Component } from '@angular/core';
import { TransactionsService } from '../helpers/services/transactions.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-range-selector',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './date-range-selector.component.html',
  styleUrl: './date-range-selector.component.scss'
})
export class DateRangeSelectorComponent {
  state:number = 0
  filters = Array(3).fill(false);
  filterList:string[]=['PAYMENT_LINK','TERMINAL','ALL']

  constructor(private transactionsService:TransactionsService){}

  loadData(date:any, state:number){
    if (this.state === state)  this.state = 0
    else this.state = state
    this.transactionsService.changesDateSelected(date);
  }

  applyFilters() {
    console.log('Filtros aplicados:', this.filters);
    let filterList:any = []
    this.filters.map((el, idx)=>{
      if (el)
        filterList.push(this.filterList[idx])
    })
    console.log(filterList)
    this.transactionsService.changesDateSelected(filterList);
  }

}
