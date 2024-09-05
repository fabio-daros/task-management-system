import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService, Task, Team } from '../../task.service';
import { StatusManagerComponent } from '../status-manager/status-manager.component';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TeamComponent } from '../team/team.component';
import { StatusService, Status } from '../../status.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, MatDialogModule, DragDropModule, FormsModule, RouterLink],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  isMenuOpen = true;
  tasks: Task[] = [];
  teams: Team[] = [];
  tasksWithTeams: { task: Task, team: Team }[] = [];
  statuses: Status[] = [];
  hoveredDescription: string | null = null;
  activeStatusMenu: string | null = null;
  newTaskTitles: { [statusTitle: string]: string } = {};
  draggingStatusId: string | null = null;
  searchTerm: string = '';
  filteredTasks: Task[] = [];
  statusIds: string[] = [];
  
  constructor(
    private taskService: TaskService,
    private statusService: StatusService,
    public dialog: MatDialog,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadStatuses();
    this.loadTasks();
    this.loadTasksAndTeams();
  }
  
  loadTasksAndTeams(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.taskService.getTeams().subscribe(teams => {
        this.teams = teams;
        this.combineTasksWithTeams();
      });
    });
  }

  combineTasksWithTeams(): void {
    this.tasks.forEach(task => {
      task.team = this.teams.find(t => t.id === task.teamId);
    });
  }

  getTeamMemberName(task: Task): string {
    return task.team ? task.team.name : 'Ownerless';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  openModalTeam(event: MouseEvent) {
    event.preventDefault();
    this.dialog.open(TeamComponent, {
      width: '500px',
    });
  }

  openModalStatus(event: MouseEvent) {
    event.preventDefault();
    this.dialog.open(StatusManagerComponent, {
      width: '500px',
      data: {}
    });
  }

  openModalTaskItem(event: MouseEvent, taskId: string) {
    event.preventDefault();
    this.dialog.open(TaskItemComponent, {
      width: '500px',
      data: {taskId}
    });
  }


  loadStatuses() {
    this.statusService.getStatuses().subscribe(statuses => {
      this.statuses = statuses.sort((a, b) => a.order - b.order);
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
        this.loadTasks();
      }
    });
  }

  deleteStatus(status: Status) {
    console.log('Deleting status:', status.title);
    const tasksForStatus = this.getTasksByStatus(status.title);
    if (tasksForStatus.length > 0) {
      alert('This status cannot be deleted because there are tasks currently associated with it.');
      return; 
  }

    const confirmation = confirm('Are you sure you want to delete this status?');
    if (confirmation) {
      this.statusService.deleteStatus(status.id).subscribe(() => {
        this.statuses = this.statuses.filter(s => s.id !== status.id);
      });
    }
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
    return this.tasks
      .filter(task => task.status === statusTitle)
      .sort((a, b) => a.order - b.order); 
  }

  addTask(title: string, status: Status): void {
    if (!title.trim()) {
      return;
    }

    const newTask: Omit<Task, 'id'> = {
      title, status: status.title,
      teamId: '',
      team: undefined,
      situation: '',
      description: '',
      statusColor: '',
      order: this.getTasksByStatus(status.title).length
    };
  this.taskService.addTask(newTask).subscribe(task => {
    this.tasks.push(task);
    this.newTaskTitles[status.title] = '';
    this.updateTaskOrder(this.getTasksByStatus(status.title));
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
    const confirmation = confirm('Are you sure you want to delete this task?');
    if (confirmation) {
      this.taskService.deleteTask(task.id).subscribe(() => { 
        this.tasks = this.tasks.filter(t => t.id !== task.id);
      });
    }
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.filteredTasks = this.tasks.filter(task =>
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredTasks = [];
    }
  }

  openTaskItem(taskId: string): void {
    this.dialog.open(TaskItemComponent, {
      width: '500px',
      data: { taskId }
    });
  }

  onDropTask(event: CdkDragDrop<Task[]>, status: Status): void {
    const task = event.item.data as Task;
    console.log('Tarefa antes da atualização:', task);
    
    if (event.previousContainer === event.container) {
      console.log('Tarefa movida dentro do mesmo status');
      // Se a tarefa está sendo movida dentro do mesmo status
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateTaskOrder(event.container.data);
    } else {
      console.log('Tarefa movida para um novo status');
      // Se a tarefa está sendo movida para um novo status
      task.status = status.title; // Atualize o status da tarefa
      console.log('Tarefa com o novo status:', task);
      
      this.taskService.updateTask(task).subscribe(() => {
        console.log('Tarefa atualizada no backend com sucesso');
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.updateTaskOrder(event.container.data); // Atualiza a ordem das tarefas no novo status
      }, error => {
        console.error('Erro ao atualizar a tarefa no backend:', error);
      });
    }
  }
  
  onDropStatus(event: CdkDragDrop<Status[]>): void {
  
    if (event.previousIndex === event.currentIndex) {
      return;
    }
  
    moveItemInArray(this.statuses, event.previousIndex, event.currentIndex);
  
    this.statuses.forEach((status, index) => {
      status.order = index;
    });
  
    this.updateStatusOrder();
  }

  updateTaskOrder(tasks: Task[]): void {
    tasks.forEach((task, index) => {
      task.order = index + 1; // Atualiza a ordem baseada na posição no array
      
      // Atualiza a tarefa no backend
      this.taskService.updateTask(task).subscribe(
        () => {
          // console.log(`Tarefa ${task.id} atualizada com a nova ordem ${task.order}`);
        },
        error => {
          console.error('Erro ao atualizar a ordem da tarefa:', error);
        }
      );
    });
  }

  updateStatusOrder() {

    this.statuses.forEach((status) => {
      const updatedStatus = { ...status };
  
      this.http.put(`http://localhost:3000/status/${status.id}`, updatedStatus).subscribe(
        () => {
          console.log(`Status ID ${status.id} updated successfully`);
        },
        (error) => {
          console.error('Error updating status order:', error);
        }
      );
    });
  }
}
