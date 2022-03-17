import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class AccessAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
      
    try {
      request.body.token = await this.authService.verifyAccessToken(request.headers.authorization);
    } catch (err) {
      return false;
    }

    return true;
  }
}