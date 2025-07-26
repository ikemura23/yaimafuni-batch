const BrowserHelper = require('../../common/browser-helper');

const URL = 'http://www.yaeyama.co.jp/operation.html';

/**
 * YKF一覧のスクレイピング処理
 */
class ListScraper {
  /**
   * 一覧データをスクレイピングする
   * @returns {Promise<Array>} スクレイピング結果の配列
   */
  static async scrapeListData() {
    return await BrowserHelper.executeScraping(async (page) => {
      // ページに移動
      await BrowserHelper.navigateToPage(page, URL);

      // 一覧データを取得
      const contentList = await this.getDataList(page);

      return contentList;
    });
  }

  /**
   * リスト取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Array>} データリスト
   */
  static async getDataList(page) {
    const itemSelector = '#status > div > div.status > div.list';

    return await page.evaluate((selector) => {
      const list = Array.from(document.querySelectorAll(selector));

      return list.map((data) => {
        // 子要素のtextContentを取得して、オブジェクトにセットして返す
        let obj = {};
        obj['port'] = data.firstChild.textContent; // 港名
        obj['status'] = data.lastChild.textContent; // 運行ステータス値
        return obj;
      });
    }, itemSelector);
  }
}

module.exports = ListScraper;
