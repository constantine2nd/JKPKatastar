const dateFormatter = (date) => {
  console.log(date);
  if (!date) {
    return "No available contract";
  }
  const myDate = new Date(date);
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
  console.log(date);
  if (!date) {
    return "Wrong string";
  }
  const myDate = new Date(date);
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
