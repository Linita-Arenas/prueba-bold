import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { TransactionTableComponent } from './components/transaction-table/transaction-table.component';
import { FooterComponent } from './components/footer/footer.component';
import { TransactionDetailModalComponent } from './components/transaction-detail-modal/transaction-detail-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
            DashboardComponent,
            HeaderComponent,
            TransactionTableComponent,
            TransactionDetailModalComponent,
            FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-project-bold';
}
