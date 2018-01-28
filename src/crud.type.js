// @flow
import { Router, Request, Response, NextFunction } from 'express';

/* Public API */

export type CrudGenOptions = {
  path?: string,
  operations: CrudOperations,
  getRequestData?: RequestDataFunction,
  responseFormatter?: Middleware,
  hooks?: HooksObject,
  policy?: PolicyObject
};

export type ExpressCrudGenerator = ({
  operations: CrudOperations,
  getRequestData?: RequestDataFunction,
  responseFormatter?: Middleware,
  hooks?: HooksObject,
  policy?: PolicyObject
}) => Router;

export type CrudOptions = {
  id: string,
  data: any,
  user?: any,
  files?: { [filename: string]: { path: string } }
};

export type RequestDataFunction = (Request) => CrudOptions;

export type Middleware = (Request, Response, NextFunction) => any;

export type PreResult = {
  success: boolean,
  error?: Error
};

export type CrudOperation = (CrudOptions) => Promise<any>;

export type CrudOperations = {
  create: CrudOperation,
  read: CrudOperation,
  update: CrudOperation,
  delete: CrudOperation
};

/* Hooks */

export type CrudAfterMiddleware = (result: *, req: Request) => Promise<*>;

export type CrudBeforeMiddleware = (CrudOptions) => Promise<PreResult>;

export type CrudAfterObject = {
  all?: CrudAfterMiddleware,
  create?: CrudAfterMiddleware,
  read?: CrudAfterMiddleware,
  update?: CrudAfterMiddleware,
  delete?: CrudAfterMiddleware
};

export type CrudBeforeObject = {
  all?: CrudAfterMiddleware,
  create?: CrudBeforeMiddleware,
  read?: CrudBeforeMiddleware,
  update?: CrudBeforeMiddleware,
  delete?: CrudBeforeMiddleware
};

export type HooksObject = {
  before?: CrudBeforeObject,
  after?: CrudAfterObject
};

/* Policy */

export type CheckAccessParams = {
  id?: string,
  data: any,
  user?: { _id: string, role?: string }
};

export type AccessFunction = (CheckAccessParams) => boolean;

export type Policy = 'guest' | 'user' | 'owner' | 'admin';

export type PolicyObject = {
  create?: Policy,
  read?: Policy,
  update?: Policy,
  delete?: Policy,
  isAuthenticated?: AccessFunction,
  isOwner?: AccessFunction,
  isAdmin?: AccessFunction
};
