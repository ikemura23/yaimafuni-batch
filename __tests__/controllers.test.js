const ControllerManager = require('../src/controllers/index.js');

// モックの設定
jest.mock('../src/annei/controllers/list-controller.js', () => ({
  updateAnneiList: jest.fn(),
}));

jest.mock('../src/annei/controllers/detail-controller.js', () => ({
  updateAnneiDetail: jest.fn(),
}));

jest.mock('../src/annei/controllers/time-announce-controller.js', () => ({
  updateAnneiUpdateTimeAndComment: jest.fn(),
}));

jest.mock('../src/ykf/controllers/list-controller.js', () => ({
  updateYkfList: jest.fn(),
}));

jest.mock('../src/ykf/controllers/detail-controller.js', () => ({
  updateYkfDetail: jest.fn(),
}));

jest.mock('../src/ykf/controllers/time-announce-controller.js', () => ({
  updateYkfUpdateTimeAndComment: jest.fn(),
}));

describe('ControllerManager', () => {
  let controllerManager;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にControllerManagerのインスタンスを作成
    controllerManager = new ControllerManager();

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
    test('anneiコントローラーが正しく初期化される', () => {
      expect(controllerManager.annei).toBeDefined();
      expect(controllerManager.annei.list).toBeDefined();
      expect(controllerManager.annei.detail).toBeDefined();
      expect(controllerManager.annei.time).toBeDefined();
    });

    test('ykfコントローラーが正しく初期化される', () => {
      expect(controllerManager.ykf).toBeDefined();
      expect(controllerManager.ykf.list).toBeDefined();
      expect(controllerManager.ykf.detail).toBeDefined();
      expect(controllerManager.ykf.time).toBeDefined();
    });
  });

  describe('updateAll', () => {
    test('すべてのコントローラーが正常に実行される', async () => {
      // モック関数を成功するように設定
      controllerManager.annei.list.mockResolvedValue();
      controllerManager.annei.detail.mockResolvedValue();
      controllerManager.ykf.list.mockResolvedValue();
      controllerManager.ykf.time.mockResolvedValue();
      controllerManager.ykf.detail.mockResolvedValue();

      await controllerManager.updateAll();

      // 各コントローラーが呼ばれたことを確認
      expect(controllerManager.annei.list).toHaveBeenCalledTimes(1);
      expect(controllerManager.annei.detail).toHaveBeenCalledTimes(1);
      expect(controllerManager.ykf.list).toHaveBeenCalledTimes(1);
      expect(controllerManager.ykf.time).toHaveBeenCalledTimes(1);
      expect(controllerManager.ykf.detail).toHaveBeenCalledTimes(1);

      // ログが出力されたことを確認
      expect(consoleSpy.group).toHaveBeenCalledWith('ControllerManager.updateAll start');
      expect(consoleSpy.log).toHaveBeenCalledWith('Starting Annei controllers...');
      expect(consoleSpy.log).toHaveBeenCalledWith('Starting YKF controllers...');
      expect(consoleSpy.log).toHaveBeenCalledWith('ControllerManager.updateAll completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('エラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('Test error');
      controllerManager.annei.list.mockRejectedValue(testError);

      await expect(controllerManager.updateAll()).rejects.toThrow('Test error');

      expect(consoleSpy.error).toHaveBeenCalledWith('ControllerManager.updateAll error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('updateAnneiList', () => {
    test('Annei一覧更新が正常に実行される', async () => {
      controllerManager.annei.list.mockResolvedValue();

      await controllerManager.updateAnneiList();

      expect(controllerManager.annei.list).toHaveBeenCalledTimes(1);
      expect(consoleSpy.group).toHaveBeenCalledWith('ControllerManager.updateAnneiList start');
      expect(consoleSpy.log).toHaveBeenCalledWith('ControllerManager.updateAnneiList completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('Annei一覧更新でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('Annei list error');
      controllerManager.annei.list.mockRejectedValue(testError);

      await expect(controllerManager.updateAnneiList()).rejects.toThrow('Annei list error');

      expect(consoleSpy.error).toHaveBeenCalledWith('ControllerManager.updateAnneiList error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('updateAnneiDetail', () => {
    test('Annei詳細更新が正常に実行される', async () => {
      controllerManager.annei.detail.mockResolvedValue();

      await controllerManager.updateAnneiDetail();

      expect(controllerManager.annei.detail).toHaveBeenCalledTimes(1);
      expect(consoleSpy.group).toHaveBeenCalledWith('ControllerManager.updateAnneiDetail start');
      expect(consoleSpy.log).toHaveBeenCalledWith('ControllerManager.updateAnneiDetail completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('Annei詳細更新でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('Annei detail error');
      controllerManager.annei.detail.mockRejectedValue(testError);

      await expect(controllerManager.updateAnneiDetail()).rejects.toThrow('Annei detail error');

      expect(consoleSpy.error).toHaveBeenCalledWith('ControllerManager.updateAnneiDetail error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('updateYkfList', () => {
    test('YKF一覧更新が正常に実行される', async () => {
      controllerManager.ykf.list.mockResolvedValue();

      await controllerManager.updateYkfList();

      expect(controllerManager.ykf.list).toHaveBeenCalledTimes(1);
      expect(consoleSpy.group).toHaveBeenCalledWith('ControllerManager.updateYkfList start');
      expect(consoleSpy.log).toHaveBeenCalledWith('ControllerManager.updateYkfList completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('YKF一覧更新でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('YKF list error');
      controllerManager.ykf.list.mockRejectedValue(testError);

      await expect(controllerManager.updateYkfList()).rejects.toThrow('YKF list error');

      expect(consoleSpy.error).toHaveBeenCalledWith('ControllerManager.updateYkfList error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('updateYkfDetail', () => {
    test('YKF詳細更新が正常に実行される', async () => {
      controllerManager.ykf.detail.mockResolvedValue();

      await controllerManager.updateYkfDetail();

      expect(controllerManager.ykf.detail).toHaveBeenCalledTimes(1);
      expect(consoleSpy.group).toHaveBeenCalledWith('ControllerManager.updateYkfDetail start');
      expect(consoleSpy.log).toHaveBeenCalledWith('ControllerManager.updateYkfDetail completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('YKF詳細更新でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('YKF detail error');
      controllerManager.ykf.detail.mockRejectedValue(testError);

      await expect(controllerManager.updateYkfDetail()).rejects.toThrow('YKF detail error');

      expect(consoleSpy.error).toHaveBeenCalledWith('ControllerManager.updateYkfDetail error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('updateYkfTime', () => {
    test('YKF時間・アナウンス更新が正常に実行される', async () => {
      controllerManager.ykf.time.mockResolvedValue();

      await controllerManager.updateYkfTime();

      expect(controllerManager.ykf.time).toHaveBeenCalledTimes(1);
      expect(consoleSpy.group).toHaveBeenCalledWith('ControllerManager.updateYkfTime start');
      expect(consoleSpy.log).toHaveBeenCalledWith('ControllerManager.updateYkfTime completed successfully');
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });

    test('YKF時間・アナウンス更新でエラーが発生した場合、エラーが再スローされる', async () => {
      const testError = new Error('YKF time error');
      controllerManager.ykf.time.mockRejectedValue(testError);

      await expect(controllerManager.updateYkfTime()).rejects.toThrow('YKF time error');

      expect(consoleSpy.error).toHaveBeenCalledWith('ControllerManager.updateYkfTime error:', testError);
      expect(consoleSpy.groupEnd).toHaveBeenCalled();
    });
  });

  describe('統合テスト', () => {
    test('複数のメソッドを連続実行しても正常に動作する', async () => {
      // すべてのモックを成功するように設定
      controllerManager.annei.list.mockResolvedValue();
      controllerManager.annei.detail.mockResolvedValue();
      controllerManager.ykf.list.mockResolvedValue();
      controllerManager.ykf.detail.mockResolvedValue();
      controllerManager.ykf.time.mockResolvedValue();

      // 複数のメソッドを連続実行
      await controllerManager.updateAnneiList();
      await controllerManager.updateAnneiDetail();
      await controllerManager.updateYkfList();
      await controllerManager.updateYkfDetail();
      await controllerManager.updateYkfTime();

      // 各メソッドが1回ずつ呼ばれたことを確認
      expect(controllerManager.annei.list).toHaveBeenCalledTimes(1);
      expect(controllerManager.annei.detail).toHaveBeenCalledTimes(1);
      expect(controllerManager.ykf.list).toHaveBeenCalledTimes(1);
      expect(controllerManager.ykf.detail).toHaveBeenCalledTimes(1);
      expect(controllerManager.ykf.time).toHaveBeenCalledTimes(1);
    });
  });
});
