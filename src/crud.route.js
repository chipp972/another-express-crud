// @flow
import { checkAccess, hasPermission } from "./crud.policy";
import { Request, Response, NextFunction, Router } from "express";
import type {
  CrudOptions,
  ExpressCrudGenerator,
  CrudBeforeMiddleware,
  CrudAfterMiddleware,
  Policy,
  AccessFunction,
  RequestDataFunction,
  CrudOperation
} from "./crud.type";

// format the response
const defaultResponseFormatter = (req: Request, res: Response): void =>
  res
    .status(res.statusCode || 200)
    .contentType("application/json")
    .json({ success: res.success ? res.success : true, data: res.data });

// get data from request
const defaultGetRequestData = (req: Request): CrudOptions => ({
  id: req.params.id || (req.body && (req.body._id || req.body.id)),
  data: { ...req.body, ...req.query },
  user: req.user,
  files: req.files || {}
});

const setRequestData = (getRequestData: RequestDataFunction) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.crud = getRequestData(req);
  next();
};

const checkPolicy = (
  isAuthenticated?: AccessFunction,
  isOwner?: AccessFunction,
  isAdmin?: AccessFunction,
  isDisabled?: boolean = false
) => (policy?: Policy) => (req: Request, res: Response, next: NextFunction) => {
  if (!policy || isDisabled) return next();
  if (
    hasPermission(
      checkAccess(req.crud, isAuthenticated, isOwner, isAdmin),
      policy
    )
  ) {
    return next();
  }
  return next(new Error("PolicyError"));
};

const executeBeforeMiddleware = (before?: CrudBeforeMiddleware) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!before) return next();
    const { success, error } = await before(req.crud);
    if (!success && error) return next(error);
    return next();
  } catch (err) {
    return next(err);
  }
};

const executeOperation = (operation: CrudOperation) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await operation(req.crud);
    if (result === undefined) return next(new Error("NotFound"));
    res.data = result;
    return next();
  } catch (err) {
    return next(err);
  }
};

const executeAfterMiddleware = (after?: CrudAfterMiddleware) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!after) return next();
    const result = await after(res.data, req);
    if (result) res.data = result;
    return next();
  } catch (err) {
    return next(err);
  }
};

const setStatus = (status: number) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(status);
  next();
};

/**
 * Create all routes CRUD operations
 * @param {CrudOperations} operations
 * @return {Router}
 */
export const generateCrudRoutes: ExpressCrudGenerator = ({
  operations,
  getRequestData = defaultGetRequestData,
  responseFormatter = defaultResponseFormatter,
  hooks = {},
  policy = {}
}): Router => {
  const router = Router();
  const policyMw = checkPolicy(
    policy.isAuthenticated,
    policy.isOwner,
    policy.isAdmin,
    policy.isDisabled
  );
  const { before = {}, after = {} } = hooks;

  router.route("/:id*?");

  router
    .route("/:id*?")
    .all(setRequestData(getRequestData))

    .get(policyMw(policy.read))
    .get(executeBeforeMiddleware(before.all))
    .get(executeBeforeMiddleware(before.read))
    .get(executeOperation(operations.read))
    .get(executeAfterMiddleware(after.read))
    .get(executeAfterMiddleware(after.all));

  router
    .route("/")
    .post(policyMw(policy.create))
    .post(executeBeforeMiddleware(before.all))
    .post(executeBeforeMiddleware(before.create))
    .post(executeOperation(operations.create))
    .post(executeAfterMiddleware(after.create))
    .post(executeAfterMiddleware(after.all))
    .post(setStatus(201));

  router
    .route("/:id")
    .put(policyMw(policy.update))
    .put(executeBeforeMiddleware(before.all))
    .put(executeBeforeMiddleware(before.update))
    .put(executeOperation(operations.update))
    .put(executeAfterMiddleware(after.update))
    .put(executeAfterMiddleware(after.all))

    .patch(policyMw(policy.update))
    .patch(executeBeforeMiddleware(before.all))
    .patch(executeBeforeMiddleware(before.update))
    .patch(executeOperation(operations.update))
    .patch(executeAfterMiddleware(after.update))
    .patch(executeAfterMiddleware(after.all))

    .delete(policyMw(policy.delete))
    .delete(executeBeforeMiddleware(before.all))
    .delete(executeBeforeMiddleware(before.delete))
    .delete(executeOperation(operations.delete))
    .delete(executeAfterMiddleware(after.delete))
    .delete(executeAfterMiddleware(after.all));

  router.use("*", responseFormatter);

  return router;
};
