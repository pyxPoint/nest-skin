// src/modules/file/dto/upload-file.dto.ts
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum FileType {
  AVATAR = 'avatar',
  DOC = 'doc',
}
export enum UploadType {
  AVATAR = 'avatar',
  NAVIGATION = 'navigation',
  PRODUCT = 'product',
  IMAGE = 'image',
}
export class UploadFileDto {
  @IsEnum(FileType)
  type: FileType; // 文件用途类型

  @IsString()
  @IsOptional()
  description?: string; // 备注
}

export class UploadImgDto {
  @Transform(({ value }) => {
    // 1. 如果是 Fastify 包装的对象，提取 .value
    if (value && typeof value === 'object' && 'value' in value) {
      // 2. 确保提取出来的是原始值，如果是流或复杂对象，直接转字符串或丢弃
      return typeof value.value === 'object'
        ? String(value.value)
        : value.value;
    }
    // 3. 如果是普通值直接返回
    return value;
  })
  @IsEnum(UploadType, {
    message: 'Invalid upload type',
  })
  type: UploadType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value && typeof value === 'object' && 'value' in value) {
      return typeof value.value === 'object'
        ? String(value.value)
        : value.value;
    }
    return value;
  })
  @IsString()
  description?: string;
}
