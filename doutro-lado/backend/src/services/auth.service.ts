import type { Request } from "express";
import { env } from "../config/env.js";
import type { Role } from "../types/domain.js";

const tokenRoleMap = new Map<string, Role>([
  [env.DEV_CUSTOMER_TOKEN, "customer"],
  [env.DEV_WHOLESALE_TOKEN, "wholesale"],
  [env.DEV_ADMIN_TOKEN, "admin"]
]);

function parseBearerToken(headerValue?: string | null) {
  if (!headerValue) return null;
  const [scheme, token] = headerValue.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token.trim();
}

function resolveHeaderRole(headerValue?: string | null): Role | null {
  if (headerValue === "customer" || headerValue === "wholesale" || headerValue === "admin") {
    return headerValue;
  }

  return null;
}

export function resolveRequestUser(req: Request) {
  if (env.AUTH_MODE === "header" && env.ALLOW_DEV_AUTH_HEADERS) {
    const role = resolveHeaderRole(req.header("x-role"));
    if (!role) return null;

    return {
      id: req.header("x-user-id") ?? `header-${role}`,
      role
    };
  }

  const token = parseBearerToken(req.header("authorization"));
  if (!token) return null;

  const role = tokenRoleMap.get(token);
  if (!role) return null;

  return {
    id: `token-${role}`,
    role
  };
}
