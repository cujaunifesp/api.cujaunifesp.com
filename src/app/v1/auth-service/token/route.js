import tokenGeneratorService from "src/services/auth/token-generator";
import controller from "utils/controller";
import { InternalServerError } from "utils/errors";
import validator from "utils/validator";

export async function POST(request) {
  try {
    let requestBody = await request.json();

    requestBody = validator.run(requestBody, {
      method: {
        required: true,
        type: validator.types.STRING_AUTH_METHODS,
      },
      email: {
        required: true,
        type: validator.types.EMAIL,
      },
      password: {
        min: 8,
        max: 72,
        type: validator.types.STRING,
      },
      verification_code: {
        min: 6,
        max: 6,
        type: validator.types.STRING_UPPERCASE,
      },
    });

    if (requestBody.method === "email_verification") {
      const createdToken =
        await tokenGeneratorService.createTokenByEmailVerification({
          email: requestBody.email,
          verificationCode: requestBody.verification_code,
        });

      return controller.response.ok(201, { ...createdToken });
    } else {
      throw new InternalServerError({
        statusCode: 501,
        message: "Esse método de autenticação não está disponível.",
        action: "Aguarde que essa função seja implementada no sistema.",
      });
    }
  } catch (error) {
    return controller.response.error(error);
  }
}
