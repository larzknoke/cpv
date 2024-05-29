// INIT CURRENT WEEK
export const currentWeek = Array.from(Array(7).keys()).map((idx) => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + idx + 1);
  return { _time: d, _value: 0 };
});

// INIT CURRENT YEAR
export function getCurrentYear() {
  const year = new Date().getFullYear();
  const yearDates = [];
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
    const d = new Date(year, month - 1, 1);
    yearDates.push({ _time: d, _value: 0 });
  });
  return yearDates;
}
