import orchestrator from "utils/orchestrator";

const testData = {};

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

describe("GET /v1/selection-service/applications/{id}/payments", () => {
  describe("Usuário anônimo", () => {
    test("com um id inválido", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/123/payments`,
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
        `${orchestrator.host}/v1/selection-service/applications/9d8f216d-27d0-46a5-bf90-fb7073fe4574/payments`,
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
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/payments`,
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
          email: "user2@teste.com",
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
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/payments`,
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
    test("com 01 pagamento adicionado", async () => {
      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user1@teste.com",
          selection_id: testData.selection.id,
          selected_groups_ids: [testData.selectionApplicationGroup.id],
          cpf: "111.111.111-11",
        });

      const applicationOrders =
        await orchestrator.selection.getApplicationOrders(
          createdApplication.id,
        );

      const createdPayment = await orchestrator.orders.createNewPayment({
        order_id: applicationOrders[0].id,
      });

      testData.user1.application = createdApplication;

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/payments`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${testData.user1.userToken}` },
        },
      );

      const responseBody = await response.json();

      testData.user1.order1 = responseBody[0];

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(1);
      expect(responseBody[0]).toEqual({
        additional_payment_method_fee:
          createdPayment.additional_payment_method_fee,
        approved_at: createdPayment.approved_at.toISOString(),
        cause: createdPayment.cause,
        created_at: createdPayment.created_at.toISOString(),
        id: createdPayment.id,
        installments: createdPayment.installments,
        mercado_pago_id: createdPayment.mercado_pago_id,
        order_id: createdPayment.order_id,
        payer_email: createdPayment.payer_email,
        payment_method_id: createdPayment.payment_method_id,
        payment_type_id: createdPayment.payment_type_id,
        status: createdPayment.status,
        total_paid_amount: createdPayment.total_paid_amount,
        transaction_amount: createdPayment.transaction_amount,
        updated_at: createdPayment.updated_at.toISOString(),
      });
    });

    test("com 02 pagamentos adicionados", async () => {
      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user1@teste.com",
          selection_id: testData.selection.id,
          selected_groups_ids: [testData.selectionApplicationGroup.id],
          cpf: "333.333.333-33",
        });

      const applicationOrders =
        await orchestrator.selection.getApplicationOrders(
          createdApplication.id,
        );

      const createdPayment = await orchestrator.orders.createNewPayment({
        order_id: applicationOrders[0].id,
      });

      const createdPayment2 = await orchestrator.orders.createNewPayment({
        order_id: applicationOrders[0].id,
      });

      testData.user1.application = createdApplication;

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/payments`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${testData.user1.userToken}` },
        },
      );

      const responseBody = await response.json();

      testData.user1.order1 = responseBody[0];

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(2);

      expect(responseBody[0]).toEqual({
        additional_payment_method_fee:
          createdPayment.additional_payment_method_fee,
        approved_at: createdPayment.approved_at.toISOString(),
        cause: createdPayment.cause,
        created_at: createdPayment.created_at.toISOString(),
        id: createdPayment.id,
        installments: createdPayment.installments,
        mercado_pago_id: createdPayment.mercado_pago_id,
        order_id: createdPayment.order_id,
        payer_email: createdPayment.payer_email,
        payment_method_id: createdPayment.payment_method_id,
        payment_type_id: createdPayment.payment_type_id,
        status: createdPayment.status,
        total_paid_amount: createdPayment.total_paid_amount,
        transaction_amount: createdPayment.transaction_amount,
        updated_at: createdPayment.updated_at.toISOString(),
      });

      expect(responseBody[1]).toEqual({
        additional_payment_method_fee:
          createdPayment2.additional_payment_method_fee,
        approved_at: createdPayment2.approved_at.toISOString(),
        cause: createdPayment2.cause,
        created_at: createdPayment2.created_at.toISOString(),
        id: createdPayment2.id,
        installments: createdPayment2.installments,
        mercado_pago_id: createdPayment2.mercado_pago_id,
        order_id: createdPayment2.order_id,
        payer_email: createdPayment2.payer_email,
        payment_method_id: createdPayment2.payment_method_id,
        payment_type_id: createdPayment2.payment_type_id,
        status: createdPayment2.status,
        total_paid_amount: createdPayment2.total_paid_amount,
        transaction_amount: createdPayment2.transaction_amount,
        updated_at: createdPayment2.updated_at.toISOString(),
      });
    });
  });

  describe("Usuário root", () => {
    test("com application_id válido de outro email", async () => {
      const rootToken = orchestrator.auth.createUserToken({
        method: "root",
        email: "email_root@teste.com",
      });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user1@teste.com",
          selection_id: testData.selection.id,
          selected_groups_ids: [testData.selectionApplicationGroup.id],
          cpf: "222.222.222-22",
        });

      const applicationOrders =
        await orchestrator.selection.getApplicationOrders(
          createdApplication.id,
        );

      const createdPayment = await orchestrator.orders.createNewPayment({
        order_id: applicationOrders[0].id,
      });

      testData.user1.application = createdApplication;

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/applications/${createdApplication.id}/payments`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${rootToken}` },
        },
      );

      const responseBody = await response.json();

      testData.user1.order1 = responseBody[0];

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(1);
      expect(responseBody[0]).toEqual({
        additional_payment_method_fee:
          createdPayment.additional_payment_method_fee,
        approved_at: createdPayment.approved_at.toISOString(),
        cause: createdPayment.cause,
        created_at: createdPayment.created_at.toISOString(),
        id: createdPayment.id,
        installments: createdPayment.installments,
        mercado_pago_id: createdPayment.mercado_pago_id,
        order_id: createdPayment.order_id,
        payer_email: createdPayment.payer_email,
        payment_method_id: createdPayment.payment_method_id,
        payment_type_id: createdPayment.payment_type_id,
        status: createdPayment.status,
        total_paid_amount: createdPayment.total_paid_amount,
        transaction_amount: createdPayment.transaction_amount,
        updated_at: createdPayment.updated_at.toISOString(),
      });
    });
  });
});
