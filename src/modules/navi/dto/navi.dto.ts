import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export enum NaviStatus {
  DRAFT = 1,
  PUBLISHED = 2,
}

export class CreateNaviDto {
  @IsString({ message: 'title must be a string' })
  title: string;

  @IsString({ message: 'description must be a string' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'parentId must be a number' })
  @IsOptional()
  parentId?: number;

  @IsNumber({}, { message: 'order must be a number' })
  @IsOptional()
  order?: number;

  @IsBoolean({ message: 'mainMenu must be a boolean' })
  @IsOptional()
  mainMenu?: boolean;

  @IsBoolean({ message: 'breadcrumbs must be a boolean' })
  @IsOptional()
  breadcrumbs?: boolean;

  @IsBoolean({ message: 'sideBar must be a boolean' })
  @IsOptional()
  sideBar?: boolean;
}

export class UpdateNaviDto extends CreateNaviDto {
  @IsNumber({}, { message: 'id must be a number' })
  id: number;

  @IsNumber({}, { message: 'status must be a number' })
  status: NaviStatus;

  @IsString({ message: 'url must be a string' })
  url: string;
}

export class DeleteNaviDto {
  @IsNumber({}, { message: 'id must be a number' })
  id: number;
}
export class GetNaviListDto {
  @IsString({ message: 'title must be a string' })
  @IsOptional()
  title?: string;

  @IsNumber({}, { message: 'id must be a number' })
  @IsOptional()
  id?: number = -1;

  @IsNumber({}, { message: 'start must be a number' })
  @IsOptional()
  start?: number = 0;

  @IsNumber({}, { message: 'size must be a number' })
  @IsOptional()
  size?: number = 10;
}

export class AddBatchImportDto {
  @IsNumber({}, { message: 'count must be a number' })
  count: number = 10;

  @IsNumber({}, { message: 'parentId must be a number' })
  parentId: number = 7;

  @IsString({ message: 'prefix must be a string' })
  prefix: string = 'navi-new';
}
