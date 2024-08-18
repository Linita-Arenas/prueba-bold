import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TransactionsService } from '../helpers/services/transactions.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TransactsInterface } from '../helpers/services/transactions.service';
@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatTableModule, MatPaginatorModule ],
  templateUrl: './transaction-table.component.html',
  styleUrl: './transaction-table.component.scss',
  providers: [DatePipe]
})
export class TransactionTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
 /*  @ViewChild(MatPaginator) paginator?: MatPaginator; */
 transactions: TransactsInterface[][] = [];
  dataSource = new MatTableDataSource<TransactsInterface[]>();
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
        this.titleTable = title;
        this.applySelectedFilter();
        //this.filterTransactions(this.dataSource, response)
      }
    })
  }

  ngOnInit() {
    this.getTransactions();
    this.applySelectedFilter();
  }

 /*  ngAfterViewInit() {
    /* this.dataSource.paginator = this.paginator; 
    console.log('paginador'+ this.paginator);
    if (this.paginator) {
      /* this.paginator.pageSize = 5; 
      this.dataSource.paginator = this.paginator;
    }
  } */

    ngAfterViewInit() {
      if (this.dataSource.data && this.dataSource.data.length > 0) {
        this.dataSource.paginator = this.paginator;
      }
      
    }

    getTransactions() {
      this.isLoading = true;
      this.transactionsService.getTransactions().subscribe({
        next: (response) => {
          this.transactions = Array.isArray(response.data) ? response.data : [];
          this.dataSource.data = this.transactions; 
  
          if (this.paginator) {
            this.dataSource.paginator = this.paginator; // Configura el paginador después de obtener los datos
          }
  
          this.paymentMethods = [
            ...new Set(
              this.transactions.map((item: any) => 
                item.franchise ? item.franchise : item.paymentMethod
              )
            )
          ];
          console.log(this.paymentMethods)
        },
        complete: () => {
          this.isLoading = false;
          this.loadIcons();
        },
        error: (err) => { 
          this.isLoading = false;
        },
      })
    }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Nuevas funciones para aplicar filtros
  applyFilters(filterList: any[]) {
    console.log('Filtros aplicados:', filterList);
    this.transactionsService.filterTransactions(filterList).subscribe((response) => {
      this.dataSource.data = response;
    });
  }

  // Cargar el estado de los filtros desde localStorage
  loadFilters() {
    const savedFilters = localStorage.getItem('filters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      this.applyFilters(filters);
    }
  }

  getformattedDate(date: string): string {
    const dateFormat = new Date(date);
    return this.datePipe.transform(dateFormat, 'dd/MM/yyyy - HH:mm:ss') || '';
  }

  getPaymentMethod(element: any) {
    if (element.paymentMethod === 'CARD')
      return { icon: `${element.franchise}`, text: `${element.franchise} ****${element.transactionReference}` }
    else
      return { icon: `${element.paymentMethod}`, text: `${element.paymentMethod}` };
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
        /* return []; */
        return transactions;
    }
    this.applySelectedFilter()
  }

  applySelectedFilter() {
    let filteredTransactions = this.filterTransactions(this.transactions, this.titleTable);
    /* this.dataSource = new MatTableDataSource(filteredTransactions); */
    this.dataSource.data = filteredTransactions;

    if (this.paginator) {
      this.dataSource.paginator = this.paginator; // Asegura que el paginador esté configurado después de filtrar
    }
  }

  loadIcons(){
    this.paymentMethods.map(logo=>{
      this.transactionsService.getLogo(logo).subscribe({
        next:(response)=>{
          this.paymentMethodsIcons.push({dispname:logo, icon:response[0].icon});
        }
      });
    });
  }

  
  getIcon(logo:any){
    return this.paymentMethodsIcons.find(el=> el.dispname == logo)
    /* return this.paymentMethodsIcons.find(el => el.dispname == logo)?.icon */
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