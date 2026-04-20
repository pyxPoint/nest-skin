import { Module, Global } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Global() // 关键：标记为全局，其他模块无需 import 直接注入 Service
@Module({
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
