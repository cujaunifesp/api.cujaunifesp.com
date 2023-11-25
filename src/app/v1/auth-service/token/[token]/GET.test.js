import orchestrator from "utils/orchestrator";

describe("GET /v1/auth-service/token/[token]", () => {
  test("Token válido", async () => {
    const createdToken = orchestrator.auth.createUserToken({
      method: "email_verification",
      email: "user1@teste.com",
    });

    const response = await fetch(
      `${orchestrator.host}/v1/auth-service/token/${createdToken}`,
    );

    const responseBody = await response.json();

    expect(response.status).toEqual(200);
    expect(responseBody).toEqual({
      token: createdToken,
      expires_at: responseBody.expires_at,
      created_at: responseBody.created_at,
      method: "email_verification",
      valid: true,
    });
  });

  test("Token expirado", async () => {
    const createdToken = orchestrator.auth.createUserToken(
      {
        method: "email_verification",
        email: "user1@teste.com",
      },
      {
        expiresIn: 1,
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 1100));

    const response = await fetch(
      `${orchestrator.host}/v1/auth-service/token/${createdToken}`,
    );

    const responseBody = await response.json();

    expect(response.status).toEqual(200);
    expect(responseBody).toEqual({
      token: createdToken,
      expires_at: responseBody.expires_at,
      created_at: responseBody.created_at,
      method: "email_verification",
      valid: false,
    });
  });

  test("Token inválido", async () => {
    const response = await fetch(
      `${orchestrator.host}/v1/auth-service/token/invalid_token`,
    );

    const responseBody = await response.json();

    expect(response.status).toEqual(200);
    expect(responseBody).toEqual({
      token: "invalid_token",
      valid: false,
    });
  });
});
