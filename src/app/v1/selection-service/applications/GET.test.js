import orchestrator from "utils/orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

const testData = {};

const endDate = new Date();
endDate.setDate(endDate.getDate() + 2);

describe("GET /v1/selection-service/applications", () => {
  describe("Usuário anônimo", () => {
    test("sem email", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications`,
      );
      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'email' não pode ser 'null'.",
        action: "Corrija os dados enviados e tente novamente.",
        name: "ValidationError",
        statusCode: 400,
      });
    });

    test("com email inválido", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications?email=useremail.com`,
      );
      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'email' deve conter um email válido.",
        action: "Corrija os dados enviados e tente novamente.",
        name: "ValidationError",
        statusCode: 400,
      });
    });

    test("com email válido", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications?email=user@email.com`,
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

  describe("Usuário autenticado mal intencionado", () => {
    test("com email diferente do da busca", async () => {
      const userToken = orchestrator.auth.createUserToken({
        email: "user1@teste.com",
        method: "email_verification",
      });

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
        `${orchestrator.host}/v1/selection-service/applications?email=another@email.com`,
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

  describe("Usuário autenticado", () => {
    test("com uma inscrição em um processo seletivo", async () => {
      const userToken = orchestrator.auth.createUserToken({
        email: "user2@teste.com",
        method: "email_verification",
      });

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
        `${orchestrator.host}/v1/selection-service/applications?email=user2@teste.com`,
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
        created_at: createdApplication.created_at.toISOString(),
        selection_application_groups: [
          {
            id: createdGroup.id,
            title: createdGroup.title,
            code: createdGroup.code,
          },
        ],
      });
    });

    test("com 2 inscrições em 2 processos seletivos", async () => {
      const userToken = orchestrator.auth.createUserToken({
        email: "user3@teste.com",
        method: "email_verification",
      });

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
          email: "user3@teste.com",
        });

      const createdSelection2 = await orchestrator.selection.createNewSelection(
        {
          applications_end_date: endDate,
        },
      );

      const createdGroup2 =
        await orchestrator.selection.createNewSelectionGroup({
          selection_id: createdSelection.id,
        });

      const createdApplication2 =
        await orchestrator.selection.createNewApplication({
          selected_groups_ids: [createdGroup2.id],
          selection_id: createdSelection2.id,
          email: "user3@teste.com",
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications?email=user3@teste.com`,
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
        created_at: createdApplication.created_at.toISOString(),
        selection_application_groups: [
          {
            id: createdGroup.id,
            title: createdGroup.title,
            code: createdGroup.code,
          },
        ],
      });

      expect(responseBody[1]).toEqual({
        id: responseBody[1].id,
        name: createdApplication2.name,
        social_name: createdApplication2.social_name,
        email: createdApplication2.email,
        phone: createdApplication2.phone,
        cpf: createdApplication2.cpf,
        identity_document: createdApplication2.identity_document,
        address: createdApplication2.address,
        zip_code: createdApplication2.zip_code,
        city: createdApplication2.city,
        state: createdApplication2.state,
        selection_id: createdApplication2.selection_id,
        sabbatarian: createdApplication2.sabbatarian,
        special_assistance: createdApplication2.special_assistance,
        special_assistance_justification:
          createdApplication2.special_assistance_justification,
        created_at: createdApplication2.created_at.toISOString(),
        selection_application_groups: [
          {
            id: createdGroup2.id,
            title: createdGroup2.title,
            code: createdGroup2.code,
          },
        ],
      });
    });
  });

  describe("Usuário root", () => {
    const userToken = orchestrator.auth.createUserToken({
      email: "user_root@teste.com",
      method: "root",
    });

    test("com email diferente", async () => {
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
          email: "user4@teste.com",
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications?email=user4@teste.com`,
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
        created_at: createdApplication.created_at.toISOString(),
        selection_application_groups: [
          {
            id: createdGroup.id,
            title: createdGroup.title,
            code: createdGroup.code,
          },
        ],
      });
    });
  });
});
