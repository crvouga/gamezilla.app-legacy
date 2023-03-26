import { Result } from '@gamezilla/core';

export type ClientId = string & { _opaque: 'ClientId' };

const is = (id: unknown): id is ClientId => {
  return typeof id === 'string';
};

type Problem = 'invalid_client_id';

const decode = (id: string): Result<Problem, ClientId> => {
  if (is(id)) {
    return Result.Ok(id);
  }

  return Result.Err('invalid_client_id');
};

export const ClientId = {
  is,
  decode,
};
