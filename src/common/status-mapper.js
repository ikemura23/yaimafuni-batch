const consts = require('../consts.js');

/**
 * 汎用的なステータス変換の共通処理
 */
class StatusMapper {
  /**
   * YKF用のステータスマッピング設定を取得
   * @returns {Object} YKF用のステータスマッピング
   */
  static getYKFMapping() {
    return {
      // 記号からステータスコードへの変換
      '△': {
        code: consts.CATION,
        text: '注意',
      },
      '×': {
        code: consts.CANCEL,
        text: '欠航',
      },
      〇: {
        code: consts.NORMAL,
        text: '通常運行',
      },
      '○': {
        code: consts.NORMAL,
        text: '通常運行',
      },
      一部欠航: {
        code: consts.CATION,
        text: '一部欠航',
      },
      '': {
        code: '',
        text: '',
      },
    };
  }

  /**
   * Annei用のステータスマッピング設定を取得
   * @returns {Object} Annei用のステータスマッピング
   */
  static getAnneiMapping() {
    return {
      // Anneiの記号パターン（必要に応じて追加）
      '△': {
        code: consts.CATION,
        text: '注意',
      },
      '×': {
        code: consts.CANCEL,
        text: '欠航',
      },
      〇: {
        code: consts.NORMAL,
        text: '通常運行',
      },
      '○': {
        code: consts.NORMAL,
        text: '通常運行',
      },
      '': {
        code: '',
        text: '',
      },
    };
  }

  /**
   * 記号からステータスコードへの変換
   * @param {string} symbol - 記号（△、×、〇、○、一部欠航など）
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {string} ステータスコード
   */
  static getStatusCode(symbol, company = 'ykf') {
    if (!symbol) {
      return '';
    }

    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    const status = mapping[symbol];
    return status ? status.code : consts.CATION; // デフォルトは注意
  }

  /**
   * 記号からステータステキストへの変換
   * @param {string} symbol - 記号（△、×、〇、○、一部欠航など）
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {string} ステータステキスト
   */
  static getStatusText(symbol, company = 'ykf') {
    if (!symbol) {
      return '';
    }

    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    const status = mapping[symbol];
    return status ? status.text : '注意'; // デフォルトは注意
  }

  /**
   * 記号からステータスオブジェクトへの変換
   * @param {string} symbol - 記号（△、×、〇、○、一部欠航など）
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Object} ステータスオブジェクト {code, text}
   */
  static getStatus(symbol, company = 'ykf') {
    if (!symbol) {
      return {
        code: '',
        text: '',
      };
    }

    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    const status = mapping[symbol];
    return (
      status || {
        code: consts.CATION,
        text: '注意',
      }
    );
  }

  /**
   * ステータスコードからステータステキストへの変換
   * @param {string} statusCode - ステータスコード
   * @returns {string} ステータステキスト
   */
  static getTextFromCode(statusCode) {
    const codeToTextMap = {
      [consts.CANCEL]: '欠航',
      [consts.CATION]: '注意',
      [consts.NORMAL]: '通常運行',
      [consts.SUSPEND]: '運休',
      [consts.NONE]: '無効',
      '': '',
    };

    return codeToTextMap[statusCode] || '注意';
  }

  /**
   * ステータステキストからステータスコードへの変換
   * @param {string} statusText - ステータステキスト
   * @returns {string} ステータスコード
   */
  static getCodeFromText(statusText) {
    const textToCodeMap = {
      欠航: consts.CANCEL,
      注意: consts.CATION,
      通常運行: consts.NORMAL,
      運休: consts.SUSPEND,
      無効: consts.NONE,
      一部欠航: consts.CATION,
      '': '',
    };

    return textToCodeMap[statusText] || consts.CATION;
  }

  /**
   * 複数の記号を一括でステータスコードに変換
   * @param {Array<string>} symbols - 記号の配列
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Array<string>} ステータスコードの配列
   */
  static getStatusCodes(symbols, company = 'ykf') {
    if (!Array.isArray(symbols)) {
      return [];
    }

    return symbols.map((symbol) => this.getStatusCode(symbol, company));
  }

  /**
   * 複数の記号を一括でステータステキストに変換
   * @param {Array<string>} symbols - 記号の配列
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Array<string>} ステータステキストの配列
   */
  static getStatusTexts(symbols, company = 'ykf') {
    if (!Array.isArray(symbols)) {
      return [];
    }

    return symbols.map((symbol) => this.getStatusText(symbol, company));
  }

  /**
   * 複数の記号を一括でステータスオブジェクトに変換
   * @param {Array<string>} symbols - 記号の配列
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Array<Object>} ステータスオブジェクトの配列
   */
  static getStatuses(symbols, company = 'ykf') {
    if (!Array.isArray(symbols)) {
      return [];
    }

    return symbols.map((symbol) => this.getStatus(symbol, company));
  }

  /**
   * 記号が有効かどうかをチェック
   * @param {string} symbol - 記号
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {boolean} 有効な記号かどうか
   */
  static isValidSymbol(symbol, company = 'ykf') {
    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    return symbol in mapping;
  }

  /**
   * ステータスコードが有効かどうかをチェック
   * @param {string} statusCode - ステータスコード
   * @returns {boolean} 有効なステータスコードかどうか
   */
  static isValidStatusCode(statusCode) {
    const validCodes = [
      consts.CANCEL,
      consts.CATION,
      consts.NORMAL,
      consts.SUSPEND,
      consts.NONE,
      '',
    ];

    return validCodes.includes(statusCode);
  }

  /**
   * 指定された会社の全記号を取得
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Array<string>} 記号の配列
   */
  static getAllSymbols(company = 'ykf') {
    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    return Object.keys(mapping);
  }

  /**
   * 指定された会社の全ステータスコードを取得
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Array<string>} ステータスコードの配列
   */
  static getAllStatusCodes(company = 'ykf') {
    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    return Object.values(mapping).map((status) => status.code);
  }
}

module.exports = StatusMapper;
