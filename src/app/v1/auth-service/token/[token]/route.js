import tokenGeneratorService from "src/services/auth/token-generator";
import controller from "utils/controller";
import validator from "utils/validator";

export async function GET(request, { params }) {
  try {
    const secure = validator.run(
      { token: params.token },
      {
        token: {
          required: true,
          type: validator.types.STRING_TRIM,
        },
      },
    );

    const tokenValidity = await tokenGeneratorService.getGeneratedTokenValidity(
      secure.token,
    );

    return controller.response.ok(200, { ...tokenValidity });
  } catch (error) {
    return controller.response.error(error);
  }
}
