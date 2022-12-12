import { JsonAlias, JsonClassType, JsonProperty } from 'jackson-js';
import { StatusCode } from '../types/statusCode.types';

export class HttpResponse {
  @JsonProperty({ value: 'success' })
  @JsonClassType({ type: () => [String] })
  @JsonAlias({ values: ['success'] })
  success: boolean;
  @JsonProperty({ value: 'messages' })
  @JsonClassType({ type: () => [String] })
  @JsonAlias({ values: ['messages'] })
  message: string;
  @JsonProperty({ value: 'data' })
  @JsonClassType({ type: () => [String] })
  @JsonAlias({ values: ['data'] })
  data: any;
  @JsonProperty({ value: 'errors' })
  @JsonClassType({ type: () => [String] })
  @JsonAlias({ values: ['errors'] })
  errors: string[] | any[];
  @JsonProperty({ value: 'exceptions' })
  @JsonClassType({ type: () => [String] })
  @JsonAlias({ values: ['exceptions'] })
  exceptions: string[] | any[];
  @JsonProperty({ value: 'status_code' })
  @JsonClassType({ type: () => [String] })
  @JsonAlias({ values: ['status_code'] })
  statusCode: StatusCode;

  constructor(data?: HttpResponse) {
    this.success = data?.success ?? false;
    this.message = data?.message ?? '';
    this.data = data?.data ?? null;
    this.errors = data?.errors ?? [];
    this.exceptions = data?.exceptions ?? [];
    this.statusCode = data?.statusCode ?? null;
  }
}
