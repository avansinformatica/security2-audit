import { Test } from "@nestjs/testing";
import { CredentialAuthGuard } from "./credential.guard";
import { AuthService } from "./auth.service";

describe('auth guards', () => {
  let credentialAuthGuard;
  let authService;
  let context;
  let request;

  beforeEach(async () => {
    const authServiceMockProvider = {
      provide: AuthService,
      useFactory: () => ({
        verifyLogin: jest.fn(),
      })
    }

    const moduleRef = await Test.createTestingModule({
      providers: [CredentialAuthGuard, authServiceMockProvider],
    })
    .compile();

    credentialAuthGuard = moduleRef.get<CredentialAuthGuard>(CredentialAuthGuard);
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

  test('accepts when auth service accepts', async () => {
    authService.verifyLogin.mockReturnValue(true);

    await expect(credentialAuthGuard.canActivate(context)).resolves.toBe(true);

    expect(authService.verifyLogin).toBeCalledWith(request.body.user, request.body.password);
  });

  test('rejects when auth service rejects', async () => {
    authService.verifyLogin.mockReturnValue(false);

    await expect(credentialAuthGuard.canActivate(context)).resolves.toBe(false);

    expect(authService.verifyLogin).toBeCalledWith(request.body.user, request.body.password);
  });
});