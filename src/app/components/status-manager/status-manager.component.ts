import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-status-manager',
  standalone: true,
  templateUrl: './status-manager.component.html',
  styleUrls: ['./status-manager.component.css'],
  imports: [FormsModule] // Adicionar FormsModule
})
export class StatusManagerComponent implements OnInit {
  data: any;
  newStatus = { title: '', description: '' };

  constructor(private http: HttpClient) {
    console.log('StatusManagerComponent instanciado');
  }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.http.get('http://localhost:3000/status').subscribe(data => {
      this.data = data;
      console.log(data);
    }, error => {
      console.error('Error getting data:', error);
    });
  }

  onSubmit() {
    this.saveStatus(this.newStatus);
  }

  saveStatus(newStatus: any) {
    if (!newStatus.title.trim() || !newStatus.description.trim()) {
      console.error('Title is required.');
      alert('Title is required');
      return; 
    }
    this.http.post('http://localhost:3000/status', newStatus).subscribe(response => {
      console.log('Status saved successfully:', response);
      this.getData();
      this.newStatus = { title: '', description: '' };
    }, error => {
      console.error('Error saving status:', error);
    });
  }
}
