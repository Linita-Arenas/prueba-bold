import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

export interface TransactsInterface {
  status: string;
  createdAt: string;
  paymentMethod: string;
  id: number;
  amount: number;
  salesType?:	string;
  transactionReference?:	number;
  deduction?:	number;
  franchise?:	string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {

  dateSelected = new BehaviorSubject('day');

  constructor(private http: HttpClient) { }

  getTransactions(): Observable<any> {
    return this.http.get<any>('https://bold-fe-api.vercel.app/api');
  }

  getLogo(logo:any){
    return this.http.get<any>(`https://api.brandfetch.io/v2/search/${logo}?limit=1`);
  }
  changesDateSelected(state:any){
    this.dateSelected.next(state);
  }
}
