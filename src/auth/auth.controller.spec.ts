import { Test } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { CredentialAuthGuard } from "./credential.guard";
import { RefreshAuthGuard } from "./refresh.guard";
import { AccessAuthGuard } from "./access.guard";
import { AuthService } from "./auth.service";
import * as request from 'supertest';

describe('auth controller', () => {
  let authController;
  let credentialAuthGuard;
  let refreshAuthGuard;
  let authService;
  let app;

  beforeEach(async () => {
    const authServiceMockProvider = {
      provide: AuthService,
      useFactory: () => ({
        generateAccessToken: jest.fn(),
        generateRefreshToken: jest.fn(),
        extendRefreshToken: jest.fn(),
      })
    }

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        authServiceMockProvider,
      ],
    })
    .overrideGuard(CredentialAuthGuard).useValue({canActivate: jest.fn()})
    .overrideGuard(RefreshAuthGuard).useValue({canActivate: jest.fn()})
    .compile();

    app = await moduleRef.createNestApplication().init();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
    refreshAuthGuard = moduleRef.get<RefreshAuthGuard>(RefreshAuthGuard);
    credentialAuthGuard = moduleRef.get<CredentialAuthGuard>(CredentialAuthGuard);
  });

  describe('logging in', () => {
    test('generates a new refresh token', async () => {
      const mockedRefreshToken = {
        type: 'refresh',
        id: '1234',
      };

      const body = {
        user: "username",
        password: "supersecret",
      }

      credentialAuthGuard.canActivate.mockReturnValue(true);
      authService.generateRefreshToken.mockReturnValue(mockedRefreshToken);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(body)
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('token');
          expect(response.body.token).toEqual(mockedRefreshToken);
          expect(response.body).toHaveProperty('type', 'refresh');
        });

      const guardRequest = credentialAuthGuard.canActivate.mock.calls[0][0].switchToHttp().getRequest();
      expect(guardRequest.body).toStrictEqual(body);
      expect(authService.generateRefreshToken).toBeCalledWith("username");
    });

    test('forbids when credentials are invalid', async () => {
      const body = {
        user: "username",
        password: "supersecret",
      }

      credentialAuthGuard.canActivate.mockReturnValue(false);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(body)
        .expect(403);

      const guardRequest = credentialAuthGuard.canActivate.mock.calls[0][0].switchToHttp().getRequest();
      expect(guardRequest.body).toStrictEqual(body);
      expect(authService.generateRefreshToken).not.toBeCalled();
    });
  });

  describe('refreshing access token', () => {
    test('generates a new access token', async () => {
      const mockedRefreshToken = {
        type: 'refresh',
        id: '1234',
      };
      const mockedAccessToken = {
        type: 'access',
      };

      refreshAuthGuard.canActivate.mockReturnValue(true);
      authService.generateAccessToken.mockReturnValue(mockedAccessToken);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', JSON.stringify(mockedRefreshToken))
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('token');
          expect(response.body.token).toEqual(mockedAccessToken);
          expect(response.body).toHaveProperty('type', 'access');
        });

      const guardRequest = refreshAuthGuard.canActivate.mock.calls[0][0].switchToHttp().getRequest();
      expect(guardRequest.headers.authorization).toBe(JSON.stringify(mockedRefreshToken));
      expect(authService.generateAccessToken).toBeCalled();
    });

    test('forbids when refresh token is invalid', async () => {
      const mockedRefreshToken = "mockedtoken";

      refreshAuthGuard.canActivate.mockReturnValue(false);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', mockedRefreshToken)
        .expect(403);

      const guardRequest = refreshAuthGuard.canActivate.mock.calls[0][0].switchToHttp().getRequest();
      expect(guardRequest.headers.authorization).toBe(mockedRefreshToken);
      expect(authService.generateAccessToken).not.toBeCalled();
    });
  });

  describe('extending refresh token', () => {
    test('extends refresh token', async () => {
      const mockedRefreshToken = {
        type: 'refresh',
        id: '1234',
      };
      const mockedExtendedToken = {
        type: 'refresh',
        id: '12345',
      };

      refreshAuthGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.body.token = mockedRefreshToken;
        return true;
      });
      authService.extendRefreshToken.mockReturnValue(mockedExtendedToken);

      await request(app.getHttpServer())
        .post('/auth/extend')
        .set('Authorization', JSON.stringify(mockedRefreshToken))
        .expect(201)
        .then(response => {
          expect(response.body).toHaveProperty('token');
          expect(response.body.token).toEqual(mockedExtendedToken);
          expect(response.body).toHaveProperty('type', 'refresh');
        });

      const guardRequest = refreshAuthGuard.canActivate.mock.calls[0][0].switchToHttp().getRequest();
      expect(guardRequest.headers.authorization).toBe(JSON.stringify(mockedRefreshToken));
      expect(authService.extendRefreshToken).toBeCalledWith(mockedRefreshToken);
    });

    test('forbids when refresh token is invalid', async () => {
      const mockedRefreshToken = {
        type: 'refresh',
        id: '1234',
      };

      refreshAuthGuard.canActivate.mockReturnValue(false)

      await request(app.getHttpServer())
        .post('/auth/extend')
        .set('Authorization', JSON.stringify(mockedRefreshToken))
        .expect(403);

      const guardRequest = refreshAuthGuard.canActivate.mock.calls[0][0].switchToHttp().getRequest();
      expect(guardRequest.headers.authorization).toBe(JSON.stringify(mockedRefreshToken));
      expect(authService.extendRefreshToken).not.toBeCalled();
    });
  });
});
