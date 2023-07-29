import { BadRequestException, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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

  @Cron(CronExpression.EVERY_30_SECONDS)
  async closeRoomsAfterFiveMinutes(): Promise<void> {
    const currentDate = new Date();
    const fiveMinutesAgo = new Date(currentDate.getTime() - 5 * 60 * 1000);

    await this.roomRepo
      .createQueryBuilder('room')
      .update(RoomEntity)
      .set({ status: RoomStatusEnum.CLOSED, winner: 'nobody' })
      .where('startedAt < :fiveMinutesAgo', { fiveMinutesAgo })
      .andWhere('status = :status', { status: RoomStatusEnum.GAME })
      .execute();
  }

  async getRoomInfo(id: string): Promise<RoomEntity | null> {
    return this.roomRepo.createQueryBuilder('room').where('room.id = :id', { id }).getOne();
  }

  async join(nickname: string): Promise<RoomEntity> {
    const freeRoom = await this.roomRepo
      .createQueryBuilder('room')
      .where('room.status = :status', { status: RoomStatusEnum.WAITING })
      .getOne();

    if (freeRoom) {
      freeRoom.players.push(nickname);
      freeRoom.status = RoomStatusEnum.GAME;
      freeRoom.startedAt = new Date();
      return this.roomRepo.save(freeRoom);
    } else {
      return this.roomRepo.save({ players: [nickname] });
    }
  }

  async close(id: string, nickname: string): Promise<RoomEntity | null> {
    try {
      await this.roomRepo.update(
        { id, status: RoomStatusEnum.GAME },
        { status: RoomStatusEnum.CLOSED, winner: nickname },
      );
      return this.roomRepo.findOneBy({ id });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
