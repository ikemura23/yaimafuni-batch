const WeatherControllerManager = require('../../src/weather/controllers/index.js');

// モックの設定
jest.mock('../../src/weather/controllers/yahoo-controller.js', () => {
  return jest.fn().mockImplementation(() => ({
    updateYahooWeather: jest.fn(),
  }));
});

jest.mock('../../src/weather/controllers/tenkijp-controller.js', () => {
  return jest.fn().mockImplementation(() => ({
    updateTenkijpWeather: jest.fn(),
  }));
});

jest.mock('../../src/weather/controllers/hourly-controller.js', () => {
  return jest.fn().mockImplementation(() => ({
    updateHourlyWeather: jest.fn(),
  }));
});

describe('WeatherControllerManager', () => {
  let weatherControllerManager;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にWeatherControllerManagerのインスタンスを作成
    weatherControllerManager = new WeatherControllerManager();

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
    test('各weatherコントローラーが正しく初期化される', () => {
      expect(weatherControllerManager.yahoo).toBeDefined();
      expect(weatherControllerManager.tenkijp).toBeDefined();
      expect(weatherControllerManager.hourly).toBeDefined();
    });
  });

  describe('updateAll', () => {
    test('すべてのweatherコントローラーが正常に実行される', async () => {
      // モック関数を成功するように設定
      weatherControllerManager.yahoo.updateYahooWeather.mockResolvedValue();
      weatherControllerManager.tenkijp.updateTenkijpWeather.mockResolvedValue();
      weatherControllerManager.hourly.updateHourlyWeather.mockResolvedValue();

      await weatherControllerManager.updateAll();

      // 各コントローラーが呼ばれたことを確認
      expect(weatherControllerManager.yahoo.updateYahooWeather).toHaveBeenCalledTimes(1);
      expect(weatherControllerManager.tenkijp.updateTenkijpWeather).toHaveBeenCalledTimes(1);
      expect(weatherControllerManager.hourly.updateHourlyWeather).toHaveBeenCalledTimes(1);

      // ログが出力されたことを確認
      expect(consoleSpy.group).toHaveBeenCalledWith('WeatherControllerManager.updateAll start');
      expect(consoleSpy.log).toHaveBeenCalledWith('Starting Yahoo weather controller...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Starting Tenkijp weather controller...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Starting Hourly weather controller...');
      expect(consoleSpy.log).toHaveBeenCalledWith('WeatherControllerManager.updateAll completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('Yahoo天気でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('Yahoo weather error');
      weatherControllerManager.yahoo.updateYahooWeather.mockRejectedValue(testError);

      await expect(weatherControllerManager.updateAll()).rejects.toThrow('Yahoo weather error');

      expect(consoleSpy.error).toHaveBeenCalledWith('WeatherControllerManager.updateAll error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
      
      // 後続の処理は実行されないことを確認
      expect(weatherControllerManager.tenkijp.updateTenkijpWeather).not.toHaveBeenCalled();
      expect(weatherControllerManager.hourly.updateHourlyWeather).not.toHaveBeenCalled();
    });

    test('天気.jpでエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('Tenkijp weather error');
      weatherControllerManager.yahoo.updateYahooWeather.mockResolvedValue();
      weatherControllerManager.tenkijp.updateTenkijpWeather.mockRejectedValue(testError);

      await expect(weatherControllerManager.updateAll()).rejects.toThrow('Tenkijp weather error');

      expect(consoleSpy.error).toHaveBeenCalledWith('WeatherControllerManager.updateAll error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
      
      // Yahoo天気は成功、時間別天気は実行されないことを確認
      expect(weatherControllerManager.yahoo.updateYahooWeather).toHaveBeenCalledTimes(1);
      expect(weatherControllerManager.hourly.updateHourlyWeather).not.toHaveBeenCalled();
    });

    test('時間別天気でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('Hourly weather error');
      weatherControllerManager.yahoo.updateYahooWeather.mockResolvedValue();
      weatherControllerManager.tenkijp.updateTenkijpWeather.mockResolvedValue();
      weatherControllerManager.hourly.updateHourlyWeather.mockRejectedValue(testError);

      await expect(weatherControllerManager.updateAll()).rejects.toThrow('Hourly weather error');

      expect(consoleSpy.error).toHaveBeenCalledWith('WeatherControllerManager.updateAll error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
      
      // 前の2つの処理は成功していることを確認
      expect(weatherControllerManager.yahoo.updateYahooWeather).toHaveBeenCalledTimes(1);
      expect(weatherControllerManager.tenkijp.updateTenkijpWeather).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateYahooWeather', () => {
    test('Yahoo天気更新が正常に実行される', async () => {
      weatherControllerManager.yahoo.updateYahooWeather.mockResolvedValue();

      await weatherControllerManager.updateYahooWeather();

      expect(weatherControllerManager.yahoo.updateYahooWeather).toHaveBeenCalledTimes(1);
      expect(consoleSpy.group).toHaveBeenCalledWith('WeatherControllerManager.updateYahooWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('WeatherControllerManager.updateYahooWeather completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('Yahoo天気更新でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('Yahoo update error');
      weatherControllerManager.yahoo.updateYahooWeather.mockRejectedValue(testError);

      await expect(weatherControllerManager.updateYahooWeather()).rejects.toThrow('Yahoo update error');

      expect(consoleSpy.error).toHaveBeenCalledWith('WeatherControllerManager.updateYahooWeather error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('updateTenkijpWeather', () => {
    test('天気.jp更新が正常に実行される', async () => {
      weatherControllerManager.tenkijp.updateTenkijpWeather.mockResolvedValue();

      await weatherControllerManager.updateTenkijpWeather();

      expect(weatherControllerManager.tenkijp.updateTenkijpWeather).toHaveBeenCalledTimes(1);
      expect(consoleSpy.group).toHaveBeenCalledWith('WeatherControllerManager.updateTenkijpWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('WeatherControllerManager.updateTenkijpWeather completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('天気.jp更新でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('Tenkijp update error');
      weatherControllerManager.tenkijp.updateTenkijpWeather.mockRejectedValue(testError);

      await expect(weatherControllerManager.updateTenkijpWeather()).rejects.toThrow('Tenkijp update error');

      expect(consoleSpy.error).toHaveBeenCalledWith('WeatherControllerManager.updateTenkijpWeather error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('updateHourlyWeather', () => {
    test('時間別天気更新が正常に実行される', async () => {
      weatherControllerManager.hourly.updateHourlyWeather.mockResolvedValue();

      await weatherControllerManager.updateHourlyWeather();

      expect(weatherControllerManager.hourly.updateHourlyWeather).toHaveBeenCalledTimes(1);
      expect(consoleSpy.group).toHaveBeenCalledWith('WeatherControllerManager.updateHourlyWeather start');
      expect(consoleSpy.log).toHaveBeenCalledWith('WeatherControllerManager.updateHourlyWeather completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('時間別天気更新でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('Hourly update error');
      weatherControllerManager.hourly.updateHourlyWeather.mockRejectedValue(testError);

      await expect(weatherControllerManager.updateHourlyWeather()).rejects.toThrow('Hourly update error');

      expect(consoleSpy.error).toHaveBeenCalledWith('WeatherControllerManager.updateHourlyWeather error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('統合テスト', () => {
    test('複数のメソッドを連続実行しても正常に動作する', async () => {
      // すべてのモックを成功するように設定
      weatherControllerManager.yahoo.updateYahooWeather.mockResolvedValue();
      weatherControllerManager.tenkijp.updateTenkijpWeather.mockResolvedValue();
      weatherControllerManager.hourly.updateHourlyWeather.mockResolvedValue();

      // 複数のメソッドを連続実行
      await weatherControllerManager.updateYahooWeather();
      await weatherControllerManager.updateTenkijpWeather();
      await weatherControllerManager.updateHourlyWeather();

      // 各メソッドが1回ずつ呼ばれたことを確認
      expect(weatherControllerManager.yahoo.updateYahooWeather).toHaveBeenCalledTimes(1);
      expect(weatherControllerManager.tenkijp.updateTenkijpWeather).toHaveBeenCalledTimes(1);
      expect(weatherControllerManager.hourly.updateHourlyWeather).toHaveBeenCalledTimes(1);
    });
  });
});