const repository = require("../../lib/firebase_repository");
const consts = require("../../consts.js");

const saveAnneiList = async (value) => {
  console.group("saveAnneiList start");
  async () => {
    await repository.set(consts.ANEI, value);
  };

  console.groupEnd();
};

module.exports = saveAnneiList;
