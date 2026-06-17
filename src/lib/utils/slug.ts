export function createEventSlug(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  const random = Math.random().toString(36).slice(2, 8);

  return `${base || "event"}-${random}`;
}
