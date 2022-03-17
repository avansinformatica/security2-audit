import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RefreshAuthGuard } from './refresh.guard';
import { AuthService } from './auth.service';
import { CredentialAuthGuard } from './credential.guard';
import { RefreshToken } from './auth.payload';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @UseGuards(CredentialAuthGuard)
  async login(@Body('user') user: string) {
    return {
      token: await this.authService.generateRefreshToken(user),
      type: 'refresh',
    };
  }

  @Post('/refresh')
  @UseGuards(RefreshAuthGuard)
  async refresh() {
    return {
      token: await this.authService.generateAccessToken(),
      type: 'access',
    };
  }
  
  // token is placed in the body by the RefreshAuthGuard,
  // the guard expects the token in the Authorization header.
  @Post('/extend')
  async extend(@Body('token') token: RefreshToken) {
    return {
      token: await this.authService.extendRefreshToken(token),
      type: 'refresh',
    }
  }
}
