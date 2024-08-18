import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  private titleTableSource = new BehaviorSubject<string>('month');
  private totalAmountSource = new BehaviorSubject<number>(0);
  totalAmount$ = this.totalAmountSource.asObservable();
  private titleTableListSource = new BehaviorSubject<any>({
    day: 'de hoy',
    week: 'de esta semana',
    month: 'de este mes',
    PAYMENT_LINK: 'con cobro con link',
    TERMINAL: 'con cobro con datáfono'
  });

  titleTable$ = this.titleTableSource.asObservable();
  titleTableList$ = this.titleTableListSource.asObservable();

  setTitleTable(title: string) {
    this.titleTableSource.next(title);
  }

  setTitleTableList(titleList: any) {
    this.titleTableListSource.next(titleList);
  }

  setTotalAmount(amount: number) {
    console.log('setTotalAmount:', amount);
    this.totalAmountSource.next(amount);
  }

  getTitleTable() {
    return this.titleTableSource.getValue();
  }

  getTitleTableList() {
    return this.titleTableListSource.getValue();
  }
 
}
