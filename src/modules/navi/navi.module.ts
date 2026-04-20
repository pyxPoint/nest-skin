import { Module } from '@nestjs/common';
import { NaviService } from './navi.service';
import { NaviController } from './navi.controller';
import { ImportService } from './navi.import.service';

@Module({
  controllers: [NaviController],
  providers: [NaviService, ImportService],
  exports: [ImportService],
})
export class NaviModule {}
