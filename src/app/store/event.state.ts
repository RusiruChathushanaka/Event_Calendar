import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Event } from '../models/event.model';
import { GetEvents, PatchEvent, UpdateEvent } from './event.actions';
import { EventDataService } from '../service/event-data.service';
import { tap } from 'rxjs';

export interface EventStateModel {
  events: Event[];
}

@State<EventStateModel>({
  name: 'Event',
  defaults: {
    events: [],
  },
})
@Injectable()
export class EventState {
  constructor(private eventService: EventDataService) {}

  @Selector()
  static getEvents(state: EventStateModel) {
    return state.events;
  }

  @Selector()
  static getAllFilteredEvents(state: EventStateModel) {
    return (filter: any) => {
      if (!filter) {
        return state.events;
      }
      return state.events.filter((event: Event) => {
        return (
          filter._eventTypes.includes(event.eventType) &&
          filter._eventStatus.includes(event.EventCompleted)
        );
      });
    };
  }

  @Selector([EventState])
  static getCompletedEvents(state: EventStateModel) {
    return (filter: string[] | null) => {
      if (!filter) {
        return state.events;
      }
      return state.events.filter((event: Event) => {
        for (let i = 0; i < filter.length; i++) {
          if (event.EventCompleted.includes(filter[i])) {
            return true;
          }
        }
        return false;
      });
    };
  }

  @Selector([EventState.getCompletedEvents])
  static getFilteredEvents(state: EventStateModel) {
    return (filter1: string[] | null) => {
      if (!filter1) {
        return state.events;
      }

      return state.events.filter((event: Event) => {
        for (let i = 0; i < filter1.length; i++) {
          if (event.eventType.includes(filter1[i])) {
            return true;
          }
        }
        return false;
      });
    };
  }

  @Selector()
  static getEvent(state: EventStateModel) {
    return (index: number) => {
      return state.events[index - 1];
    };
  }

  @Action(GetEvents)
  get(ctx: StateContext<EventStateModel>) {
    return this.eventService.getEvents().pipe(
      tap((res: any) => {
        const state = ctx.getState();
        ctx.setState({
          ...state,
          events: res,
        });
      })
    );
  }

  @Action(UpdateEvent)
  update(ctx: StateContext<EventStateModel>, payload: any) {
    console.log('Store : ', payload);
    payload.date = payload.newDate;
    payload.EventCompleted = payload.completed;
    return this.eventService.updateEvent(payload).subscribe((res) => {
      console.log(res);
      const state = ctx.getState();
      const index = state.events.findIndex((event) => event.Id === payload.id);
      console.log('Index : ', index);

      if (index !== -1) {
        const events = [...state.events];
        events[index] = {
          ...events[index],
          start: payload.newDate,
          EventCompleted: payload.completed,
        };
        ctx.patchState({
          events,
        });
      }
    });
  }
}
