// 港別の運行ステータスの値をまとめているだけ

const firebase = require("firebase");
const consts = require("../consts.js");

/**
 * メイン処理
 */
module.exports = async () => {
    console.log("開始 港別の作成 ");

    const annei = await readDatabase(consts.ANEI);
    const ykf = await readDatabase(consts.YKF);
    const sendData = await createSendData(annei, ykf);
    await sendToFirebase(sendData);

    console.log("完了 港別の作成");
};

/**
 * firebaeから取得した値を返す
 */
async function readDatabase(path) {
    return firebase
        .database()
        .ref(path)
        .once("value")
        .then(function (snapshot) {
            return snapshot.val();
        });
}

/**
 * firebaseへ送信
 */
async function sendToFirebase(data) {
    return firebase
        .database()
        .ref("top_port")
        .set(data);
}

/**
 * 送信用の変数を作成して返す
 */
async function createSendData(anei, ykf) {
    // 竹富
    const taketomi = {
        anei: anei.taketomi,
        ykf: ykf.taketomi
    };
    // 小浜
    const kohama = {
        anei: anei.kohama,
        ykf: ykf.kohama
    };
    // 黒島
    const kuroshima = {
        anei: anei.kuroshima,
        ykf: ykf.kuroshima
    };
    // 大原
    const oohara = {
        anei: anei.oohara,
        ykf: ykf.oohara
    };
    // 上原
    const uehara = {
        anei: anei.uehara,
        ykf: ykf.uehara
    };
    // 鳩間
    const hatoma = {
        anei: anei.hatoma,
        ykf: ykf.hatoma
    };
    // 波照間
    const hateruma = {
        anei: anei.hateruma
    };
    return {
        taketomi,
        kohama,
        kuroshima,
        oohara,
        uehara,
        hatoma,
        hateruma
    };
}
