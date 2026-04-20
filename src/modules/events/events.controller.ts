import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { EventsService } from './events.service';
import { Observable } from 'rxjs';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return this.eventsService.subscribe();
  }
}
