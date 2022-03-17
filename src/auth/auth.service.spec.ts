import { Test } from "@nestjs/testing";
import { AuthConfig, AUTH_CONFIG } from "./auth.config";
import { AuthService } from "./auth.service";
import { UserService } from "./user.service";
import { hash as hashPwd } from "bcryptjs";
import { sign, verify, decode } from "jsonwebtoken";
import { AccessToken, RefreshToken } from "./auth.payload";
import { v4 as generateUuid, version, validate } from "uuid";

describe('Auth Service', () => {
  let authService;
  let userService;
  let authConfig;

  beforeEach(async () => {
    const userServiceMockProvider = {
      provide: UserService,
      useFactory: () => ({getUserHash: jest.fn()}),
    };

    const authConfigMockProvider = {
      provide: AUTH_CONFIG,
      useValue: {
        jwtSecret: "secret",
        initialRefreshes: 4,
        refreshExpire: "4h",
        accessExpire: "15m",
        saltRounds: 10,
      },
    }

    const moduleRef = await Test.createTestingModule({
      providers: [AuthService, authConfigMockProvider, userServiceMockProvider]
    })
    .compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
    authConfig = moduleRef.get<AuthConfig>(AUTH_CONFIG);
  });

  describe('verifying login', () => {
    let user, correctPwd, incorrectPwd, correctHash, incorrectHash;

    beforeEach(async () => {
      user = "username";
      correctPwd = "supersecret";
      incorrectPwd = "ilovecats";
      correctHash = await hashPwd(correctPwd, 10);
      incorrectHash = await hashPwd(incorrectPwd, 10);
    })

    test('accepts correct password', async () => {
      userService.getUserHash.mockReturnValue(correctHash);

      await expect(authService.verifyLogin(user, correctPwd)).resolves.toBe(true);
    });

    test('rejects incorrect password', async () => {
      userService.getUserHash.mockReturnValue(incorrectHash);
      
      await expect(authService.verifyLogin(user, correctPwd)).resolves.toBe(false);
    });

    test('rejects non-existing user', async () => {
      userService.getUserHash.mockImplementation(() => {
        throw new Error('user does not exist');
      });

      await expect(authService.verifyLogin(user, correctPwd)).resolves.toBe(false);
    });
  });

  describe('access tokens', () => {
    test('accepts valid token', async () => {
      const payload: AccessToken = {type: 'access'};
      const token = sign(payload, authConfig.jwtSecret);

      await expect(authService.verifyAccessToken(token)).resolves.toHaveProperty('iat');
    });

    test('rejects invalid token', async () => {
      const payload: AccessToken = {type: 'access'};
      const token = sign(payload, authConfig.jwtSecret + "evil");

      await expect(authService.verifyAccessToken(token)).rejects.toThrow();
    });

    test('rejects token without type', async () => {
      const payload: AccessToken = {} as AccessToken;
      const token = sign(payload, authConfig.jwtSecret);

      await expect(authService.verifyAccessToken(token)).rejects.toThrow();
    });

    test('rejects expired token', async () => {
      const payload: AccessToken = {type: 'access', iat: (Date.now()/1000 - 10)} as AccessToken;
      const token = sign(payload, authConfig.jwtSecret, {expiresIn: "1s"})

      await expect(authService.verifyAccessToken(token)).rejects.toThrow();
    });

    test('rejects random string', async () => {
      await expect(authService.verifyAccessToken("randomstring")).rejects.toThrow();
    });

    test('rejects refresh token', async () => {
      const payload = {
        type: 'refresh',
        user: "username",
        id: generateUuid(),
        refreshesLeft: 4,
      };
      const token = sign(payload, authConfig.jwtSecret);

      await expect(authService.verifyAccessToken(token)).rejects.toThrow();
    });

    test('generates valid token with correct expiration', async () => {
      const token = await authService.generateAccessToken();
      let payload;

      try {
        payload = verify(token, authConfig.jwtSecret);
      } catch (err) {
        expect(err).toEqual(undefined);
      }

      // 900 seconds is 15 minutes
      expect(payload.exp - payload.iat).toBe(900);
    });
  });

  describe('refresh tokens', () => {
    const user = "username";

    test('generates correct payload', async () => {
      const token = await authService.generateRefreshToken(user);

      let payload;

      try {
        payload = verify(token, authConfig.jwtSecret);
      } catch (err) {
        expect(err).toBe(undefined);
      }

      expect(payload).toHaveProperty('user', user);
      expect(payload).toHaveProperty('id');
      expect(validate(payload.id) && version(payload.id) == 4).toBe(true);
      expect(payload).toHaveProperty('refreshesLeft', authConfig.initialRefreshes);
    });

    test('verifies token after it has been generated', async () => {
      const token = await authService.generateRefreshToken(user);
      
      let payload;

      try {
        payload = await authService.verifyRefreshToken(token);
      } catch (err) {
        expect(err).toBe(undefined);
      }

      expect(payload).toHaveProperty('user', user);
      expect(payload).toHaveProperty('id');
      expect(validate(payload.id) && version(payload.id) == 4).toBe(true);
      expect(payload).toHaveProperty('refreshesLeft', authConfig.initialRefreshes);
    });

    test('rejects correct token, but made outside AuthService', async () => {
      const payload = {
        user,
        id: generateUuid(),
        refreshesLeft: authConfig.initialRefreshes,
      };

      const token = sign(payload, authConfig.jwtSecret);

      await expect(authService.verifyRefreshToken(token)).rejects.toThrow();
    });

    test('extends refresh token while invalidating old', async () => {
      const token = await authService.generateRefreshToken(user);
      const payload = decode(token) as RefreshToken;

      const extendedToken = await authService.extendRefreshToken(payload);
      const extendedPayload = decode(extendedToken) as RefreshToken;

      expect(extendedPayload).toHaveProperty('refreshesLeft', authConfig.initialRefreshes - 1);
      await expect(authService.verifyRefreshToken(extendedToken)).resolves.toHaveProperty('id', extendedPayload.id);
      await expect(authService.verifyRefreshToken(token)).rejects.toThrow();
    });
    
    test('rejects access token', async () => {
      const payload = {};
      const token = sign(payload, authConfig.jwtSecret);

      await expect(authService.verifyRefreshToken(token)).rejects.toThrow();
    });

    test('rejects token without type', async () => {
      const payload = {
        user: "username",
        id: generateUuid(),
        refreshesLeft: 4,
      };
      const token = sign(payload, authConfig.jwtSecret);

      await expect(authService.verifyRefreshToken(token)).rejects.toThrow();
    });
  });
});