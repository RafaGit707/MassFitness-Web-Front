import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})

export class ConfirmDialogComponent {
  message: string = "¿Estás seguro?"; // Mensaje por defecto

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    // MAT_DIALOG_DATA contendrá el objeto que pasamos al abrir, ej: { message: '...' }
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {
    if (data?.message) {
      this.message = data.message;
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }
}