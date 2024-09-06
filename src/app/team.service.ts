import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Team {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = 'https://vht4zycyqk.execute-api.us-east-1.amazonaws.com/team';

  constructor(private http: HttpClient) {}

  getTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.apiUrl).pipe(
      catchError(this.handleError<Team[]>('getTeams', []))
    );
  }

  addTeam(team: Team): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, team).pipe(
      catchError(this.handleError<Team>('addTeam'))
    );
  }

  updateTeam(team: Team): Observable<Team> {
    return this.http.put<Team>(`${this.apiUrl}/${team.id}`, team).pipe(
      catchError(this.handleError<Team>('updateTeam'))
    );
  }

  deleteTeam(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError<void>('deleteTeam'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
