export type S3File = {
  buffer: Buffer;
  mimetype: string;
  name?: string;
  path?: string;
};

// export interface RawBodyRequest<T> extends Request {
//   rawBody: string;
//   body: T;
// }

export interface CheckrResponse {
  id: string;
  object: string;
  type: string;
  created_at: string;
  data: {
    id: string;
    status: string;
    uri: string;
    invitation_url: string;
    completed_at: string | null;
    package: string;
    candidate_id: string;
    object: string;
    report_id: string | null;
    tags: string[];
    expires_at: string | null;
  };
  account_id: string;
}
export type Schema = 'invitation' | 'report' | 'candidates';
