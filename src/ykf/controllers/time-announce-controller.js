const consts = require('../../consts.js');
const firebase = require('../../repository/firebase_repository');
const sendError = require('../../slack');
const TimeAnnounceScraper = require('../../ykf/scrapers/time-announce-scraper');
const TimeAnnounceTransformer = require('../../ykf/transformers/time-announce-transformer');

const COMPANY = consts.YKF;

module.exports = async () => {
  console.log('開始:' + COMPANY + ' 時間+アナウンス');

  try {
    // スクレイピング処理
    const scrapedData = await TimeAnnounceScraper.scrapeTimeAndAnnounceData();

    // データ変換処理
    const data =
      TimeAnnounceTransformer.transformTimeAndAnnounceData(scrapedData);
    console.dir(data);

    // 送信開始
    await firebase.update(consts.YKF, data);
  } catch (error) {
    console.error(error.stack, '異常: YKF 時間+アナウンスでエラー');
    sendError(
      error.stack,
      '異常: YKF 時間+アナウンスのスクレイピングでエラー発生!',
    );
  }

  console.log('終了:' + COMPANY + ' 時間+アナウンス');
};
