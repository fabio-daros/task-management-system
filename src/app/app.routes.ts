import { Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { StatusManagerComponent } from './components/status-manager/status-manager.component';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', component: TaskListComponent },
  { path: 'status', component: StatusManagerComponent },
];
