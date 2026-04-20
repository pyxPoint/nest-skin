import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join } from 'path';

// 获取环境变量，默认开发环境
const env = process.env.NODE_ENV || 'development';
// 日志存储根目录（项目根目录下的logs/）
const logDir = join(process.cwd(), 'logs');

// 日志级别：开发环境debug，生产环境warn
const logLevel = env === 'development' ? 'debug' : 'warn';

// 定义日志格式化器：开发环境友好格式，生产环境JSON格式
const formatters = {
  // 开发环境：彩色、带时间/级别/上下文/消息
  dev: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, context, message, stack }) => {
      return `[${timestamp}] [${level}] [${context}] ${stack || message}`;
    }),
  ),
  // 生产环境：JSON格式（方便日志工具解析），包含所有关键信息
  prod: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(), // 核心：JSON格式化
    winston.format.errors({ stack: true }), // 保留错误堆栈
  ),
};

// 配置Winston Logger
export const winstonConfig: winston.LoggerOptions = {
  // 日志级别
  level: logLevel,
  // 日志分类（与Nest Logger兼容）
  levels: winston.config.npm.levels,
  // 格式化器：按环境选择
  format: env === 'development' ? formatters.dev : formatters.prod,
  // 输出端配置：开发环境仅控制台，生产环境控制台+文件
  transports: [
    // 控制台输出（所有环境都开启）
    new winston.transports.Console(),

    // 生产环境：按日期分割的文件输出（info/warn/debug）
    ...(env === 'production' && !process.env.VERCEL
      ? [
          new DailyRotateFile({
            filename: join(logDir, 'app-%DATE%.log'), // 日志文件名：app-2026-02-05.log
            datePattern: 'YYYY-MM-DD', // 按日期分割
            maxSize: '20m', // 单个文件最大20M
            maxFiles: '14d', // 保留14天日志
            level: 'info', // 该文件记录info及以上级别
          }),
          // 单独的错误日志文件（仅记录error级别，方便排查）
          new DailyRotateFile({
            filename: join(logDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '30d', // 错误日志保留30天
            level: 'error',
          }),
        ]
      : []),
  ],
};
