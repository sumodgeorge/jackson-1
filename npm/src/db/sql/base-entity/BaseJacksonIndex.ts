import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne } from 'typeorm';

@Index('_jackson_index_key_store', ['key', 'storeKey'])
@Entity()
export class BaseJacksonIndex {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index('_jackson_index_key')
  @Column({
    type: 'varchar',
    length: 1500,
  })
  key!: string;

  @Column({
    type: 'varchar',
    length: 1500,
  })
  storeKey!: string;
}
