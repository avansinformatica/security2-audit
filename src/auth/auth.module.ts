/*
Idea:

Refresh tokens are connected to a user and only one refresh token is valid per user
at any given time. Currently there will be a fixed set of users with hardcoded
hashed passwords. (Need a tool to generate hashes?)

Access token is valid for 15 minutes
After 15 minutes a new access token has to be requested with the refresh token
{
  type: access,
}

refresh token is valid for 4 hours
A new refresh token can be obtained by supplying a valid refresh token, but only for
at most 4 times. A sequence number is stored in the token for client convenience.
Only the most recent refresh token is valid. The id is used to store which token is valid.
{
  type: refresh,
  user: dion,
  id: da62e667-1f07-45fd-a028-0c70bead68a3,
  refreshesLeft: 1,
}

Valid tokens are stored in backend memory as a whitelist. When the backend goes down all
users need to login again.
*/

import { DynamicModule, Module } from '@nestjs/common';
import { AuthConfig, AUTH_CONFIG } from './auth.config';
import { AuthController } from './auth.controller';
import { CredentialAuthGuard } from "./credential.guard";
import { RefreshAuthGuard } from "./refresh.guard";
import { AccessAuthGuard } from "./access.guard";
import { AuthService } from './auth.service';
import { UserService } from './user.service';


@Module({})
export class AuthModule {
  static forRoot(config: AuthConfig): DynamicModule {
    return {
      module: AuthModule,
      controllers: [
        AuthController,
      ],
      providers: [
        {
          provide: AUTH_CONFIG,
          useValue: config,
        },
        CredentialAuthGuard,
        RefreshAuthGuard,
        AccessAuthGuard,
        AuthService,
        UserService,
      ],
      exports: [
        AccessAuthGuard,
        AuthService,
        UserService,
      ],
    };
  }
}
