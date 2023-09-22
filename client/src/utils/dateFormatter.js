const dateFormatter = (date) => {
  const myDate = new Date(date);
  const formattedString = `${myDate.getDate()}.${
    myDate.getMonth() + 1
  }.${myDate.getFullYear()}.`;
  return formattedString;
};

export { dateFormatter };
