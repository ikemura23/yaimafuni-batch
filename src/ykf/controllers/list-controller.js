const consts = require('../../consts.js');
const firebase = require('../../repository/firebase_repository');
const sendError = require('../../slack');
const ListScraper = require('../../ykf/scrapers/list-scraper');
const ListTransformer = require('../../ykf/transformers/list-transformer');

const COMPANY = consts.YKF;

module.exports = async () => {
  console.log(`開始: ${COMPANY} 一覧`);

  try {
    // スクレイピング処理
    const contentList = await ListScraper.scrapeListData();
    console.log('YKF 一覧 inner htmlデータ');
    console.table(contentList);

    // データ変換処理
    const sendData = ListTransformer.transformListData(contentList);
    console.log('送信値');
    console.dir(sendData);

    // 送信開始
    await firebase.set(consts.YKF, sendData);
  } catch (error) {
    console.error(error.stack, `${COMPANY}一覧でエラー`);
    sendError(error.stack, `${COMPANY}一覧のスクレイピングでエラー発生!`);
  }

  console.log(`終了: ${COMPANY} 一覧`);
};
