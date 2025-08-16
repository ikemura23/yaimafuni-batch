const HourlyScraper = require('../../src/weather/scrapers/hourly-scraper.js');

// fetchのモック
global.fetch = jest.fn();

describe('HourlyScraper', () => {
  let hourlyScraper;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にHourlyScraperのインスタンスを作成
    hourlyScraper = new HourlyScraper();

    // console.logとconsole.errorをスパイ
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };
  });

  afterEach(() => {
    // 各テスト後にモックをクリア
    jest.clearAllMocks();
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('constructor', () => {
    test('apiUrlが正しく設定される', () => {
      expect(hourlyScraper.apiUrl).toContain('api.open-meteo.com');
      expect(hourlyScraper.apiUrl).toContain('latitude=24.34');
      expect(hourlyScraper.apiUrl).toContain('longitude=124.16');
      expect(hourlyScraper.apiUrl).toContain('hourly=weathercode,windspeed_10m,winddirection_10m');
    });
  });

  describe('fetchWeather', () => {
    test('正常にAPI呼び出しが成功する', async () => {
      // モックレスポンスの設定
      const mockApiResponse = {
        current_weather: {
          temperature: 25.5,
          windspeed: 5.2,
          winddirection: 180,
          weathercode: 0,
          time: '2024-01-01T12:00'
        },
        hourly: {
          time: ['2024-01-01T00:00', '2024-01-01T01:00'],
          weathercode: [0, 1],
          windspeed_10m: [3.5, 4.2],
          winddirection_10m: [180, 200]
        }
      };

      // fetchモックの設定
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse)
      });

      const result = await hourlyScraper.fetchWeather();

      // 結果の確認
      expect(result).toEqual(mockApiResponse);
      expect(fetch).toHaveBeenCalledWith(hourlyScraper.apiUrl);
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyScraper.fetchWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyScraper.fetchWeather end');
    });

    test('HTTPエラーが発生した場合、適切にエラーが処理される', async () => {
      // fetchモックでHTTPエラーを発生させる
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(hourlyScraper.fetchWeather()).rejects.toThrow('HTTP error! status: 404');

      expect(fetch).toHaveBeenCalledWith(hourlyScraper.apiUrl);
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyScraper.fetchWeather start');
      expect(consoleSpy.error).toHaveBeenCalledWith('HourlyScraper.fetchWeather error:', expect.any(Error));
    });

    test('ネットワークエラーが発生した場合、適切にエラーが処理される', async () => {
      const networkError = new Error('Network Error');
      
      // fetchモックでネットワークエラーを発生させる
      fetch.mockRejectedValueOnce(networkError);

      await expect(hourlyScraper.fetchWeather()).rejects.toThrow('Network Error');

      expect(fetch).toHaveBeenCalledWith(hourlyScraper.apiUrl);
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyScraper.fetchWeather start');
      expect(consoleSpy.error).toHaveBeenCalledWith('HourlyScraper.fetchWeather error:', networkError);
    });

    test('JSONパースエラーが発生した場合、適切にエラーが処理される', async () => {
      const jsonError = new Error('Invalid JSON');
      
      // fetchモックでJSONエラーを発生させる
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(jsonError)
      });

      await expect(hourlyScraper.fetchWeather()).rejects.toThrow('Invalid JSON');

      expect(fetch).toHaveBeenCalledWith(hourlyScraper.apiUrl);
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyScraper.fetchWeather start');
      expect(consoleSpy.error).toHaveBeenCalledWith('HourlyScraper.fetchWeather error:', jsonError);
    });

    test('空のレスポンスでも正常に処理される', async () => {
      const emptyResponse = {};

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(emptyResponse)
      });

      const result = await hourlyScraper.fetchWeather();

      expect(result).toEqual(emptyResponse);
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyScraper.fetchWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyScraper.fetchWeather end');
    });

    test('複雑なネストされたデータ構造も正常に処理される', async () => {
      const complexResponse = {
        current_weather: {
          temperature: 25.5,
          windspeed: 5.2,
          winddirection: 180,
          weathercode: 0,
          time: '2024-01-01T12:00'
        },
        hourly: {
          time: Array.from({length: 24}, (_, i) => `2024-01-01T${String(i).padStart(2, '0')}:00`),
          weathercode: Array.from({length: 24}, (_, i) => i % 3),
          windspeed_10m: Array.from({length: 24}, (_, i) => 3.5 + i * 0.1),
          winddirection_10m: Array.from({length: 24}, (_, i) => 180 + i * 5)
        },
        hourly_units: {
          time: 'iso8601',
          weathercode: 'wmo code',
          windspeed_10m: 'm/s',
          winddirection_10m: '°'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(complexResponse)
      });

      const result = await hourlyScraper.fetchWeather();

      expect(result).toEqual(complexResponse);
      expect(result.hourly.time).toHaveLength(24);
      expect(result.hourly.weathercode).toHaveLength(24);
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyScraper.fetchWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyScraper.fetchWeather end');
    });
  });
});