import { NextResponse } from "next/server";

import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  ServiceError,
  TooManyRequestsError,
  UnauthorizedError,
  ValidationError,
} from "utils/errors";
import validator from "utils/validator";

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
    errorObject instanceof TooManyRequestsError ||
    errorObject instanceof ServiceError
  ) {
    console.error(errorObject);
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

const request = {
  getResourceByRequestParams,
};

async function getResourceByRequestParams({ idParam, resourceModel }) {
  try {
    const secure = validator.run(
      { idParam },
      {
        idParam: {
          required: true,
          type: validator.types.UUID,
        },
      },
    );

    const resource = await resourceModel.findById(secure.idParam);

    if (!resource) {
      throw new NotFoundError({});
    }

    return resource;
  } catch (error) {
    throw new NotFoundError({});
  }
}

export default Object.freeze({
  response,
  request,
});
