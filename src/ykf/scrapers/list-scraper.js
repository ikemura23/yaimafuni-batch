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
    console.group('ListScraper.scrapeListData start');

    try {
      const result = await BrowserHelper.executeScraping(async (page) => {
        // ページに移動
        await BrowserHelper.navigateToPage(page, URL);

        // 一覧データを取得
        const contentList = await this.getDataList(page);

        return contentList;
      });

      return result;
    } catch (error) {
      console.error('ListScraper.scrapeListData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * リスト取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Array>} データリスト
   */
  static async getDataList(page) {
    console.group('ListScraper.getDataList start');

    try {
      const itemSelector = '#status > div > div.status > div.list';

      const result = await page.evaluate((selector) => {
        const list = Array.from(document.querySelectorAll(selector));

        return list.map((data) => {
          // 子要素のtextContentを取得して、オブジェクトにセットして返す
          let obj = {};
          obj['port'] = data.firstChild.textContent; // 港名
          obj['status'] = data.lastChild.textContent; // 運行ステータス値
          return obj;
        });
      }, itemSelector);

      return result;
    } catch (error) {
      console.error('ListScraper.getDataList error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}

module.exports = ListScraper;
