import { StatusTypes } from "../shared";
export const statusColor = (status?: StatusTypes) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-success";
    case "in progress":
      return "bg-blue-500";
    case "not completed":
      return "bg-gray-700";
    case "issue":
      return "bg-error";
    default:
      return "bg-gray-700";
  }
};
