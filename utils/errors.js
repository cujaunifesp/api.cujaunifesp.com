class BaseError extends Error {
  constructor({
    message,
    action,
    statusCode,
    context,
    errorLocationCode,
    internalErrorMessage,
  }) {
    super();
    this.name = this.constructor.name;
    this.message = message;
    this.action = action;
    this.statusCode = statusCode || 500;
    this.context = context;
    this.errorLocationCode = errorLocationCode;
    this.internalErrorMessage = internalErrorMessage;
  }

  getPublicErrorObject() {
    return {
      statusCode: this.statusCode,
      name: this.name,
      message: this.message,
      action: this.action,
    };
  }
}

export class InternalServerError extends BaseError {
  constructor({
    message,
    action,
    statusCode,
    context,
    errorLocationCode,
    internalErrorMessage,
  }) {
    super({
      message:
        message ||
        "Não foi possível completar sua solicitação devido a um erro inesperado.",
      action: action || "Entre em contato com o suporte técnico.",
      statusCode: statusCode || 500,
      context: context,
      errorLocationCode: errorLocationCode,
      internalErrorMessage: internalErrorMessage,
    });
  }
}

export class NotFoundError extends BaseError {
  constructor({
    message,
    action,
    context,
    errorLocationCode,
    internalErrorMessage,
  }) {
    super({
      message: message || "Não foi possível encontrar este recurso.",
      action:
        action ||
        "Verifique se o recurso que você está tentando acessar está correto.",
      statusCode: 404,
      context: context,
      errorLocationCode: errorLocationCode,
      internalErrorMessage: internalErrorMessage,
    });
  }
}

export class ServiceError extends BaseError {
  constructor({
    message,
    action,
    context,
    statusCode,
    errorLocationCode,
    internalErrorMessage,
  }) {
    super({
      message: message || "Serviço indisponível no momento.",
      action: action || "Tente novamente mais tarde.",
      statusCode: statusCode || 503,
      context: context,
      errorLocationCode: errorLocationCode,
      internalErrorMessage: internalErrorMessage,
    });
  }
}

export class ValidationError extends BaseError {
  constructor({
    message,
    action,
    statusCode,
    context,
    errorLocationCode,
    internalErrorMessage,
  }) {
    super({
      message: message || "Dados enviados estão incorretos.",
      action: action || "Corrija os dados enviados e tente novamente.",
      statusCode: statusCode || 400,
      context: context,
      errorLocationCode: errorLocationCode,
      internalErrorMessage: internalErrorMessage,
    });
  }
}

export class UnauthorizedError extends BaseError {
  constructor({ message, action, errorLocationCode, internalErrorMessage }) {
    super({
      message: message || "Usuário não autenticado.",
      action:
        action ||
        "Verifique se você está autenticado com uma sessão ativa e tente novamente.",
      statusCode: 401,
      errorLocationCode: errorLocationCode,
      internalErrorMessage: internalErrorMessage,
    });
  }
}

export class ForbiddenError extends BaseError {
  constructor({
    message,
    action,
    context,
    errorLocationCode,
    internalErrorMessage,
  }) {
    super({
      message: message || "Você não possui permissão para executar esta ação.",
      action: action || "Tente acessar essa função com um usuário diferente.",
      statusCode: 403,
      context: context,
      errorLocationCode: errorLocationCode,
      internalErrorMessage,
    });
  }
}
