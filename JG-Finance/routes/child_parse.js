// const xlsx = require('node-xlsx')
// let header = [];
// obj = {};
// const parsing = async (path) => {
//     try {
//         // console.log("lllllll",path)
//         obj = await xlsx.parse(path);
//         for (let i = 0; i < obj[0].data[0].length; i++) {
//             header.push('<option value="' + obj[0].data[0][i] + '">' + obj[0].data[0][i] + '</option>')
//         }
//         return true;
//     } catch (error) {
//         console.log("Error in parse", error.message)
//         process.send({
//             "success": false,
//             "msg": error.message
//         })
//     }
// }
// process.on('message', async (path) => {
//     try {
//         console.log("paths", path)
//         const result = await parsing(path);
//         console.log("response of parse", result)
//         if (result) {
//             process.send({
//                 isCompleted: true,
//                 header: header,
//                 // path: path,
//                 obj: obj
//             });
//         }
//     } catch (error) {
//         process.send({
//             isCompleted: false,
//             msg: error.message
//         })
//     }
// });


// const xlsx = require('node-xlsx')
const Excel = require('exceljs');
// var streamBuffers = require('stream-buffers');
const fs = require('fs');

const parsing = (path, callback) => {

    try {
        var obj1 = {};
        var data = [];
        var obj = [];
        var header = [];
        var readStream = fs.createReadStream(path);
        const workbook = new Excel.stream.xlsx.WorkbookReader();
        var options = {
            entries: "emit",
            sharedStrings: "cache",
            styles: "emit",
            hyperlinks: "emit",
            worksheets: "emit"
        };
        console.log('options', options);
        workbook.on('error', function (error) {
            console.log('An error occurred while writing reading excel', error);
        });
        workbook.on('worksheet', function (worksheet) {
            worksheet.on('row', function (row,rowNumber) {
                let temp=[];
                // console.log(" row.values", row.values);
                row.model.cells.forEach(element => {
                    // console.log(":"+element.value)
                    temp.push(element.value);
                if (row.model.number == 1) {
                    header.push('<option value="' +  element.value + '">' +  element.value + '</option>');
                }
                });
                data.push(temp);
            });
            worksheet.on('close', function () {
                console.log("worksheet close");
            });
            worksheet.on('finished', function () {
                obj1 = {
                    "data": data
                }
                obj.push(obj1);
                console.log("worksheet finished");
            });
        });
        workbook.on('finished', function () {
            // console.log("finished"+header);
            callback({"header":header,"obj":obj})
        });
        workbook.on('close', function () {
            console.log("close");
        });
        workbook.read(readStream, options);
      
        //     instream.pipe(workbook.xlsx.createInputStream());
        //     var outstream = new stream();
        //     var rl =readline.createInterface(instream,outstream);
        //     console.log("++lincount");
        //     var stream1;
        //     // console.log("++lincount"+rl);
        //     rl.on('line',function(data){

        //         // stream1 =stream1+data;
        //         console.log("stream"+data);    

        //         linecount++;

        //     })
        // // })
        //     rl.on('close',function(){
        //         console.log("++lincount"+linecount);
        //  var workbook = new Excel.Workbook();
        // workbook.xlsx.read(stream1).then(() => {
        //  var worksheet = workbook.getWorksheet('Sheet1');
        // worksheet.eachRow({
        //     includeEmpty: true
        // }, function (row, rowNumber) {
        //     let temp = [];
        //     row.eachCell({
        //         includeampty: true
        //     }, function (cell, colNumber) {
        //         if (rowNumber == 1) {
        //             header.push('<option value="' + cell.value + '">' + cell.value + '</option>');
        //         }
        //         temp.push(cell.value);
        //     });
        //     data.push(temp);
        //     obj1 = {
        //         "data": data
        //     }
        //     obj.push(obj1);
        //     workbook.removeWorksheet(worksheet.id);
        //     callback({"header":header,"obj":obj});
        // });

        // })
        // });


        // ____________________________________________________________
        // var obj1 = {};
        // var data = [];
        // var obj = [];
        // var header = [];
        // var stream = fs.createReadStream(path, {
        //     objectMode: true
        // });
        // var workbook = new Excel.Workbook();
        // workbook.xlsx.read(stream).then(() => {
        //     var worksheet = workbook.getWorksheet('Sheet1');
        //     worksheet.eachRow({
        //         includeEmpty: true
        //     }, function (row, rowNumber) {
        //         let temp = [];
        //         row.eachCell({
        //             includeampty: true
        //         }, function (cell, colNumber) {
        //             if (rowNumber == 1) {
        //                 header.push('<option value="' + cell.value + '">' + cell.value + '</option>');
        //             }
        //             temp.push(cell.value);
        //         });
        //         data.push(temp);
        //         obj1 = {
        //             "data": data
        //         }
        //         obj.push(obj1);

        //     });
        //     workbook.removeWorksheet(worksheet.id);
        //     callback({"header":header,"obj":obj});
        // })


    } catch (error) {
        console.log("Error in parse", error.message)
        process.send({
            "success": false,
            "msg": error.message
        })
    }


    // try {   
    //     // console.log("lllllll",path)
    //     obj = await xlsx.parse(path);
    //     for (let i = 0; i < obj[0].data[0].length; i++) {
    //         header.push('<option value="' + obj[0].data[0][i] + '">' + obj[0].data[0][i] + '</option>')
    //         // console.log("header"+header);
    //     }
    //     return true;
    // } catch (error) {
    //     console.log("Error in parse", error.message)
    //     process.send({
    //         "success": false,
    //         "msg": error.message
    //     })
    // }
}
process.on('message', async (path) => {
    try {
        console.log("paths", path + " ::   " + new Date())
        parsing(path, (result) => {
            console.log("response of parse " + JSON.stringify(result.obj[0].data[0][1]) + " ::::::::   " + new Date())
            if (result) {
                process.send({
                    isCompleted: true,
                    header: result.header,
                    obj: result.obj
                });
            }
        });

    } catch (error) {
        process.send({
            isCompleted: false,
            msg: error.message
        })
    }
});
