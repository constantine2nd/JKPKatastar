import log from "../models/logModel.js";

const addLog = async (userName, action, data) => {
  try {
    const dataToSave = JSON.stringify(data);

    const newLog = await log.create({
      userName,
      action,
      data: dataToSave,
    });
    console.log(newLog);
    if (newLog) {
      console.log("New log is saved");
    } else {
      console.log("New log is not saved");
    }
  } catch (error) {
    console.log(error);
  }
};

export { addLog };
