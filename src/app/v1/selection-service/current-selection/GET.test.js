import orchestrator from "utils/tests-orchestration/orchestrator";
import selectionOrchestrator from "utils/tests-orchestration/selection-orchestrator";

describe("GET /v1/selection-service/current-selection", () => {
  describe("Sem etapas", () => {
    beforeAll(async () => {
      await orchestrator.refreshDatabase();
    });

    test("e nenhum processo seletivo", async () => {
      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/current-selection`,
      );
      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual({});
    });

    test("e com 1 processo seletivo (0 publicados)", async () => {
      const createdSelection = await selectionOrchestrator.createNewSelection();

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/current-selection`,
      );
      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual({});
    });

    test("e com 2 processos seletivos (1 publicado)", async () => {
      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/current-selection`,
      );
      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual({
        id: createdSelection.id,
        title: createdSelection.title,
        description: createdSelection.description,
        exam_address: createdSelection.exam_address,
        exam_date: createdSelection.exam_date.toISOString(),
        applications_start_date:
          createdSelection.applications_start_date.toISOString(),
        applications_end_date:
          createdSelection.applications_end_date.toISOString(),
        public_notice_url: createdSelection.public_notice_url,
        application_price: createdSelection.application_price,
        application_limit: createdSelection.application_limit,
        created_at: createdSelection.created_at.toISOString(),
        published_at: createdSelection.published_at.toISOString(),
        updated_at: createdSelection.updated_at.toISOString(),
        steps: [],
      });
    });

    test("e com 3 processos seletivos (2 publicados)", async () => {
      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
      });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/current-selection`,
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual({
        id: createdSelection.id,
        title: createdSelection.title,
        description: createdSelection.description,
        exam_address: createdSelection.exam_address,
        exam_date: createdSelection.exam_date.toISOString(),
        applications_start_date:
          createdSelection.applications_start_date.toISOString(),
        applications_end_date:
          createdSelection.applications_end_date.toISOString(),
        public_notice_url: createdSelection.public_notice_url,
        application_price: createdSelection.application_price,
        application_limit: createdSelection.application_limit,
        created_at: createdSelection.created_at.toISOString(),
        published_at: createdSelection.published_at.toISOString(),
        updated_at: createdSelection.updated_at.toISOString(),
        steps: [],
      });
    });
  });

  describe("Com 3 etapas", () => {
    beforeAll(async () => {
      await orchestrator.refreshDatabase();
    });

    test("e com 1 processo seletivo (0 publicados)", async () => {
      const createdSelection = await selectionOrchestrator.createNewSelection();
      const createdSelectionStep1 =
        await selectionOrchestrator.createNewSelectionStep({
          selection_id: createdSelection.id,
        });
      const createdSelectionStep2 =
        await selectionOrchestrator.createNewSelectionStep({
          selection_id: createdSelection.id,
        });
      const createdSelectionStep3 =
        await selectionOrchestrator.createNewSelectionStep({
          selection_id: createdSelection.id,
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/current-selection`,
      );

      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual({});
    });

    test("e com 2 processos seletivos (1 publicado)", async () => {
      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
      });
      const createdSelectionStep1 =
        await selectionOrchestrator.createNewSelectionStep({
          title: "Etapa 1",
          selection_id: createdSelection.id,
        });
      const createdSelectionStep2 =
        await selectionOrchestrator.createNewSelectionStep({
          title: "Etapa 2",
          selection_id: createdSelection.id,
        });
      const createdSelectionStep3 =
        await selectionOrchestrator.createNewSelectionStep({
          title: "Etapa 3",
          selection_id: createdSelection.id,
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/current-selection`,
      );
      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual({
        id: createdSelection.id,
        title: createdSelection.title,
        description: createdSelection.description,
        exam_address: createdSelection.exam_address,
        exam_date: createdSelection.exam_date.toISOString(),
        applications_start_date:
          createdSelection.applications_start_date.toISOString(),
        applications_end_date:
          createdSelection.applications_end_date.toISOString(),
        public_notice_url: createdSelection.public_notice_url,
        application_price: createdSelection.application_price,
        application_limit: createdSelection.application_limit,
        created_at: createdSelection.created_at.toISOString(),
        published_at: createdSelection.published_at.toISOString(),
        updated_at: createdSelection.updated_at.toISOString(),
        steps: [
          {
            id: createdSelectionStep1.id,
            title: createdSelectionStep1.title,
            date: createdSelectionStep1.date.toISOString(),
          },
          {
            id: createdSelectionStep2.id,
            title: createdSelectionStep2.title,
            date: createdSelectionStep2.date.toISOString(),
          },
          {
            id: createdSelectionStep3.id,
            title: createdSelectionStep3.title,
            date: createdSelectionStep3.date.toISOString(),
          },
        ],
      });
    });

    test("e com 3 processos seletivos (2 publicados)", async () => {
      const createdSelection = await selectionOrchestrator.createNewSelection({
        published_at: new Date(),
      });
      const createdSelectionStep1 =
        await selectionOrchestrator.createNewSelectionStep({
          title: "Etapa 1",
          selection_id: createdSelection.id,
        });
      const createdSelectionStep2 =
        await selectionOrchestrator.createNewSelectionStep({
          title: "Etapa 2",
          selection_id: createdSelection.id,
        });
      const createdSelectionStep3 =
        await selectionOrchestrator.createNewSelectionStep({
          title: "Etapa 3",
          selection_id: createdSelection.id,
        });

      const response = await fetch(
        `${orchestrator.host}/v1/selection-service/current-selection`,
      );
      const responseBody = await response.json();

      expect(response.status).toEqual(200);
      expect(responseBody).toEqual({
        id: createdSelection.id,
        title: createdSelection.title,
        description: createdSelection.description,
        exam_address: createdSelection.exam_address,
        exam_date: createdSelection.exam_date.toISOString(),
        applications_start_date:
          createdSelection.applications_start_date.toISOString(),
        applications_end_date:
          createdSelection.applications_end_date.toISOString(),
        public_notice_url: createdSelection.public_notice_url,
        application_price: createdSelection.application_price,
        application_limit: createdSelection.application_limit,
        created_at: createdSelection.created_at.toISOString(),
        published_at: createdSelection.published_at.toISOString(),
        updated_at: createdSelection.updated_at.toISOString(),
        steps: [
          {
            id: createdSelectionStep1.id,
            title: createdSelectionStep1.title,
            date: createdSelectionStep1.date.toISOString(),
          },
          {
            id: createdSelectionStep2.id,
            title: createdSelectionStep2.title,
            date: createdSelectionStep2.date.toISOString(),
          },
          {
            id: createdSelectionStep3.id,
            title: createdSelectionStep3.title,
            date: createdSelectionStep3.date.toISOString(),
          },
        ],
      });
    });
  });
});
