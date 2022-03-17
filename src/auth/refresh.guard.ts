import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class RefreshAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      request.body.token = await this.authService.verifyRefreshToken(request.headers.authorization);
    } catch (err) {
      return true;
    }

    return true;
  }
}