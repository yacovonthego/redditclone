import { QueryInput, Cache } from "@urql/exchange-graphcache";

export function betterUpdateQuery<Result, Query>(
  cache: Cache,
  input: QueryInput,
  result: any,
  updaterFn: (r: Result, q: Query) => Query) {
  return cache.updateQuery(
    input,
    (data) => updaterFn(result, data as any) as any
  );
}
