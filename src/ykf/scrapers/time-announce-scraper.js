const BrowserHelper = require('../../common/browser-helper');

const URL = 'http://www.yaeyama.co.jp/operation.html';

/**
 * YKF時間・アナウンスのスクレイピング処理
 */
class TimeAnnounceScraper {
  /**
   * 時間・アナウンスデータをスクレイピングする
   * @returns {Promise<Object>} スクレイピング結果
   */
  static async scrapeTimeAndAnnounceData() {
    return await BrowserHelper.executeScraping(async (page) => {
      // ページに移動
      await BrowserHelper.navigateToPage(page, URL);

      // 更新日時
      const updateTime = await this.getUpdateTime(page);
      // アナウンス
      const announce = await this.getAnnounce(page);
      // アナウンス2
      const announce2 = await this.getAnnounce2(page);

      return {
        updateTime,
        announce,
        announce2,
      };
    });
  }

  /**
   * 更新日時
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<string>} 更新日時
   */
  static async getUpdateTime(page) {
    return await BrowserHelper.getTextContent(
      page,
      '#status > div > div.statusdate',
    );
  }

  /**
   * アナウンス
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<string>} アナウンス
   */
  static async getAnnounce(page) {
    return await BrowserHelper.getTextContent(
      page,
      '#status > div > div:nth-child(3)',
    );
  }

  /**
   * アナウンス 2
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<string>} アナウンス2
   */
  static async getAnnounce2(page) {
    return await BrowserHelper.getTextContent(
      page,
      '#status > div > div.statusdate2.bgylw',
      '',
    );
  }
}

module.exports = TimeAnnounceScraper;
