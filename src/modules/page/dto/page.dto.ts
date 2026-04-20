import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum NaviStatus {
  DRAFT = 1,
  PUBLISHED = 2,
}

export class CreatePageDto {
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title is required' })
  title: string;

  @IsString({ message: 'heading must be a string' })
  @IsOptional()
  heading?: string;

  @IsString({ message: 'description must be a string' })
  @IsOptional()
  description?: string;

  @IsBoolean({ message: 'sideBar must be a boolean' })
  @IsOptional()
  sideBar?: boolean;

  @IsBoolean({ message: 'inquiry must be a boolean' })
  @IsOptional()
  inquiry?: boolean;

  @IsBoolean({ message: 'fullScreen must be a boolean' })
  @IsOptional()
  fullScreen?: boolean;

  @IsString({ message: 'metaDescription must be a string' })
  @IsOptional()
  metaDescription?: string;

  @IsString({ message: 'metaTitle must be a string' })
  @IsOptional()
  metaTitle?: string;

  @IsString({ message: 'content must be a string' })
  content: string;

  @IsString({ message: 'cover must be a string' })
  @IsOptional()
  cover?: string;

  @IsNumber()
  order: number;

  @IsNumber()
  @IsOptional()
  parentId?: number;
}
export class UpdatePageDto extends CreatePageDto {
  @IsNumber({}, { message: 'id must be a number' })
  @IsNotEmpty({ message: 'id is required' })
  id: number;

  @IsNumber({}, { message: 'status must be a number' })
  status: NaviStatus;

  @IsString({ message: 'url must be a string' })
  url: string;
}
