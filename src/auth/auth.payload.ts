export interface Token {
  type: string;
}

export interface AccessToken extends Token {

}

export interface RefreshToken extends Token {
  id: string;
  user: string;
  refreshesLeft: number;
}