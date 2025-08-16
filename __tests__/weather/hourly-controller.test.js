const HourlyController = require('../../src/weather/controllers/hourly-controller.js');

// モックの設定
jest.mock('../../src/weather/scrapers/hourly-scraper.js', () => {
  return jest.fn().mockImplementation(() => ({
    fetchWeather: jest.fn(),
  }));
});

jest.mock('../../src/weather/transformers/hourly-transformer.js', () => {
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

describe('HourlyController', () => {
  let hourlyController;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にHourlyControllerのインスタンスを作成
    hourlyController = new HourlyController();

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
      expect(hourlyController.scraper).toBeDefined();
      expect(hourlyController.transformer).toBeDefined();
    });
  });

  describe('updateHourlyWeather', () => {
    test('正常に時間別天気更新処理が実行される', async () => {
      // モックデータの設定
      const mockApiResponse = {
        forecasts: [
          {
            dateLabel: '今日',
            chanceOfRain: {
              T00_06: '--%',
              T06_12: '10%',
              T12_18: '20%',
              T18_24: '0%'
            }
          }
        ]
      };
      
      const mockTransformedData = {
        '2024-01-01': [
          { time: '00', temperature: 20, humidity: 60 }
        ]
      };

      // モック関数の設定
      hourlyController.scraper.fetchWeather.mockResolvedValue(mockApiResponse);
      hourlyController.transformer.transform.mockReturnValue(mockTransformedData);
      repository.set.mockResolvedValue();

      await hourlyController.updateHourlyWeather();

      // 各メソッドが呼ばれたことを確認
      expect(hourlyController.scraper.fetchWeather).toHaveBeenCalledTimes(1);
      expect(hourlyController.transformer.transform).toHaveBeenCalledWith(mockApiResponse);
      expect(repository.set).toHaveBeenCalledWith('hourly_weather/v1/', mockTransformedData);

      // ログが出力されたことを確認
      expect(consoleSpy.group).toHaveBeenCalledWith('HourlyController.updateHourlyWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('Starting hourly weather API call...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Transforming hourly weather data...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Saving hourly weather data...');
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyController.updateHourlyWeather completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('API呼び出しでエラーが発生した場合、エラーが適切に処理される', async () => {
      const testError = new Error('API Error');
      testError.stack = 'Error stack trace';
      
      hourlyController.scraper.fetchWeather.mockRejectedValue(testError);

      await expect(hourlyController.updateHourlyWeather()).rejects.toThrow('API Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('HourlyController.updateHourlyWeather error:', testError);
      expect(sendError).toHaveBeenCalledWith('Error stack trace', '時間別天気の更新でエラー発生!');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('データ変換でエラーが発生した場合、エラーが適切に処理される', async () => {
      const mockApiResponse = { forecasts: [] };
      const testError = new Error('Transform Error');
      testError.stack = 'Transform error stack';

      hourlyController.scraper.fetchWeather.mockResolvedValue(mockApiResponse);
      hourlyController.transformer.transform.mockImplementation(() => {
        throw testError;
      });

      await expect(hourlyController.updateHourlyWeather()).rejects.toThrow('Transform Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('HourlyController.updateHourlyWeather error:', testError);
      expect(sendError).toHaveBeenCalledWith('Transform error stack', '時間別天気の更新でエラー発生!');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('データ保存でエラーが発生した場合、エラーが適切に処理される', async () => {
      const mockApiResponse = { forecasts: [] };
      const mockTransformedData = { '2024-01-01': [] };
      const testError = new Error('Save Error');
      testError.stack = 'Save error stack';

      hourlyController.scraper.fetchWeather.mockResolvedValue(mockApiResponse);
      hourlyController.transformer.transform.mockReturnValue(mockTransformedData);
      repository.set.mockRejectedValue(testError);

      await expect(hourlyController.updateHourlyWeather()).rejects.toThrow('Save Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('HourlyController.updateHourlyWeather error:', testError);
      expect(sendError).toHaveBeenCalledWith('Save error stack', '時間別天気の更新でエラー発生!');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('saveData', () => {
    test('正常にデータが保存される', async () => {
      const testData = { '2024-01-01': [{ time: '00', temperature: 20 }] };
      repository.set.mockResolvedValue();

      await hourlyController.saveData(testData);

      expect(repository.set).toHaveBeenCalledWith('hourly_weather/v1/', testData);
      expect(consoleSpy.log).toHaveBeenCalledWith('Hourly weather data saved successfully');
    });

    test('保存でエラーが発生した場合、エラーが再スローされる', async () => {
      const testData = { '2024-01-01': [] };
      const testError = new Error('Repository Error');
      repository.set.mockRejectedValue(testError);

      await expect(hourlyController.saveData(testData)).rejects.toThrow('Repository Error');

      expect(consoleSpy.error).toHaveBeenCalledWith('Error saving hourly weather data:', testError);
    });
  });
});