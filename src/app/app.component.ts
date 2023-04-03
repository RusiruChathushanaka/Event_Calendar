import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import listPlugin from '@fullcalendar/list';
import { Observable, async, map, tap } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { Event } from './models/event.model';
import { GetEvents, UpdateEvent } from './store/event.actions';
import { EventState } from './store/event.state';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventDetailsDialogComponent } from './components/event-details-dialog/event-details-dialog.component';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'EventCalendar';

  events$!: Observable<any>;

  @Select(EventState.getEvents)
  eventData$!: Observable<Event>;

  eventTypeList: string[] = ['Claim', 'Confirmation', 'Payment'];
  eventStatusList: string[] = ['TRUE', 'FALSE'];
  eventTypes = new FormControl(['Claim', 'Confirmation', 'Payment']);
  eventStatus = new FormControl(['TRUE', 'FALSE']);
  selectedEventTypes!: string[] | null | undefined;
  selectedEventStatus!: string[] | null | undefined;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,today,next',
      center: 'title',
      right: 'dayGridMonth,listMonth,dayGridWeek,listWeek', // user can switch between the two
    },
    buttonText: { listMonth: 'list month', listWeek: 'list week' },
    editable: true,
    selectable: true,
    eventDrop: this.handleEventDrop.bind(this),
    eventClick: this.onEventClick.bind(this),
    height: '78vh',
  };

  myForm = this.fb.group({
    _eventTypes: [this.eventTypeList],
    _eventStatus: [this.eventStatusList],
  });

  constructor(
    private store: Store,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {
    this.events$ = this.store
      .select(EventState.getAllFilteredEvents)
      .pipe(map((filterFn) => filterFn(this.myForm.value)));

    this.myForm.valueChanges
      .pipe(
        tap(
          (val) =>
            (this.events$ = this.store
              .select(EventState.getAllFilteredEvents)
              .pipe(map((filterFn) => filterFn(val))))
        )
      )
      .subscribe((res) => {
        console.log(res);
      });
  }

  ngOnInit(): void {
    this.getEventData();
  }

  getEventData() {
    this.store.dispatch(new GetEvents());
  }

  onEventClick(arg: any) {
    // alert('Event clicked Id : ' + arg.event.extendedProps.Id);
    console.log(arg);
    this.dialog.open(EventDetailsDialogComponent, {
      width: '40%',
      data: {
        eventId: arg.event.extendedProps.Id,
      },
    });
  }

  handleEventDrop(_info: any) {
    const event = _info.event;
    const newStart = this.datePipe.transform(event.start, 'yyyy-MM-dd');

    console.log(event);
    console.log('Event Dropped: ', event.extendedProps.Id, newStart);
    this.store.dispatch(
      new UpdateEvent(
        event.extendedProps.Id,
        newStart,
        event.extendedProps.EventCompleted
      )
    );
  }

  onSelectionChange() {
    const status = this.myForm.get('_eventStatus')?.value;
    const types = this.myForm.get('_eventTypes')?.value;

    if (status) {
      this.eventStatus.setValue(status);
    }

    if (types) {
      this.eventTypes.setValue(types);
    }

    console.log(this.eventStatus.value);
  }
}
