import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { OperationType } from "../../entities/Statement";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementError } from "./CreateStatementError";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;

describe("Create statement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to create a deposit statement", async () => {
    const user = await createUserUseCase.execute({
      name: "kaiky",
      email: "kaiky@test.com",
      password: "123"
    });

    const operation: ICreateStatementDTO = {
      user_id: user.id,
      description: "pagamento",
      amount: 100,
      type: OperationType.DEPOSIT
    };

    const statement = await createStatementUseCase.execute(operation);

    expect(statement).toHaveProperty("id")
  });

  it("should be able to create a withdraw statement", async () => {
    const user = await createUserUseCase.execute({
      name: "kaiky",
      email: "kaiky@test.com",
      password: "123"
    });

    const operation_one: ICreateStatementDTO = {
      user_id: user.id,
      description: "pagamento",
      amount: 110,
      type: OperationType.DEPOSIT
    };

    await createStatementUseCase.execute(operation_one);

    const operation: ICreateStatementDTO = {
      user_id: user.id,
      description: "pagamento",
      amount: 100,
      type: OperationType.WITHDRAW
    };

    const statement = await createStatementUseCase.execute(operation);

    expect(statement).toHaveProperty("id");
  })

  it("should not be able to create a withdraw statement if amount is less than user's balance", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "kaiky",
        email: "kaiky@test.com",
        password: "123"
      });

      const operation: ICreateStatementDTO = {
        user_id: user.id,
        description: "pagamento",
        amount: 100,
        type: OperationType.WITHDRAW
      };

      await createStatementUseCase.execute(operation);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create any statement if user doesn't exists", async () => {
    expect(async () => {
      const operation: ICreateStatementDTO = {
        user_id: "any",
        description: "pagamento",
        amount: 100,
        type: OperationType.DEPOSIT
      };

      await createStatementUseCase.execute(operation);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
