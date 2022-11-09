import { Entity, Column, Index } from 'typeorm';

@Entity()
export class BaseJacksonTTL {
  @Index('_jackson_ttl_expires_at')
  @Column({
    type: 'bigint',
  })
  expiresAt!: number;
}
