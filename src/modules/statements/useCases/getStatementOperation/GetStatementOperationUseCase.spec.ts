import { InMemoryStatementsRepository } from "../../../statements/repositories/in-memory/InMemoryStatementsRepository"
import { OperationType, Statement } from "../../entities/Statement"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getStatementsUseCase: GetStatementOperationUseCase;

describe("Tests for GetStatement", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementsRepositoryInMemory = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    getStatementsUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory)
  });

  it("Should be able to get single statement of a user", async () => {
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

    const getStatement = await getStatementsUseCase.execute({
      user_id: user.id,
      statement_id: statement.id
    });

    expect(getStatement).toBeInstanceOf(Statement);
  });

  it("should not be able to find a statement if user doesn't exists", async () => {
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
        type: OperationType.DEPOSIT
      };

      const statement = await createStatementUseCase.execute(operation);

      await getStatementsUseCase.execute({
        user_id: 'any',
        statement_id: statement.id
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to find a statement if it doesn't exists", async () => {
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
        type: OperationType.DEPOSIT
      };

      await createStatementUseCase.execute(operation);

      await getStatementsUseCase.execute({
        user_id: user.id,
        statement_id: 'any'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })
})
