import authOrchestrator from "utils/tests-orchestration/auth-orchestrator";
import orchestrator from "utils/tests-orchestration/orchestrator";
import selectionOrchestrator from "utils/tests-orchestration/selection-orchestrator";

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
                socioeconomic_question_option_id:
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

  describe("Usuário autenticado 'bem intencionado e instruído'", () => {
    const userTestingData = {
      selection: [],
      group: [],
      application: [],
      question: [],
      options: [],
    };

    test("com apenas uma resposta", async () => {
      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        email: "user@teste.com",
        role: "visitor",
      });

      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        title: "Processo Seletivo de Exemplo",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: date,
      });

      const createdGroup = await selectionOrchestrator.createNewSelectionGroup({
        title: "Reserva de Vagas - PPI",
        code: "T1",
        selection_id: createdSelection.id,
      });

      const createdQuestion =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdOption =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestion.id,
        });

      const createdApplication =
        await selectionOrchestrator.createNewApplication({
          email: "user@teste.com",
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
                value: "Alternativa A",
                socioeconomic_question_option_id: createdOption.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(201);
      expect(responseBody.length).toEqual(1);
      expect(responseBody[0]).toEqual({
        id: responseBody[0].id,
        value: "Alternativa A",
        socioeconomic_question_option_id: createdOption.id,
        application_id: createdApplication.id,
        created_at: responseBody[0].created_at,
      });

      userTestingData.selection[0] = createdSelection;
      userTestingData.group[0] = createdGroup;
      userTestingData.application[0] = createdApplication;
      userTestingData.question[0] = createdQuestion;
      userTestingData.options[0] = createdOption;
      userTestingData.token = userToken;
    });

    test("com mais de uma resposta", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdQuestion1 =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Essa é a pergunta 2[1]",
          number: 2,
          selection_id: userTestingData.selection[0].id,
        });

      const createdQuestion2 =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Essa é a pergunta 3[2]",
          number: 2,
          selection_id: userTestingData.selection[0].id,
        });

      const createdOption1 =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestion1.id,
        });

      const createdOption2 =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestion2.id,
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userTestingData.token}` },
          body: JSON.stringify({
            application_id: userTestingData.application[0].id,
            answers: [
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: createdOption1.id,
              },
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: createdOption2.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(201);
      expect(responseBody.length).toEqual(2);
      expect(responseBody[0]).toEqual({
        id: responseBody[0].id,
        value: "Alternativa A",
        socioeconomic_question_option_id: createdOption1.id,
        application_id: userTestingData.application[0].id,
        created_at: responseBody[0].created_at,
      });

      expect(responseBody[1]).toEqual({
        id: responseBody[1].id,
        value: "Alternativa A",
        socioeconomic_question_option_id: createdOption2.id,
        application_id: userTestingData.application[0].id,
        created_at: responseBody[1].created_at,
      });
    });
  });

  describe("Usuário autenticado 'mal intencionado'", () => {
    const userTestingData = {
      selection: [],
      group: [],
      application: [],
      question: [],
      options: [],
    };

    test("com inscrição de outra pessoa", async () => {
      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        email: "user2@teste.com",
        role: "visitor",
      });

      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        title: "Processo Seletivo de Exemplo 2",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: date,
      });

      const createdGroup = await selectionOrchestrator.createNewSelectionGroup({
        title: "Reserva de Vagas - PPI",
        code: "T1",
        selection_id: createdSelection.id,
      });

      const createdQuestion =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdOption =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestion.id,
        });

      const createdApplication =
        await selectionOrchestrator.createNewApplication({
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
                value: "Alternativa A",
                socioeconomic_question_option_id: createdOption.id,
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

      userTestingData.selection[0] = createdSelection;
      userTestingData.group[0] = createdGroup;
      userTestingData.question[0] = createdQuestion;
      userTestingData.options[0] = createdOption;
      userTestingData.token = userToken;
    });

    test("com processo seletivo sem inscrições abertas", async () => {
      const userToken = authOrchestrator.createUserToken({
        method: "email_verification",
        email: "user2@teste.com",
        role: "visitor",
      });

      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        title: "Processo Seletivo Fechado",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: date,
      });

      const createdGroup = await selectionOrchestrator.createNewSelectionGroup({
        title: "Um grupo qualquer",
        code: "T?",
        selection_id: createdSelection.id,
      });

      const createdQuestion =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdOption =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestion.id,
        });

      const createdApplication =
        await selectionOrchestrator.createNewApplication({
          email: "user2@teste.com",
          selection_id: createdSelection.id,
          selected_groups_ids: [createdGroup.id],
        });

      await selectionOrchestrator.closeSelectionApplications(
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
                value: "Alternativa A",
                socioeconomic_question_option_id: createdOption.id,
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

    test("com respostas duplicadas", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdApplication =
        await selectionOrchestrator.createNewApplication({
          email: "user2@teste.com",
          selection_id: userTestingData.selection[0].id,
          selected_groups_ids: [userTestingData.group[0].id],
          cpf: "111.111.111-11",
        });

      userTestingData.application.push(createdApplication);

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userTestingData.token}` },
          body: JSON.stringify({
            application_id: createdApplication.id,
            answers: [
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: userTestingData.options[0].id,
              },
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: userTestingData.options[0].id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message: "Você tentou responder duas vezes a mesma questão.",
        action: "Tente enviar apenas uma resposta por questão.",
        name: "ValidationError",
        statusCode: 422,
      });
    });

    test("respondendo uma questão inexistente", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdQuestion =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta nova",
          number: 1,
          selection_id: userTestingData.selection[0].id,
        });

      const createdOption =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestion.id,
        });

      userTestingData.question.push(createdQuestion);
      userTestingData.options.push(createdOption);

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userTestingData.token}` },
          body: JSON.stringify({
            application_id: userTestingData.application[0].id,
            answers: [
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: userTestingData.options[0].id,
              },
              {
                value: "Alternativa A",
                socioeconomic_question_option_id:
                  "03b16fbc-df8d-4a4d-9071-41c2a47fa001",
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message:
          "A questão que você está tentando responder não corresponte ao processo seletivo de sua inscrição",
        action: "Tente responder o formulário da sua inscrição",
        name: "ValidationError",
        statusCode: 422,
      });
    });

    test("respondendo uma questão de outro processo seletivo", async () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);

      const createdSelection = await selectionOrchestrator.createNewSelection({
        title: "Processo Seletivo do espertinho",
        published_at: new Date(),
        applications_start_date: new Date(),
        applications_end_date: date,
      });

      const createdQuestion =
        await selectionOrchestrator.createNewSocioeconomicQuestion({
          text: "Essa é uma pergunta de outro processo seletivo",
          number: 1,
          selection_id: createdSelection.id,
        });

      const createdOption =
        await selectionOrchestrator.createNewSocioeconomicQuestionOption({
          label: "Alternativa A",
          number: 1,
          socioeconomic_question_id: createdQuestion.id,
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userTestingData.token}` },
          body: JSON.stringify({
            application_id: userTestingData.application[0].id,
            answers: [
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: createdOption.id,
              },
            ],
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(422);
      expect(responseBody.error).toEqual({
        message:
          "A questão que você está tentando responder não corresponte ao processo seletivo de sua inscrição",
        action: "Tente responder o formulário da sua inscrição",
        name: "ValidationError",
        statusCode: 422,
      });
    });

    test("respondendo uma questão que ele já respondeu antes", async () => {
      await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userTestingData.token}` },
          body: JSON.stringify({
            application_id: userTestingData.application[0].id,
            answers: [
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: userTestingData.options[0].id,
              },
            ],
          }),
        },
      );

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userTestingData.token}` },
          body: JSON.stringify({
            application_id: userTestingData.application[0].id,
            answers: [
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: userTestingData.options[0].id,
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

    test("respondendo 2 questões (com uma delas já respondida antes)", async () => {
      await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userTestingData.token}` },
          body: JSON.stringify({
            application_id: userTestingData.application[0].id,
            answers: [
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: userTestingData.options[0].id,
              },
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: userTestingData.options[1].id,
              },
            ],
          }),
        },
      );

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/socioeconomic/answers`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userTestingData.token}` },
          body: JSON.stringify({
            application_id: userTestingData.application[0].id,
            answers: [
              {
                value: "Alternativa A",
                socioeconomic_question_option_id: userTestingData.options[0].id,
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
  });
});
