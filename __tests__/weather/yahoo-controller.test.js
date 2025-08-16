const YahooController = require('../../src/weather/controllers/yahoo-controller.js');

// モックの設定
jest.mock('../../src/weather/scrapers/yahoo-scraper.js', () => {
  return jest.fn().mockImplementation(() => ({
    scrapeWeather: jest.fn(),
  }));
});

jest.mock('../../src/weather/transformers/yahoo-transformer.js', () => {
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

describe('YahooController', () => {
  let yahooController;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にYahooControllerのインスタンスを作成
    yahooController = new YahooController();

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
      expect(yahooController.scraper).toBeDefined();
      expect(yahooController.transformer).toBeDefined();
    });
  });

  describe('updateYahooWeather', () => {
    test('正常にYahoo天気更新処理が実行される', async () => {
      // モックデータの設定
      const mockScrapedData = {
        today: { date: '2024-01-01', weather: 'sunny', temperature: 25 },
        tomorrow: { date: '2024-01-02', weather: 'rainy', temperature: 20 }
      };
      
      const mockTransformedData = {
        today: { 
          date: '2024-01-01',
          weather: 'sunny',
          temperature: { high: 25, low: 15 },
          precipitation: '0%'
        },
        tomorrow: { 
          date: '2024-01-02',
          weather: 'rainy',
          temperature: { high: 20, low: 12 },
          precipitation: '80%'
        }
      };

      // モック関数の設定
      yahooController.scraper.scrapeWeather.mockResolvedValue(mockScrapedData);
      yahooController.transformer.transform.mockReturnValue(mockTransformedData);
      repository.set.mockResolvedValue();

      await yahooController.updateYahooWeather();

      // 各メソッドが呼ばれたことを確認
      expect(yahooController.scraper.scrapeWeather).toHaveBeenCalledTimes(1);
      expect(yahooController.transformer.transform).toHaveBeenCalledWith(mockScrapedData);
      expect(repository.set).toHaveBeenCalledWith('weather/yahoo/today', mockTransformedData.today);
      expect(repository.set).toHaveBeenCalledWith('weather/yahoo/tomorrow', mockTransformedData.tomorrow);

      // ログが出力されたことを確認
      expect(consoleSpy.group).toHaveBeenCalledWith('YahooController.updateYahooWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('Starting Yahoo weather scraping...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Transforming Yahoo weather data...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Saving Yahoo weather data...');
      expect(consoleSpy.log).toHaveBeenCalledWith('YahooController.updateYahooWeather completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('スクレイピングでエラーが発生した場合、エラーが適切に処理される', async () => {
      const testError = new Error('Scraping Error');
      testError.stack = 'Error stack trace';
      
      yahooController.scraper.scrapeWeather.mockRejectedValue(testError);

      await expect(yahooController.updateYahooWeather()).rejects.toThrow('Scraping Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('YahooController.updateYahooWeather error:', testError);
      expect(sendError).toHaveBeenCalledWith('Error stack trace', 'Yahoo天気の更新でエラー発生!');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('データ変換でエラーが発生した場合、エラーが適切に処理される', async () => {
      const mockScrapedData = { today: {}, tomorrow: {} };
      const testError = new Error('Transform Error');
      testError.stack = 'Transform error stack';

      yahooController.scraper.scrapeWeather.mockResolvedValue(mockScrapedData);
      yahooController.transformer.transform.mockImplementation(() => {
        throw testError;
      });

      await expect(yahooController.updateYahooWeather()).rejects.toThrow('Transform Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('YahooController.updateYahooWeather error:', testError);
      expect(sendError).toHaveBeenCalledWith('Transform error stack', 'Yahoo天気の更新でエラー発生!');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('データ保存でエラーが発生した場合、エラーが適切に処理される', async () => {
      const mockScrapedData = { today: {}, tomorrow: {} };
      const mockTransformedData = { today: {}, tomorrow: {} };
      const testError = new Error('Save Error');
      testError.stack = 'Save error stack';

      yahooController.scraper.scrapeWeather.mockResolvedValue(mockScrapedData);
      yahooController.transformer.transform.mockReturnValue(mockTransformedData);
      repository.set.mockRejectedValue(testError);

      await expect(yahooController.updateYahooWeather()).rejects.toThrow('Save Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('YahooController.updateYahooWeather error:', testError);
      expect(sendError).toHaveBeenCalledWith('Save error stack', 'Yahoo天気の更新でエラー発生!');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('saveData', () => {
    test('正常にデータが保存される', async () => {
      const testData = {
        today: { date: '2024-01-01', weather: 'sunny' },
        tomorrow: { date: '2024-01-02', weather: 'cloudy' }
      };
      repository.set.mockResolvedValue();

      await yahooController.saveData(testData);

      expect(repository.set).toHaveBeenCalledWith('weather/yahoo/today', testData.today);
      expect(repository.set).toHaveBeenCalledWith('weather/yahoo/tomorrow', testData.tomorrow);
      expect(consoleSpy.log).toHaveBeenCalledWith('Yahoo weather data saved successfully');
    });

    test('保存でエラーが発生した場合、エラーが再スローされる', async () => {
      const testData = { today: {}, tomorrow: {} };
      const testError = new Error('Repository Error');
      repository.set.mockRejectedValue(testError);

      await expect(yahooController.saveData(testData)).rejects.toThrow('Repository Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('Error saving Yahoo weather data:', testError);
    });
  });
});