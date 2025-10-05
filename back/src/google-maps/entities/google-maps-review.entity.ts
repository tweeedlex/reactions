import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('google_maps_reviews')
export class GoogleMapsReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  placeId: string;

  @Column()
  placeName: string;

  @Column('text')
  content: string;

  @Column()
  author: string;

  @Column({ type: 'int', default: 0 })
  rating: number;

  @Column({ type: 'datetime' })
  reviewDate: Date;

  @Column({ type: 'int', default: 0 })
  helpfulVotes: number;

  @Column({ type: 'varchar', length: 50, default: 'googlemaps' })
  store: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
