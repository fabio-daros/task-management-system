import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task, Team, Status } from '../../task.service';
import { EditorModule } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css']
})
export class TaskItemComponent {
  task: Task = {
    title: '',
    status: '',
    teamId: '',
    situation: 'unstarted',
    description: '',
    team: undefined,
    id: '',
    statusColor: ''
  };
  teams: Team[] = [];
  statuses: Status[] = [];

  constructor(
    private taskService: TaskService,
    public dialogRef: MatDialogRef<TaskItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { taskId: string }
  ) { }

  ngOnInit(): void {
    this.loadTask();
    this.loadTeams();
    this.loadStatuses();
  }

  onSubmit(): void {
    if (this.task) {
      this.taskService.updateTask(this.task).subscribe(
        updatedTask => {
          console.log('Task updated:', updatedTask);
          window.location.reload();
          this.dialogRef.close(updatedTask);
        },
        error => {
          console.error('Error updating task:', error);
        }
      );
    }
  }

  loadTask(): void {
    this.taskService.getTasks().subscribe(tasks => {
      const task = tasks.find(task => task.id === this.data.taskId);
      if (task) {
        this.task = task;
        this.task.status = task.status;
        if (this.statuses.length > 0) {
          this.task.statusColor = this.getStatusColor(task.status);
        }
      }
    });
  }

  loadTeams(): void {
    this.taskService.getTeams().subscribe(teams => {
      this.teams = teams;
    });
  }

  loadStatuses(): void {
    this.taskService.getStatus().subscribe(statuses => {
      this.statuses = statuses;
    });
  }

  getStatusColor(statusId: string): string {
    const status = this.statuses.find(s => s.id === statusId);
    console.log('Status ID:', statusId, 'Color:', status ? status.color : '#888888');
    return status ? status.color : '#888888';
  }

  isEditingTitle: boolean = false;

  deleteTask(): void {
    if (this.task.id) {
      const confirmation = confirm('Are you sure you want to delete this task?');
      if (confirmation) {
        this.taskService.deleteTask(this.task.id).subscribe(() => {
          console.log('Task deleted:', this.task.id);
          this.dialogRef.close();
          location.reload();
        }, error => {
          console.error('Error deleting task:', error);
        });
      }
    }
  }

  closeModal(): void {
    this.dialogRef.close();
  }
}
