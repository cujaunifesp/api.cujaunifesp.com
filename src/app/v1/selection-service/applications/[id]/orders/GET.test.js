import orchestrator from "utils/orchestrator";

const testData = {};

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

describe("GET /v1/selection-service/applications/{id}/orders", () => {
  describe("Usuário anônimo", () => {
    test("com um id inválido", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/123/orders`,
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

    test("com um id válido inexistente", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/9d8f216d-27d0-46a5-bf90-fb7073fe4574/orders`,
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

    test("com um id válido e existente", async () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 2);

      const createdSelection = await orchestrator.selection.createNewSelection({
        title: "Processo Seletivo que testa o não autenticado",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: endDate,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          title: "Reserva de autenticação",
          code: "AUTH",
          selection_id: createdSelection.id,
        },
      );

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "no-token@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/orders`,
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
    test("com um application_id de outro usuário", async () => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 2);

      const createdSelection = await orchestrator.selection.createNewSelection({
        title: "Processo Seletivo de Exemplo",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: endDate,
        application_price: 35,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          title: "Reserva de Vagas - PPI",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user-another@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const userToken = orchestrator.auth.createUserToken({
        method: "email_verification",
        role: "visitor",
        email: "user1@teste.com",
      });

      testData.selection = createdSelection;
      testData.selectionApplicationGroup = createdGroup;

      testData.user1 = {
        userToken,
      };

      testData.user2 = {
        application: createdApplication,
      };

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/orders`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
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

  describe("Usuário autenticado bem intencionado", () => {
    test("com application_id válido, 1 pedido e nenhum pagamento", async () => {
      const userToken = orchestrator.auth.createUserToken({
        email: "user1@teste.com",
        method: "email_verification",
      });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user1@teste.com",
          selection_id: testData.selection.id,
          selected_groups_ids: [testData.selectionApplicationGroup.id],
          cpf: "111.111.111-11",
        });

      testData.user1.application = createdApplication;

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/orders`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        },
      );

      const responseBody = await response.json();

      testData.user1.order1 = responseBody[0];

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(1);
      expect(responseBody[0]).toEqual({
        created_at: responseBody[0].created_at,
        description: "Taxa de inscrição no processo seletivo do CUJA",
        expires_at: responseBody[0].expires_at,
        id: responseBody[0].id,
        status: "waiting",
        amount: responseBody[0].amount,
        title: "Inscrição CUJA",
      });
    });

    test("com application_id válido, 1 pedido e 1 pagamento em processamento", async () => {
      const userToken = orchestrator.auth.createUserToken({
        email: "user2@teste.com",
        method: "email_verification",
      });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user2@teste.com",
          selection_id: testData.selection.id,
          selected_groups_ids: [testData.selectionApplicationGroup.id],
          cpf: "211.111.111-11",
        });

      const applicationOrders =
        await orchestrator.selection.getApplicationOrders(
          createdApplication.id,
        );

      const createdPayment = orchestrator.orders.createNewPayment({
        order_id: applicationOrders[0].id,
        status: "pending",
      });

      testData.user1.application = createdApplication;

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/orders`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        },
      );

      const responseBody = await response.json();

      testData.user1.order1 = responseBody[0];

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(1);
      expect(responseBody[0]).toEqual({
        created_at: responseBody[0].created_at,
        description: "Taxa de inscrição no processo seletivo do CUJA",
        expires_at: responseBody[0].expires_at,
        id: responseBody[0].id,
        status: "pending",
        amount: responseBody[0].amount,
        title: "Inscrição CUJA",
      });
    });

    test("com application_id válido, 1 pedido e 1 pagamento aprovado", async () => {
      const userToken = orchestrator.auth.createUserToken({
        email: "user3@teste.com",
        method: "email_verification",
      });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user3@teste.com",
          selection_id: testData.selection.id,
          selected_groups_ids: [testData.selectionApplicationGroup.id],
          cpf: "311.111.111-11",
        });

      const applicationOrders =
        await orchestrator.selection.getApplicationOrders(
          createdApplication.id,
        );

      const createdPayment = orchestrator.orders.createNewPayment({
        order_id: applicationOrders[0].id,
        status: "approved",
        total_paid_amount: testData.selection.application_price,
        transaction_amount: testData.selection.application_price,
      });

      testData.user1.application = createdApplication;

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/orders`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        },
      );

      const responseBody = await response.json();

      testData.user1.order1 = responseBody[0];

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(1);
      expect(responseBody[0]).toEqual({
        created_at: responseBody[0].created_at,
        description: "Taxa de inscrição no processo seletivo do CUJA",
        expires_at: responseBody[0].expires_at,
        id: responseBody[0].id,
        status: "paid",
        amount: responseBody[0].amount,
        title: "Inscrição CUJA",
      });
    });

    test("com application_id válido, 2 pedidos", async () => {
      const userToken = orchestrator.auth.createUserToken({
        email: "user4@teste.com",
        method: "email_verification",
      });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user4@teste.com",
          selection_id: testData.selection.id,
          selected_groups_ids: [testData.selectionApplicationGroup.id],
          cpf: "411.111.111-11",
        });

      await orchestrator.selection.createApplicationOrder(
        createdApplication.id,
      );

      const applicationOrders =
        await orchestrator.selection.getApplicationOrders(
          createdApplication.id,
        );

      const createdPayment = orchestrator.orders.createNewPayment({
        order_id: applicationOrders[0].id,
        status: "approved",
        total_paid_amount: testData.selection.application_price,
        transaction_amount: testData.selection.application_price,
      });

      testData.user1.application = createdApplication;

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/orders`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        },
      );

      const responseBody = await response.json();

      testData.user1.order1 = responseBody[0];

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(2);
      expect(responseBody[0]).toEqual({
        created_at: responseBody[0].created_at,
        description: "Taxa de inscrição no processo seletivo do CUJA",
        expires_at: responseBody[0].expires_at,
        id: responseBody[0].id,
        status: "paid",
        amount: responseBody[0].amount,
        title: "Inscrição CUJA",
      });

      expect(responseBody[1]).toEqual({
        created_at: responseBody[1].created_at,
        description: "Taxa de inscrição no processo seletivo do CUJA",
        expires_at: responseBody[1].expires_at,
        id: responseBody[1].id,
        status: "waiting",
        amount: responseBody[1].amount,
        title: "Inscrição CUJA",
      });
    });

    test("com application_id válido, 3 pedidos", async () => {
      const userToken = orchestrator.auth.createUserToken({
        email: "user5@teste.com",
        method: "email_verification",
      });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user5@teste.com",
          selection_id: testData.selection.id,
          selected_groups_ids: [testData.selectionApplicationGroup.id],
          cpf: "511.111.111-11",
        });

      await orchestrator.selection.createApplicationOrder(
        createdApplication.id,
      );

      await orchestrator.selection.createApplicationOrder(
        createdApplication.id,
      );

      const applicationOrders =
        await orchestrator.selection.getApplicationOrders(
          createdApplication.id,
        );

      await orchestrator.orders.createNewPayment({
        order_id: applicationOrders[0].id,
        status: "approved",
        total_paid_amount: testData.selection.application_price,
        transaction_amount: testData.selection.application_price,
      });

      await orchestrator.orders.createNewPayment({
        order_id: applicationOrders[1].id,
        status: "pending",
        total_paid_amount: testData.selection.application_price,
        transaction_amount: testData.selection.application_price,
      });

      testData.user1.application = createdApplication;

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/orders`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${userToken}` },
        },
      );

      const responseBody = await response.json();
      testData.user1.order1 = responseBody[0];

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(3);
      expect(responseBody[0]).toEqual({
        created_at: responseBody[0].created_at,
        description: "Taxa de inscrição no processo seletivo do CUJA",
        expires_at: responseBody[0].expires_at,
        id: responseBody[0].id,
        status: "paid",
        amount: responseBody[0].amount,
        title: "Inscrição CUJA",
      });

      expect(responseBody[1]).toEqual({
        created_at: responseBody[1].created_at,
        description: "Taxa de inscrição no processo seletivo do CUJA",
        expires_at: responseBody[1].expires_at,
        id: responseBody[1].id,
        status: "pending",
        amount: responseBody[1].amount,
        title: "Inscrição CUJA",
      });

      expect(responseBody[2]).toEqual({
        created_at: responseBody[2].created_at,
        description: "Taxa de inscrição no processo seletivo do CUJA",
        expires_at: responseBody[2].expires_at,
        id: responseBody[2].id,
        status: "waiting",
        amount: responseBody[2].amount,
        title: "Inscrição CUJA",
      });
    });
  });
});
