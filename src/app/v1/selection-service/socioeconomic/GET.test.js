import authOrchestrator from "utils/tests-orchestration/auth-orchestrator";
import orchestrator from "utils/tests-orchestration/orchestrator";
import selectionOrchestrator from "utils/tests-orchestration/selection-orchestrator";

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
      const userToken = authOrchestrator.createUserToken({
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
      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        email: "teste@teste.com",
        role: "visitor",
      });

      const createdSelection = await selectionOrchestrator.createNewSelection({
        title: "Processo Seletivo 2000",
      });

      const createdQuestion =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Qual é a resposta correta?",
          selection_id: createdSelection.id,
          number: 1,
        });

      const createdOptionA =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "A",
          type: "multiple_choice",
          socioeconomic_question_id: createdQuestion.id,
          number: 1,
        });

      const createdOptionB =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "B",
          type: "multiple_choice",
          socioeconomic_question_id: createdQuestion.id,
          number: 2,
        });

      const createdOptionC =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "C",
          type: "multiple_choice",
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
        number: createdQuestion.number,
        options: [
          { ...createdOptionA, socioeconomic_question_id: undefined },
          { ...createdOptionB, socioeconomic_question_id: undefined },
          { ...createdOptionC, socioeconomic_question_id: undefined },
        ],
      });
    });

    test("com 2 perguntas do mesmo processo seletivo", async () => {
      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        email: "teste@teste.com",
        role: "visitor",
      });

      const createdSelection = await selectionOrchestrator.createNewSelection({
        title: "Processo Seletivo 2000",
      });

      const createdQuestion =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Qual é a resposta correta?",
          selection_id: createdSelection.id,
          number: 1,
        });

      const createdQuestion2 =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Qual é a resposta correta?",
          selection_id: createdSelection.id,
          number: 2,
        });

      const createdOptionA =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "A",
          type: "multiple_choice",
          socioeconomic_question_id: createdQuestion.id,
          number: 1,
        });

      const createdOptionB =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "B",
          type: "multiple_choice",
          socioeconomic_question_id: createdQuestion.id,
          number: 2,
        });

      const createdOptionC =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "C",
          type: "multiple_choice",
          socioeconomic_question_id: createdQuestion.id,
          number: 3,
        });

      const createdOptionInput =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "Digite aqui",
          type: "number_input",
          socioeconomic_question_id: createdQuestion2.id,
          number: 1,
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
      expect(responseBody[0].options).toEqual([
        { ...createdOptionA, socioeconomic_question_id: undefined },
        { ...createdOptionB, socioeconomic_question_id: undefined },
        { ...createdOptionC, socioeconomic_question_id: undefined },
      ]);

      expect(responseBody[1].id).toEqual(createdQuestion2.id);
      expect(responseBody[1].text).toEqual(createdQuestion2.text);
      expect(responseBody[1].number).toEqual(createdQuestion2.number);
      expect(responseBody[1].options.length).toEqual(1);
      expect(responseBody[1].options[0]).toEqual({
        ...createdOptionInput,
        socioeconomic_question_id: undefined,
      });
    });
  });
});
