import emailVerificationService from "src/services/auth/email-verification";
import controller from "utils/controller";
import validator from "utils/validator";

export async function POST(request) {
  try {
    const requestBody = await request.json();

    const secure = validator.run(requestBody, {
      email: {
        required: true,
        type: validator.types.EMAIL,
      },
    });

    await emailVerificationService.startEmailVerification(secure.email);

    return controller.response.ok(201, {});
  } catch (error) {
    return controller.response.error(error);
  }
}
