const repository = require("../repository/firebase_repository");
const consts = require("../consts.js");

/**
 * 安栄詳細のデータを保存する
 * @param  value 保存データ
 */
const saveAnneiDetail = async (value) => {
  console.group("saveAnneiDetail start");

  const tableName = `${consts.ANEI}_timeTable/`; // TODO: 後でリファクタリングする
  // console.log(value);

  await repository.set(tableName, value);

  console.groupEnd();
  console.log("saveAnneiDetail end");

  console.groupEnd();
};

module.exports = saveAnneiDetail;
