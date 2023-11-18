import emailVerificationService from "src/services/auth/email-verification";
import controller from "utils/controller";

export async function POST(request) {
  try {
    const requestBody = await request.json();
    await emailVerificationService.startEmailVerification(requestBody.email);

    return controller.response.ok(201, {
      message: "Código de verificação enviado com sucesso",
    });
  } catch (error) {
    return controller.response.error(error);
  }
}
