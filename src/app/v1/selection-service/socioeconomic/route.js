import authorizator from "src/services/auth/authorizator";
import selectionQueryService from "src/services/selection/selection-query";
import controller from "utils/controller";
import validator from "utils/validator";

export async function GET(request) {
  try {
    const selection_id = request.nextUrl.searchParams.get("selection_id");
    const secureParams = validator.run(
      { selection_id },
      {
        selection_id: { required: true, type: validator.types.UUID },
      },
    );

    await authorizator.request(request.headers).can("GET:SOCIOECONOMIC");

    const socioecocomicQuestions =
      await selectionQueryService.getSocioeconomicQuestionsBySelectionId(
        secureParams.selection_id,
      );

    if (socioecocomicQuestions.length === 0) {
      return controller.response.ok(404, []);
    }

    return controller.response.ok(200, socioecocomicQuestions);
  } catch (error) {
    return controller.response.error(error);
  }
}

export const revalidate = 600;
