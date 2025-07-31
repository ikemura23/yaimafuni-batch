const BrowserHelper = require('../../common/browser-helper');
const consts = require('../../consts.js');

/**
 * Annei詳細データのスクレイピング処理
 */
class DetailScraper {
  static TARGET_URL = 'https://aneikankou.co.jp/condition';

  /**
   * 詳細データをスクレイピング
   * @returns {Promise<Object>} スクレイピング結果
   */
  static async scrapeDetailData() {
    console.group('DetailScraper.scrapeDetailData start');

    try {
      const { browser, page } = await BrowserHelper.createBrowserAndPage();

      try {
        await BrowserHelper.navigateToPage(page, this.TARGET_URL);

        const data = await this.getData(page);

        return data;
      } finally {
        await BrowserHelper.closeBrowser(browser);
      }
    } catch (error) {
      console.error('DetailScraper.scrapeDetailData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * ページからデータを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} データ
   */
  static async getData(page) {
    return {
      // 波照間
      hateruma: await this.getHaterumaStatus(page),
      // 上原
      uehara: await this.getUeharaStatus(page),
      // 鳩間
      hatoma: await this.getHatomaStatus(page),
      // 大原
      oohara: await this.getOoharaStatus(page),
      // 竹富
      taketomi: await this.getTaketomiStatus(page),
      // 小浜
      kohama: await this.getKohamaStatus(page),
      // 黒島
      kuroshima: await this.getKuroshimaStatus(page),
    };
  }

  /**
   * 波照間のステータスデータを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} ステータスデータ
   */
  static async getHaterumaStatus(page) {
    return await this.getStatusData(
      page,
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div',
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div',
      '波照間発'
    );
  }

  /**
   * 上原のステータスデータを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} ステータスデータ
   */
  static async getUeharaStatus(page) {
    return await this.getStatusData(
      page,
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div',
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div',
      '上原発'
    );
  }

  /**
   * 鳩間のステータスデータを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} ステータスデータ
   */
  static async getHatomaStatus(page) {
    return await this.getStatusData(
      page,
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div',
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div',
      '鳩間発'
    );
  }

  /**
   * 大原のステータスデータを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} ステータスデータ
   */
  static async getOoharaStatus(page) {
    return await this.getStatusData(
      page,
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div',
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div',
      '大原発'
    );
  }

  /**
   * 竹富のステータスデータを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} ステータスデータ
   */
  static async getTaketomiStatus(page) {
    return await this.getStatusData(
      page,
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > div',
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > div',
      '竹富発'
    );
  }

  /**
   * 小浜のステータスデータを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} ステータスデータ
   */
  static async getKohamaStatus(page) {
    return await this.getStatusData(
      page,
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1) > div',
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div',
      '小浜発'
    );
  }

  /**
   * 黒島のステータスデータを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} ステータスデータ
   */
  static async getKuroshimaStatus(page) {
    return await this.getStatusData(
      page,
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(1) > div',
      '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(4) > div > div:nth-child(3) > div:nth-child(2) > div',
      '黒島発'
    );
  }

  /**
   * 港単体のデータ取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @param {string} leftSelector - 左側のセレクタ
   * @param {string} rightSelector - 右側のセレクタ
   * @param {string} rightHeaderText - 右側のヘッダーテキスト
   * @returns {Promise<Object>} ステータスデータ
   */
  static async getStatusData(page, leftSelector, rightSelector, rightHeaderText) {
    const leftNodes = await page.$$(leftSelector);
    const leftRow = await this.convertRowData(leftNodes);

    const rightNodes = await page.$$(rightSelector);
    const rightRow = await this.convertRowData(rightNodes);

    const row = [];

    for (var i = 0; i < leftRow.length; i++) {
      row.push({
        left: leftRow[i],
        right: rightRow[i],
      });
    }

    return {
      header: {
        left: '石垣発',
        right: rightHeaderText,
      },
      row: row,
    };
  }

  /**
   * divタグのnode配列を整形して配列にする
   * @param {Array} parentNodes - divタグのnode配列
   * @returns {Array} 縦1列の配列
   */
  static async convertRowData(parentNodes) {
    if (parentNodes.length === 0) {
      console.log('parentNodes is empty');
      return [];
    }

    const row = [];

    for (const node of parentNodes) {
      // 左の時刻（例 08:00）
      const time = await node.$eval('div.condition_item_port_detail_time', (nd) => nd.innerText);

      // 右のステータス記号文字（例 ○ △ ✗）
      const status = await node.$eval('div.condition_item_port_detail_status', (nd) => nd.innerText);

      row.push({
        memo: '',
        time: time,
        status: {
          code: await this.getRowStatusCode(status),
          text: await this.getRowStatusText(status),
        },
      });
    }

    return row;
  }

  /**
   * ステータスコードを取得
   * @param {string} statusText - ステータステキスト
   * @returns {string} ステータスコード
   */
  static async getRowStatusCode(statusText) {
    if (statusText === '◯') {
      return consts.NORMAL;
    } else if (statusText === '△') {
      return consts.CATION;
    } else if (statusText === '✕') {
      return consts.CANCEL;
    } else if (statusText === '未定') {
      return consts.CATION;
    } else {
      return consts.CATION;
    }
  }

  /**
   * ステータス文字を取得
   * @param {string} statusText - ステータステキスト
   * @returns {string} ステータス文字
   */
  static async getRowStatusText(statusText) {
    if (statusText === '◯') {
      return '通常運航';
    } else if (statusText === '△') {
      return '一部運休';
    } else if (statusText === '✕') {
      return '欠航';
    } else {
      return statusText;
    }
  }
}

module.exports = DetailScraper;
