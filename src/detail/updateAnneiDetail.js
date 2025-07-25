const getAnneiDetail = require('./getAnneiDetail');
const saveAnneiDetail = require('./saveAnneiDetail');

const updateAnneiDetail = async () => {
  console.group('updateAnneiDetail start');

  // 取得
  const value = await getAnneiDetail();

  // 保存
  await saveAnneiDetail(value);

  console.log('updateAnneiDetail end');
  console.groupEnd();
};

module.exports = updateAnneiDetail;
