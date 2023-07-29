import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Headers } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { StatusCode } from '../common/decorators/status.code.decorator';
import { RoomEntity } from './entity/room.entity';
import { RoomService } from './room.service';

@ApiTags('Room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get(':id')
  @StatusCode(HttpStatus.OK)
  async getRoomInfo(@Param('id', ParseUUIDPipe) id: string): Promise<RoomEntity | null> {
    return this.roomService.getRoomInfo(id);
  }

  @Post('join')
  @StatusCode(HttpStatus.OK)
  async join(@Headers('nickname') nickname: string): Promise<RoomEntity> {
    return this.roomService.join(nickname);
  }

  @Post('close/:id')
  @StatusCode(HttpStatus.OK)
  async close(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('nickname') nickname: string,
  ): Promise<RoomEntity | null> {
    return this.roomService.close(id, nickname);
  }
}
