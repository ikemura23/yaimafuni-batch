module.exports = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyB0bKf_bGMHP62fiQD4D00bG_vdm_RNb5A',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'yaima-funi.firebaseapp.com',
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://yaima-funi.firebaseio.com',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'yaima-funi.appspot.com',
    serviceAccountKeyPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH || './serviceAccountKey.json',
  },
  slack: {
    webHookUrl: process.env.SLACK_WEBHOOK_URL || 'https://hooks.slack.com/services/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',
  },
  puppeteer: {
    userAgent: process.env.PUPPETEER_USER_AGENT || 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B5110e Safari/601.1',
  },
};
