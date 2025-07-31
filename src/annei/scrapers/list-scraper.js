const BrowserHelper = require('../../common/browser-helper');
const consts = require('../../consts.js');

/**
 * Annei一覧データのスクレイピング処理
 */
class ListScraper {
  static TARGET_URL = 'https://aneikankou.co.jp/condition';

  /**
   * 一覧データをスクレイピング
   * @returns {Promise<Object>} スクレイピング結果
   */
  static async scrapeListData() {
    console.group('ListScraper.scrapeListData start');
    
    try {
      const { browser, page } = await BrowserHelper.createBrowserAndPage();
      
      try {
        await BrowserHelper.navigateToPage(page, this.TARGET_URL);
        
        const dataList = await this.getDataList(page);
        
        return dataList;
      } finally {
        await BrowserHelper.closeBrowser(browser);
      }
    } catch (error) {
      console.error('ListScraper.scrapeListData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * ページからデータリストを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} データリスト
   */
  static async getDataList(page) {
    // 波照間
    const haterumaStatus = {
      portName: '波照間島航路',
      portCode: 'hateruma',
      status: await this.readStatusData(
        page,
        '#condition > div > div:nth-child(3) > div > div:nth-child(1) > a',
      ),
      comment: await this.readCommentData(
        page,
        '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(1) > div:nth-child(1) > div.conditon_item_caption',
      ),
    };

    // 上原
    const ueharaStatus = {
      portName: '上原航路',
      portCode: 'uehara',
      status: await this.readStatusData(
        page,
        '#condition > div > div:nth-child(3) > div > div:nth-child(2) > a',
      ),
      comment: await this.readCommentData(
        page,
        '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(1) > div.conditon_item_caption',
      ),
    };

    // 鳩間
    const hatomaStatus = {
      portName: '鳩間航路',
      portCode: 'hatoma',
      status: await this.readStatusData(
        page,
        '#condition > div > div:nth-child(3) > div > div:nth-child(3) > a',
      ),
      comment: await this.readCommentData(
        page,
        '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(1) > div.conditon_item_caption',
      ),
    };

    // 大原
    const ooharaStatus = {
      portName: '大原航路',
      portCode: 'oohara',
      status: await this.readStatusData(
        page,
        '#condition > div > div:nth-child(3) > div > div:nth-child(4) > a',
      ),
      comment: await this.readCommentData(
        page,
        '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(2) > div:nth-child(2) > div.conditon_item_caption',
      ),
    };

    // 竹富
    const taketomiStatus = {
      portName: '竹富航路',
      portCode: 'taketomi',
      status: await this.readStatusData(
        page,
        '#condition > div > div:nth-child(3) > div > div:nth-child(5) > a',
      ),
      comment: await this.readCommentData(
        page,
        '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(1) > div.conditon_item_caption',
      ),
    };

    // 小浜
    const kohamaStatus = {
      portName: '小浜航路',
      portCode: 'kohama',
      status: await this.readStatusData(
        page,
        '#condition > div > div:nth-child(3) > div > div:nth-child(6) > a',
      ),
      comment: await this.readCommentData(
        page,
        '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(3) > div:nth-child(2) > div.conditon_item_caption',
      ),
    };

    // 黒島
    const kuroshimaStatus = {
      portName: '黒島航路',
      portCode: 'kuroshima',
      status: await this.readStatusData(
        page,
        '#condition > div > div:nth-child(3) > div > div:nth-child(7) > a',
      ),
      comment: await this.readCommentData(
        page,
        '#condition > div > div:nth-child(5) > div.condition_list > div:nth-child(4) > div > div.conditon_item_caption',
      ),
    };

    return {
      hateruma: haterumaStatus,
      uehara: ueharaStatus,
      hatoma: hatomaStatus,
      oohara: ooharaStatus,
      taketomi: taketomiStatus,
      kohama: kohamaStatus,
      kuroshima: kuroshimaStatus,
    };
  }

  /**
   * タグのcssクラス名からステータスコードを取得
   * @param {string} className - CSSクラス名
   * @returns {Object} ステータスオブジェクト {code, text}
   */
  static getStatusCode(className) {
    if (className === 'operation_partial') {
      return { code: consts.CATION, text: '一部運休' };
    } else if (className === 'operation_suspension') {
      return { code: consts.CANCEL, text: '全便欠航' };
    } else if (className === 'operation_normal') {
      return { code: consts.NORMAL, text: '通常運航' };
    } else {
      return { code: consts.CATION, text: '一部運休' };
    }
  }

  /**
   * ステータスデータを読み取り
   * @param {Object} page - Puppeteerのページオブジェクト
   * @param {string} statusSelector - ステータス要素のセレクタ
   * @returns {Promise<Object>} ステータスオブジェクト {code, text}
   */
  static async readStatusData(page, statusSelector) {
    const raw = await page.$eval(statusSelector, (item) => {
      return { className: item.className, text: item.textContent };
    });
    return this.getStatusCode(raw.className);
  }

  /**
   * コメントデータを読み取り
   * @param {Object} page - Puppeteerのページオブジェクト
   * @param {string} commentSelector - コメント要素のセレクタ
   * @returns {Promise<string>} コメントテキスト
   */
  static async readCommentData(page, commentSelector) {
    return await page.$eval(commentSelector, (item) => {
      return item.textContent.trim();
    });
  }
}

module.exports = ListScraper; 