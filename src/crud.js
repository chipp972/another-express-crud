// @flow
import { Router } from 'express';
import { generateCrudRoutes } from './crud.route';
import type { CrudGenOptions } from './crud.type';

export const crud = ({
  path = '/',
  operations,
  getRequestData,
  responseFormatter,
  hooks,
  policy
}: CrudGenOptions): Router => {
  const router = Router();

  router.use(
    path,
    generateCrudRoutes({
      operations,
      getRequestData,
      responseFormatter,
      hooks,
      policy
    })
  );
  return router;
};
