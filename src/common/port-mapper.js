const consts = require('../consts.js');

/**
 * 汎用的な港名・港コード変換の共通処理
 */
class PortMapper {
  constructor(companyMapping = {}) {
    this.companyMapping = companyMapping;
  }

  /**
   * YKF用の港マッピング設定を取得
   * @returns {Object} YKF用の港マッピング
   */
  static getYKFMapping() {
    return {
      竹富: consts.TAKETOMI,
      小浜: consts.KOHAMA,
      '小浜-竹富': consts.KOHAMA_TAKETOMI,
      黒島: consts.KUROSHIMA,
      '小浜-大原': consts.KOHAMA_OOHARA,
      西表大原: consts.OOHARA,
      西表上原: consts.UEHARA,
      '上原-鳩間': consts.UEHARA_HATOMA,
      鳩間: consts.HATOMA,
      // 詳細用の航路名
      竹富航路: consts.TAKETOMI,
      小浜航路: consts.KOHAMA,
      '小浜-竹富航路': consts.KOHAMA_TAKETOMI,
      黒島航路: consts.KUROSHIMA,
      '小浜-大原航路': consts.KOHAMA_OOHARA,
      西表大原航路: consts.OOHARA,
      西表上原航路: consts.UEHARA,
      '上原-鳩間航路': consts.UEHARA_HATOMA,
      鳩間航路: consts.HATOMA,
    };
  }

  /**
   * Annei用の港マッピング設定を取得
   * @returns {Object} Annei用の港マッピング
   */
  static getAnneiMapping() {
    return {
      竹富: consts.TAKETOMI,
      小浜: consts.KOHAMA,
      黒島: consts.KUROSHIMA,
      西表大原: consts.OOHARA,
      西表上原: consts.UEHARA,
      鳩間: consts.HATOMA,
      波照間: consts.HATERUMA,
      // 詳細用の航路名
      竹富航路: consts.TAKETOMI,
      小浜航路: consts.KOHAMA,
      黒島航路: consts.KUROSHIMA,
      西表大原航路: consts.OOHARA,
      西表上原航路: consts.UEHARA,
      鳩間航路: consts.HATOMA,
      波照間航路: consts.HATERUMA,
    };
  }

  /**
   * 港名から港コードへの変換
   * @param {string} portName - 港名
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {string} 港コード
   */
  static getPortCode(portName, company = 'ykf') {
    if (!portName) {
      return null;
    }

    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    return mapping[portName] || null;
  }

  /**
   * 港コードから港名への変換
   * @param {string} portCode - 港コード
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {string} 港名
   */
  static getPortName(portCode, company = 'ykf') {
    if (!portCode) {
      return null;
    }

    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    // 逆引き
    for (const [name, code] of Object.entries(mapping)) {
      if (code === portCode) {
        return name;
      }
    }

    return null;
  }

  /**
   * 複数の港名を一括で港コードに変換
   * @param {Array<string>} portNames - 港名の配列
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Array<string>} 港コードの配列
   */
  static getPortCodes(portNames, company = 'ykf') {
    if (!Array.isArray(portNames)) {
      return [];
    }

    return portNames
      .map((portName) => this.getPortCode(portName, company))
      .filter((code) => code !== null);
  }

  /**
   * 複数の港コードを一括で港名に変換
   * @param {Array<string>} portCodes - 港コードの配列
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Array<string>} 港名の配列
   */
  static getPortNames(portCodes, company = 'ykf') {
    if (!Array.isArray(portCodes)) {
      return [];
    }

    return portCodes
      .map((portCode) => this.getPortName(portCode, company))
      .filter((name) => name !== null);
  }

  /**
   * 指定された会社の全港名を取得
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Array<string>} 港名の配列
   */
  static getAllPortNames(company = 'ykf') {
    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    return Object.keys(mapping);
  }

  /**
   * 指定された会社の全港コードを取得
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {Array<string>} 港コードの配列
   */
  static getAllPortCodes(company = 'ykf') {
    const mapping =
      company === 'ykf' ? this.getYKFMapping() : this.getAnneiMapping();

    return Object.values(mapping);
  }

  /**
   * 港名が有効かどうかをチェック
   * @param {string} portName - 港名
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {boolean} 有効な港名かどうか
   */
  static isValidPortName(portName, company = 'ykf') {
    return this.getPortCode(portName, company) !== null;
  }

  /**
   * 港コードが有効かどうかをチェック
   * @param {string} portCode - 港コード
   * @param {string} company - 会社名（'ykf' または 'anei'）
   * @returns {boolean} 有効な港コードかどうか
   */
  static isValidPortCode(portCode, company = 'ykf') {
    return this.getPortName(portCode, company) !== null;
  }
}

module.exports = PortMapper;
