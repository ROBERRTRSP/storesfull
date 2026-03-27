import { z } from "zod";

export const Role = z.enum(["ADMIN", "CUSTOMER", "DELIVERY", "SELLER"]);
export type Role = z.infer<typeof Role>;

