import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrlStatus = 'http://localhost:3000/status';
  private apiUrlTasks = 'http://localhost:3000/task';
  private apiUrlTeam = 'http://localhost:3000/team';

  constructor(private http: HttpClient) {}

  getStatuses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlStatus).pipe(
      catchError(this.handleError<any[]>('getStatuses', []))
    );
  }

  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlTasks).pipe(
      catchError(this.handleError<any[]>('getTasks', []))
    );
  }

  getTeamMembers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlTeam).pipe(
      catchError(this.handleError<any[]>('getTeamMembers', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
