import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TransactionsService } from '../../helpers/services/transactions.service';
import { DataSharingService } from '../../helpers/services/data-sharing.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TransactsInterface } from '../../helpers/services/transactions.service';
import { MatDialog } from '@angular/material/dialog';
import { TransactionDetailModalComponent } from '../transaction-detail-modal/transaction-detail-modal.component';
import { StorageService } from '../../helpers/services/storage.service';

@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    TransactionDetailModalComponent],
  templateUrl: './transaction-table.component.html',
  styleUrl: './transaction-table.component.scss',
  providers: [DatePipe]
})
export class TransactionTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  transactions: TransactsInterface[][] = [];
  dataSource = new MatTableDataSource<TransactsInterface[]>();
  dataSourceStorage: any = [];
  isLoading: boolean = false;
  titleTable: string = 'month';
  paymentMethods: any[] = [];
  paymentMethodsIcons: { dispname: string, icon: string }[] = [];
  listTypeFilter:any[]=[]
  readonly displayedColumns: string[] = ['status', 'createdAt', 'paymentMethod', 'id', 'amount'];
  readonly stateTransaction: any = {
    REJECTED: 'Cobro no realizado',
    SUCCESSFUL: 'Cobro exitoso',
  }
  readonly stateIconTransaction: any = {
    PAYMENT_LINK: {
      icon: `link.svg`, dispname: 'Cobro con link de pago'
    },
    TERMINAL: {
      icon: `credit.svg`, dispname: 'Cobro con datáfono'
    },
  }
  readonly titleTableList: any = {
    day: 'de hoy', week: 'de esta semana', month: 'de este mes',
    PAYMENT_LINK: 'con cobro con link', TERMINAL: 'con cobro con datáfono'
  }

  constructor(
    private transactionsService: TransactionsService,
    private datePipe: DatePipe,
    private storageService: StorageService,
    private dialog: MatDialog,
    private dataSharingService: DataSharingService
  ) {
    this.transactionsService.dateSelected$.subscribe({
      next: (response: any) => {
        let title = ''
        this.listTypeFilter=[]
        if (typeof response === 'string') {
          title = response
          this.applySelectedFilter();
        } else {
          response.map((el: any, idx: any) => {
            this.listTypeFilter.push(el)
            if (idx == 0) {
              title = this.titleTableList[el]
            } else if (idx != 0) {
              title = title + ' y ' + this.titleTableList[el]
            }
          })
          this.filterTypeTransaction(this.transactions, this.listTypeFilter)
        }
        this.titleTable = title;
        //this.filterTransactions(this.dataSource, response)
        this.dataSharingService.setTitleTable(this.titleTable);
        this.dataSharingService.setTitleTableList(this.titleTableList);
      }
    })
  }

  ngOnInit() {
    const storedData = this.storageService.getItemParse('bold-services');
    if (storedData) {
      try {
        this.dataSource = new MatTableDataSource<TransactsInterface[]>(JSON.parse(storedData));
        this.loadDataStorage();
      } catch (e) {
        console.error('Error parsing JSON from localStorage:', e);
        this.getTransactions();
      }
    } else {
      this.getTransactions();
    }
    this.applySelectedFilter();
    this.dataSharingService.setTitleTable(this.titleTable);
    this.dataSharingService.setTitleTableList(this.titleTableList);
  }

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
          this.dataSource.paginator = this.paginator;
        }

        this.paymentMethods = [
          ...new Set(
            this.transactions.map((item: any) =>
              item.franchise ? item.franchise : item.paymentMethod
            )
          )
        ];
        this.dataSource.data = this.transactions;
        this.storageService.setItem('bold-services', JSON.stringify(this.dataSource.data))
        this.setupPaginator();
        this.setupPaymentMethods();
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

  setupPaginator() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  setupPaymentMethods() {
    this.paymentMethods = [
      ...new Set(
        this.transactions.map((item: any) =>
          item.franchise ? item.franchise : item.paymentMethod
        )
      )
    ];
  }

  loadDataStorage() {
    this.dataSource.data = JSON.parse(this.storageService.getItem('bold-services') || '[]');
    this.setupPaginator();
    this.setupPaymentMethods();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilters(filterList: any[]) {
    this.transactionsService.filterTransactions(filterList).subscribe((response) => {
      this.dataSource.data = response;
      const totalAmount = this.calculateTotalAmount(response);
    this.dataSharingService.setTotalAmount(totalAmount)
    });
  }

  getformattedDate(date: string): string {
    const dateFormat = new Date(date);
    return this.datePipe.transform(dateFormat, 'dd/MM/yyyy - HH:mm:ss') || '';
  }

  getPaymentMethod(element: any) {
    if (element.paymentMethod === 'CARD') {
        return {
            icon: element.franchise,
            text: element.franchise,
            transactionReference: element.transactionReference
        };
    } else {
        return {
            icon: element.paymentMethod,
            text: element.paymentMethod
        };
    }
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
        return transactions;
    }
  }

  applySelectedFilter() {
    let filteredTransactions = this.filterTransactions(this.transactions, this.titleTable);
    this.dataSource = new MatTableDataSource<TransactsInterface[]>(filteredTransactions);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    const totalAmount = this.calculateTotalAmount(filteredTransactions);
    this.dataSharingService.setTotalAmount(totalAmount);
  }

  calculateTotalAmount(transactions: TransactsInterface[]): number {
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  loadIcons() {
    this.paymentMethods.map(logo => {
      this.transactionsService.getLogo(logo).subscribe({
        next: (response) => {
          this.paymentMethodsIcons.push({ dispname: logo, icon: response[0].icon });
        }
      });
    });
  }

  getIcon(logo: any) {
    return this.paymentMethodsIcons.find(el => el.dispname === logo) || { icon: '/assets/img/default-icon.svg' }; // Añade un icono por defecto si no se encuentra uno
  }

  filterTypeTransaction(transactions: any[], salesTypes: string[]){
    let dataFilter =  transactions.filter(transaction => salesTypes.includes(transaction.salesType));
    this.dataSource = new MatTableDataSource<TransactsInterface[]>(dataFilter);
  }
  /** Filtrar por Mes | Semana | Día */
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

  private filterByWeek(transactions: any[], date: Date): any[] {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = this.getEndOfWeek(date);
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
    });
  }

  private filterByMonth(transactions: any[], date: Date): any[] {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return (
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    });
  }

  private getStartOfWeek(date: Date): Date {
    const day = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }


  private getEndOfWeek(date: Date): Date {
    const day = date.getDay();
    const endOfWeek = new Date(date);
    endOfWeek.setDate(date.getDate() + (6 - day));
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

  getTooltipText(paymentType: string): string {
    return this.stateIconTransaction[paymentType]?.dispname || 'Tipo de pago desconocido';
  }

  openTransactionDetail(transaction: TransactsInterface): void {
    const icon = this.getStateIconTransaction(transaction.salesType);
    const paymentMethod = this.getPaymentMethod(transaction);
    const paymentMethodIcon = this.getIcon(paymentMethod.text)?.icon || '';

    this.dialog.open(TransactionDetailModalComponent, {
      width: '30%',
      data: {
        icon: `/assets/img/${icon.icon}`,
        description: this.getDispnameTransaction(transaction.status),
        amount: this.formatCurrency(transaction.amount),
        date: this.getformattedDate(transaction.createdAt),
        id: transaction.id,
        deduction: transaction.deduction ? this.formatCurrency(transaction.deduction) : null,
        paymentMethod: paymentMethod.text,
        paymentMethodIcon: paymentMethodIcon,
        paymentType: this.stateIconTransaction[transaction.paymentMethod]?.dispname || 'Desconocido'
      }
    });
  }
}