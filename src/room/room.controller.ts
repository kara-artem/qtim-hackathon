import { Controller, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { StatusCode } from '../common/decorators/status.code.decorator';
import { RoomEntity } from './entity/room.entity';
import { RoomService } from './room.service';

@ApiTags('Room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('join')
  @StatusCode(HttpStatus.OK)
  async join(): Promise<RoomEntity> {
    return this.roomService.join();
  }

  @Post('close/:id')
  @StatusCode(HttpStatus.OK)
  async close(@Param('id', ParseUUIDPipe) id: string): Promise<boolean> {
    return this.roomService.close(id);
  }
}
