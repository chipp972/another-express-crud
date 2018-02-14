// @flow
import { Router } from 'express';
import { generateCrudRoutes } from './crud.route';
import type {
  CrudGenOptions as CrudGenOpts,
  CrudOperations as CrudOps,
  PolicyObject as PolicyObj,
  Policy as Pol,
  HooksObject as HooksObj
} from './crud.type';

export type CrudGenOptions = CrudGenOpts;
export type CrudOperations = CrudOps;
export type PolicyObject = PolicyObj;
export type Policy = Pol;
export type HooksObject = HooksObj;

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
