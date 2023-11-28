import orchestrator from "utils/orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

describe("GET /v1/selection-service/socioeconomic", () => {
  describe("Usuário anônimo", () => {
    test("com id inexistente", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic?selection_id=03b16fbc-df8d-4a4d-9071-41c2a47fa001`,
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(401);
      expect(responseBody.error).toEqual({
        message: "Usuário não autenticado.",
        action:
          "Verifique se você está autenticado com uma sessão ativa e tente novamente.",
        statusCode: 401,
        name: "UnauthorizedError",
      });
    });

    test("com id no formato errado", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic?selection_id=12345`,
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'selection_id' deve possuir um token UUID na versão 4.",
        action: "Corrija os dados enviados e tente novamente.",
        statusCode: 400,
        name: "ValidationError",
      });
    });
  });

  describe("Usuário autenticado", () => {
    test("sem nenhuma pergunta no banco de dados", async () => {
      const userToken = orchestrator.auth.createUserToken({
        method: "email_verification",
        email: "teste@teste.com",
        role: "visitor",
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic?selection_id=03b16fbc-df8d-4a4d-9071-41c2a47fa001`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(404);
      expect(responseBody).toEqual([]);
    });

    test("com uma pergunta de múltipla escolha no banco", async () => {
      const userToken = orchestrator.auth.createUserToken({
        method: "email_verification",
        email: "teste@teste.com",
        role: "visitor",
      });

      const createdSelection = await orchestrator.selection.createNewSelection({
        title: "Processo Seletivo 2000",
      });

      const createdQuestion =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Qual é a resposta correta?",
          selection_id: createdSelection.id,
          type: "multiple_choice",
          number: 1,
        });

      const createdOptionA =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "A",
          socioeconomic_question_id: createdQuestion.id,
          number: 1,
        });

      const createdOptionB =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "B",
          socioeconomic_question_id: createdQuestion.id,
          number: 2,
        });

      const createdOptionC =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "C",
          socioeconomic_question_id: createdQuestion.id,
          number: 3,
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic?selection_id=${createdSelection.id}`,
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
        id: createdQuestion.id,
        text: createdQuestion.text,
        description: createdQuestion.description,
        number: createdQuestion.number,
        type: createdQuestion.type,
        options: [
          { ...createdOptionA, socioeconomic_question_id: undefined },
          { ...createdOptionB, socioeconomic_question_id: undefined },
          { ...createdOptionC, socioeconomic_question_id: undefined },
        ],
      });
    });

    test("com 2 perguntas do mesmo processo seletivo (uma de texto)", async () => {
      const userToken = orchestrator.auth.createUserToken({
        method: "email_verification",
        email: "teste@teste.com",
        role: "visitor",
      });

      const createdSelection = await orchestrator.selection.createNewSelection({
        title: "Processo Seletivo 2000",
      });

      const createdQuestion =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Qual é a resposta correta?",
          selection_id: createdSelection.id,
          number: 1,
          type: "multiple_choice",
        });

      const createdQuestion2 =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Qual é a resposta correta?",
          selection_id: createdSelection.id,
          number: 2,
          type: "text",
        });

      const createdOptionA =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "A",
          socioeconomic_question_id: createdQuestion.id,
          number: 1,
        });

      const createdOptionB =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "B",
          socioeconomic_question_id: createdQuestion.id,
          number: 2,
        });

      const createdOptionC =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "C",
          socioeconomic_question_id: createdQuestion.id,
          number: 3,
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic?selection_id=${createdSelection.id}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody.length).toEqual(2);

      expect(responseBody[0].id).toEqual(createdQuestion.id);
      expect(responseBody[0].text).toEqual(createdQuestion.text);
      expect(responseBody[0].number).toEqual(createdQuestion.number);
      expect(responseBody[0].description).toEqual(createdQuestion.description);
      expect(responseBody[0].options).toEqual([
        { ...createdOptionA, socioeconomic_question_id: undefined },
        { ...createdOptionB, socioeconomic_question_id: undefined },
        { ...createdOptionC, socioeconomic_question_id: undefined },
      ]);

      expect(responseBody[1].id).toEqual(createdQuestion2.id);
      expect(responseBody[1].text).toEqual(createdQuestion2.text);
      expect(responseBody[1].number).toEqual(createdQuestion2.number);
      expect(responseBody[1].description).toEqual(createdQuestion2.description);
      expect(responseBody[1].options.length).toEqual(0);
    });
  });
});
