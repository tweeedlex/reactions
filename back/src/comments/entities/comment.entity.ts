import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('comments')
@Index('unique_comment', ['appId', 'content', 'author', 'rating'], { unique: true })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  appId: string;

  @Column()
  appName: string;

  @Column()
  store: 'playstore' | 'appstore' | 'googlemaps';

  @Column('text')
  content: string;

  @Column()
  author: string;

  @Column()
  rating: number;

  @Column({ nullable: true })
  reviewDate: Date;

  @Column({ nullable: true })
  helpfulVotes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
