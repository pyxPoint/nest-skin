import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class EventsService {
  // 定义一个消息流
  private readonly eventBus$ = new Subject<{ data: any; type?: string }>();

  constructor() {
    setInterval(() => this.emit('heartbeat', 'ping'), 15000);
  }
  /**
   * 统一发送接口
   * @param data 消息主体
   * @param type 事件类型（前端根据此类型决定如何显示）
   */
  emit(data: any, type: string = 'message') {
    this.eventBus$.next({ data, type });
  }

  /**
   * 暴露给控制器的 SSE 流
   */
  subscribe(): Observable<MessageEvent> {
    return this.eventBus$.asObservable().pipe(
      map(({ data, type }) => ({
        data,
        type, // SSE 的 event 字段，前端可以通过 eventSource.addEventListener(type, ...) 监听
      })),
    );
  }
}
