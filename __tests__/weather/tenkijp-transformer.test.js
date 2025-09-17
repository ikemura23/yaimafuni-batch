const TenkijpTransformer = require('../../src/weather/transformers/tenkijp-transformer.js');

describe('TenkijpTransformer', () => {
  let tenkijpTransformer;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にTenkijpTransformerのインスタンスを作成
    tenkijpTransformer = new TenkijpTransformer();

    // console.logとconsole.errorをスパイ
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
    };
  });

  afterEach(() => {
    // 各テスト後にモックをクリア
    jest.clearAllMocks();
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  describe('transform', () => {
    test('正常にスクレイピングデータを保存用データ形式に変換する', () => {
      // モックスクレイピングデータ
      const mockData = {
        today: [
          { hour: '09', weather: '晴れ', windBlow: '北', windSpeed: '2m/s' },
          { hour: '12', weather: '曇り', windBlow: '北東', windSpeed: '3m/s' },
          { hour: '15', weather: '雨', windBlow: '東', windSpeed: '4m/s' },
        ],
        tomorrow: [
          { hour: '09', weather: '曇り', windBlow: '南', windSpeed: '3m/s' },
          { hour: '12', weather: '晴れ', windBlow: '南西', windSpeed: '2m/s' },
        ],
      };

      const result = tenkijpTransformer.transform(mockData);

      // 結果の確認
      expect(result).toHaveProperty('today');
      expect(result).toHaveProperty('tomorrow');

      expect(result.today).toHaveLength(3);
      expect(result.today[0]).toEqual({
        hour: '09',
        weather: '晴れ',
        windBlow: '北',
        windSpeed: '2m/s',
      });

      expect(result.tomorrow).toHaveLength(2);
      expect(result.tomorrow[0]).toEqual({
        hour: '09',
        weather: '曇り',
        windBlow: '南',
        windSpeed: '3m/s',
      });

      // ログ確認
      expect(consoleSpy.log).toHaveBeenCalledWith('TenkijpTransformer.transform start');
      expect(consoleSpy.log).toHaveBeenCalledWith('TenkijpTransformer.transform end');
    });

    test('空のデータでも正常に処理される', () => {
      const mockData = {
        today: [],
        tomorrow: [],
      };

      const result = tenkijpTransformer.transform(mockData);

      expect(result.today).toEqual([]);
      expect(result.tomorrow).toEqual([]);
      expect(consoleSpy.log).toHaveBeenCalledWith('TenkijpTransformer.transform start');
      expect(consoleSpy.log).toHaveBeenCalledWith('TenkijpTransformer.transform end');
    });

    test('不正なデータでエラーが適切に処理される', () => {
      const mockData = {
        today: null, // 不正なデータ
        tomorrow: [],
      };

      expect(() => {
        tenkijpTransformer.transform(mockData);
      }).toThrow('Weather data must be an array');

      expect(consoleSpy.log).toHaveBeenCalledWith('TenkijpTransformer.transform start');
      expect(consoleSpy.error).toHaveBeenCalledWith('TenkijpTransformer.transform error:', expect.any(Error));
    });
  });

  describe('validateAndTransform', () => {
    test('正常なデータ配列を検証・変換する', () => {
      const mockDataArray = [
        { hour: '09', weather: '晴れ', windBlow: '北', windSpeed: '2m/s' },
        { hour: '12', weather: '曇り', windBlow: '北東', windSpeed: '3m/s' },
        { hour: '15', weather: '雨', windBlow: '東', windSpeed: '4m/s' },
      ];

      const result = tenkijpTransformer.validateAndTransform(mockDataArray);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        hour: '09',
        weather: '晴れ',
        windBlow: '北',
        windSpeed: '2m/s',
      });
      expect(result[1]).toEqual({
        hour: '12',
        weather: '曇り',
        windBlow: '北東',
        windSpeed: '3m/s',
      });
      expect(result[2]).toEqual({
        hour: '15',
        weather: '雨',
        windBlow: '東',
        windSpeed: '4m/s',
      });
    });

    test('欠損データがある場合、警告を出力して適切にデフォルト値を設定する', () => {
      const mockDataArray = [
        { hour: '09', weather: '晴れ', windBlow: '北', windSpeed: '2m/s' },
        { hour: '12', weather: '', windBlow: '北東', windSpeed: '3m/s' }, // weather が空
        { hour: '', weather: '雨', windBlow: '', windSpeed: '4m/s' }, // hour, windBlow が空
        { hour: '18', weather: '曇り', windBlow: '南', windSpeed: '' }, // windSpeed が空
      ];

      const result = tenkijpTransformer.validateAndTransform(mockDataArray);

      expect(result).toHaveLength(4);
      expect(result[1]).toEqual({
        hour: '12',
        weather: '',
        windBlow: '北東',
        windSpeed: '3m/s',
      });
      expect(result[2]).toEqual({
        hour: '',
        weather: '雨',
        windBlow: '',
        windSpeed: '4m/s',
      });

      // 警告ログが出力されることを確認
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: weather at index 1');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: hour at index 2');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: windBlow at index 2');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: windSpeed at index 3');
    });

    test('nullやundefinedのアイテムがある場合、それらを除外する', () => {
      const mockDataArray = [
        { hour: '09', weather: '晴れ', windBlow: '北', windSpeed: '2m/s' },
        null,
        { hour: '12', weather: '曇り', windBlow: '北東', windSpeed: '3m/s' },
        undefined,
        { hour: '15', weather: '雨', windBlow: '東', windSpeed: '4m/s' },
      ];

      const result = tenkijpTransformer.validateAndTransform(mockDataArray);

      expect(result).toHaveLength(3); // null, undefinedが除外されて3つ
      expect(result[0].hour).toBe('09');
      expect(result[1].hour).toBe('12');
      expect(result[2].hour).toBe('15');

      // 警告ログが出力されることを確認
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing weather data at index 1');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing weather data at index 3');
    });

    test('配列でない場合、エラーをスローする', () => {
      expect(() => {
        tenkijpTransformer.validateAndTransform('not an array');
      }).toThrow('Weather data must be an array');

      expect(() => {
        tenkijpTransformer.validateAndTransform(null);
      }).toThrow('Weather data must be an array');

      expect(() => {
        tenkijpTransformer.validateAndTransform(undefined);
      }).toThrow('Weather data must be an array');
    });

    test('空の配列を渡した場合、空の配列が返される', () => {
      const result = tenkijpTransformer.validateAndTransform([]);
      expect(result).toEqual([]);
    });

    test('部分的に不正なフィールドを持つデータも適切に処理される', () => {
      const mockDataArray = [
        { hour: '09', weather: '晴れ', windBlow: '北', windSpeed: '2m/s' },
        { hour: '12', extraField: 'extra', windBlow: '北東', windSpeed: '3m/s' }, // weather missing, extra field
        { weather: '雨', windBlow: '東', windSpeed: '4m/s' }, // hour missing
      ];

      const result = tenkijpTransformer.validateAndTransform(mockDataArray);

      expect(result).toHaveLength(3);
      expect(result[1]).toEqual({
        hour: '12',
        weather: '', // デフォルト値
        windBlow: '北東',
        windSpeed: '3m/s',
      });
      expect(result[2]).toEqual({
        hour: '', // デフォルト値
        weather: '雨',
        windBlow: '東',
        windSpeed: '4m/s',
      });

      // 警告ログが出力されることを確認
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: weather at index 1');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: hour at index 2');
    });
  });

  describe('統合テスト', () => {
    test('実際のスクレイピングデータ形式でも正常に動作する', () => {
      // 実際のスクレイパーから取得される可能性のあるデータ形式
      const mockData = {
        today: [
          { hour: '09', weather: '晴れ', windBlow: '北', windSpeed: '2m/s' },
          { hour: '12', weather: '晴れ時々曇り', windBlow: '北北東', windSpeed: '3m/s' },
          { hour: '15', weather: '曇り一時雨', windBlow: '北東', windSpeed: '4m/s' },
          { hour: '18', weather: '雨', windBlow: '東', windSpeed: '5m/s' },
          { hour: '21', weather: '雨時々曇り', windBlow: '東南東', windSpeed: '3m/s' },
        ],
        tomorrow: [
          { hour: '09', weather: '曇り', windBlow: '南東', windSpeed: '4m/s' },
          { hour: '12', weather: '晴れ', windBlow: '南', windSpeed: '2m/s' },
          { hour: '15', weather: '晴れ', windBlow: '南南西', windSpeed: '2m/s' },
          { hour: '18', weather: '曇り', windBlow: '南西', windSpeed: '3m/s' },
          { hour: '21', weather: '曇り時々雨', windBlow: '西', windSpeed: '4m/s' },
        ],
      };

      const result = tenkijpTransformer.transform(mockData);

      // 基本構造の確認
      expect(result).toHaveProperty('today');
      expect(result).toHaveProperty('tomorrow');
      expect(result.today).toHaveLength(5);
      expect(result.tomorrow).toHaveLength(5);

      // 複雑な天気表現も正しく保持されている
      expect(result.today[1].weather).toBe('晴れ時々曇り');
      expect(result.today[2].weather).toBe('曇り一時雨');
      expect(result.tomorrow[4].weather).toBe('曇り時々雨');

      // 風向きの複雑な表現も正しく保持されている
      expect(result.today[1].windBlow).toBe('北北東');
      expect(result.tomorrow[0].windBlow).toBe('南東');
      expect(result.tomorrow[2].windBlow).toBe('南南西');
    });
  });
});
