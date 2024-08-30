import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Status {
  id: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private apiUrl = 'http://localhost:3000/status';
  private statusesSubject = new BehaviorSubject<Status[]>([]);
  statuses$ = this.statusesSubject.asObservable();

  constructor(private http: HttpClient) { }

  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(this.apiUrl);
  }

  addStatus(status: Status): Observable<Status> {
    return this.http.post<Status>(this.apiUrl, status);
  }

  updateStatus(status: Status): Observable<Status> {
    return this.http.put<Status>(`${this.apiUrl}/${status.id}`, status);
  }

  deleteStatus(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
