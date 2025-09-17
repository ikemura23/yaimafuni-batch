const TenkijpController = require('../../src/weather/controllers/tenkijp-controller.js');

// モックの設定
jest.mock('../../src/weather/scrapers/tenkijp-scraper.js', () => {
  return jest.fn().mockImplementation(() => ({
    scrapeWeather: jest.fn(),
  }));
});

jest.mock('../../src/weather/transformers/tenkijp-transformer.js', () => {
  return jest.fn().mockImplementation(() => ({
    transform: jest.fn(),
  }));
});

jest.mock('../../src/repository/firebase_repository.js', () => ({
  set: jest.fn(),
}));

jest.mock('../../src/slack.js', () => jest.fn());

const repository = require('../../src/repository/firebase_repository.js');
const sendError = require('../../src/slack.js');

describe('TenkijpController', () => {
  let tenkijpController;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にTenkijpControllerのインスタンスを作成
    tenkijpController = new TenkijpController();

    // console.logとconsole.errorをスパイ
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      group: jest.spyOn(console, 'group').mockImplementation(),
      groupEnd: jest.spyOn(console, 'groupEnd').mockImplementation(),
    };
  });

  afterEach(() => {
    // 各テスト後にモックをクリア
    jest.clearAllMocks();
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.group.mockRestore();
    consoleSpy.groupEnd.mockRestore();
  });

  describe('constructor', () => {
    test('scrapperとtransformerが正しく初期化される', () => {
      expect(tenkijpController.scraper).toBeDefined();
      expect(tenkijpController.transformer).toBeDefined();
    });
  });

  describe('updateTenkijpWeather', () => {
    test('正常に天気.jp更新処理が実行される', async () => {
      // モックデータの設定
      const mockScrapedData = {
        today: { date: '2024-01-01', weather: 'sunny' },
        tomorrow: { date: '2024-01-02', weather: 'cloudy' },
      };

      const mockTransformedData = {
        today: {
          date: '2024-01-01',
          weather: 'sunny',
          temperature: { high: 25, low: 15 },
        },
        tomorrow: {
          date: '2024-01-02',
          weather: 'cloudy',
          temperature: { high: 22, low: 12 },
        },
      };

      // モック関数の設定
      tenkijpController.scraper.scrapeWeather.mockResolvedValue(mockScrapedData);
      tenkijpController.transformer.transform.mockReturnValue(mockTransformedData);
      repository.set.mockResolvedValue();

      await tenkijpController.updateTenkijpWeather();

      // 各メソッドが呼ばれたことを確認
      expect(tenkijpController.scraper.scrapeWeather).toHaveBeenCalledTimes(1);
      expect(tenkijpController.transformer.transform).toHaveBeenCalledWith(mockScrapedData);
      expect(repository.set).toHaveBeenCalledWith('weather/tenkijp/today/table', mockTransformedData.today);
      expect(repository.set).toHaveBeenCalledWith('weather/tenkijp/tomorrow/table', mockTransformedData.tomorrow);

      // ログが出力されたことを確認
      expect(consoleSpy.group).toHaveBeenCalledWith('TenkijpController.updateTenkijpWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('Starting Tenkijp weather scraping...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Transforming Tenkijp weather data...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Saving Tenkijp weather data...');
      expect(consoleSpy.log).toHaveBeenCalledWith('TenkijpController.updateTenkijpWeather completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('スクレイピングでエラーが発生した場合、エラーが適切に処理される', async () => {
      const testError = new Error('Scraping Error');
      testError.stack = 'Error stack trace';

      tenkijpController.scraper.scrapeWeather.mockRejectedValue(testError);

      await expect(tenkijpController.updateTenkijpWeather()).rejects.toThrow('Scraping Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('TenkijpController.updateTenkijpWeather error:', testError);
      expect(sendError).toHaveBeenCalledWith('Error stack trace', '天気.jpの更新でエラー発生!');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('データ変換でエラーが発生した場合、エラーが適切に処理される', async () => {
      const mockScrapedData = { today: {}, tomorrow: {} };
      const testError = new Error('Transform Error');
      testError.stack = 'Transform error stack';

      tenkijpController.scraper.scrapeWeather.mockResolvedValue(mockScrapedData);
      tenkijpController.transformer.transform.mockImplementation(() => {
        throw testError;
      });

      await expect(tenkijpController.updateTenkijpWeather()).rejects.toThrow('Transform Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('TenkijpController.updateTenkijpWeather error:', testError);
      expect(sendError).toHaveBeenCalledWith('Transform error stack', '天気.jpの更新でエラー発生!');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('データ保存でエラーが発生した場合、エラーが適切に処理される', async () => {
      const mockScrapedData = { today: {}, tomorrow: {} };
      const mockTransformedData = { today: {}, tomorrow: {} };
      const testError = new Error('Save Error');
      testError.stack = 'Save error stack';

      tenkijpController.scraper.scrapeWeather.mockResolvedValue(mockScrapedData);
      tenkijpController.transformer.transform.mockReturnValue(mockTransformedData);
      repository.set.mockRejectedValue(testError);

      await expect(tenkijpController.updateTenkijpWeather()).rejects.toThrow('Save Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('TenkijpController.updateTenkijpWeather error:', testError);
      expect(sendError).toHaveBeenCalledWith('Save error stack', '天気.jpの更新でエラー発生!');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('saveData', () => {
    test('正常にデータが保存される', async () => {
      const testData = {
        today: { date: '2024-01-01', weather: 'sunny' },
        tomorrow: { date: '2024-01-02', weather: 'cloudy' },
      };
      repository.set.mockResolvedValue();

      await tenkijpController.saveData(testData);

      expect(repository.set).toHaveBeenCalledWith('weather/tenkijp/today/table', testData.today);
      expect(repository.set).toHaveBeenCalledWith('weather/tenkijp/tomorrow/table', testData.tomorrow);
      expect(consoleSpy.log).toHaveBeenCalledWith('Tenkijp weather data saved successfully');
    });

    test('保存でエラーが発生した場合、エラーが再スローされる', async () => {
      const testData = { today: {}, tomorrow: {} };
      const testError = new Error('Repository Error');
      repository.set.mockRejectedValue(testError);

      await expect(tenkijpController.saveData(testData)).rejects.toThrow('Repository Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('Error saving Tenkijp weather data:', testError);
    });
  });
});
