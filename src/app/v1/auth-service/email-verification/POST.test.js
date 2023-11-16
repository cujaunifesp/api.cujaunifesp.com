import orchestrator from "utils/tests-orchestration/orchestrator";

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

      expect(responseBody).toEqual({
        error: {
          message: "Não foi possível realizar a verificação desse email",
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

      expect(responseBody).toEqual({
        error: {
          message: "Não foi possível realizar a verificação desse email",
        },
      });
    });
  });
});
