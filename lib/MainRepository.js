const firebase = require("firebase");

/**
 * Firebaseのリポジトリ
 */
module.exports = {
  update: function update(path, data) {
    console.log(path);
    //   console.log(data);

    if (path) return;
    if (data) return;

    // try {
    return firebase
      .database()
      .ref(path)
      .update(data, e => {
        if (e) {
          console.error("update error");
        } else {
          console.log("update complete!");
        }
      });
    // } catch (error) {
    //   console.error(error);
    // }
  }
};
