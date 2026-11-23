import { format } from "date-fns";

// Template formatting helpers (the Vue 2 `date` and `error` filters).

export const formatDate = (date) => {
  const parsed = new Date(date);
  // A missing/invalid date (e.g. an article that failed to load) renders as
  // empty instead of throwing and aborting the whole component tree's mount.
  if (isNaN(parsed)) return "";
  return format(parsed, "MMMM d, yyyy");
};

// The API's wordCount as "N words"; empty when the article has no count yet.
export const formatWordCount = (count) => {
  if (!Number.isInteger(count) || count < 0) return "";
  return `${count} words`;
};

export const formatError = (errorValue) => {
  return `${errorValue[0]}`;
};
