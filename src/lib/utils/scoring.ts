import { ResponseStatus } from "@/types/response";

export function scoreStatus(status: ResponseStatus) {
  switch (status) {
    case "available":
      return 1;
    case "maybe":
      return 0.5;
    case "unavailable":
    default:
      return 0;
  }
}
