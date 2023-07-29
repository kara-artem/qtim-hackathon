import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoomEntity } from './entity/room.entity';
import { RoomStatusEnum } from './enums/room.status.enum';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
  ) {}

  async join(): Promise<RoomEntity> {
    const freeRoom = await this.roomRepo
      .createQueryBuilder('room')
      .where('room.players = :player1', { player1: ['player1'] })
      .getOne();

    if (freeRoom) {
      freeRoom.players.push('player2');
      freeRoom.status = RoomStatusEnum.GAME;
      return this.roomRepo.save(freeRoom);
    }

    return this.roomRepo.save({ players: ['player1'] });
  }

  async close(id: string): Promise<boolean> {
    try {
      await this.roomRepo.update(id, { status: RoomStatusEnum.CLOSED });
      return true;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
