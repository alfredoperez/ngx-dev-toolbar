export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function nounSingular(plural: string): string {
  return plural.replace(/ies$/, 'y').replace(/s$/, '');
}
