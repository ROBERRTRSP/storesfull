import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(dto.email, dto.password);
    res.cookie('refresh_token', result.refreshToken, this.auth.refreshCookie());
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      dto.refreshToken ?? (req.cookies?.refresh_token as string | undefined);
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    const result = await this.auth.refresh(refreshToken);
    res.cookie('refresh_token', result.refreshToken, this.auth.refreshCookie());
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token as string | undefined;
    if (refreshToken) await this.auth.logout(refreshToken);
    res.clearCookie('refresh_token', this.auth.refreshCookie());
    return { ok: true };
  }

  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const user = req.user as any;
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

