import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('instagram_comments')
export class InstagramComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postUrl: string;

  @Column()
  commentId: string;

  @Column('text')
  text: string;

  @Column()
  authorUsername: string;

  @Column()
  authorFullName: string;

  @Column({ nullable: true })
  authorProfilePictureUrl: string;

  @Column()
  likesCount: number;

  @Column()
  timestamp: string;

  @Column({ nullable: true })
  parentCommentId: string;

  @Column({ default: false })
  isReply: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
