import { Component, OnInit } from '@angular/core';
import { DataSharingService } from '../../helpers/services/data-sharing.service';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  titleTable: string = '';
  titleTableList: any = {};
  totalAmount: number = 0;

  constructor(private dataSharingService: DataSharingService) { }

  ngOnInit() {
    this.dataSharingService.titleTable$.subscribe(title => {
      this.titleTable = title;
    });

    this.dataSharingService.titleTableList$.subscribe(list => {
      this.titleTableList = list;
    });

    this.dataSharingService.totalAmount$.subscribe(totalAmount => {
      this.totalAmount = totalAmount;
      console.log('Recibido totalAmount en CardComponent:', this.totalAmount);
    });

  }
  getTableTitle(): string {
    return this.titleTableList[this.titleTable] || '';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  getFormattedDate(): string {
    const now = new Date();
    return now.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
