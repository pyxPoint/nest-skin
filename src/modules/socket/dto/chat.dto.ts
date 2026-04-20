import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UploadProgressDto {
  @IsString()
  fileName: string;

  @IsNumber()
  progress: number; // 0 - 100

  @IsEnum(['uploading', 'completed', 'error'])
  status: string;

  @IsOptional()
  url?: string;
}

export class ChatDto {
  @IsString()
  @IsNotEmpty({ message: 'message is required' })
  @MaxLength(500, { message: '消息长度不能超过 500 个字符' })
  content: string;

  @IsString()
  @IsOptional()
  roomId?: string; // 如果有群聊或房间功能

  @IsString()
  @IsOptional()
  toUserId?: string; // 如果是私聊
}
