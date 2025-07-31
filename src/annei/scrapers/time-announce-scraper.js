const BrowserHelper = require('../../common/browser-helper');

/**
 * Annei時間・アナウンスデータのスクレイピング処理
 */
class TimeAnnounceScraper {
  static TARGET_URL = 'https://aneikankou.co.jp/condition';

  /**
   * 時間・アナウンスデータをスクレイピング
   * @returns {Promise<Object>} スクレイピング結果
   */
  static async scrapeTimeAndAnnounceData() {
    console.group('TimeAnnounceScraper.scrapeTimeAndAnnounceData start');
    
    try {
      const { browser, page } = await BrowserHelper.createBrowserAndPage();
      
      try {
        await BrowserHelper.navigateToPage(page, this.TARGET_URL);
        
        const updateTime = await this.getUpdateTime(page);
        const announce = await this.getAnnounce(page);
        
        const value = {
          updateTime,
          comment: announce,
        };
        
        console.dir(value);
        return value;
      } finally {
        await BrowserHelper.closeBrowser(browser);
      }
    } catch (error) {
      console.error('TimeAnnounceScraper.scrapeTimeAndAnnounceData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 更新時刻を取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<string>} 更新時刻
   */
  static async getUpdateTime(page) {
    return await page.$eval(
      'div.condition_subtitle > div',
      (item) => {
        return item.textContent
          .replace('【更新時間', '')
          .replace('】', '')
          .trim();
      },
    );
  }

  /**
   * お知らせコメントを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<string>} お知らせコメント
   */
  static async getAnnounce(page) {
    return await page.$eval('div.condition_list > div', (item) => {
      return item.textContent.trim();
    });
  }

  /**
   * お知らせコメントを取得（別名メソッド）
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<string>} お知らせコメント
   */
  static async getAnnounce2(page) {
    return this.getAnnounce(page);
  }
}

module.exports = TimeAnnounceScraper; 