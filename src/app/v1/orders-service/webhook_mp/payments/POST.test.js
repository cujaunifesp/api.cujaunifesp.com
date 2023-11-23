import orchestrator from "utils/orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

describe("POST /v1/orders-service/webhook_mp/payments", () => {
  describe("Simulando o mercado pago", () => {
    test("com um pagamento não registrado no banco de dados", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/webhook_mp/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            id: 12345,
            live_mode: true,
            type: "payment",
            date_created: "2015-03-25T10:04:58.396-04:00",
            user_id: 44444,
            api_version: "v1",
            action: "payment.created",
            data: {
              id: "999999999",
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(500);
    });

    test("com um pagamento válido", async () => {
      const createdOrder = await orchestrator.orders.createNewOrder({
        amount: 200,
      });

      const responsePayment = await fetch(
        `${orchestrator.host}/v1/orders-service/orders/${createdOrder.id}/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            payment_method_id: "pix",
            payer: {
              first_name: "User",
              email: "user1@teste.com",
            },
          }),
        },
      );

      const createdPayment = await responsePayment.json();

      const response = await fetch(
        `${orchestrator.host}/v1/orders-service/webhook_mp/payments`,
        {
          method: "POST",
          body: JSON.stringify({
            id: 12345,
            live_mode: true,
            type: "payment",
            date_created: new Date().toISOString(),
            user_id: 44444,
            api_version: "v1",
            action: "payment.updated",
            data: {
              id: createdPayment.mercado_pago_id.toString(),
            },
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(201);
    });
  });
});
