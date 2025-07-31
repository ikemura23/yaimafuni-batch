const createBrowser = require('../browser-factory');
const config = require('../config/config');

/**
 * 汎用的なブラウザ操作の共通処理
 */
class BrowserHelper {
  /**
   * ブラウザとページを作成し、基本的な設定を行う
   * @param {Object} options - オプション設定
   * @param {string} options.userAgent - ユーザーエージェント（デフォルト: config.puppeteer.userAgent）
   * @param {number} options.timeout - タイムアウト時間（ミリ秒、デフォルト: 60000）
   * @returns {Object} {browser, page} - ブラウザとページのインスタンス
   */
  static async createBrowserAndPage(options = {}) {
    const browser = await createBrowser();
    const page = await browser.newPage();

    // ユーザーエージェント設定
    const userAgent = options.userAgent || config.puppeteer.userAgent;
    await page.setUserAgent(userAgent);

    // タイムアウト設定
    const timeout = options.timeout || 60000;
    page.setDefaultTimeout(timeout);

    return { browser, page };
  }

  /**
   * ページに移動し、指定された条件まで待機する
   * @param {Object} page - Puppeteerのページオブジェクト
   * @param {string} url - 移動先URL
   * @param {Object} options - オプション設定
   * @param {string} options.waitUntil - 待機条件（デフォルト: 'networkidle2'）
   * @param {number} options.timeout - タイムアウト時間（ミリ秒、デフォルト: 60000）
   */
  static async navigateToPage(page, url, options = {}) {
    const waitUntil = options.waitUntil || 'networkidle2';
    const timeout = options.timeout || 60000;

    await page.goto(url, { waitUntil, timeout });
  }

  /**
   * セレクターで要素を取得し、textContentを返す
   * @param {Object} page - Puppeteerのページオブジェクト
   * @param {string} selector - CSSセレクター
   * @param {string} defaultValue - 要素が見つからない場合のデフォルト値（デフォルト: ''）
   * @returns {string} 要素のtextContent
   */
  static async getTextContent(page, selector, defaultValue = '') {
    try {
      return await page.$eval(selector, (item) => item.textContent);
    } catch (error) {
      // 要素が見つからない場合はデフォルト値を返す
      return defaultValue;
    }
  }

  /**
   * セレクターで複数の要素を取得し、textContentの配列を返す
   * @param {Object} page - Puppeteerのページオブジェクト
   * @param {string} selector - CSSセレクター
   * @returns {Array<string>} 要素のtextContentの配列
   */
  static async getTextContents(page, selector) {
    try {
      return await page.$$eval(selector, (items) => items.map((item) => item.textContent));
    } catch (error) {
      return [];
    }
  }

  /**
   * セレクターで要素を取得し、innerHTMLを返す
   * @param {Object} page - Puppeteerのページオブジェクト
   * @param {string} selector - CSSセレクター
   * @param {string} defaultValue - 要素が見つからない場合のデフォルト値（デフォルト: ''）
   * @returns {string} 要素のinnerHTML
   */
  static async getInnerHTML(page, selector, defaultValue = '') {
    try {
      return await page.$eval(selector, (item) => item.innerHTML);
    } catch (error) {
      return defaultValue;
    }
  }

  /**
   * セレクターで複数の要素を取得し、innerHTMLの配列を返す
   * @param {Object} page - Puppeteerのページオブジェクト
   * @param {string} selector - CSSセレクター
   * @returns {Array<string>} 要素のinnerHTMLの配列
   */
  static async getInnerHTMLs(page, selector) {
    try {
      return await page.$$eval(selector, (items) => items.map((item) => item.innerHTML));
    } catch (error) {
      return [];
    }
  }

  /**
   * ブラウザを安全にクローズする
   * @param {Object} browser - Puppeteerのブラウザオブジェクト
   */
  static async closeBrowser(browser) {
    if (browser) {
      try {
        await browser.close();
      } catch (error) {
        console.error('ブラウザクローズ時にエラーが発生しました:', error.message);
      }
    }
  }

  /**
   * スクレイピング処理の共通ラッパー
   * @param {Function} scrapingFunction - スクレイピング処理を行う関数
   * @param {Object} options - オプション設定
   * @returns {Promise<any>} スクレイピング結果
   */
  static async executeScraping(scrapingFunction, options = {}) {
    let browser = null;
    try {
      const { browser: createdBrowser, page } = await this.createBrowserAndPage(options);
      browser = createdBrowser;

      return await scrapingFunction(page);
    } catch (error) {
      throw error;
    } finally {
      await this.closeBrowser(browser);
    }
  }
}

module.exports = BrowserHelper;
