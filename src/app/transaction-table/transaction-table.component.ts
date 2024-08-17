import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TransactionsService } from '../helpers/services/transactions.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatTableModule,MatPaginator],
  templateUrl: './transaction-table.component.html',
  styleUrl: './transaction-table.component.scss',
  providers: [DatePipe]
})
export class TransactionTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  transactions: any[] = [];
  dataSource: any;
  isLoading: boolean = false;
  titleTable:string='day';
  readonly displayedColumns: string[] = ['status', 'createdAt', 'paymentMethod', 'id', 'amount'];
  readonly stateTransaction: any = {
    REJECTED: 'Cobro no realizado',
    SUCCESSFUL: 'Cobro exitoso',
  }
  readonly stateIconTransaction: any = {
    PAYMENT_LINK: {
      icon: `link-45deg.svg`, dispname: 'Cobro con link de pago'
    },
    TERMINAL: {
      icon: `credit-card-2-front.svg`, dispname: 'Cobro con datáfono'
    },
  }
  readonly titleTableList: any = {day: 'de hoy', week:'de esta semana', month:'de este mes', PAYMENT_LINK: 'con cobro con link',TERMINAL: 'con cobro con datáfono' }
  paymentMethods:any[] = [];
  paymentMethodsIcons:any[]=[]

  constructor(private transactionsService: TransactionsService, private datePipe: DatePipe) {
    this.transactionsService.dateSelected.subscribe({
      next: (response: any) => {
          let title =''
        if (typeof response === 'string') {
          this.titleTable=response
        }else{
          response.map((el:any, idx:any) =>{
            if (idx== 0) {
              title = this.titleTableList[el]
            }else if (idx != 0){
              title = title +' y '+ this.titleTableList[el]
            }
          })
        }
        this.titleTable = title
        //this.filterTransactions(this.dataSource, response)
      }
    })
  }

  ngOnInit() {
    this.getTransactions()
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getTransactions() {
    this.isLoading = true;
    this.transactionsService.getTransactions().subscribe({
      next: (response) => {
      this.transactions = Array.isArray(response.data) ? response.data : [];
        this.dataSource = new MatTableDataSource(response.data)
        this.paymentMethods = [...new Set(response.data.map((item:any) =>{
          if ( item.franchise) {
            return item.franchise
          }else{
            return item.paymentMethod
          }
        }))]
        console.log(this.paymentMethods)
      },
      complete: () => {
        this.isLoading = false;
        this.loadIcons()
      },
      error: (err) => { },
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getformattedDate(date: string): string {
    const dateFormat = new Date(date);
    return this.datePipe.transform(dateFormat, 'dd/MM/yyyy - HH:mm:ss') || '';
  }

  getPaymentMethod(element: any) {
    if (element.paymentMethod === 'CARD')
      return { icon: `${element.franchise}`, text: `${element.franchise} ****${element.transactionReference}` }
    else
      return { icon: `${element.paymentMethod}`, text: `${element.paymentMethod}` }
  }

  getStateIconTransaction(element: any) {
    return this.stateIconTransaction[element] || 'null';
  }

  getDispnameTransaction(status: string) {
    return this.stateTransaction[status] || 'null';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  filterTransactions(transactions: any[], filterType: string): any[] {
    const date: Date = new Date();
    switch (filterType) {
      case 'day':
        return this.filterByDay(transactions, date);
      case 'week':
        return this.filterByWeek(transactions, date);
      case 'month':
        return this.filterByMonth(transactions, date);
      default:
        return [];
    }
    this.applySelectedFilter()
  }

  applySelectedFilter() {
    let filteredTransactions = this.filterTransactions(this.transactions, this.titleTable);
    this.dataSource = new MatTableDataSource(filteredTransactions);
  }

  loadIcons(){
    this.paymentMethods.map(logo=>{
      this.transactionsService.getLogo(logo).subscribe({
        next:(response)=>{
          this.paymentMethodsIcons.push({dispname:logo, icon:response[0].icon})
        }
      })
    })
  }

  
  getIcon(logo:any){
    return this.paymentMethodsIcons.find(el=> el.dispname == logo)
  }

  /** Filtrar por Mes | Semana | Día */

  // Filtrar transacciones por día.
  private filterByDay(transactions: any[], date: Date): any[] {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return (
        transactionDate.getDate() === date.getDate() &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    });
  }

  // Filtrar transacciones por semana.
  private filterByWeek(transactions: any[], date: Date): any[] {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = this.getEndOfWeek(date);
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
    });
  }

  // Filtrar transacciones por mes.
  private filterByMonth(transactions: any[], date: Date): any[] {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return (
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    });
  }

  // Obtener el inicio de la semana para una fecha dada.
  private getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  // Obtener el final de la semana para una fecha dada.
  private getEndOfWeek(date: Date): Date {
    const day = date.getDay();
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + (6 - day));
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

}