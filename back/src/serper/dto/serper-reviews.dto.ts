import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum SortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  RATING_HIGH = 'rating_high',
  RATING_LOW = 'rating_low',
  MOST_RELEVANT = 'most_relevant'
}

export class SerperReviewsDto {
  @IsString()
  @IsOptional()
  cid?: string;

  @IsString()
  @IsOptional()
  fid?: string;

  @IsString()
  placeId: string;

  @IsString()
  @IsOptional()
  hl?: string = 'uk';

  @IsEnum(SortBy)
  @IsOptional()
  sortBy?: SortBy = SortBy.NEWEST;

  @IsString()
  @IsOptional()
  topicId?: string;

  @IsString()
  @IsOptional()
  nextPageToken?: string;
}

export class SerperReviewsResponse {
  reviews: SerperReview[];
  nextPageToken?: string;
  placeInfo?: {
    title: string;
    address: string;
    rating: number;
    totalReviews: number;
  };
}

export class SerperReview {
  author: string;
  content: string;
  rating: number;
  date: string;
  helpfulVotes?: number;
  profilePhotoUrl?: string;
  isVerified?: boolean;
}
