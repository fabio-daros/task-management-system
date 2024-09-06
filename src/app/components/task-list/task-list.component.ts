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

  // Método que faltava, adicionando ele aqui:
  loadTasks(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
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
      data: { taskId }
    });
  }

  loadStatuses() {
    this.statusService.getStatuses().subscribe(statuses => {
      this.statuses = statuses.sort((a, b) => a.order - b.order);
    });
  }

  editStatus(status: Status) {
    const oldStatusTitle = status.title; // Guardar o título antigo do status
    
    const dialogRef = this.dialog.open(StatusManagerComponent, {
      width: '500px',
      data: { status }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newStatusTitle = result.title; // Novo título do status após edição
        
        // Atualiza o status no back-end
        this.statusService.updateStatus(result).subscribe(() => {
          // Atualiza todas as tasks que têm o status antigo
          const tasksToUpdate = this.tasks.filter(task => task.status === oldStatusTitle);
          
          tasksToUpdate.forEach(task => {
            task.status = newStatusTitle; // Atualiza o status da task com o novo título
          });
  
          // Envia todas as tasks atualizadas para o backend
          this.taskService.updateMultipleTasks(tasksToUpdate).subscribe(() => {
            this.loadStatuses(); // Recarrega os statuses
            this.loadTasks(); // Recarrega as tasks para refletir as alterações
          });
        });
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

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updateTaskOrder(event.container.data);
    } else {
      task.status = status.title;
      this.taskService.updateTask(task).subscribe(() => {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
        this.updateTaskOrder(event.container.data);
      }, error => {
        console.error('Erro ao atualizar a tarefa:', error);
      });
    }
  }

  updateTaskOrder(tasks: Task[]): void {
    tasks.forEach((task, index) => {
      task.order = index;
      this.taskService.updateTask(task).subscribe(
        () => {
          console.log(`Tarefa ${task.id} atualizada com a nova ordem ${task.order}`);
        },
        error => {
          console.error('Erro ao atualizar a ordem da tarefa:', error);
        }
      );
    });
  }

  moveStatusLeft(index: number): void {
    if (index > 0) {
      const temp = this.statuses[index - 1];
      this.statuses[index - 1] = this.statuses[index];
      this.statuses[index] = temp;
      this.updateStatusOrder();
    }
  }

  moveStatusRight(index: number): void {
    if (index < this.statuses.length - 1) {
      const temp = this.statuses[index + 1];
      this.statuses[index + 1] = this.statuses[index];
      this.statuses[index] = temp;
      this.updateStatusOrder();
    }
  }

  updateStatusOrder(): void {
    this.statuses.forEach((status, index) => {
      status.order = index;
      this.statusService.updateStatus(status).subscribe(() => {
        console.log(`Status ${status.title} atualizado para a nova posição ${status.order}`);
      });
    });
  }
}
