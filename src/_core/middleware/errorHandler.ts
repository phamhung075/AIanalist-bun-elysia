import { HttpStatusCode } from '../helper/http-status/common/HttpStatusCode';
import { StatusCodes } from '../helper/http-status/common/StatusCodes';

export const errorHandler = (error: Error & { status?: HttpStatusCode }) => {
  // console.error(startTime);
  const statusCode = error.status || HttpStatusCode.INTERNAL_SERVER_ERROR;
  const statusInfo = StatusCodes[statusCode];

  return {
    success: false,
    error: true,
    message: error.message || statusInfo.phrase,
    metadata: {
      code: statusCode,
      status: statusInfo.phrase,
      description: statusInfo.description,
      documentation: statusInfo.documentation,
    }
  };
};