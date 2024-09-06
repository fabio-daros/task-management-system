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
  private apiUrl = 'https://vht4zycyqk.execute-api.us-east-1.amazonaws.com/task';
  private teamApiUrl = 'https://vht4zycyqk.execute-api.us-east-1.amazonaws.com/team';
  private statusApiUrl = 'https://vht4zycyqk.execute-api.us-east-1.amazonaws.com/status';
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
    return this.http.put<Task>(`https://vht4zycyqk.execute-api.us-east-1.amazonaws.com/task/${task.id}`, task);
  }
  
  updateMultipleTasks(tasks: Task[]): Observable<Task[]> {
    return forkJoin(tasks.map(task => this.updateTask(task)));
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
