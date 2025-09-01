export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
  });
}
