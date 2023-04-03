import { Event } from '../models/event.model';

export class GetEvents {
  static readonly type = '[Event] Get';
  constructor() {}
}

export class PatchEvent {
  static readonly type = '[Event] Patch';
  constructor(public id: any, public payload: Event) {}
}

export class GetEvent {
  static readonly type = '[Event] Get';
  constructor(public id: any) {}
}

export class UpdateEvent {
  static readonly type = '[Event] Update';
  constructor(public id: any, public newDate: any, public completed: any) {}
}
