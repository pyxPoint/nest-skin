import { registerAs } from '@nestjs/config';

export const UPLOAD_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
export const ALLOWED_EXTENSIONS = {
  avatar: ['.jpg', '.jpeg', '.png'],
  doc: ['.pdf', '.docx', '.txt', '.doc', '.xlsx', '.xls'],
  image: ['.jpg', '.jpeg', '.png', '.webp'],
  video: ['.mp4', '.mov', '.avi'],
};
export default registerAs('upload', () => ({
  sizeLimit: UPLOAD_SIZE_LIMIT,
  allowedExtensions: ALLOWED_EXTENSIONS,
}));
