import { NextResponse } from "next/server";

import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  ValidationError,
} from "utils/errors";

const response = {
  error,
  ok,
};

function error(errorObject) {
  if (
    errorObject instanceof ValidationError ||
    errorObject instanceof NotFoundError ||
    errorObject instanceof ForbiddenError ||
    errorObject instanceof InternalServerError ||
    errorObject instanceof UnauthorizedError ||
    errorObject instanceof TooManyRequestsError
  ) {
    return NextResponse.json(
      {
        error: errorObject.getPublicErrorObject(),
      },
      {
        status: errorObject.statusCode,
      },
    );
  }

  const unknownError = new InternalServerError({
    internalErrorMessage: errorObject.message,
    context: {
      originalError: errorObject,
    },
  });

  console.error(unknownError);

  return NextResponse.json(
    {
      error: unknownError.getPublicErrorObject(),
    },
    {
      status: unknownError.statusCode,
    },
  );
}

function ok(statusCode, data) {
  return NextResponse.json(data, {
    status: statusCode || 200,
  });
}

export default Object.freeze({
  response,
});
