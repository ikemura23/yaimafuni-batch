const TenkijpScraper = require('../../src/weather/scrapers/tenkijp-scraper.js');

// ブラウザとページのモック
const mockPage = {
  goto: jest.fn(),
  evaluate: jest.fn(),
};

const mockBrowser = {
  newPage: jest.fn(() => Promise.resolve(mockPage)),
  close: jest.fn(),
};

// createBrowserのモック
jest.mock('../../src/browser-factory.js', () => {
  return jest.fn(() => Promise.resolve(mockBrowser));
});

const createBrowser = require('../../src/browser-factory.js');

describe('TenkijpScraper', () => {
  let tenkijpScraper;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にTenkijpScraperのインスタンスを作成
    tenkijpScraper = new TenkijpScraper();

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
    test('URLが正しく設定される', () => {
      expect(tenkijpScraper.url).toBe('https://tenki.jp/forecast/10/50/9410/47207/3hours.html');
    });
  });

  describe('scrapeWeather', () => {
    test('正常にスクレイピングが実行される', async () => {
      // モックデータの設定
      const mockTodayData = [
        { hour: '09', weather: '晴れ', windBlow: '北', windSpeed: '2m/s' },
        { hour: '12', weather: '曇り', windBlow: '北東', windSpeed: '3m/s' },
      ];

      const mockTomorrowData = [
        { hour: '09', weather: '雨', windBlow: '南', windSpeed: '4m/s' },
        { hour: '12', weather: '晴れ', windBlow: '南西', windSpeed: '2m/s' },
      ];

      // スパイ用のメソッドモック
      const getTodaySpy = jest.spyOn(tenkijpScraper, 'getToday').mockResolvedValue(mockTodayData);
      const getTomorrowSpy = jest.spyOn(tenkijpScraper, 'getTomorrow').mockResolvedValue(mockTomorrowData);

      // ページナビゲーションの成功をモック
      mockPage.goto.mockResolvedValue();

      const result = await tenkijpScraper.scrapeWeather();

      // 結果の確認
      expect(result).toEqual({
        today: mockTodayData,
        tomorrow: mockTomorrowData,
      });

      // メソッドが正しく呼ばれたことを確認
      expect(createBrowser).toHaveBeenCalled();
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockPage.goto).toHaveBeenCalledWith(tenkijpScraper.url, {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      });
      expect(getTodaySpy).toHaveBeenCalledWith(mockPage);
      expect(getTomorrowSpy).toHaveBeenCalledWith(mockPage);
      expect(mockBrowser.close).toHaveBeenCalled();

      // ログ確認
      expect(consoleSpy.log).toHaveBeenCalledWith('TenkijpScraper.scrapeWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('TenkijpScraper.scrapeWeather end');

      // スパイのクリーンアップ
      getTodaySpy.mockRestore();
      getTomorrowSpy.mockRestore();
    });

    test('ページ読み込みエラーが発生した場合、適切にエラーが処理される', async () => {
      const testError = new Error('Page load error');
      mockPage.goto.mockRejectedValue(testError);

      await expect(tenkijpScraper.scrapeWeather()).rejects.toThrow('Page load error');

      expect(createBrowser).toHaveBeenCalled();
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith('TenkijpScraper.scrapeWeather start');
      expect(consoleSpy.error).toHaveBeenCalledWith('TenkijpScraper.scrapeWeather error:', testError);
    });

    test('getTodayでエラーが発生した場合、適切にエラーが処理される', async () => {
      const testError = new Error('getToday error');
      const getTodaySpy = jest.spyOn(tenkijpScraper, 'getToday').mockRejectedValue(testError);

      mockPage.goto.mockResolvedValue();

      await expect(tenkijpScraper.scrapeWeather()).rejects.toThrow('getToday error');

      expect(mockBrowser.close).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalledWith('TenkijpScraper.scrapeWeather error:', testError);

      getTodaySpy.mockRestore();
    });
  });

  describe('getData', () => {
    test('正常にDOM要素からデータを取得する', async () => {
      const mockSelector = 'div.test';
      const mockData = ['データ1', 'データ2', 'データ3'];

      mockPage.evaluate.mockResolvedValue(mockData);

      const result = await tenkijpScraper.getData(mockPage, mockSelector);

      expect(result).toEqual(mockData);
      expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function), mockSelector);
    });

    test('空の結果が返された場合も正常に処理される', async () => {
      const mockSelector = 'div.empty';
      const emptyData = [];

      mockPage.evaluate.mockResolvedValue(emptyData);

      const result = await tenkijpScraper.getData(mockPage, mockSelector);

      expect(result).toEqual(emptyData);
      expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function), mockSelector);
    });
  });

  describe('getToday', () => {
    test('正常に今日の天気データを取得する', async () => {
      // 各要素のモックデータ
      const mockHour = ['時', '09', '12', '15', '18', '21'];
      const mockWeather = ['天気', '晴れ', '曇り', '雨', '晴れ', '曇り'];
      const mockWindDirection = ['風向', '北', '北東', '東', '南東', '南'];
      const mockWindSpeed = ['風速', '2m/s', '3m/s', '4m/s', '3m/s', '2m/s'];

      // getDataメソッドのモック
      const getDataSpy = jest.spyOn(tenkijpScraper, 'getData')
        .mockResolvedValueOnce(mockHour)
        .mockResolvedValueOnce(mockWeather)
        .mockResolvedValueOnce(mockWindDirection)
        .mockResolvedValueOnce(mockWindSpeed);

      const result = await tenkijpScraper.getToday(mockPage);

      // 期待される結果（インデックス1-5を使用）
      const expectedData = [
        { hour: '09', weather: '晴れ', windBlow: '北', windSpeed: '2m/s' },
        { hour: '12', weather: '曇り', windBlow: '北東', windSpeed: '3m/s' },
        { hour: '15', weather: '雨', windBlow: '東', windSpeed: '4m/s' },
        { hour: '18', weather: '晴れ', windBlow: '南東', windSpeed: '3m/s' },
        { hour: '21', weather: '曇り', windBlow: '南', windSpeed: '2m/s' },
      ];

      expect(result).toEqual(expectedData);
      expect(getDataSpy).toHaveBeenCalledTimes(4);
      
      getDataSpy.mockRestore();
    });
  });

  describe('getTomorrow', () => {
    test('正常に明日の天気データを取得する', async () => {
      // 各要素のモックデータ
      const mockHour = ['時', '09', '12', '15', '18', '21'];
      const mockWeather = ['天気', '雨', '曇り', '晴れ', '曇り', '雨'];
      const mockWindDirection = ['風向', '南', '南西', '西', '北西', '北'];
      const mockWindSpeed = ['風速', '4m/s', '3m/s', '2m/s', '3m/s', '4m/s'];

      // getDataメソッドのモック
      const getDataSpy = jest.spyOn(tenkijpScraper, 'getData')
        .mockResolvedValueOnce(mockHour)
        .mockResolvedValueOnce(mockWeather)
        .mockResolvedValueOnce(mockWindDirection)
        .mockResolvedValueOnce(mockWindSpeed);

      const result = await tenkijpScraper.getTomorrow(mockPage);

      // 期待される結果（インデックス1-5を使用）
      const expectedData = [
        { hour: '09', weather: '雨', windBlow: '南', windSpeed: '4m/s' },
        { hour: '12', weather: '曇り', windBlow: '南西', windSpeed: '3m/s' },
        { hour: '15', weather: '晴れ', windBlow: '西', windSpeed: '2m/s' },
        { hour: '18', weather: '曇り', windBlow: '北西', windSpeed: '3m/s' },
        { hour: '21', weather: '雨', windBlow: '北', windSpeed: '4m/s' },
      ];

      expect(result).toEqual(expectedData);
      expect(getDataSpy).toHaveBeenCalledTimes(4);
      
      getDataSpy.mockRestore();
    });
  });
});