import { Test } from "@nestjs/testing";
import { RefreshAuthGuard } from "./refresh.guard";
import { AuthService } from "./auth.service";

describe('auth guards', () => {
  let refreshAuthGuard;
  let authService;
  let context;
  let request;

  beforeEach(async () => {
    const authServiceMockProvider = {
      provide: AuthService,
      useFactory: () => ({
        verifyRefreshToken: jest.fn(),
      })
    }

    const moduleRef = await Test.createTestingModule({
      providers: [RefreshAuthGuard, authServiceMockProvider],
    })
    .compile();

    refreshAuthGuard = moduleRef.get<RefreshAuthGuard>(RefreshAuthGuard);
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
    authService.verifyRefreshToken.mockReturnValue(token);
    request.headers.authorization = token;

    await expect(refreshAuthGuard.canActivate(context)).resolves.toBe(true);

    expect(request.body).toHaveProperty('token', token);

    expect(authService.verifyRefreshToken).toBeCalledWith(token);
  });

  test('rejects invalid token', async () => {
    authService.verifyRefreshToken.mockImplementation(() => {throw new Error('problem')});
    const token = "someinvalidtoken";

    request.headers.authorization = token;

    await expect(refreshAuthGuard.canActivate(context)).resolves.toBe(false);

    expect(authService.verifyRefreshToken).toBeCalledWith(token);
  });
});