export type Role = "visitor" | "buyer" | "developer" | "admin";

export interface SessionUser {
  id: string;
  email?: string;
  roles: Role[];
}
