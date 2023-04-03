import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventDataService {
  constructor(private http: HttpClient) {}

  getEvents(): Observable<any> {
    {
      return this.http.get<any>('http://localhost:3000/events').pipe(
        map((res) => {
          const transformedData = res.map(
            (item: {
              id: string;
              title: string;
              ClaimNo: string;
              EventType: string;
              date: any;
              color: any;
              EventCompleted: string;
            }) => {
              return {
                Id: item.id,
                title: item.title + '-' + item.ClaimNo + ' ' + item.EventType,
                start: item.date,
                color: item.color,
                eventType: item.EventType,
                EventCompleted: item.EventCompleted,
              };
            }
          );
          return transformedData;
        })
      );
    }
  }

  updateEvent(event: any): Observable<any> {
    {
      return this.http.patch(`http://localhost:3000/events/${event.id}`, event);
    }
  }
}
