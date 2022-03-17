import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { v4 as generateUuid } from "uuid";
import { AuthConfig, AUTH_CONFIG } from "./auth.config";
import { AccessToken, RefreshToken } from "./auth.payload";
import { compare as comparePwd } from "bcryptjs";
import { verify, sign, SignOptions } from "jsonwebtoken";

async function verifyJwt<T>(token: string, secret: string): Promise<T> {
  return new Promise((resolve, reject) => {
    verify(token, secret, function(err, decoded) {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as T);
      }
    });
  });
}

async function signJwt<T extends object>(payload: T, secret: string, options: SignOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    sign(payload, secret, options, function(err, token) {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
}

@Injectable()
export class AuthService {
  // map with username as key and valid token id as value
  private readonly validRefreshTokens: Map<string, string> = new Map();

  constructor(@Inject(AUTH_CONFIG) private readonly authConfig: AuthConfig, private readonly userService: UserService) {}

  private generateAccessPayload() {
    return {
      type: 'access',
    };
  }

  private generateRefreshPayload(user: string, refreshesLeft: number) {
    return {
      type: 'refresh',
      user,
      refreshesLeft,
      id: generateUuid(),
    }
  }

  async verifyLogin(user: string, password: string): Promise<boolean> {
    try {
      const hash = await this.userService.getUserHash(user);
      return comparePwd(password, hash);
    } catch (err) {
      return false;
    }
  }

  async verifyAccessToken(accessToken: string): Promise<AccessToken> {
    const payload = await verifyJwt<AccessToken>(accessToken, this.authConfig.jwtSecret);

    if (payload.type != 'access') {
      throw new Error('access token invalid');
    }

    return payload;
  }

  async generateAccessToken(): Promise<string> {
    return signJwt(this.generateAccessPayload(), this.authConfig.jwtSecret, {expiresIn: this.authConfig.accessExpire});
  }

  async verifyRefreshToken(refreshToken: string): Promise<RefreshToken> {
    const payload = await verifyJwt<RefreshToken>(refreshToken, this.authConfig.jwtSecret);

    if (payload.type != 'refresh') {
      throw new Error('refresh token invalid');
    }


    return payload;
  }

  async generateRefreshToken(user: string): Promise<string> {
    const payload = this.generateRefreshPayload(user, this.authConfig.initialRefreshes);

    this.validRefreshTokens.set(user, payload.id);

    return signJwt(payload, this.authConfig.jwtSecret, {expiresIn: this.authConfig.refreshExpire});
  }

  async extendRefreshToken(oldToken: RefreshToken): Promise<string> {
    if (oldToken.refreshesLeft <= 0) {
      throw new Error('refresh not allowed');
    }

    const payload = this.generateRefreshPayload(oldToken.user, oldToken.refreshesLeft- -1);

    this.validRefreshTokens.set(payload.user, payload.id);

    return signJwt(payload, this.authConfig.jwtSecret, {expiresIn: this.authConfig.refreshExpire});
  }
}
