import authOrchestrator from "utils/tests-orchestration/auth-orchestrator";
import orchestrator from "utils/tests-orchestration/orchestrator";
import selectionOrchestrator from "utils/tests-orchestration/selection-orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

describe("POST /v1/selection-service/applications", () => {
  describe("Usuário não autenticado", () => {
    test("inscrição com dados completos", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
        applications_end_date: date,
      });

      const createdGroup1 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 1",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const createdGroup2 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 2",
          code: "T2",
          selection_id: createdSelection.id,
        },
      );

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications`,
        {
          method: "POST",
          body: JSON.stringify({
            name: "Nome completo",
            email: "teste@teste.com",
            phone: "11999999999",
            cpf: "123.456.789-00",
            identity_document: "999999999",
            address: "Rua Pedro de Toledo",
            zip_code: "04039032",
            city: "São Paulo",
            state: "SP",
            sabbatarian: false,
            special_assistance: false,
            selected_groups_ids: [createdGroup1.id, createdGroup2.id],
            selection_id: createdSelection.id,
          }),
        },
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
    test("inscrição com dados completos", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
        applications_end_date: date,
      });

      const createdGroup1 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 1",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const createdGroup2 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 2",
          code: "T2",
          selection_id: createdSelection.id,
        },
      );

      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        role: "visitor",
        email: "teste@teste.com",
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            name: "Nome completo",
            email: "teste@teste.com",
            phone: "11999999999",
            cpf: "123.456.789-00",
            identity_document: "999999999",
            address: "Rua Pedro de Toledo",
            zip_code: "04039032",
            city: "São Paulo",
            state: "SP",
            sabbatarian: false,
            special_assistance: false,
            selected_groups_ids: [createdGroup1.id, createdGroup2.id],
            selection_id: createdSelection.id,
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(201);
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Nome completo",
        social_name: null,
        email: "teste@teste.com",
        phone: "11999999999",
        cpf: "123.456.789-00",
        identity_document: "999999999",
        address: "Rua Pedro de Toledo",
        zip_code: "04039032",
        city: "São Paulo",
        state: "SP",
        sabbatarian: false,
        special_assistance: false,
        special_assistance_justification: null,
        selection_application_groups: [
          {
            id: createdGroup1.id,
            title: createdGroup1.title,
            code: createdGroup1.code,
          },
          {
            id: createdGroup2.id,
            title: createdGroup2.title,
            code: createdGroup2.code,
          },
        ],
        selection_id: createdSelection.id,
      });
    });

    test("inscrição com dados completos", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
        applications_end_date: date,
      });

      const createdGroup1 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 1",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const createdGroup2 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 2",
          code: "T2",
          selection_id: createdSelection.id,
        },
      );

      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        role: "visitor",
        email: "teste@teste.com",
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            name: "Nome completo",
            email: "teste@teste.com",
            phone: "11999999999",
            cpf: "123.456.78900",
            identity_document: "999999999",
            address: "Rua Pedro de Toledo",
            zip_code: "04039032",
            city: "São Paulo",
            state: "SP",
            sabbatarian: false,
            special_assistance: false,
            selected_groups_ids: [createdGroup1.id, createdGroup2.id],
            selection_id: createdSelection.id,
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        action: "Corrija os dados enviados e tente novamente.",
        message: "'cpf' deve ser um CPF válido.",
        name: "ValidationError",
        statusCode: 400,
      });
    });

    test("inscrição com email diferente do usuário", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
        applications_end_date: date,
      });

      const createdGroup1 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 3",
          code: "T3",
          selection_id: createdSelection.id,
        },
      );

      const createdGroup2 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 4",
          code: "T4",
          selection_id: createdSelection.id,
        },
      );

      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        role: "visitor",
        email: "teste@teste.com",
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            name: "Another User",
            email: "another_email@teste.com",
            phone: "11999999999",
            cpf: "123.456.789-00",
            identity_document: "999999999",
            address: "Rua Pedro de Toledo",
            zip_code: "04039032",
            city: "São Paulo",
            state: "SP",
            sabbatarian: false,
            special_assistance: false,
            selected_groups_ids: [createdGroup1.id, createdGroup2.id],
            selection_id: createdSelection.id,
          }),
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

    test("inscrição com apenas 1 grupo de cotas", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
        applications_end_date: date,
      });

      const createdGroup1 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 5",
          code: "T5",
          selection_id: createdSelection.id,
        },
      );

      const createdGroup2 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 6",
          code: "T6",
          selection_id: createdSelection.id,
        },
      );

      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        role: "visitor",
        email: "teste@teste.com",
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            name: "Nome completo",
            email: "teste@teste.com",
            phone: "11999999999",
            cpf: "123.456.789-00",
            identity_document: "999999999",
            address: "Rua Pedro de Toledo",
            zip_code: "04039032",
            city: "São Paulo",
            state: "SP",
            sabbatarian: false,
            special_assistance: false,
            selected_groups_ids: [createdGroup2.id],
            selection_id: createdSelection.id,
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(201);
      expect(responseBody).toEqual({
        id: responseBody.id,
        name: "Nome completo",
        social_name: null,
        email: "teste@teste.com",
        phone: "11999999999",
        cpf: "123.456.789-00",
        identity_document: "999999999",
        address: "Rua Pedro de Toledo",
        zip_code: "04039032",
        city: "São Paulo",
        state: "SP",
        sabbatarian: false,
        special_assistance: false,
        special_assistance_justification: null,
        selection_application_groups: [
          {
            id: createdGroup2.id,
            title: createdGroup2.title,
            code: createdGroup2.code,
          },
        ],
        selection_id: createdSelection.id,
      });
    });

    test("inscrição com CPF duplicado", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
        applications_end_date: date,
      });

      const createdGroup1 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas 1",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        role: "visitor",
        email: "duplicate_cpf@teste.com",
      });

      await fetch(`${orchestrator.host}/v1/selection-service/applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: "Nome completo",
          email: "duplicate_cpf@teste.com",
          phone: "11999999999",
          cpf: "123.456.789-00",
          identity_document: "999999999",
          address: "Rua Pedro de Toledo",
          zip_code: "04039032",
          city: "São Paulo",
          state: "SP",
          sabbatarian: false,
          special_assistance: false,
          selected_groups_ids: [createdGroup1.id],
          selection_id: createdSelection.id,
        }),
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            name: "Nome completo",
            email: "duplicate_cpf@teste.com",
            phone: "11999999999",
            cpf: "123.456.789-00",
            identity_document: "999999999",
            address: "Rua Pedro de Toledo",
            zip_code: "04039032",
            city: "São Paulo",
            state: "SP",
            sabbatarian: false,
            special_assistance: false,
            selected_groups_ids: [createdGroup1.id],
            selection_id: createdSelection.id,
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message: "Esse CPF já está sendo usado em outra isncrição.",
        action:
          "Entre em contato com o suporte se acreditar que isso é um erro.",
        statusCode: 422,
        name: "ValidationError",
      });
    });

    test("inscrição fora do prazo", async () => {
      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
      });

      const createdGroup1 = await selectionOrchestrator.createNewSelectionGroup(
        {
          title: "Reserva de Vagas",
          code: "TX",
          selection_id: createdSelection.id,
        },
      );

      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        role: "visitor",
        email: "wrong_date@teste.com",
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            name: "Nome completo",
            email: "wrong_date@teste.com",
            phone: "11999999999",
            cpf: "123.456.789-00",
            identity_document: "999999999",
            address: "Rua Pedro de Toledo",
            zip_code: "04039032",
            city: "São Paulo",
            state: "SP",
            sabbatarian: false,
            special_assistance: false,
            selected_groups_ids: [createdGroup1.id],
            selection_id: createdSelection.id,
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message: "As inscrições para esse processo seletivo não estão abertas",
        action: "Confira as datas para inscrição através do site",
        statusCode: 422,
        name: "ValidationError",
      });
    });

    test("inscrição em grupo inexistente", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
        applications_end_date: date,
      });

      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        role: "visitor",
        email: "no_group@teste.com",
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            name: "Nome completo",
            email: "no_group@teste.com",
            phone: "11999999999",
            cpf: "123.456.789-00",
            identity_document: "999999999",
            address: "Rua Pedro de Toledo",
            zip_code: "04039032",
            city: "São Paulo",
            state: "SP",
            sabbatarian: false,
            special_assistance: false,
            selected_groups_ids: ["ABC"],
            selection_id: createdSelection.id,
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(500);
      expect(responseBody.error).toEqual({
        action: "Entre em contato com o suporte técnico.",
        message:
          "Não foi possível completar sua solicitação devido a um erro inesperado.",
        name: "InternalServerError",
        statusCode: 500,
      });
    });
  });
});
