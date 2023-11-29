import application from "src/models/application";
import authorizator from "src/services/auth/authorizator";
import selectionQueryService from "src/services/selection/selection-query";
import socioeconomicFormService from "src/services/selection/socioeconomic-form";
import controller from "utils/controller";
import validator from "utils/validator";

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const secureRequestBody = validator.run(requestBody, {
      application_id: {
        required: true,
        type: validator.types.UUID,
      },
      answers: {
        required: true,
        min: 1,
        type: validator.types.ARRAY_OF_OBJECTS,
        objectSchema: {
          value: validator.types.STRING_TRIM,
          socioeconomic_question_id: validator.types.UUID,
        },
      },
    });

    await authorizator
      .request(request.headers)
      .can("POST:SOCIOECONOMIC_ANSWERS", {
        resource: secureRequestBody,
      });

    const createdAnswers =
      await socioeconomicFormService.submitSocioeconomicAnswersForApplication({
        applicationId: secureRequestBody.application_id,
        answersToSave: secureRequestBody.answers,
      });

    return controller.response.ok(201, [...createdAnswers]);
  } catch (error) {
    console.error(error);
    return controller.response.error(error);
  }
}

export async function GET(request) {
  try {
    const applicationId = request.nextUrl.searchParams.get("application_id");

    const requestedApplication =
      await controller.request.getResourceByRequestParams({
        idParam: applicationId,
        resourceModel: application,
      });

    await authorizator
      .request(request.headers)
      .can("GET:APPLICATIONS_ANSWERS", {
        resource: requestedApplication,
      });

    const applicationAnswers =
      await selectionQueryService.getApplicationAnswers(applicationId);

    return controller.response.ok(200, [...applicationAnswers]);
  } catch (error) {
    return controller.response.error(error);
  }
}
