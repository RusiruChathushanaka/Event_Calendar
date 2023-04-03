import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, filter, map } from 'rxjs';
import { GetEvent, UpdateEvent } from 'src/app/store/event.actions';
import { EventState } from 'src/app/store/event.state';

@Component({
  selector: 'app-event-details-dialog',
  templateUrl: './event-details-dialog.component.html',
  styleUrls: ['./event-details-dialog.component.scss'],
})
export class EventDetailsDialogComponent implements OnInit {
  selectedID: any;
  form!: FormGroup;
  event: any;
  checked = false;
  // @Select(EventState)
  event$!: Observable<any>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EventDetailsDialogComponent>,
    private store: Store,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.event$ = this.store
      .select(EventState.getEvent)
      .pipe(map((filterFn) => filterFn(this.selectedID)));
  }

  ngOnInit(): void {
    console.log(this.data);
    this.selectedID = this.data.eventId;

    this.event$.subscribe((data) => {
      this.event = data;
    });

    this.checked = this.event.EventCompleted === 'TRUE' ? true : false;

    console.log(this.event);

    this.form = this.fb.group({
      title: [this.event.title],
      startDate: [this.event.start],
      eventCompleted: [this.checked],
    });
  }

  onSubmit() {
    this.form.controls['startDate'].setValue(
      this.datePipe.transform(this.form.value.startDate, 'yyyy-MM-dd')
    );

    if (this.checked) {
      this.form.controls['eventCompleted'].setValue('TRUE');
    } else {
      this.form.controls['eventCompleted'].setValue('FALSE');
    }

    console.log(this.form.value);
    this.store.dispatch(
      new UpdateEvent(this.event.Id, this.form.value.startDate, this.checked)
    );

    this.dialogRef.close();
  }
}
