const BrowserHelper = require('../../common/browser-helper');

const URL = 'http://www.yaeyama.co.jp/operation.html';

/**
 * YKF詳細のスクレイピング処理
 */
class DetailScraper {
  /**
   * 詳細データをスクレイピングする
   * @returns {Promise<Object>} スクレイピング結果
   */
  static async scrapeDetailData() {
    console.group('DetailScraper.scrapeDetailData start');

    try {
      const result = await BrowserHelper.executeScraping(async (page) => {
        // ページに移動
        await BrowserHelper.navigateToPage(page, URL);

        // データ取得
        const data = await this.getData(page);

        return data;
      });

      return result;
    } catch (error) {
      console.error('DetailScraper.scrapeDetailData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 詳細データを取得
   * @param {Object} page - Puppeteerのページオブジェクト
   * @returns {Promise<Object>} 詳細データ
   */
  static async getData(page) {
    console.group('DetailScraper.getData start');

    try {
      // 最初に div.local をまとめて取得
      const devLocalNodes = await page.$$('#status > div > div.local');

      if (devLocalNodes.length == 0) {
        console.log('devLocalNodes is empty');
        return null;
      }

      // 送信用データ生成
      const sendData = {
        taketomi: await this.getStatusData(await devLocalNodes[0].$$('div.local.local0 > table > tbody > tr')), // 竹富
        kohama: await this.getStatusData(await devLocalNodes[1].$$('div.local.local1 > table > tbody > tr')), // 小浜
        kuroshima: await this.getStatusData(await devLocalNodes[2].$$('div.local.local2 > table > tbody > tr')), // 黒島
        oohara: await this.getStatusData(await devLocalNodes[3].$$('div.local.local3 > table > tbody > tr')), // 大原
        uehara: await this.getStatusData(await devLocalNodes[4].$$('div.local.local4 > table > tbody > tr')), // 上原
        hatoma: await this.getStatusData(await devLocalNodes[5].$$('div.local.local5 > table > tbody > tr')), // 鳩間
      };

      return sendData;
    } catch (error) {
      console.error('DetailScraper.getData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 港単体のデータ取得
   * @param {Array} trNodes - テーブル行の配列
   * @returns {Promise<Object>} 港の詳細データ
   */
  static async getStatusData(trNodes) {
    console.group('DetailScraper.getStatusData start');

    try {
      if (trNodes.length === 0) {
        console.log('trNodes is empty');
        return;
      }

      // ヘッダー左
      const leftPortName = await trNodes[1].$eval('td:nth-child(1)', (nd) => nd.innerText);
      // ヘッダー右
      const rightPortName = await trNodes[1].$eval('td:nth-child(2)', (nd) => nd.innerText);

      // 時刻ごとのステータス
      // trタグの0〜1行目は港名なので除外する
      const timeTable = trNodes.filter((_, i) => i > 1);
      const rows = [];

      // 時刻ステータスのループ
      for (const time of timeTable) {
        // 左の行
        const trLeft = await time.$eval('td:nth-child(1)', (nd) => nd.innerText);
        const leftWords = trLeft.split(' ');

        // 右の行
        const trRight = await time.$eval('td:nth-child(2)', (nd) => nd.innerText);
        const rightWords = trRight.split(' ');

        // 行データ生成
        const row = {
          left: {
            memo: '',
            time: leftWords[1],
            status: {
              code: this.getRowStatusCode(leftWords[0]),
              text: this.getRowStatusText(leftWords[0]),
            },
          },
          right: {
            memo: '',
            time: rightWords[1],
            status: {
              code: this.getRowStatusCode(rightWords[0]),
              text: this.getRowStatusText(rightWords[0]),
            },
          },
        };

        // 配列に追加
        rows.push(row);
      }

      // 返却データ作成
      return {
        header: {
          left: leftPortName,
          right: rightPortName,
        },
        row: rows,
      };
    } catch (error) {
      console.error('DetailScraper.getStatusData error:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * 記号からステータスを取得
   * @param {string} statusRawText - 生のステータステキスト
   * @returns {string} ステータスコード
   */
  static getRowStatusCode(statusRawText) {
    switch (statusRawText) {
      case '△':
        return 'cation';
      case '×':
        return 'cancel';
      case '〇':
        return 'normal';
      case '':
        return '';
      default:
        return 'cation';
    }
  }

  /**
   * 記号からステータス文字を取得
   * @param {string} statusRawText - 生のステータステキスト
   * @returns {string} ステータステキスト
   */
  static getRowStatusText(statusRawText) {
    switch (statusRawText) {
      case '○':
        return '通常運行';
      case '〇':
        return '通常運行';
      case '×':
        return '欠航';
      case '':
        return '';
      default:
        return '注意';
    }
  }
}

module.exports = DetailScraper;
