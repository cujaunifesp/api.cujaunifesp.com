import authorizator from "src/services/auth/authorizator";
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
