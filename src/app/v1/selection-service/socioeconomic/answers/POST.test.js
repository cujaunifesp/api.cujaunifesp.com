import orchestrator from "utils/orchestrator";

beforeAll(async () => {
  await orchestrator.refreshDatabase();
});

describe("POST /v1/selection-service/socioeconomic/answers", () => {
  describe("Usuário anônimo", () => {
    test("com request em branco", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          body: JSON.stringify({}),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'application_id' é um campo obrigatório.",
        action: "Corrija os dados enviados e tente novamente.",
        statusCode: 400,
        name: "ValidationError",
      });
    });

    test("com um array em branco em answers", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          body: JSON.stringify({
            application_id: "fb17530b-e8fc-4ca1-a57e-3e3608b87d09",
            answers: [],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'answers' deve conter pelo menos 1 item.",
        action: "Corrija os dados enviados e tente novamente.",
        statusCode: 400,
        name: "ValidationError",
      });
    });

    test("com propriedades proibidas dentro do objeto de answers", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          body: JSON.stringify({
            application_id: "fb17530b-e8fc-4ca1-a57e-3e3608b87d09",
            answers: [
              {
                value: "R$12.000",
                socioeconomic_question_option_id:
                  "fb17530b-e8fc-4ca1-a57e-3e3608b87d09",
                other: "Valor não permitido",
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "O objeto enviado possui valores não permitidos",
        action: "Corrija os dados enviados e tente novamente.",
        statusCode: 400,
        name: "ValidationError",
      });
    });

    test("com valores inválidos dentro do objeto de answers", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          body: JSON.stringify({
            application_id: "fb17530b-e8fc-4ca1-a57e-3e3608b87d09",
            answers: [
              {
                value: "",
                socioeconomic_question_option_id:
                  "fb17530b-e8fc-4ca1-a57e-3e3608b87d09",
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'value' não pode estar em branco.",
        action: "Corrija os dados enviados e tente novamente.",
        statusCode: 400,
        name: "ValidationError",
      });
    });

    test("com request completa", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          body: JSON.stringify({
            application_id: "fb17530b-e8fc-4ca1-a57e-3e3608b87d09",
            answers: [
              {
                value: "R$12.000",
                socioeconomic_question_id:
                  "fb17530b-e8fc-4ca1-a57e-3e3608b87d09",
              },
            ],
          }),
        },
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
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: "Essa é uma resposta de texto",
                socioeconomic_question_id: createdQuestionInputText.id,
              },
            ],
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

    /*
    test("em processo seletivo com as inscrições fechadas", async () => {
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
          email: "user1@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      await orchestrator.selection.closeSelectionApplications(
        createdSelection.id,
      );

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: "Essa é uma resposta de texto",
                socioeconomic_question_id: createdQuestionInputText.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message: "As inscrições para esse processo seletivo não estão abertas",
        action: "Confira as datas para inscrição através do site",
        name: "ValidationError",
        statusCode: 422,
      });
    });
    */

    test("com duas respostas para a mesma questão", async () => {
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
          email: "user1@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: "Essa é uma resposta de texto",
                socioeconomic_question_id: createdQuestionInputText.id,
              },
              {
                value: "Essa é a outra resposta para a mesma pergunta",
                socioeconomic_question_id: createdQuestionInputText.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message: "Você enviou duas respostas para a mesma questão.",
        action: "Tente enviar apenas uma resposta por questão.",
        name: "ValidationError",
        statusCode: 422,
      });
    });

    test("respondendo questão de outro processo seletivo", async () => {
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

      const createdSelection2 = await orchestrator.selection.createNewSelection(
        {
          title: "Processo Seletivo",
          published_at: new Date(),
          applications_start_date: new Date(),
          applications_end_date: date,
        },
      );

      const createdQuestionInputText2 =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de texto do segundo processo seletivo",
          type: "text",
          number: 1,
          selection_id: createdSelection2.id,
        });

      const createdQuestionInputText =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de texto",
          type: "text",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user1@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: "Essa é uma resposta de texto",
                socioeconomic_question_id: createdQuestionInputText2.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message:
          "A questão que você está tentando responder não corresponte ao processo seletivo de sua inscrição.",
        action: "Responda apenas o formulário referente a sua inscrição.",
        name: "ValidationError",
        statusCode: 422,
      });
    });

    test("respondendo questão já respondida", async () => {
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
          email: "user1@teste.com",
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
                value: "Essa é uma resposta de texto pela primeira vez",
                socioeconomic_question_id: createdQuestionInputText.id,
              },
            ],
          }),
        },
      );

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: "Essa é uma resposta de texto pela segunda vez",
                socioeconomic_question_id: createdQuestionInputText.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message:
          "Você está tentando responder uma questão que você já respondeu antes.",
        action:
          "Entre em contato com o suporte se acreditar que isso é um erro.",
        name: "ValidationError",
        statusCode: 422,
      });
    });

    test("respondendo uma questão de multiple_choice com texto simples", async () => {
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

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: "Respondendo com texto (tipo inválido)",
                socioeconomic_question_id: createdQuestionMultipleChoice.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'answerValue' deve possuir um token UUID na versão 4.",
        action: "Corrija os dados enviados e tente novamente.",
        name: "ValidationError",
        statusCode: 400,
      });
    });

    test("respondendo uma questão de number com texto sem número", async () => {
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

      const createdQuestionInputNumber =
        await orchestrator.selection.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de number",
          type: "number",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user1@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: "Respondendo com texto (tipo inválido)",
                socioeconomic_question_id: createdQuestionInputNumber.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message:
          "'answerValue' deve ser um número e não deve ter casas decimais.",
        action: "Corrija os dados enviados e tente novamente.",
        name: "ValidationError",
        statusCode: 400,
      });
    });

    test("respondendo uma questão de text com um id de opção", async () => {
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
          text: "Essa é uma pergunta de multipla escolha",
          type: "text",
          number: 1,
          selection_id: createdSelection.id,
        });

      //Estamos criando opções de forma errada para uma questão type "text" para forçar teste
      const createdOption =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestionInputText.id,
        });

      const createdOption2 =
        await orchestrator.selection.createNewSocioeconomicQuestionOption({
          label: "Alternativa B",
          number: 2,
          socioeconomic_question_id: createdQuestionInputText.id,
        });

      const createdApplication =
        await orchestrator.selection.createNewApplication({
          email: "user1@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userToken}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: createdOption.id,
                socioeconomic_question_id: createdQuestionInputText.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(400);
      expect(responseBody.error).toEqual({
        message: "'answerValue' não pode ser do tipo UUID.",
        action: "Corrija os dados enviados e tente novamente.",
        name: "ValidationError",
        statusCode: 400,
      });
    });
  });

  describe("Usuário autenticado bem intencionado", () => {
    test("respondendo 3 perguntas de forma correta", async () => {
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

      const response = await fetch(
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

      const responseBody = await response.json();

      expect(response.status).toEqual(201);
      expect(responseBody).toEqual([
        {
          application_id: createdApplication.id,
          created_at: responseBody[0].created_at,
          id: responseBody[0].id,
          socioeconomic_question_id: createdQuestionMultipleChoice.id,
          value: createdOption.id,
        },
        {
          application_id: createdApplication.id,
          created_at: responseBody[1].created_at,
          id: responseBody[1].id,
          socioeconomic_question_id: createdQuestionInputNumber.id,
          value: "254",
        },
        {
          application_id: createdApplication.id,
          created_at: responseBody[2].created_at,
          id: responseBody[2].id,
          socioeconomic_question_id: createdQuestionInputText.id,
          value: "Resposta em texto",
        },
      ]);
    });
  });
});
