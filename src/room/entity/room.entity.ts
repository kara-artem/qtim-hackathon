import { Column, Entity } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { RoomStatusEnum } from '../enums/room.status.enum';

@Entity('rooms')
export class RoomEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: RoomStatusEnum,
    default: RoomStatusEnum.WAITING,
    nullable: false,
  })
  status: RoomStatusEnum;

  @Column('text', { array: true, nullable: true, default: '{}' })
  players: string[];
}
