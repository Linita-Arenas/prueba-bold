import { HttpClient, HttpParams } from '@angular/common/http';
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

  dateSelected$ = new BehaviorSubject('month');
  private apiUrl = 'https://bold-fe-api.vercel.app/api'; 

  constructor(private http: HttpClient) { }

  getTransactions(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getLogo(logo: any): Observable<any> {
    return this.http.get<any>(`https://api.brandfetch.io/v2/search/${logo}?limit=1`);
  }
  changesDateSelected(state: any): void {
    this.dateSelected$.next(state);
  }
  filterTransactions(filterList: string[]): Observable<any> {
    let params = new HttpParams();
    filterList.forEach((filter) => {
      params = params.append('filter', filter);
    });
    return this.http.get<any>(this.apiUrl, { params });
  }
}
