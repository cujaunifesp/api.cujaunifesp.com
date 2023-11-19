import jwt from "jsonwebtoken";

import authOrchestrator from "utils/tests-orchestration/auth-orchestrator";
import orchestrator from "utils/tests-orchestration/orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

describe("Usando método email_verification", () => {
  test("sem ter iniciado o processo de verificação", async () => {
    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "teste@teste.com",
        verification_code: "ABCDEF",
      }),
    });
    const responseBody = await response.json();

    expect(response.status).toEqual(404);
    expect(responseBody.error).toEqual({
      message:
        "Não encontramos nenhum código de verificação para o email informado.",
      action: "Reenvie o email de confirmação para gerar um novo código.",
      name: "NotFoundError",
      statusCode: 404,
    });
  });

  test("sem o verification_code", async () => {
    const createdEmailVerification =
      await authOrchestrator.createEmailVerification({
        email: "sem_verification_code@teste.com",
      });

    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "sem_verification_code@teste.com",
      }),
    });
    const responseBody = await response.json();

    expect(response.status).toEqual(401);
    expect(responseBody.error).toEqual({
      message: "O código de verificação está incorreto.",
      action:
        "Tente novamente ou reenvie o email de confirmação para gerar um novo código.",
      name: "UnauthorizedError",
      statusCode: 401,
    });
  });

  test("com um verification_code inválido", async () => {
    const createdEmailVerification =
      await authOrchestrator.createEmailVerification({
        email: "invalid_verification_code@teste.com",
      });

    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "invalid_verification_code@teste.com",
        verification_code: "ABCD",
      }),
    });
    const responseBody = await response.json();

    expect(response.status).toEqual(400);
    expect(responseBody.error).toEqual({
      message: "'verification_code' deve conter no mínimo 6 caracteres.",
      action: "Corrija os dados enviados e tente novamente.",
      name: "ValidationError",
      statusCode: 400,
    });
  });

  test("com um verification_code válido incorreto", async () => {
    const createdEmailVerification =
      await authOrchestrator.createEmailVerification({
        email: "wrong_verification_code@teste.com",
        verification_code: "ABC123",
      });

    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "wrong_verification_code@teste.com",
        verification_code: "CBA321",
      }),
    });
    const responseBody = await response.json();

    expect(response.status).toEqual(401);
    expect(responseBody.error).toEqual({
      message: "O código de verificação está incorreto.",
      action:
        "Tente novamente ou reenvie o email de confirmação para gerar um novo código.",
      name: "UnauthorizedError",
      statusCode: 401,
    });
  });

  test("com um verification_code de outro usuário", async () => {
    const createdEmailVerification1 =
      await authOrchestrator.createEmailVerification({
        email: "user1_verification_code@teste.com",
        verification_code: "USER01",
      });

    const createdEmailVerification2 =
      await authOrchestrator.createEmailVerification({
        email: "user2_verification_code@teste.com",
        verification_code: "USER02",
      });

    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "user1_verification_code@teste.com",
        verification_code: createdEmailVerification2.verification_code,
      }),
    });
    const responseBody = await response.json();

    expect(response.status).toEqual(401);
    expect(responseBody.error).toEqual({
      message: "O código de verificação está incorreto.",
      action:
        "Tente novamente ou reenvie o email de confirmação para gerar um novo código.",
      name: "UnauthorizedError",
      statusCode: 401,
    });
  });

  test("com um verification_code errado em 11 tentativas", async () => {
    const createdEmailVerification =
      await authOrchestrator.createEmailVerification({
        email: "attempts_verification_code@teste.com",
        verification_code: "ABC123",
      });

    for (let index = 0; index < 10; index++) {
      await fetch(`${orchestrator.host}/v1/auth-service/token`, {
        method: "POST",
        body: JSON.stringify({
          method: "email_verification",
          email: "attempts_verification_code@teste.com",
          verification_code: "CBA321",
        }),
      });
    }

    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "attempts_verification_code@teste.com",
        verification_code: "CBA321",
      }),
    });

    const responseBody = await response.json();

    expect(response.status).toEqual(429);
    expect(responseBody.error).toEqual({
      message:
        "Você excedeu o número de tentativas para o código de validação.",
      action: "Reenvie o email de confirmação para gerar um novo código.",
      name: "TooManyRequestsError",
      statusCode: 429,
    });
  });

  test("com um verification_code correto", async () => {
    const createdEmailVerification =
      await authOrchestrator.createEmailVerification({
        email: "right_verification_code@teste.com",
      });

    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "right_verification_code@teste.com",
        verification_code: createdEmailVerification.verification_code,
      }),
    });
    const responseBody = await response.json();

    expect(response.status).toEqual(201);
    const expirationTime =
      new Date(responseBody.expires_at) - new Date(responseBody.created_at);
    expect(expirationTime).toEqual(604800000);
    expect(responseBody.token).not.toBeNull();
    expect(jwt.decode(responseBody.token)).toEqual({
      exp: new Date(responseBody.expires_at) / 1000,
      iat: new Date(responseBody.created_at) / 1000,
      method: "email_verification",
      email: createdEmailVerification.email,
      role: "visitor",
    });
  });

  test("com um verification_code já usado", async () => {
    const createdEmailVerification =
      await authOrchestrator.createEmailVerification({
        email: "used_verification_code@teste.com",
      });

    await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "used_verification_code@teste.com",
        verification_code: createdEmailVerification.verification_code,
      }),
    });

    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "used_verification_code@teste.com",
        verification_code: createdEmailVerification.verification_code,
      }),
    });

    const responseBody = await response.json();

    expect(response.status).toEqual(401);
    expect(responseBody.error).toEqual({
      message: "O código de verificação está expirado.",
      action: "Reenvie o email de confirmação para gerar um novo código.",
      name: "UnauthorizedError",
      statusCode: 401,
    });
  });

  test("com um verification_code expirado", async () => {
    const createdEmailVerification =
      await authOrchestrator.createEmailVerification({
        email: "expired_verification_code@teste.com",
        expired: true,
      });

    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "email_verification",
        email: "expired_verification_code@teste.com",
        verification_code: createdEmailVerification.verification_code,
      }),
    });

    const responseBody = await response.json();

    expect(response.status).toEqual(401);
    expect(responseBody.error).toEqual({
      message: "O código de verificação está expirado.",
      action: "Reenvie o email de confirmação para gerar um novo código.",
      name: "UnauthorizedError",
      statusCode: 401,
    });
  });
});

