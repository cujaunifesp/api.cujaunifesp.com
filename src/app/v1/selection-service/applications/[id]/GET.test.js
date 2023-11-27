import orchestrator from "utils/orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

const testData = {};

const endDate = new Date();
endDate.setDate(endDate.getDate() + 2);

describe("GET /v1/selection-service/applications/[id]", () => {
  describe("Usuário anônimo", () => {
    test("com selection_id inexistente", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/a0b3c8ec-fa1b-4e19-8515-1ebe570282cc`,
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
      const createdSelection = await orchestrator.selection.createNewSelection({
        applications_end_date: endDate,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          selection_id: createdSelection.id,
        },
      );

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          selected_groups_ids: [createdGroup.id],
          selection_id: createdSelection.id,
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}`,
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

    test("com mesmo email da application", async () => {
      const createdSelection = await orchestrator.selection.createNewSelection({
        applications_end_date: endDate,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          selection_id: createdSelection.id,
        },
      );

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          selected_groups_ids: [createdGroup.id],
          selection_id: createdSelection.id,
          email: "user1@teste.com",
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: createdApplication.name,
        social_name: createdApplication.social_name,
        email: createdApplication.email,
        phone: createdApplication.phone,
        cpf: createdApplication.cpf,
        identity_document: createdApplication.identity_document,
        address: createdApplication.address,
        zip_code: createdApplication.zip_code,
        city: createdApplication.city,
        state: createdApplication.state,
        selection_id: createdApplication.selection_id,
        sabbatarian: createdApplication.sabbatarian,
        special_assistance: createdApplication.special_assistance,
        special_assistance_justification:
          createdApplication.special_assistance_justification,
      });
    });

    test("com email diferente da application", async () => {
      const createdSelection = await orchestrator.selection.createNewSelection({
        applications_end_date: endDate,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          selection_id: createdSelection.id,
        },
      );

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          selected_groups_ids: [createdGroup.id],
          selection_id: createdSelection.id,
          email: "user2@teste.com",
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(403);
      expect(responseBody.error).toEqual({
        message: "Você não possui permissão para executar esta ação.",
        action: "Tente acessar essa função com um usuário diferente.",
        name: "ForbiddenError",
        statusCode: 403,
      });
    });
  });

  describe("Usuário root", () => {
    const userToken = orchestrator.auth.createUserToken({
      email: "user_root@teste.com",
      method: "root",
    });

    test("com email diferente da application", async () => {
      const createdSelection = await orchestrator.selection.createNewSelection({
        applications_end_date: endDate,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          selection_id: createdSelection.id,
        },
      );

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          selected_groups_ids: [createdGroup.id],
          selection_id: createdSelection.id,
          email: "user1@teste.com",
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: createdApplication.name,
        social_name: createdApplication.social_name,
        email: createdApplication.email,
        phone: createdApplication.phone,
        cpf: createdApplication.cpf,
        identity_document: createdApplication.identity_document,
        address: createdApplication.address,
        zip_code: createdApplication.zip_code,
        city: createdApplication.city,
        state: createdApplication.state,
        selection_id: createdApplication.selection_id,
        sabbatarian: createdApplication.sabbatarian,
        special_assistance: createdApplication.special_assistance,
        special_assistance_justification:
          createdApplication.special_assistance_justification,
      });
    });
  });
});
