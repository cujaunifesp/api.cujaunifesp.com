import orchestrator from "utils/orchestrator";

describe("GET /v1/orders-service/payments-methods", () => {
  test("Usuário não autenticado", async () => {
    const response = await fetch(
      `${orchestrator.host}/v1/orders-service/payments-methods`,
    );
    const responseBody = await response.json();

    expect(response.status).toEqual(200);
    expect(responseBody.length > 0).toEqual(true);
    expect(responseBody[0]).toEqual({
      additional_payment_method_fee:
        responseBody[0].additional_payment_method_fee,
      max_allowed_amount: responseBody[0].max_allowed_amount,
      min_allowed_amount: responseBody[0].min_allowed_amount,
      name: responseBody[0].name,
      payment_method_id: responseBody[0].payment_method_id,
      payment_type_id: responseBody[0].payment_type_id,
      thumbnail: responseBody[0].thumbnail,
    });
  });
});
