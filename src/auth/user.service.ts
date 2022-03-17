import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  private readonly users: Map<string, string> = new Map();

  constructor() {
    let cur = 1;

    while (process.env[`USER${cur}`]) {
      this.users.set(process.env[`USER${cur}`], process.env[`PWD${cur}`]);
      cur += 1;
    }
  }

  async getUserHash(user: string): Promise<string> {
      // TODO later this should come from a database (therefore already async)
      if (!this.users.has(user)) {
        throw new Error('user not found');
      }

      return this.users.get(user);
  }
}
