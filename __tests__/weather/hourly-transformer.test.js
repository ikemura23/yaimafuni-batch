const HourlyTransformer = require('../../src/weather/transformers/hourly-transformer.js');

describe('HourlyTransformer', () => {
  let hourlyTransformer;
  let consoleSpy;

  beforeEach(() => {
    // 各テスト前にHourlyTransformerのインスタンスを作成
    hourlyTransformer = new HourlyTransformer();

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

  describe('transform', () => {
    test('正常にAPIレスポンスを保存用データ形式に変換する', async () => {
      // モックAPIレスポンス
      const mockApiResponse = {
        hourly: {
          time: [
            '2024-01-01T00:00',
            '2024-01-01T01:00',
            '2024-01-01T02:00',
            '2024-01-02T00:00',
            '2024-01-02T01:00',
          ],
          weathercode: [0, 1, 2, 3, 45],
          windspeed_10m: [2.5, 3.0, 2.8, 4.2, 1.8],
          winddirection_10m: [0, 45, 90, 180, 270]
        }
      };

      const result = hourlyTransformer.transform(mockApiResponse);

      // 日付でグループ化された結果を期待
      expect(result).toHaveProperty('2024-01-01');
      expect(result).toHaveProperty('2024-01-02');
      
      // 2024-01-01のデータ確認
      expect(result['2024-01-01']).toHaveLength(3);
      expect(result['2024-01-01'][0]).toEqual({
        date: '2024-01-01',
        dateTime: '2024-01-01T00:00',
        weatherCode: 0,
        cardinalDirection: '北',
        windSpeed: 2.5,
      });

      // 2024-01-02のデータ確認
      expect(result['2024-01-02']).toHaveLength(2);
      expect(result['2024-01-02'][0]).toEqual({
        date: '2024-01-02',
        dateTime: '2024-01-02T00:00',
        weatherCode: 3,
        cardinalDirection: '南',
        windSpeed: 4.2,
      });

      // ログ確認
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyTransformer.transform start');
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyTransformer.transform end');
    });

    test('空のAPIレスポンスでもエラーにならない', async () => {
      const mockApiResponse = {
        hourly: {
          time: [],
          weathercode: [],
          windspeed_10m: [],
          winddirection_10m: []
        }
      };

      const result = hourlyTransformer.transform(mockApiResponse);

      expect(result).toEqual({});
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyTransformer.transform start');
      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyTransformer.transform end');
    });

    test('不正なAPIレスポンスでエラーが適切に処理される', async () => {
      const mockApiResponse = {
        hourly: null // 不正なデータ
      };

      expect(() => {
        hourlyTransformer.transform(mockApiResponse);
      }).toThrow();

      expect(consoleSpy.log).toHaveBeenCalledWith('HourlyTransformer.transform start');
      expect(consoleSpy.error).toHaveBeenCalledWith('HourlyTransformer.transform error:', expect.any(Error));
    });
  });

  describe('mapToData', () => {
    test('正常に配列をオブジェクト型に変換する', () => {
      const timeList = ['2024-01-01T00:00', '2024-01-01T01:00', '2024-01-01T02:00'];
      const weatherCodeList = [0, 1, 2];
      const windSpeedList = [2.5, 3.0, 2.8];
      const windDirectionList = [0, 45, 90];

      const result = hourlyTransformer.mapToData(timeList, weatherCodeList, windSpeedList, windDirectionList);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2024-01-01',
        dateTime: '2024-01-01T00:00',
        weatherCode: 0,
        cardinalDirection: '北',
        windSpeed: 2.5,
      });
      expect(result[1]).toEqual({
        date: '2024-01-01',
        dateTime: '2024-01-01T01:00',
        weatherCode: 1,
        cardinalDirection: '北東',
        windSpeed: 3.0,
      });
      expect(result[2]).toEqual({
        date: '2024-01-01',
        dateTime: '2024-01-01T02:00',
        weatherCode: 2,
        cardinalDirection: '東',
        windSpeed: 2.8,
      });
    });

    test('空の配列を渡した場合、空の配列が返される', () => {
      const result = hourlyTransformer.mapToData([], [], [], []);
      expect(result).toEqual([]);
    });
  });

  describe('calculateCardinalDirection', () => {
    test('風向の数値から正しい方角を計算する', () => {
      // 16方位の境界値をテスト
      expect(hourlyTransformer.calculateCardinalDirection(0)).toBe('北');
      expect(hourlyTransformer.calculateCardinalDirection(22.5)).toBe('北北東');
      expect(hourlyTransformer.calculateCardinalDirection(45)).toBe('北東');
      expect(hourlyTransformer.calculateCardinalDirection(67.5)).toBe('東北東');
      expect(hourlyTransformer.calculateCardinalDirection(90)).toBe('東');
      expect(hourlyTransformer.calculateCardinalDirection(112.5)).toBe('東南東');
      expect(hourlyTransformer.calculateCardinalDirection(135)).toBe('南東');
      expect(hourlyTransformer.calculateCardinalDirection(157.5)).toBe('南南東');
      expect(hourlyTransformer.calculateCardinalDirection(180)).toBe('南');
      expect(hourlyTransformer.calculateCardinalDirection(202.5)).toBe('南南西');
      expect(hourlyTransformer.calculateCardinalDirection(225)).toBe('南西');
      expect(hourlyTransformer.calculateCardinalDirection(247.5)).toBe('西南西');
      expect(hourlyTransformer.calculateCardinalDirection(270)).toBe('西');
      expect(hourlyTransformer.calculateCardinalDirection(292.5)).toBe('西北西');
      expect(hourlyTransformer.calculateCardinalDirection(315)).toBe('北西');
      expect(hourlyTransformer.calculateCardinalDirection(337.5)).toBe('北北西');
      expect(hourlyTransformer.calculateCardinalDirection(360)).toBe('北');
    });

    test('境界値付近の値も正しく処理される', () => {
      // 各方位の中間値をテスト（22.5度間隔で計算）
      expect(hourlyTransformer.calculateCardinalDirection(11)).toBe('北');      // 11/22.5 = 0.49 → 0
      expect(hourlyTransformer.calculateCardinalDirection(34)).toBe('北東');   // 34/22.5 = 1.51 → 2
      expect(hourlyTransformer.calculateCardinalDirection(56)).toBe('北東');     // 56/22.5 = 2.49 → 2
      expect(hourlyTransformer.calculateCardinalDirection(100)).toBe('東');      // 100/22.5 = 4.44 → 4
      expect(hourlyTransformer.calculateCardinalDirection(190)).toBe('南');      // 190/22.5 = 8.44 → 8
      expect(hourlyTransformer.calculateCardinalDirection(280)).toBe('西');      // 280/22.5 = 12.44 → 12
    });

    test('小数点を含む値も正しく処理される', () => {
      expect(hourlyTransformer.calculateCardinalDirection(44.9)).toBe('北東');
      expect(hourlyTransformer.calculateCardinalDirection(45.1)).toBe('北東');
      expect(hourlyTransformer.calculateCardinalDirection(89.9)).toBe('東');
      expect(hourlyTransformer.calculateCardinalDirection(90.1)).toBe('東');
    });
  });

  describe('groupBy', () => {
    test('指定されたキーで配列をグループ化する', () => {
      const testData = [
        { date: '2024-01-01', value: 'A' },
        { date: '2024-01-01', value: 'B' },
        { date: '2024-01-02', value: 'C' },
        { date: '2024-01-02', value: 'D' },
        { date: '2024-01-03', value: 'E' },
      ];

      const result = hourlyTransformer.groupBy(testData, 'date');

      expect(result).toEqual({
        '2024-01-01': [
          { date: '2024-01-01', value: 'A' },
          { date: '2024-01-01', value: 'B' }
        ],
        '2024-01-02': [
          { date: '2024-01-02', value: 'C' },
          { date: '2024-01-02', value: 'D' }
        ],
        '2024-01-03': [
          { date: '2024-01-03', value: 'E' }
        ]
      });
    });

    test('空の配列を渡した場合、空のオブジェクトが返される', () => {
      const result = hourlyTransformer.groupBy([], 'date');
      expect(result).toEqual({});
    });

    test('異なるキーでもグループ化できる', () => {
      const testData = [
        { category: 'A', value: 1 },
        { category: 'B', value: 2 },
        { category: 'A', value: 3 },
      ];

      const result = hourlyTransformer.groupBy(testData, 'category');

      expect(result).toEqual({
        'A': [
          { category: 'A', value: 1 },
          { category: 'A', value: 3 }
        ],
        'B': [
          { category: 'B', value: 2 }
        ]
      });
    });
  });

  describe('統合テスト', () => {
    test('実際のAPIレスポンス形式でも正常に動作する', () => {
      const mockApiResponse = {
        hourly: {
          time: [
            '2024-01-01T00:00',
            '2024-01-01T03:00',
            '2024-01-01T06:00',
            '2024-01-01T09:00',
            '2024-01-01T12:00',
            '2024-01-01T15:00',
            '2024-01-01T18:00',
            '2024-01-01T21:00',
            '2024-01-02T00:00',
            '2024-01-02T03:00',
          ],
          weathercode: [0, 1, 2, 3, 0, 1, 2, 3, 45, 48],
          windspeed_10m: [2.1, 3.2, 4.5, 5.8, 6.2, 4.9, 3.1, 2.5, 3.8, 4.1],
          winddirection_10m: [15, 75, 120, 165, 210, 255, 300, 345, 30, 330]
        }
      };

      const result = hourlyTransformer.transform(mockApiResponse);

      // 2日間のデータが正しく分離されている
      expect(Object.keys(result)).toEqual(['2024-01-01', '2024-01-02']);
      expect(result['2024-01-01']).toHaveLength(8);
      expect(result['2024-01-02']).toHaveLength(2);

      // 方角が正しく変換されている
      expect(result['2024-01-01'][1].cardinalDirection).toBe('東北東'); // 75度
      expect(result['2024-01-01'][4].cardinalDirection).toBe('南南西'); // 210度
      expect(result['2024-01-02'][0].cardinalDirection).toBe('北北東'); // 30度
    });
  });
});