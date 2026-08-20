export function filterByYear(data, year) {
  if (!data || !year || year === 'all') return data;
  return data.filter(r => r.day.startsWith(year));
}

export function getAvailableYears(data) {
  if (!data || data.length === 0) return [];

  const years = [];
  for (const record of data) {
    const year = record.day.slice(0, 4);
    if (!years.includes(year)) years.push(year);
  }
  return years;
}
