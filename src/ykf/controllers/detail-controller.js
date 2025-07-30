// YKF 詳細
const consts = require('../../consts.js');
const firebase = require('../../repository/firebase_repository');
const sendError = require('../../slack');
const DetailScraper = require('../../ykf/scrapers/detail-scraper');
const DetailTransformer = require('../../ykf/transformers/detail-transformer');

const COMPANY = consts.YKF;

module.exports = async () => {
  console.log(`開始: ${COMPANY} 詳細`);

  try {
    // スクレイピング処理
    const data = await DetailScraper.scrapeDetailData();
    console.table(data);

    // 送信開始
    if (data != null) {
      await sendToFirebase(data);
    } else {
      console.log('dataが null のため送信しない');
    }
  } catch (error) {
    console.error(error.stack, `${COMPANY}詳細でエラー`);
    sendError(error.stack, `${COMPANY}詳細のスクレイピングでエラー発生!`);
  }

  console.log(`終了: ${COMPANY} 詳細`);
};

/**
 * DBへ登録
 */
async function sendToFirebase(data) {
  const tableName = `${COMPANY}_timeTable/`;
  console.log('送信開始' + tableName);
  return await firebase.update(tableName, data);
}
