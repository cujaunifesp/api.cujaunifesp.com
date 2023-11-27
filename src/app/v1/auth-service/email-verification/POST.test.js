import orchestrator from "utils/orchestrator";

describe("POST /v1/auth-service/email-verification", () => {
  describe("Iniciar verificação", () => {
    test("com email válido", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/auth-service/email-verification`,
        {
          method: "POST",
          body: JSON.stringify({
            email: "teste@teste.com",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(201);
      expect(responseBody).toEqual({});
    });

    test("sem email", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/auth-service/email-verification`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody).toEqual({
        error: {
          statusCode: 400,
          name: "ValidationError",
          message: "'email' é um campo obrigatório.",
          action: "Corrija os dados enviados e tente novamente.",
        },
      });
    });

    test("com email inválido", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/auth-service/email-verification`,
        {
          method: "POST",
          body: JSON.stringify({
            email: "testeNÃOÉARROBAteste.com",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody).toEqual({
        error: {
          statusCode: 400,
          name: "ValidationError",
          message: "'email' deve conter um email válido.",
          action: "Corrija os dados enviados e tente novamente.",
        },
      });
    });
  });
});
