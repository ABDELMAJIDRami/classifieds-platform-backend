import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { ManagerAuthGuard } from './guards/manager-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return req.user;
  }

  @UseGuards(ManagerAuthGuard)
  @Post('admin/login')
  async adminLogin(@Body() loginDto: LoginDto, @Request() req) {
    console.log('Login successful, session:', req.session);
    console.log('User:', req.user);
    return req.user;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthenticatedGuard)
  @Get('profile')
  getProfile(@Request() req) {
     /* For every request with a session cookie, the following happens automatically before calling canActivate in AuthenticatedGuard
          1. Reads session
          2. If session has passport.user, triggers deserializeUser
          3. Attaches result to req.user
      */
    return req.user;
  }

  @UseGuards(AuthenticatedGuard)
  @Post('logout')
  logout(@Request() req) {
    req.session.destroy();
    return { message: 'Logged out successfully' };
  }
}