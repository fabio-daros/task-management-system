import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { TaskService, Task } from '../../task.service';
import { StatusManagerComponent } from '../status-manager/status-manager.component';
import { StatusService, Status } from '../../status.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  isMenuOpen = true;
  tasks: Task[] = [];
  statuses: Status[] = [];
  hoveredDescription: string | null = null;
  activeStatusMenu: string | null = null;
  newTaskTitle = '';

  constructor(
    private taskService: TaskService,
    private statusService: StatusService,
    public dialog: MatDialog,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadStatuses();
    this.loadTasks();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  openModal(event: MouseEvent) {
    event.preventDefault();
    this.dialog.open(StatusManagerComponent, {
      width: '500px',
      data: {}
    });
  }

  loadStatuses() {
    this.statusService.getStatuses().subscribe(statuses => {
      this.statuses = statuses;
    });
  }

  editStatus(status: Status) {
    const dialogRef = this.dialog.open(StatusManagerComponent, {
      width: '500px',
      data: { status }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStatuses();
      }
    });
  }

  deleteStatus(status: Status) {
    console.log('Deleting status:', status.title);
    this.statusService.deleteStatus(status.id).subscribe(() => {
      this.statuses = this.statuses.filter(s => s.id !== status.id);
    });
  }

  showDescription(description: string) {
    this.hoveredDescription = description;
  }

  hideDescription() {
    this.hoveredDescription = null;
  }

  toggleStatusMenu(statusTitle: string) {
    this.activeStatusMenu = this.activeStatusMenu === statusTitle ? null : statusTitle;
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  getTasksByStatus(statusTitle: string): Task[] {
    return this.tasks.filter(task => task.status === statusTitle);
  }

  addTask(title: string): void {
    if (!title.trim()) {
      return;
    }

    const newTask: Task = { id: 0, title, status: 'unstarted' };
    this.taskService.addTask(newTask).subscribe(task => {
      this.tasks.push(task);
      this.newTaskTitle = '';
    });
  }

  moveTask(task: Task): void {
    const currentIndex = this.tasks.findIndex(t => t.id === task.id);
    const nextIndex = (currentIndex + 1) % this.tasks.length;
    const nextStatus = this.tasks[nextIndex].status;
    task.status = nextStatus;
    this.taskService.updateTask(task).subscribe(() => {
      this.tasks[currentIndex] = task;
    });
  }

  deleteTask(task: Task): void {
    this.taskService.deleteTask(task.id).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== task.id);
    });
  }
}
