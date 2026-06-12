export type ResumeSection = {
  title: string;
  lines: string[];
};

export function parseResume(raw: string): ResumeSection[] {
  const sections: ResumeSection[] = [];
  let current: ResumeSection | null = null;

  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\[(.+)\]$/);
    if (match) {
      if (current) sections.push(current);
      current = { title: formatSectionTitle(match[1]), lines: [] };
      continue;
    }

    if (!current || line.trim() === '') continue;
    current.lines.push(line);
  }

  if (current) sections.push(current);
  return sections;
}

function formatSectionTitle(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
