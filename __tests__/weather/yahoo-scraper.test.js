const YahooScraper = require('../../src/weather/scrapers/yahoo-scraper.js');

// ブラウザとページのモック
const mockPage = {
  goto: jest.fn(),
  $eval: jest.fn(),
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

describe('YahooScraper', () => {
  let yahooScraper;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にYahooScraperのインスタンスを作成
    yahooScraper = new YahooScraper();

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
      expect(yahooScraper.url).toBe('https://weather.yahoo.co.jp/weather/jp/47/9410.html');
    });
  });

  describe('scrapeWeather', () => {
    test('正常にスクレイピングが実行される', async () => {
      // モックデータの設定
      const mockTodayData = {
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: { hight: '25°', low: '15°' },
        wave: '1.5m',
        wind: '北 2m/s'
      };

      const mockTomorrowData = {
        date: '1月2日(火)',
        weather: '曇り',
        temperature: { hight: '22°', low: '12°' },
        wave: '2.0m',
        wind: '南 3m/s'
      };

      // スパイ用のメソッドモック
      const getTodaySpy = jest.spyOn(yahooScraper, 'getToday').mockResolvedValue(mockTodayData);
      const getTomorrowSpy = jest.spyOn(yahooScraper, 'getTomorrow').mockResolvedValue(mockTomorrowData);

      // ページナビゲーションの成功をモック
      mockPage.goto.mockResolvedValue();

      const result = await yahooScraper.scrapeWeather();

      // 結果の確認
      expect(result).toEqual({
        today: mockTodayData,
        tomorrow: mockTomorrowData,
      });

      // メソッドが正しく呼ばれたことを確認
      expect(createBrowser).toHaveBeenCalled();
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockPage.goto).toHaveBeenCalledWith(yahooScraper.url, { waitUntil: 'networkidle2' });
      expect(getTodaySpy).toHaveBeenCalledWith(mockPage);
      expect(getTomorrowSpy).toHaveBeenCalledWith(mockPage);
      expect(mockBrowser.close).toHaveBeenCalled();

      // ログ確認
      expect(consoleSpy.log).toHaveBeenCalledWith('YahooScraper.scrapeWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('YahooScraper.scrapeWeather end');

      // スパイのクリーンアップ
      getTodaySpy.mockRestore();
      getTomorrowSpy.mockRestore();
    });

    test('ページ読み込みエラーが発生した場合、適切にエラーが処理される', async () => {
      const testError = new Error('Page load error');
      mockPage.goto.mockRejectedValue(testError);

      await expect(yahooScraper.scrapeWeather()).rejects.toThrow('Page load error');

      expect(createBrowser).toHaveBeenCalled();
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockBrowser.close).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith('YahooScraper.scrapeWeather start');
      expect(consoleSpy.error).toHaveBeenCalledWith('YahooScraper.scrapeWeather error:', testError);
    });

    test('getTodayでエラーが発生した場合、適切にエラーが処理される', async () => {
      const testError = new Error('getToday error');
      const getTodaySpy = jest.spyOn(yahooScraper, 'getToday').mockRejectedValue(testError);

      mockPage.goto.mockResolvedValue();

      await expect(yahooScraper.scrapeWeather()).rejects.toThrow('getToday error');

      expect(mockBrowser.close).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalledWith('YahooScraper.scrapeWeather error:', testError);

      getTodaySpy.mockRestore();
    });
  });

  describe('getData', () => {
    test('正常にDOM要素からデータを取得する', async () => {
      const mockSelector = 'div.test';
      const mockData = 'テストデータ';

      mockPage.$eval.mockResolvedValue(mockData);

      const result = await yahooScraper.getData(mockPage, mockSelector);

      expect(result).toBe(mockData);
      expect(mockPage.$eval).toHaveBeenCalledWith(mockSelector, expect.any(Function));
    });

    test('空の結果が返された場合も正常に処理される', async () => {
      const mockSelector = 'div.empty';
      const emptyData = '';

      mockPage.$eval.mockResolvedValue(emptyData);

      const result = await yahooScraper.getData(mockPage, mockSelector);

      expect(result).toBe(emptyData);
      expect(mockPage.$eval).toHaveBeenCalledWith(mockSelector, expect.any(Function));
    });
  });

  describe('getToday', () => {
    test('正常に今日の天気データを取得する', async () => {
      // 各要素のモックデータ（実際のHTML要素から取得される可能性のある形式）
      const mockRawData = {
        date: '1月1日(月)\n',
        weather: '晴れ\n',
        wind: '北 2m/s\r\n',
        wave: '1.5m\n',
        temperatureHight: '25°\r\n',
        temperatureLow: '15°\n'
      };

      // getDataメソッドのモック（順番に呼び出される）
      const getDataSpy = jest.spyOn(yahooScraper, 'getData')
        .mockResolvedValueOnce(mockRawData.date)
        .mockResolvedValueOnce(mockRawData.weather)
        .mockResolvedValueOnce(mockRawData.wind)
        .mockResolvedValueOnce(mockRawData.wave)
        .mockResolvedValueOnce(mockRawData.temperatureHight)
        .mockResolvedValueOnce(mockRawData.temperatureLow);

      const result = await yahooScraper.getToday(mockPage);

      // 期待される結果（改行文字が除去され、trimされた状態）
      const expectedData = {
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: {
          hight: '25°',
          low: '15°'
        },
        wave: '1.5m',
        wind: '北 2m/s'
      };

      expect(result).toEqual(expectedData);
      expect(getDataSpy).toHaveBeenCalledTimes(6);
      
      getDataSpy.mockRestore();
    });

    test('空白文字を含むデータも正常に処理される', async () => {
      const mockRawData = {
        date: '  1月1日(月)  \n\r  ',
        weather: '\n\r  晴れ  \n\r',
        wind: '  北 2m/s  \r\n  ',
        wave: '\r\n  1.5m  \n',
        temperatureHight: '  25°  \r\n',
        temperatureLow: '\n  15°  \r'
      };

      const getDataSpy = jest.spyOn(yahooScraper, 'getData')
        .mockResolvedValueOnce(mockRawData.date)
        .mockResolvedValueOnce(mockRawData.weather)
        .mockResolvedValueOnce(mockRawData.wind)
        .mockResolvedValueOnce(mockRawData.wave)
        .mockResolvedValueOnce(mockRawData.temperatureHight)
        .mockResolvedValueOnce(mockRawData.temperatureLow);

      const result = await yahooScraper.getToday(mockPage);

      const expectedData = {
        date: '1月1日(月)',
        weather: '晴れ',
        temperature: {
          hight: '25°',
          low: '15°'
        },
        wave: '1.5m',
        wind: '北 2m/s'
      };

      expect(result).toEqual(expectedData);
      
      getDataSpy.mockRestore();
    });
  });

  describe('getTomorrow', () => {
    test('正常に明日の天気データを取得する', async () => {
      // 各要素のモックデータ
      const mockRawData = {
        date: '1月2日(火)\n',
        weather: '曇り\n',
        wind: '南 3m/s\r\n',
        wave: '2.0m\n',
        temperatureHight: '22°\r\n',
        temperatureLow: '12°\n'
      };

      // getDataメソッドのモック
      const getDataSpy = jest.spyOn(yahooScraper, 'getData')
        .mockResolvedValueOnce(mockRawData.date)
        .mockResolvedValueOnce(mockRawData.weather)
        .mockResolvedValueOnce(mockRawData.wind)
        .mockResolvedValueOnce(mockRawData.wave)
        .mockResolvedValueOnce(mockRawData.temperatureHight)
        .mockResolvedValueOnce(mockRawData.temperatureLow);

      const result = await yahooScraper.getTomorrow(mockPage);

      // 期待される結果
      const expectedData = {
        date: '1月2日(火)',
        weather: '曇り',
        temperature: {
          hight: '22°',
          low: '12°'
        },
        wave: '2.0m',
        wind: '南 3m/s'
      };

      expect(result).toEqual(expectedData);
      expect(getDataSpy).toHaveBeenCalledTimes(6);
      
      getDataSpy.mockRestore();
    });
  });
});