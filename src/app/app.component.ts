import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskListComponent } from "./components/task-list/task-list.component";
import { StatusManagerComponent } from './components/status-manager/status-manager.component';
import { TaskItemComponent } from './components/task-item/task-item.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TaskListComponent, StatusManagerComponent, TaskItemComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ineo-task-management';
}
