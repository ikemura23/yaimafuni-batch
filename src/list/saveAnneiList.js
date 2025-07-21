const repository = require("../repository/firebase_repository");
const firestoreRepository = require("../repository/firestoreRepository.js");
const consts = require("../consts.js");

const saveAnneiList = async (value) => {
  console.group("saveAnneiList start");

  await repository.set(consts.ANEI, value);
  await firestoreRepository.set(consts.ANEI, value);

  console.groupEnd();
};

module.exports = saveAnneiList;
