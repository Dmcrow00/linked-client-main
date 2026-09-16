import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface NewsArticle {
  title: string;
  url: string;
  description: string | null;
  publishedAt: string | null;
  source: string | null;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(private http: HttpClient) {}

  getTattooNews(): Observable<NewsArticle[]> {
    return this.http
      .get<NewsArticle[]>(`${environment.urlApi}news`)
      .pipe(catchError(() => of([])));
  }
}
