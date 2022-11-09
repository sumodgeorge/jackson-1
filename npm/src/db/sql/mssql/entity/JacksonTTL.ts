import { Entity, Column } from 'typeorm';
import { BaseJacksonTTL } from '../../base-entity/BaseJacksonTTL';

@Entity()
export class JacksonTTL extends BaseJacksonTTL {
  @Column({
    primary: true,
    type: 'varchar',
    length: 1500,
  })
  key!: string;
}
