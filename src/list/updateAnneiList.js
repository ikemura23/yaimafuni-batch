const getAnneiList = require("./getAnneiList");
const saveAnneiList = require("./saveAnneiList");

const updateAnneiList = async () => {
    const value = await getAnneiList();
    await saveAnneiList(value)
};

module.exports = updateAnneiList;