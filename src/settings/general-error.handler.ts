import { HttpResponse } from 'src/common/models/http.models';
import { StatusCodeClientErrorEnum } from 'src/common/types/statusCode.types';
import { TypeORMError } from 'typeorm';
export const ErrorHandlerWithForHttpResponse = (
  response: HttpResponse,
  exception: any,
) => {
  const error: TypeORMError = exception;
  const { message, stack } = error || {};
  response.errors.push(message);
  response.exceptions.push(stack);
  response.statusCode = StatusCodeClientErrorEnum.ClientErrorBadRequest;
};
