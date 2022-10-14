import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate user", () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to authenticate a user", async () => {
    const user = {
      name: "kaiky",
      email: "kaiky@test.com",
      password: "123"
    };

    await createUserUseCase.execute(user);

    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(auth).toHaveProperty("token");
  });

  it("should not be able to login if email is incorrect", async () => {
    expect(async () => {
      const user = {
        name: "kaiky",
        email: "kaiky@test.com",
        password: "123"
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: "kaiky1@test.com",
        password: user.password
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to login if password is incorrect", async () => {
    expect(async () => {
      const user = {
        name: "kaiky",
        email: "kaiky@test.com",
        password: "123"
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "321"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

})
