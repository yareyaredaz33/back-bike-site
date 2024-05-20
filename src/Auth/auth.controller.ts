import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UserInputModel } from './DTO/user.input.model';
import { UserService } from '../User/user.service';
import { JwtAuthGuard } from './Guards/jwt.auth.guards';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  @UseGuards(ThrottlerGuard)
  @Post('registration')
  async registration(
    @Body() userModel: UserInputModel,
    @Res() response: Response,
  ) {
    const isUserExists = await this.userService.getUserByUsernameOrEmail({
      username: userModel.username,
      email: userModel.email,
    });
    if (isUserExists) {
      response.sendStatus(400);
      return;
    }
    await this.userService.createUser(userModel);
    response.sendStatus(204);
  }

  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(
    @Req() req: Request,
    @Body() userModel: { username: string; password: string },
    @Res() response: Response,
  ) {
    const user = await this.authService.checkCredentials(
      userModel.username,
      userModel.password,
    );
    if (!(user && req.headers['user-agent'])) {
      response.sendStatus(401);
    }

    const deviceId = new Date().toISOString();
    const token = this.authService.generateTokens(user, deviceId);
    await this.authService.saveToken(user.id, token.refreshToken, req.ip);
    response.cookie('refreshToken', token.refreshToken, {
      secure: true,
      httpOnly: true,
    });
    response.status(200).json({ accessToken: token.accessToken });
  }
  // @UseGuards(ThrottlerGuard)
  // @Post('registration-email-resending')
  // async registrationEmailResending(
  //   @Request() req,
  //   @Body() userModel: { email: string },
  //   @Res() response: Response,
  // ) {
  //   const user = await this.userService.getUserByLoginOrEmail(
  //     '',
  //     userModel.email,
  //   );
  //   if (user?.result?.emailConfirmation?.isConfirmed || !user?.result) {
  //     throw new BadRequestException([
  //       {
  //         message: 'User is already confirmed',
  //         field: 'email',
  //       },
  //     ]);
  //   }
  //   const newCode = v4();
  //   await this.userService.updateUser(
  //     user.result.id,
  //     'emailConfirmation.confirmationCode',
  //     newCode,
  //   );
  //   await this.mailService.sendMailConfirmation(user.result, true, newCode);
  //   response.sendStatus(204);
  // }
  //
  // @UseGuards(ThrottlerGuard)
  // @Post('registration-confirmation')
  // async registrationConfirmation(
  //   @Request() req,
  //   @Body() userModel: { code: string },
  //   @Res() response: Response,
  // ) {
  //   const user = await this.userService.getUserByField(userModel.code);
  //
  //   if (
  //     !user ||
  //     user.emailConfirmation?.isConfirmed ||
  //     !user.emailConfirmation?.confirmationCode
  //   ) {
  //     throw new BadRequestException([
  //       {
  //         message: 'User Alredy Exists',
  //         field: 'code',
  //       },
  //     ]);
  //   }
  //
  //   const status = await this.userService.confirmCode(user, userModel.code);
  //   if (status) {
  //     response.sendStatus(204);
  //   } else response.sendStatus(400);
  // }
  // @UseGuards(ThrottlerGuard)
  // @Post('new-password')
  // async newPassword(
  //   @Request() req,
  //   @Body() recoveryInfo: { newPassword: string; recoveryCode: string },
  //   @Res() response: Response,
  // ) {
  //   const { newPassword, recoveryCode } = req.body;
  //   const user = await this.authService.getUserByRecoveryCode(recoveryCode);
  //   if (user) {
  //     const updateStatus = this.authService.processPasswordRecovery(
  //       newPassword,
  //       user.id.toString(),
  //     );
  //     if (updateStatus) {
  //       response.sendStatus(204);
  //     } else {
  //       response.sendStatus(400);
  //     }
  //   } else {
  //     throw new BadRequestException([
  //       {
  //         message: 'incorrect recovery code',
  //         field: 'recoveryCode',
  //       },
  //     ]);
  //   }
  // }
  // @UseGuards(ThrottlerGuard)
  // @Post('password-recovery')
  // async passwordRecovery(
  //   @Request() req,
  //   @Body() recoveryInfo: { email: string },
  //   @Res() response: Response,
  // ) {
  //   const { email } = req.body;
  //   try {
  //     const user = await this.userService.getUserByLoginOrEmail('', email);
  //     const code = v4();
  //     await this.mailService.sendRecoveryPasswordCode(user.result, false, code);
  //     await this.authService.savePasswordRecoveryCode(user.result.id, code);
  //     response.sendStatus(204);
  //   } catch (e) {
  //     response.sendStatus(204);
  //   }
  // }

  @Post('refresh-token')
  async refreshToken(@Req() req, @Res() response: Response) {
    console.log('ref');
    console.log(req.cookies);
    try {
      const { refreshToken } = req.cookies;
      let tokens;
      if (req.headers['user-agent']) {
        tokens = await this.authService.refresh(
          refreshToken,
          req.headers['user-agent'],
          req.ip,
        );
      }
      console.log('zdarova', tokens);
      if (tokens) {
        response.cookie('refreshToken', tokens.refreshToken, {
          secure: true,
          httpOnly: true,
        });
        return response.status(200).json({ accessToken: tokens.accessToken });
      }
    } catch (e) {
      console.log(e);
      response.sendStatus(401);
    }
  }
  // @UseGuards(ThrottlerGuard)
  // @Post('logout')
  // async logout(
  //   @Req() req,
  //   @Body() recoveryInfo: { email: string },
  //   @Res() response: Response,
  // ) {
  //   try {
  //     const { refreshToken } = req.cookies;
  //     await this.authService.logout(refreshToken);
  //     response.clearCookie('refreshToken');
  //     response.sendStatus(204);
  //   } catch (e) {
  //     response.sendStatus(401);
  //   }
  // }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() request) {
    return request.user.userInfo;
  }
}
