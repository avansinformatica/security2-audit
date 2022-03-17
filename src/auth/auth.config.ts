export const AUTH_CONFIG: string = 'AUTH_CONFIG';

export interface AuthConfig {
  // token config
  jwtSecret: string;
  initialRefreshes: number;
  refreshExpire: string;
  accessExpire: string;

  // passwd config
  saltRounds: number;
}