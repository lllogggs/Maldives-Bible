import type { IncomingHttpHeaders } from 'node:http';

export type ApiRequest = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  headers: IncomingHttpHeaders;
  body?: any;
};

export type ApiResponse = {
  setHeader(name: string, value: number | string | readonly string[]): void;
  status(code: number): ApiResponse;
  json(body: any): ApiResponse | void;
  send(body?: any): ApiResponse | void;
  end(body?: any): ApiResponse | void;
};
