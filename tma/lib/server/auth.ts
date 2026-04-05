import { serverEnv } from './env';
import { extractTelegramUserId } from './http';

export function isAuthorizedAdminRequest(request: Request): boolean {
  if (serverEnv.adminUserId === null) {
    return true;
  }
  return extractTelegramUserId(request) === serverEnv.adminUserId;
}
