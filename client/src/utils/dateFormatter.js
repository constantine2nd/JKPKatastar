const dateFormatter = (date) => {
  const myDate = new Date(date);
  let day = myDate.getDate();
  let month = myDate.getMonth();
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

export { dateFormatter };
