import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Status } from '../../status.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-status-manager',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './status-manager.component.html',
  styleUrls: ['./status-manager.component.css']
})
export class StatusManagerComponent {
  status: Status;

  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<StatusManagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { status: Status }
  ) {
    this.status = { ...data.status };
    if (!this.status.color) {
      this.status.color = '#888888';
    }
  }

  onSubmit(): void {
    this.saveStatus(this.status);
  }

  saveStatus(status: Status): void {
    if (!status.title.trim() || !status.description.trim()) {
      alert('Title and Description, are required');
      return;
    }

    if (!status.color || status.color.trim() === '') {
      status.color = '#888888';
    }

    if (status.id) {
      this.http.put(`http://localhost:3000/status/${status.id}`, status).subscribe(
        response => {
          console.log('Status updated successfully:', response);
          this.dialogRef.close(true);
          location.reload();
        },
        error => {
          console.error('Error updating status:', error);
        }
      );
    } else {
      this.http.post('http://localhost:3000/status', status).subscribe(
        response => {
          console.log('Status created successfully:', response);
          this.dialogRef.close(true);
          location.reload();
        },
        error => {
          console.error('Error creating status:', error);
        }
      );
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
