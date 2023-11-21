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
      expect(responseBody).toEqual({
        message: "Código de verificação enviado com sucesso",
      });
    });

    test("sem email", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/auth-service/email-verification`,
        {
          method: "POST",
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(500);
      expect(responseBody).toEqual({
        error: {
          statusCode: 500,
          name: "InternalServerError",
          message:
            "Não foi possível completar sua solicitação devido a um erro inesperado.",
          action: "Entre em contato com o suporte técnico.",
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

      expect(response.status).toEqual(500);
      expect(responseBody).toEqual({
        error: {
          statusCode: 500,
          name: "InternalServerError",
          message:
            "Não foi possível completar sua solicitação devido a um erro inesperado.",
          action: "Entre em contato com o suporte técnico.",
        },
      });
    });
  });
});
