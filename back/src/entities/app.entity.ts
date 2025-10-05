import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Review } from './review.entity';

@Entity('apps')
@Index('idx_apps_platform_app_id', ['platform', 'appId'], { unique: true })
@Index('idx_apps_platform', ['platform'])
@Index('idx_apps_category', ['category'])
@Index('idx_apps_created_at', ['createdAt'])
export class App {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  platform: string;

  @Column({ type: 'varchar', length: 100 })
  appId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Review, review => review.app)
  reviews: Review[];
}
