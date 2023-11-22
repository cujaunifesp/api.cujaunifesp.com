import orchestrator from "utils/orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

const testData = {};

describe("POST /v1/orders-service/orders/[id]/payments", () => {
  describe("Usuário anônimo mal intencionado", () => {
    test("sem um order_id válido", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/123/payments`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
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

    test("com um order_id válido inexistente", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/f82ef65e-12cb-404e-99e8-3891c3679c4a/payments`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
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

    test("com um order_id válido existente e reuqisição em branco", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({});

      testData.order1 = createdOrder;

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'payment_method_id' é um campo obrigatório.",
        action: "Corrija os dados enviados e tente novamente.",
        name: "ValidationError",
        statusCode: 400,
      });
    });

    test("sem id do método de pagamento", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({});

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            token: "df650dd38769c9dfacb458222d5292ee",
            issuer_id: "24",
            payer: {
              email: "user1@teste.com",
              identification: {
                type: "CPF",
                number: "12345678909",
              },
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'payment_method_id' é um campo obrigatório.",
        action: "Corrija os dados enviados e tente novamente.",
        name: "ValidationError",
        statusCode: 400,
      });
    });

    test("sem objeto do pagador", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({});

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            token: "df650dd38769c9dfacb458222d5292ee",
            issuer_id: "24",
            payment_method_id: "pix",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'payer' é um campo obrigatório.",
        action: "Corrija os dados enviados e tente novamente.",
        name: "ValidationError",
        statusCode: 400,
      });
    });

    test("sem email do pagador", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({});

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            token: "df650dd38769c9dfacb458222d5292ee",
            issuer_id: "24",
            payment_method_id: "pix",
            payer: {
              first_name: "User",
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'email' é um campo obrigatório.",
        action: "Corrija os dados enviados e tente novamente.",
        name: "ValidationError",
        statusCode: 400,
      });
    });

    test("com id de um método de pagamento inexistente ou indisponível", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({});

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            token: "df650dd38769c9dfacb458222d5292ee",
            issuer_id: "24",
            payment_method_id: "dinheiro",
            payer: {
              first_name: "User",
              email: "user1@teste.com",
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message:
          "O método de pagamento escolhido está indisponível ou não existe.",
        action: "Inicie o pagamento com outro método de pagamento.",
        name: "ValidationError",
        statusCode: 422,
      });
    });

    // Como não temos testes com cliente, não conseguimos gerar tokens válidos para cartão
    test("com card token incorreto", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({});

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            token: "df650dd38769c9dfacb458222d5292ee",
            issuer_id: "24",
            payment_method_id: "master",
            payer: {
              first_name: "User",
              email: "user1@teste.com",
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(503);
      expect(responseBody.error.message).toEqual(
        "Não foi possível processar seu pagamento.",
      );
      expect(
        responseBody.error.action.includes(
          "Entre em contato com o suporte informado o id",
        ),
      ).toEqual(true);
      expect(responseBody.error.name).toEqual("ServiceError");
      expect(responseBody.error.statusCode).toEqual(503);
    });

    test("com pagamento que excede o valor permitido pelo meio de pagamento", async () => {
      //Rejeitado por ser API de testes
      const createdOrder = await orchestrator.orders.createNewOrder({
        amount: 3500,
      });

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            payment_method_id: "pec",
            payer: {
              first_name: "User",
              last_name: "Test",
              email: "user2@teste.com",
              identification: {
                type: "CPF",
                number: "12345678909",
              },
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message: "Esse método de pagamento não aceita esse valor de pagamento",
        action: "Tente utilizar outro método de pagamento",
        statusCode: 422,
        name: "ValidationError",
      });
    });

    test("com pagamento de um pedido expirado", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({
        expires_at: new Date(),
      });

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            payment_method_id: "pix",
            payer: {
              first_name: "User",
              email: "user2@teste.com",
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message: "Esse pedido não aceita mais pagamentos.",
        action:
          "Entre em contato com o suporte caso acredite que isso seja um erro.",
        statusCode: 422,
        name: "ValidationError",
      });
    });

    test("com pagamento de um pedido encerrado", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({
        closed_at: new Date(),
      });

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            payment_method_id: "pix",
            payer: {
              first_name: "User",
              email: "user2@teste.com",
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message: "Esse pedido não aceita mais pagamentos.",
        action:
          "Entre em contato com o suporte caso acredite que isso seja um erro.",
        statusCode: 422,
        name: "ValidationError",
      });
    });
  });

  describe("Usuário anônimo bem intencionado", () => {
    test("com pagamento por pix válido", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({});

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            payment_method_id: "pix",
            payer: {
              first_name: "User",
              email: "user2@teste.com",
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(201);
      expect(responseBody).toEqual({
        additional_fee_amount: "0.00",
        approved_at: null,
        cause: null,
        created_at: responseBody.created_at,
        id: responseBody.id,
        installments: 1,
        mercado_pago_id: responseBody.mercado_pago_id,
        order_id: createdOrder.id,
        payer_email: responseBody.payer_email,
        payment_method_id: "pix",
        payment_type_id: "bank_transfer",
        status: "pending",
        total_paid_amount: null,
        transaction_amount: createdOrder.amount,
        updated_at: responseBody.updated_at,
      });
    });

    test("com pagamento por lotérica válido", async () => {
      //Rejeitado por ser API de testes
      const createdOrder = await orchestrator.orders.createNewOrder({
        amount: 500,
      });

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            payment_method_id: "pec",
            payer: {
              first_name: "User",
              last_name: "Test",
              email: "user2@teste.com",
              identification: {
                type: "CPF",
                number: "12345678909",
              },
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(201);
      expect(responseBody).toEqual({
        additional_fee_amount: "3.50",
        approved_at: null,
        cause: null,
        created_at: responseBody.created_at,
        id: responseBody.id,
        installments: 1,
        mercado_pago_id: responseBody.mercado_pago_id,
        order_id: createdOrder.id,
        payer_email: responseBody.payer_email,
        payment_method_id: "pec",
        payment_type_id: "ticket",
        status: "rejected",
        total_paid_amount: null,
        transaction_amount: responseBody.transaction_amount,
        updated_at: responseBody.updated_at,
      });
    });
  });
});
