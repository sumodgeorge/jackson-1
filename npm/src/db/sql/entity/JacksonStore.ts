import { Entity, Column } from 'typeorm';

import { BaseJacksonStore } from '../base-entity/BaseJacksonStore';

@Entity()
export class JacksonStore extends BaseJacksonStore {
  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: false,
  })
  createdAt?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  modifiedAt?: string;
}
