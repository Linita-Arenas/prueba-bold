import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-transaction-detail-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './transaction-detail-modal.component.html',
  styleUrls: ['./transaction-detail-modal.component.scss']
})
export class TransactionDetailModalComponent {
  
  constructor(
    public dialogRef: MatDialogRef<TransactionDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
/*     console.log('Datos del modal:', data); */
  }

  // Método para obtener el texto del tipo de pago basado en el ícono
  getPaymentTypeText(): string {
    switch (this.data.icon) {
      case '/assets/img/link.svg':
        return 'Link de Pago';
      case '/assets/img/credit.svg':
        return 'Cobro con datáfono';
      default:
        return 'Tipo de Pago Desconocido';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
