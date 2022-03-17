import { UserService } from "./user.service";

beforeAll(() => {
  process.env.USER1 = "dion";
  process.env.PWD1 = "supersecret";
  process.env.USER2 = "maurice";
  process.env.PWD2 = "shhhh";
});

describe('user service', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
  });

  test('returns password hash of user', async () => {
    await expect(userService.getUserHash("dion")).resolves.toBe("supersecret");
    await expect(userService.getUserHash("maurice")).resolves.toBe("shhhh");
  });

  test('throws when user is not found', async () => {
    await expect(userService.getUserHash("noah")).rejects.toThrowError("user not found");
  });
});