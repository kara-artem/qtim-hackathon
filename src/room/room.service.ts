import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdateUserStatDto } from './dto/update.user.stat.dto';
import { RoomEntity } from './entity/room.entity';
import { RoomStatusEnum } from './enums/room.status.enum';
import { PlayerStatInterface } from './interfaces/player.stat.interface';

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

    const playerStat: PlayerStatInterface = {
      name: nickname,
      guessedLetters: 0,
      mistakes: 0,
    };

    if (freeRoom) {
      freeRoom.players.push(playerStat);
      freeRoom.status = RoomStatusEnum.GAME;
      freeRoom.startedAt = new Date();
      return this.roomRepo.save(freeRoom);
    } else {
      return this.roomRepo.save({ players: [playerStat] });
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

  async updatePlayerStat(
    id: string,
    nickname: string,
    { guessedLetters, mistakes }: UpdateUserStatDto,
  ): Promise<RoomEntity> {
    const room = await this.roomRepo.findOne({ where: { id } });

    if (!room) {
      throw new NotFoundException('Комната не найдена');
    }

    const playerToUpdate: PlayerStatInterface | undefined = room.players.find((player) => player.name === nickname);

    if (!playerToUpdate) {
      throw new NotFoundException('Игрок не найден');
    }

    playerToUpdate.guessedLetters = guessedLetters;
    playerToUpdate.mistakes = mistakes;

    return this.roomRepo.save(room);
  }
}
