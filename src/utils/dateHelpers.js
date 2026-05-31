export function formatTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function formatDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const day = date.getDate();
  const monthsEn = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${day} ${monthsEn[date.getMonth()]}`;
}

export function getTodayKey() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getHoursDiff(start, end) {
  const diffMs = new Date(end) - new Date(start);
  return diffMs / (1000 * 60 * 60);
}

export function cmToFeetInches(cm) {
  if (!cm) return '';
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return `${feet} ft ${inches} in`;
}
