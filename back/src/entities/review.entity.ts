import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { App } from './app.entity';

@Entity('reviews')
@Index('idx_reviews_source_review_id', ['source', 'reviewId'], { unique: true })
@Index('idx_reviews_app_id_date', ['appId', 'date'])
@Index('idx_reviews_app_id', ['appId'])
@Index('idx_reviews_source', ['source'])
@Index('idx_reviews_rating', ['rating'])
@Index('idx_reviews_date', ['date'])
@Index('idx_reviews_created_at', ['createdAt'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appId: number;

  @ManyToOne(() => App, app => app.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appId' })
  app: App;

  @Column({ type: 'varchar', length: 255 })
  author: string;

  @Column({ type: 'smallint', nullable: true })
  rating: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', length: 50 })
  source: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reviewId: string;

  @Column({ type: 'datetime', nullable: true })
  date: Date;

  @Column({ type: 'int', default: 0 })
  helpful: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
