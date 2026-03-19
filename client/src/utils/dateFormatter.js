const dateFormatter = (date) => {
  if (!date) return "-";
  const myDate = new Date(date);
  if (isNaN(myDate.getTime())) return "-";
  let day = myDate.getDate();
  let month = myDate.getMonth() + 1;
  let year = myDate.getFullYear();
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = `0${month}`;
  }
  const formattedString = `${day}.${month}.${year}`;
  return formattedString;
};

const dateCalendarFormatter = (date) => {
  if (!date) return "";
  const myDate = new Date(date);
  if (isNaN(myDate.getTime())) return "";
  let day = myDate.getDate();
  let month = myDate.getMonth() + 1;
  let year = myDate.getFullYear();
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = `0${month}`;
  }
  const formattedString = `${year}-${month}-${day}`;
  return formattedString;
};

export { dateFormatter, dateCalendarFormatter };
