// @flow
import type { CheckAccessParams, AccessFunction, Policy } from './crud.type';

export const ACCESS = {
  GUEST: 'guest',
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin'
};

const defaultIsAuthenticated: AccessFunction = ({
  id,
  data,
  user
}: CheckAccessParams) => (user && user._id ? user._id !== '' : false);

const defaultIsAdmin: AccessFunction = ({
  id,
  data,
  user
}: CheckAccessParams) => (user ? user.role === 'admin' : false);

const defaultIsOwner: AccessFunction = ({
  id,
  data,
  user
}: CheckAccessParams) =>
  user
    ? user._id === id || data._id === user._id || data.owner === user._id
    : false;

/**
 * check if access right is :
 * - guest
 * - user
 * - owner
 * - admin
 *
 * @param {CheckAccessParams} params
 * @param {AccessFunction} isAuthenticated
 * @param {AccessFunction} isOwner
 * @param {AccessFunction} isAdmin
 * @return {string} access right level
 */
export const checkAccess = (
  params: CheckAccessParams,
  isAuthenticated: AccessFunction = defaultIsAuthenticated,
  isOwner: AccessFunction = defaultIsOwner,
  isAdmin: AccessFunction = defaultIsAdmin
): Policy => {
  if (isAuthenticated(params)) {
    if (isAdmin(params)) {
      return ACCESS.ADMIN;
    } else if (isOwner(params)) {
      return ACCESS.OWNER;
    } else {
      return ACCESS.USER;
    }
  }
  return ACCESS.GUEST;
};

export const hasPermission = (
  rights: Policy,
  requiredPolicy: Policy
): boolean => {
  switch (rights) {
    case ACCESS.GUEST:
      if (requiredPolicy === ACCESS.GUEST) {
        return true;
      }
      return false;
    case ACCESS.USER:
      if ([ACCESS.ADMIN, ACCESS.OWNER].includes(requiredPolicy)) {
        return false;
      }
      return true;
    case ACCESS.OWNER:
      if (requiredPolicy === ACCESS.ADMIN) {
        return false;
      }
      return true;
    case ACCESS.ADMIN:
      return true;
    default:
      return false;
  }
};
