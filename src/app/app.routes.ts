import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionTableComponent } from './components/transaction-table/transaction-table.component';

export const routes: Routes = [
    { path: 'transactions', component: TransactionTableComponent },
    { path: '', redirectTo: '/transactions', pathMatch: 'full' },
    
  ];


  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }