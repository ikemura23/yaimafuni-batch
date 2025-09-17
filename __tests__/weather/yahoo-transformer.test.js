const YahooTransformer = require('../../src/weather/transformers/yahoo-transformer.js');

describe('YahooTransformer', () => {
  let yahooTransformer;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にYahooTransformerのインスタンスを作成
    yahooTransformer = new YahooTransformer();

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
        today: {
          date: '1月1日(月)',
          weather: '晴れ',
          temperature: { hight: '25°', low: '15°' },
          wave: '1.5m',
          wind: '北 2m/s',
        },
        tomorrow: {
          date: '1月2日(火)',
          weather: '曇り',
          temperature: { hight: '22°', low: '12°' },
          wave: '2.0m',
          wind: '南 3m/s',
        },
      };

      const result = yahooTransformer.transform(mockData);

      // 結果の確認
      expect(result).toHaveProperty('today');
      expect(result).toHaveProperty('tomorrow');

      expect(result.today).toEqual({
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: { hight: '25°', low: '15°' },
        wave: '1.5m',
        wind: '北 2m/s',
      });

      expect(result.tomorrow).toEqual({
        date: '1月2日(火)',
        weather: '曇り',
        temperature: { hight: '22°', low: '12°' },
        wave: '2.0m',
        wind: '南 3m/s',
      });

      // ログ確認
      expect(consoleSpy.log).toHaveBeenCalledWith('YahooTransformer.transform start');
      expect(consoleSpy.log).toHaveBeenCalledWith('YahooTransformer.transform end');
    });

    test('不正なデータでエラーが適切に処理される', () => {
      const mockData = {
        today: null, // 不正なデータ
        tomorrow: {
          date: '1月2日(火)',
          weather: '曇り',
          temperature: { hight: '22°', low: '12°' },
          wave: '2.0m',
          wind: '南 3m/s',
        },
      };

      expect(() => {
        yahooTransformer.transform(mockData);
      }).toThrow('Weather data is required');

      expect(consoleSpy.log).toHaveBeenCalledWith('YahooTransformer.transform start');
      expect(consoleSpy.error).toHaveBeenCalledWith('YahooTransformer.transform error:', expect.any(Error));
    });

    test('transformでエラーが発生した場合、ログが出力される', () => {
      // validateAndTransformをモックしてエラーを発生させる
      const transformError = new Error('Transform failed');
      jest.spyOn(yahooTransformer, 'validateAndTransform').mockImplementation(() => {
        throw transformError;
      });

      const mockData = {
        today: {
          date: '1月1日',
          weather: '晴れ',
          temperature: { hight: '25°', low: '15°' },
          wave: '1.5m',
          wind: '北 2m/s',
        },
        tomorrow: {
          date: '1月2日',
          weather: '曇り',
          temperature: { hight: '22°', low: '12°' },
          wave: '2.0m',
          wind: '南 3m/s',
        },
      };

      expect(() => {
        yahooTransformer.transform(mockData);
      }).toThrow('Transform failed');

      expect(consoleSpy.log).toHaveBeenCalledWith('YahooTransformer.transform start');
      expect(consoleSpy.error).toHaveBeenCalledWith('YahooTransformer.transform error:', transformError);
    });
  });

  describe('validateAndTransform', () => {
    test('正常なデータを検証・変換する', () => {
      const mockWeatherData = {
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: { hight: '25°', low: '15°' },
        wave: '1.5m',
        wind: '北 2m/s',
      };

      const result = yahooTransformer.validateAndTransform(mockWeatherData);

      expect(result).toEqual({
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: { hight: '25°', low: '15°' },
        wave: '1.5m',
        wind: '北 2m/s',
      });
    });

    test('欠損データがある場合、警告を出力して適切にデフォルト値を設定する', () => {
      const mockWeatherData = {
        date: '1月1日(月)',
        weather: '', // 空
        temperature: { hight: '25°', low: '' }, // low が空
        // wave は欠損
        wind: '北 2m/s',
      };

      const result = yahooTransformer.validateAndTransform(mockWeatherData);

      expect(result).toEqual({
        date: '1月1日(月)',
        weather: '',
        temperature: { hight: '25°', low: '' },
        wave: '',
        wind: '北 2m/s',
      });

      // 警告ログが出力されることを確認
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: weather');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: wave');
    });

    test('temperature オブジェクトが欠損している場合、デフォルト値を設定する', () => {
      const mockWeatherData = {
        date: '1月1日(月)',
        weather: '晴れ',
        // temperature は欠損
        wave: '1.5m',
        wind: '北 2m/s',
      };

      const result = yahooTransformer.validateAndTransform(mockWeatherData);

      expect(result).toEqual({
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: { hight: '', low: '' },
        wave: '1.5m',
        wind: '北 2m/s',
      });

      // 警告ログが出力されることを確認
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: temperature');
    });

    test('部分的な temperature オブジェクトも適切に処理される', () => {
      const mockWeatherData = {
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: { hight: '25°' }, // low が欠損
        wave: '1.5m',
        wind: '北 2m/s',
      };

      const result = yahooTransformer.validateAndTransform(mockWeatherData);

      expect(result).toEqual({
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: { hight: '25°', low: '' },
        wave: '1.5m',
        wind: '北 2m/s',
      });
    });

    test('nullまたはundefinedのデータでエラーをスローする', () => {
      expect(() => {
        yahooTransformer.validateAndTransform(null);
      }).toThrow('Weather data is required');

      expect(() => {
        yahooTransformer.validateAndTransform(undefined);
      }).toThrow('Weather data is required');
    });

    test('すべてのフィールドが欠損している場合でもデフォルト値で処理される', () => {
      const mockWeatherData = {}; // すべて欠損

      const result = yahooTransformer.validateAndTransform(mockWeatherData);

      expect(result).toEqual({
        date: '',
        weather: '',
        temperature: { hight: '', low: '' },
        wave: '',
        wind: '',
      });

      // すべてのフィールドで警告ログが出力されることを確認
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: date');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: weather');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: temperature');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: wave');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Missing required field: wind');
    });

    test('余分なフィールドがあっても正常に処理される', () => {
      const mockWeatherData = {
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: { hight: '25°', low: '15°' },
        wave: '1.5m',
        wind: '北 2m/s',
        extraField1: 'extra1', // 余分なフィールド
        extraField2: 'extra2', // 余分なフィールド
      };

      const result = yahooTransformer.validateAndTransform(mockWeatherData);

      // 余分なフィールドは含まれず、必要なフィールドのみが返される
      expect(result).toEqual({
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: { hight: '25°', low: '15°' },
        wave: '1.5m',
        wind: '北 2m/s',
      });

      expect(result).not.toHaveProperty('extraField1');
      expect(result).not.toHaveProperty('extraField2');
    });
  });

  describe('統合テスト', () => {
    test('実際のスクレイピングデータ形式でも正常に動作する', () => {
      // 実際のYahooスクレイパーから取得される可能性のあるデータ形式
      const mockData = {
        today: {
          date: '1月15日(月)',
          weather: '晴れ時々曇り',
          temperature: {
            hight: '28°',
            low: '18°',
          },
          wave: '1.0m',
          wind: '北東 3m/s',
        },
        tomorrow: {
          date: '1月16日(火)',
          weather: '曇り一時雨',
          temperature: {
            hight: '24°',
            low: '16°',
          },
          wave: '2.5m',
          wind: '南南西 5m/s',
        },
      };

      const result = yahooTransformer.transform(mockData);

      // 基本構造の確認
      expect(result).toHaveProperty('today');
      expect(result).toHaveProperty('tomorrow');

      // 複雑な天気表現も正しく保持されている
      expect(result.today.weather).toBe('晴れ時々曇り');
      expect(result.tomorrow.weather).toBe('曇り一時雨');

      // 風向きの複雑な表現も正しく保持されている
      expect(result.today.wind).toBe('北東 3m/s');
      expect(result.tomorrow.wind).toBe('南南西 5m/s');

      // temperature オブジェクトが正しく保持されている
      expect(result.today.temperature).toEqual({ hight: '28°', low: '18°' });
      expect(result.tomorrow.temperature).toEqual({ hight: '24°', low: '16°' });
    });

    test('改行文字や空白文字が含まれたデータも正常に処理される', () => {
      // スクレイピング時に改行文字などが含まれる可能性のあるデータ
      const mockData = {
        today: {
          date: ' 1月15日(月)\n ',
          weather: '\n晴れ時々曇り\r\n ',
          temperature: {
            hight: ' 28°\n',
            low: '\r15°\n ',
          },
          wave: '  1.0m ',
          wind: ' 北東 3m/s\n',
        },
        tomorrow: {
          date: '1月16日(火)',
          weather: '曇り',
          temperature: {
            hight: '24°',
            low: '16°',
          },
          wave: '2.5m',
          wind: '南 5m/s',
        },
      };

      const result = yahooTransformer.transform(mockData);

      // データがそのまま保持されている（変換は行わない）
      expect(result.today.date).toBe(' 1月15日(月)\n ');
      expect(result.today.weather).toBe('\n晴れ時々曇り\r\n ');
      expect(result.today.temperature.hight).toBe(' 28°\n');
      expect(result.today.temperature.low).toBe('\r15°\n ');
    });
  });
});