describe("Usando método credentials", () => {
  test("(não implementado)", async () => {
    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "credentials",
        email: "teste@teste.com",
      }),
    });
    const responseBody = await response.json();

    expect(response.status).toEqual(501);
    expect(responseBody.error).toEqual({
      message: "Esse método de autenticação não está disponível.",
      action: "Aguarde que essa função seja implementada no sistema.",
      name: "InternalServerError",
      statusCode: 501,
    });
  });
});

describe("Usando método admin", () => {
  test("(não implementado)", async () => {
    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "admin",
        email: "teste@teste.com",
      }),
    });
    const responseBody = await response.json();

    expect(response.status).toEqual(501);
    expect(responseBody.error).toEqual({
      message: "Esse método de autenticação não está disponível.",
      action: "Aguarde que essa função seja implementada no sistema.",
      name: "InternalServerError",
      statusCode: 501,
    });
  });
});

describe("Tentando qualquer outro método", () => {
  test("(não implementado)", async () => {
    const response = await fetch(`${orchestrator.host}/v1/auth-service/token`, {
      method: "POST",
      body: JSON.stringify({
        method: "non-existing_method",
        email: "teste@teste.com",
      }),
    });
    const responseBody = await response.json();

    expect(response.status).toEqual(400);
    expect(responseBody.error).toEqual({
      message:
        "'method' deve possuir um dos seguintes valores: 'email_credencials', 'credentials' ou 'admin'.",
      action: "Corrija os dados enviados e tente novamente.",
      name: "ValidationError",
      statusCode: 400,
    });
  });
});
