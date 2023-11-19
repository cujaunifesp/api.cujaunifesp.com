import authorizator from "src/services/auth/authorizator";
import registration from "src/services/selection/applications";
import controller from "utils/controller";
import validator from "utils/validator";

const applicationValidationKeys = {
  name: { required: true, type: validator.types.STRING_TRIM },
  social_name: { type: validator.types.STRING_TRIM },
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
  special_assistance_justification: { max: 510, type: validator.types.STRING },
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
      await registration.submitNewApplication(secureRequestBody);

    return controller.response.ok(201, { ...createdApplication });
  } catch (error) {
    console.log(error);
    return controller.response.error(error);
  }
}
