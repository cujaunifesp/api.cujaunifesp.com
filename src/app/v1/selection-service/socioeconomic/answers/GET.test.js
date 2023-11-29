import orchestrator from "utils/orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

describe("GET /v1/selection-service/socioeconomic/answers", () => {
  describe("Usuário anônimo", () => {
    test("sem application_id", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(404);
      expect(responseBody.error).toEqual({
        message: "Não foi possível encontrar este recurso.",
        action:
          "Verifique se o recurso que você está tentando acessar está correto.",
        statusCode: 404,
        name: "NotFoundError",
      });
    });

    test("com application_id inexistente", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers?application_id=481563ee-2a3c-4f3d-b7f0-8e4f3de99223`,
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(404);
      expect(responseBody.error).toEqual({
        message: "Não foi possível encontrar este recurso.",
        action:
          "Verifique se o recurso que você está tentando acessar está correto.",
        statusCode: 404,
        name: "NotFoundError",
      });
    });

    test("com application_id existente", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await orchestrator.selection.createNewSelection({
        title: "Processo Seletivo",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: date,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          title: "Reserva de Vagas - PPI",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const createdQuestionInputText =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de texto",
          type: "text",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "no_token_user@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers?application_id=${createdApplication.id}`,
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
  });

  describe("Usuário autenticado mal intencionado", () => {
    test("com application de outro usuário", async () => {
      const userToken = orchestrator.auth.createUserToken({
        method: "email_verification",
        email: "user1@teste.com",
      });

      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await orchestrator.selection.createNewSelection({
        title: "Processo Seletivo",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: date,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          title: "Reserva de Vagas - PPI",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const createdQuestionInputText =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de texto",
          type: "text",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "another-user@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers?application_id=${createdApplication.id}`,
        { headers: { Authorization: `Bearer ${userToken}` } },
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
    test("com 3 perguntas respondidas", async () => {
      const userToken = orchestrator.auth.createUserToken({
        method: "email_verification",
        email: "user1@teste.com",
      });

      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await orchestrator.selection.createNewSelection({
        title: "Processo Seletivo",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: date,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          title: "Reserva de Vagas - PPI",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const createdQuestionMultipleChoice =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de multipla escolha",
          type: "multiple_choice",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdQuestionInputText =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de texto",
          type: "text",
          number: 2,
          selection_id: createdSelection.id,
        });

      const createdQuestionInputNumber =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de número",
          type: "number",
          number: 3,
          selection_id: createdSelection.id,
        });

      const createdOption =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestionMultipleChoice.id,
        });

      const createdOption2 =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "Alternativa B",
          number: 2,
          socioeconomic_question_id: createdQuestionMultipleChoice.id,
        });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user1@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const responseAnswer = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: createdOption.id,
                socioeconomic_question_id: createdQuestionMultipleChoice.id,
              },
              {
                value: "254",
                socioeconomic_question_id: createdQuestionInputNumber.id,
              },
              {
                value: "Resposta em texto",
                socioeconomic_question_id: createdQuestionInputText.id,
              },
            ],
          }),
        },
      );

      const responseAnswerBody = await responseAnswer.json();

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers?application_id=${createdApplication.id}`,
        { headers: { Authorization: `Bearer ${userToken}` } },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual([
        {
          application_id: createdApplication.id,
          created_at: responseBody[0].created_at,
          id: responseBody[0].id,
          socioeconomic_question_id: createdQuestionMultipleChoice.id,
          value: createdOption.id,
          question_number: 1,
          question_text: "Essa é uma pergunta de multipla escolha",
          question_type: "multiple_choice",
          options: [
            {
              id: createdOption.id,
              label: createdOption.label,
              number: createdOption.number,
            },
            {
              id: createdOption2.id,
              label: createdOption2.label,
              number: createdOption2.number,
            },
          ],
        },
        {
          application_id: createdApplication.id,
          created_at: responseBody[1].created_at,
          id: responseBody[1].id,
          socioeconomic_question_id: createdQuestionInputText.id,
          value: "Resposta em texto",
          question_number: 2,
          question_text: "Essa é uma pergunta de texto",
          question_type: "text",
          options: [],
        },
        {
          application_id: createdApplication.id,
          created_at: responseBody[2].created_at,
          id: responseBody[2].id,
          socioeconomic_question_id: createdQuestionInputNumber.id,
          value: "254",
          question_number: 3,
          question_text: "Essa é uma pergunta de número",
          question_type: "number",
          options: [],
        },
      ]);
    });

    test("com 3 perguntas respondidas por dois usuários", async () => {
      const userToken = orchestrator.auth.createUserToken({
        method: "email_verification",
        email: "user2@teste.com",
      });

      const userToken2 = orchestrator.auth.createUserToken({
        method: "email_verification",
        email: "user3@teste.com",
      });

      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await orchestrator.selection.createNewSelection({
        title: "Processo Seletivo",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: date,
      });

      const createdGroup = await orchestrator.selection.createNewSelectionGroup(
        {
          title: "Reserva de Vagas - PPI",
          code: "T1",
          selection_id: createdSelection.id,
        },
      );

      const createdQuestionMultipleChoice =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de multipla escolha",
          type: "multiple_choice",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdQuestionInputText =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de texto",
          type: "text",
          number: 2,
          selection_id: createdSelection.id,
        });

      const createdQuestionInputNumber =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de número",
          type: "number",
          number: 3,
          selection_id: createdSelection.id,
        });

      const createdOption =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestionMultipleChoice.id,
        });

      const createdOption2 =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "Alternativa B",
          number: 2,
          socioeconomic_question_id: createdQuestionMultipleChoice.id,
        });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user2@teste.com",
          cpf: "222.222.222-22",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const createdApplication2 =
        await orchestrator.selection.createNewApplication({
          email: "user3@teste.com",
          cpf: "333.333.333-33",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: createdOption.id,
                socioeconomic_question_id: createdQuestionMultipleChoice.id,
              },
              {
                value: "254",
                socioeconomic_question_id: createdQuestionInputNumber.id,
              },
              {
                value: "Resposta em texto",
                socioeconomic_question_id: createdQuestionInputText.id,
              },
            ],
          }),
        },
      );

      await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken2}` },
          body: JSON.stringify({
            application_id: createdApplication2.id,
            answers: [
              {
                value: createdOption.id,
                socioeconomic_question_id: createdQuestionMultipleChoice.id,
              },
              {
                value: "254",
                socioeconomic_question_id: createdQuestionInputNumber.id,
              },
              {
                value: "Resposta em texto",
                socioeconomic_question_id: createdQuestionInputText.id,
              },
            ],
          }),
        },
      );

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers?application_id=${createdApplication.id}`,
        { headers: { Authorization: `Bearer ${userToken}` } },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual([
        {
          application_id: createdApplication.id,
          created_at: responseBody[0].created_at,
          id: responseBody[0].id,
          socioeconomic_question_id: createdQuestionMultipleChoice.id,
          value: createdOption.id,
          question_number: 1,
          question_text: "Essa é uma pergunta de multipla escolha",
          question_type: "multiple_choice",
          options: [
            {
              id: createdOption.id,
              label: createdOption.label,
              number: createdOption.number,
            },
            {
              id: createdOption2.id,
              label: createdOption2.label,
              number: createdOption2.number,
            },
          ],
        },
        {
          application_id: createdApplication.id,
          created_at: responseBody[1].created_at,
          id: responseBody[1].id,
          socioeconomic_question_id: createdQuestionInputText.id,
          value: "Resposta em texto",
          question_number: 2,
          question_text: "Essa é uma pergunta de texto",
          question_type: "text",
          options: [],
        },
        {
          application_id: createdApplication.id,
          created_at: responseBody[2].created_at,
          id: responseBody[2].id,
          socioeconomic_question_id: createdQuestionInputNumber.id,
          value: "254",
          question_number: 3,
          question_text: "Essa é uma pergunta de número",
          question_type: "number",
          options: [],
        },
      ]);
    });
  });
});
