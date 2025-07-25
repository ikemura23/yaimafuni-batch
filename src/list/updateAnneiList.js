const getAnneiUpdateTimeAndComment = require('./getAnneiUpdateTimeAndComment');
const getAnneiList = require('./getAnneiList');
const saveAnneiList = require('./saveAnneiList');

const updateAnneiList = async () => {
  console.group('updateAnneiList start');
  const updateTimeAndComment = await getAnneiUpdateTimeAndComment();
  const value = await getAnneiList();
  const saveData = {
    updateTime: updateTimeAndComment.updateTime,
    comment: updateTimeAndComment.comment,
    hateruma: value.hateruma,
    hatoma: value.hatoma,
    kohama: value.kohama,
    kuroshima: value.kuroshima,
    oohara: value.oohara,
    taketomi: value.taketomi,
    uehara: value.uehara,
  };
  await saveAnneiList(saveData);
  console.log('updateAnneiList end');
  console.groupEnd();
};

module.exports = updateAnneiList;
