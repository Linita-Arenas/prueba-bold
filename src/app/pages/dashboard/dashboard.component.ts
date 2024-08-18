import { Component, EventEmitter, Output } from '@angular/core';
import { TransactionTableComponent } from '../../components/transaction-table/transaction-table.component';
import { CardComponent } from '../../components/card/card.component';
import { TransactionsService } from '../../helpers/services/transactions.service';
import { DateRangeSelectorComponent } from '../../components/date-range-selector/date-range-selector.component';
import { TransactionDetailModalComponent } from '../../components/transaction-detail-modal/transaction-detail-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TransactionTableComponent, TransactionDetailModalComponent, CardComponent, DateRangeSelectorComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  period = 'Junio';
  state:number = 0
  @Output() dateSelected: EventEmitter<any> = new EventEmitter();

  constructor(private transactionsService:TransactionsService){}

  setPeriod(period: string) {
    this.period = period;
    // Actualizar la tabla con los datos correspondientes
  }

  openFilterModal() {
    // Lógica para abrir el modal de filtros
  }

  
 


}