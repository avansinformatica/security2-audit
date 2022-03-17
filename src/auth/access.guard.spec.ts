import { Test } from "@nestjs/testing";
import { AccessAuthGuard } from "./access.guard";
import { AuthService } from "./auth.service";

describe('auth guards', () => {
  let accessAuthGuard;
  let authService;
  let context;
  let request;

  beforeEach(async () => {
    const authServiceMockProvider = {
      provide: AuthService,
      useFactory: () => ({
        verifyAccessToken: jest.fn(),
      })
    }

    const moduleRef = await Test.createTestingModule({
      providers: [AccessAuthGuard, authServiceMockProvider],
    })
    .compile();

    accessAuthGuard = moduleRef.get<AccessAuthGuard>(AccessAuthGuard);
    authService = moduleRef.get<AuthService>(AuthService);

    request = {
      headers: {
        authorization: "",
      },
      body: {
        user: 'username',
        password: 'supersecret',
      }
    }

    context = {
      switchToHttp: () => ({
        getRequest: () => request,
      })
    };
  });

  test('accepts when auth service accepts and places it in body', async () => {
    const token = "sometoken";
    authService.verifyAccessToken.mockReturnValue(token);
    request.headers.authorization = token;

    await expect(accessAuthGuard.canActivate(context)).resolves.toBe(true);

    expect(request.body).toHaveProperty('token', token);

    expect(authService.verifyAccessToken).toBeCalledWith(token);
  });

  test('rejects invalid token', async () => {
    authService.verifyAccessToken.mockImplementation(() => {throw new Error('problem')});
    const token = "someinvalidtoken";

    request.headers.authorization = token;

    await expect(accessAuthGuard.canActivate(context)).resolves.toBe(false);

    expect(authService.verifyAccessToken).toBeCalledWith(token);
  });
});