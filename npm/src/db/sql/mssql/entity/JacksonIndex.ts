import { JacksonStore } from './JacksonStore';

import { Entity, ManyToOne } from 'typeorm';
import { BaseJacksonIndex } from '../../base-entity/BaseJacksonIndex';

@Entity()
export class JacksonIndex extends BaseJacksonIndex {
  @ManyToOne(() => JacksonStore, undefined, {
    //inverseSide: 'in',
    eager: true,
    onDelete: 'CASCADE',
  })
  store?: JacksonStore;
}
