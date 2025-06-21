export function escapeQuotesInsideValues(text: string): string {
    return text.replace(/:\s*"(.*?)"/g, (match, p1) => {
      const escapedValue = p1.replace(/(?<!\\)"/g, '\\"');
      return `: "${escapedValue}"`;
    });
}