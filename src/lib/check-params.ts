import { BadRequest } from 'fejl';

export function hasParams(params: string[], object: { [x: string]: any }) {
  params.forEach(param =>
    BadRequest.assert(param in object, `파라미터에 ${param}이/가 없습니다.`)
  );
}
