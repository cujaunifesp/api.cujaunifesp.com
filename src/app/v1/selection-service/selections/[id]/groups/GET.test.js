import orchestrator from "utils/orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

const testData = {};

describe("GET /v1/selection-service/selections/[id]/groups", () => {
  describe("Usuário anônimo", () => {
    test("com selection_id inexistente", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/selections/a0b3c8ec-fa1b-4e19-8515-1ebe570282cc/groups`,
      );
      const responseBody = await response.json();

      expect(response.status).toEqual(404);
      expect(responseBody.error).toEqual({
        message: "Não foi possível encontrar este recurso.",
        action:
          "Verifique se o recurso que você está tentando acessar está correto.",
        name: "NotFoundError",
        statusCode: 404,
      });
    });

    test("com selection_id válido existente", async () => {
      const createdSelection = await orchestrator.selection.createNewSelection(
        {},
      );

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/selections/${createdSelection.id}/groups`,
      );
      const responseBody = await response.json();

      expect(response.status).toEqual(401);
      expect(responseBody.error).toEqual({
        message: "Usuário não autenticado.",
        action:
          "Verifique se você está autenticado com uma sessão ativa e tente novamente.",
        name: "UnauthorizedError",
        statusCode: 401,
      });
    });
  });

  describe("Usuário autenticado", () => {
    const userToken = orchestrator.auth.createUserToken({
      email: "user1@teste.com",
      method: "email_verification",
    });

    test("com nenhum grupo disponível", async () => {
      const createdSelection = await orchestrator.selection.createNewSelection(
        {},
      );

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/selections/${createdSelection.id}/groups`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(0);
    });

    test("com 01 grupo disponível", async () => {
      const createdSelection = await orchestrator.selection.createNewSelection(
        {},
      );

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          title: "Reserva de Vagas",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/selections/${createdSelection.id}/groups`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(1);
      expect(responseBody[0]).toEqual({
        id: responseBody[0].id,
        title: createdGroup.title,
        code: createdGroup.code,
      });
    });

    test("com 02 grupos disponíveis", async () => {
      const createdSelection = await orchestrator.selection.createNewSelection(
        {},
      );

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          title: "Reserva de Vagas",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const createdGroup2 =
        await orchestrator.selection.createNewSelectionGroup({
          title: "Reserva de Vagas",
          code: "T2",
          selection_id: createdSelection.id,
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/selections/${createdSelection.id}/groups`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(2);
      expect(responseBody[0]).toEqual({
        id: responseBody[0].id,
        title: createdGroup.title,
        code: createdGroup.code,
      });
      expect(responseBody[1]).toEqual({
        id: responseBody[1].id,
        title: createdGroup2.title,
        code: createdGroup2.code,
      });
    });
  });
});
