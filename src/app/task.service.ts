import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Task {
  id: string;
  title: string;
  statusColor: string;
  description?: string;
  team: any;
  status: string;
  teamId: string;
  situation: string;
  order: number;
}

export interface Team {
  id: string;
  name: string;
}
export interface Status {
  id: string;
  title: string;
  description: string;
  color: string;
  order: any;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/task';
  private teamApiUrl = 'http://localhost:3000/team';
  private statusApiUrl = 'http://localhost:3000/status';
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) { }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl).pipe(
      map(tasks => tasks.map(task => ({
        ...task,
        team: undefined
      })))
    );
  }

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.teamApiUrl);
  }

  getStatus(): Observable<Status[]> {
    return this.http.get<Status[]>(this.statusApiUrl);
  }

  addTask(task: Omit<Task, 'id'>): Observable<Task> {
    const taskWithSituation = {
      ...task,
      situation: task.situation || 'unstarted'
    };
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`http://localhost:3000/task/${task.id}`, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
