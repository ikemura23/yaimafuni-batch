const getAnneiUpdateTimeAndComment = require("./getAnneiUpdateTimeAndComment");
const getAnneiList = require("./getAnneiList");
const saveAnneiList = require("./saveAnneiList");

const updateAnneiList = async () => {
  const updateTimeAndComment = await getAnneiUpdateTimeAndComment();
  const value = await getAnneiList();
  const saveData = {
    updateTime: updateTimeAndComment.updateTime,
    comment: updateTimeAndComment.comment,
    hateruma: null,
    hatoma: null,
    kohama: null,
    kuroshima: null,
    oohara: null,
    taketomi: null,
    uehara: null,
  };
  await saveAnneiList(saveData);
};

module.exports = updateAnneiList;
