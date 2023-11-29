import authorizator from "src/services/auth/authorizator";
import applicationsFormService from "src/services/selection/applications-form";
import selectionQueryService from "src/services/selection/selection-query";
import controller from "utils/controller";
import validator from "utils/validator";

const applicationValidationKeys = {
  name: { required: true, type: validator.types.STRING_TRIM },
  social_name: { type: validator.types.STRING_TRIM, allowNull: true },
  email: { required: true, type: validator.types.EMAIL },
  phone: { required: true, max: 50, type: validator.types.STRING_TRIM },
  cpf: { required: true, type: validator.types.STRING_CPF },
  identity_document: {
    required: true,
    max: 50,
    type: validator.types.STRING_TRIM,
  },
  address: { required: true, type: validator.types.STRING_TRIM },
  zip_code: { required: true, max: 16, type: validator.types.STRING_TRIM },
  city: { required: true, max: 64, type: validator.types.STRING_TRIM },
  state: { required: true, max: 64, type: validator.types.STRING_TRIM },
  sabbatarian: { required: true, type: validator.types.BOOLEAN },
  special_assistance: { required: true, type: validator.types.BOOLEAN },
  special_assistance_justification: {
    max: 510,
    type: validator.types.STRING,
    allowNull: true,
  },
  selected_groups_ids: { type: validator.types.ARRAY },
  selection_id: { required: true, type: validator.types.UUID },
};

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const secureRequestBody = validator.run(
      requestBody,
      applicationValidationKeys,
    );

    await authorizator.request(request.headers).can("POST:APPLICATIONS", {
      resource: secureRequestBody,
    });

    const createdApplication =
      await applicationsFormService.applyToSelection(secureRequestBody);

    return controller.response.ok(201, { ...createdApplication });
  } catch (error) {
    return controller.response.error(error);
  }
}

export async function GET(request) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    const secureParams = validator.run(
      { email },
      {
        email: { required: true, type: validator.types.EMAIL },
      },
    );

    await authorizator.request(request.headers).can("GET:APPLICATIONS", {
      resource: { email },
    });

    const searchedApplications =
      await selectionQueryService.searchApplicationsByEmail(email);

    return controller.response.ok(200, searchedApplications);
  } catch (error) {
    return controller.response.error(error);
  }
}
