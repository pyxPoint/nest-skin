import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  async login(@Body() user: LoginUserDto) {
    return this.authService.login(user);
  }
  @Post('register')
  async register(@Body() user: RegisterUserDto) {
    return this.authService.register(user);
  }
  @Post('refresh-token')
  async refreshToken(@Body() body: any) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
