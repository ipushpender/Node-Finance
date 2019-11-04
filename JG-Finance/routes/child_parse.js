const xlsx = require('node-xlsx')
let header = [];
obj = {};
const parsing = async (path) => {
    try {
        // console.log("lllllll",path)
        obj = await xlsx.parse(path);
        for (let i = 0; i < obj[0].data[0].length; i++) {
            header.push('<option value="' + obj[0].data[0][i] + '">' + obj[0].data[0][i] + '</option>')
        }
        return true;
    } catch (error) {
        console.log("Error in parse", error.message)
        process.send({
            "success": false,
            "msg": error.message
        })
    }
}
process.on('message', async (path) => {
    try {
        console.log("paths", path)
        const result = await parsing(path);
        console.log("response of parse", result)
        if (result) {
            process.send({
                isCompleted: true,
                header: header,
                // path: path,
                obj: obj
            });
        }
    } catch (error) {
        process.send({
            isCompleted: false,
            msg: error.message
        })
    }
});