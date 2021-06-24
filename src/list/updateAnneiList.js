const getAnneiList = require("./getAnneiList");

const updateAnneiList = async () => {
    const value = await getAnneiList();
    console.log(value)
};

module.exports = updateAnneiList;