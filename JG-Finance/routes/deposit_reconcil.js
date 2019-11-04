const express = require('express');
const router = express.Router();
const middleware = require('../provider/middleware');
var multer = require('multer')
var xlsx = require('node-xlsx')
var path = require('path');
let fs = require('fs')
const log4js = require('log4js');

log4js.configure({
  appenders: {
    fileAppender: {
      type: 'file',
      filename: './logs.log'
    }
  },
  categories: {
    default: {

      appenders: ['fileAppender'],
      level: 'info'
    }
  }
})

const logger = log4js.getLogger();

const {
  convertArrayToCSV
} = require('convert-array-to-csv');
// var upload = multer({ dest: 'public/uploads' })
// var progress = require('request-progress');
// var request = require('request');
// {cellDates:true}


len1 = 0;
len2 = 0;

router.get('/', middleware.checksession, async (req, res, next) => {
  res.render('deposit_reconcil');
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/' + req.session.username)
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, "Admin" + ext)
  }
})

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20
  }
})

router.post('/upload', upload.single('uploadedFile'), async (req, res, next) => {
  logger.info('file1');
  let header = [];
  var file_row = [];
  if (typeof req.file !== "undefined") {
    try {
      var obj = await xlsx.parse(req.file.path);
      for (let i = 0; i < obj[0].data[0].length; i++) {
        header.push('<option value="' + obj[0].data[0][i] + '">' + obj[0].data[0][i] + '</option>')
      }

      res.send({
        "success": true,
        "header": header,
        "path": req.file.path
      })
    } catch (error) {
      res.send({
        "success": false,
        "msg": error.message
      })
    }
  } else {
    res.send({
      "success": false,
    })
  }
});

var storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/' + req.session.username)
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, "gateway" + ext)
  }
})

var upload1 = multer({
  storage: storage1,
  limits: {
    fileSize: 1024 * 1024 * 20
  }
})
router.post('/upload_payment', upload1.single('paymentFile'), async (req, res, next) => {
  logger.info('file2');
  let header = [];
  if (typeof req.file !== "undefined") {
    try {
      var obj = await xlsx.parse(req.file.path);
      for (let i = 0; i < obj[0].data[0].length; i++) {
        header.push('<option value="' + obj[0].data[0][i] + '">' + obj[0].data[0][i] + '</option>')
      }
      res.send({
        "success": true,
        "header": header,
        "path": req.file.path
      })
    } catch (error) {
      res.send({
        "success": false,
        "msg": error.message
      })
    }
  } else {
    res.send({
      "success": false,
    })
  }

});

router.post('/compare', async (req, res, next) => {
  try {
    column1 = null;
    column2 = null;
    amount1 = null;
    amount2 = null;
    date1 = null;
    date2 = null;
    Admin_head = []
    Gateway_head = []
    var obj = xlsx.parse(req.body.file1);
    var obj1 = xlsx.parse(req.body.file2);
    for (let i = 0; i < obj[0].data[0].length; i++) {
      // console.log(req.body.col1," ==", obj[0].data[0][i])
      Admin_head.push(obj[0].data[0][i]);
      if (req.body.col1 == obj[0].data[0][i]) {
        column1 = i;
      }
      if (req.body.amount1 == obj[0].data[0][i]) {
        amount1 = i;
      }
      if (req.body.date1 == obj[0].data[0][i]) {
        date1 = i;
      }
    }
    Admin_head.push('Gateway');
    Admin_head.push('Diff')
    for (let i = 0; i < obj1[0].data[0].length; i++) {
      Gateway_head.push(obj1[0].data[0][i]);
      if (req.body.col2 == obj1[0].data[0][i]) {
        column2 = i;
      }
      if (req.body.amount2 == obj1[0].data[0][i]) {
        amount2 = i;
      }
      if (req.body.date2 == obj1[0].data[0][i]) {
        date2 = i;
      }
    }
    Gateway_head.push('Admin');
    Gateway_head.push('Diff')
    console.log("---", amount1, "----", amount2, "----", column1, "------", column2, "---", date1, "----", date2, "---");

    // console.log(obj[0].data.length);
    obj[0].data.shift();
    obj1[0].data.shift();
    // console.log(obj[0].data.length);
    // ========================remove duplicay========================

    file_row1 = []
    file_row2 = []
    for (let i = 0; i < obj[0].data.length; i++) {
      let str = obj[0].data[i];
      str = str.toString().replace(/,/g, '&');
      file_row1.push(str);
    }
    for (let i = 0; i < obj1[0].data.length; i++) {
      let str = obj1[0].data[i];
      str = str.toString().replace(/,/g, '&');
      file_row2.push(str);
    }
    // console.log("file_row1", file_row1.length);
    // console.log("file_row2", file_row2.length);
    var uniq = file_row1
      .map((name) => {
        return {
          count: 1,
          name: name
        }
      })
      .reduce((a, b) => {
        a[b.name] = (a[b.name] || 0) + b.count
        return a
      }, {})

    var uniq1 = file_row2
      .map((name) => {
        return {
          count: 1,
          name: name
        }
      })
      .reduce((a, b) => {
        a[b.name] = (a[b.name] || 0) + b.count
        return a
      }, {})


    var duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1)
    var duplicates1 = Object.keys(uniq1).filter((a) => uniq1[a] > 1)
    // console.log("duplicates", duplicates);
    // console.log("duplicates1", duplicates1);
    let unique_file1 = await file_row1.filter((item, i, ar) => ar.indexOf(item) === i);
    let unique_file2 = await file_row2.filter((item, i, ar) => ar.indexOf(item) === i);
    after_unique1 = [];
    after_unique2 = [];
    // console.log("unique_file1",unique_file1)
    for (let i = 0; i < unique_file1.length; i++) {

      let str = unique_file1[i];
      str = str.toString().replace(/&/g, ',');
      str = str.split(",")
      // console.log(i,"--",str)
      if (str[0] != '') {
        after_unique1.push(str);
      }
    }
    for (let i = 0; i < unique_file2.length; i++) {
      let str = unique_file2[i];
      str = str.toString().replace(/&/g, ',');
      str = str.split(",")
      if (str[0] != '') {
        after_unique2.push(str);
      }
    }

    // console.log(after_unique1.length);
    // console.log(after_unique2.length);
    // ================================================================

    len1 = after_unique1.length;
    len2 = after_unique2.length;
    count_match = 0;
    admin_matched_csv = [];
    match_arr = ''
    unmatch_gateway = ''
    sum_of_match = 0;
    flag = 0;
    diff_of_amt1 = 0;
    diff_of_amt = 0;
    gateway_match = []
    gateway_match_arr = '';
    date_wise_amount = [];
    date_admin = []
    admin_date = '';
    gateway_date_total = 0;
    flag_for_datewise = 0;

    admin_dates_only = [];
    gateway_dates_and_amount = [];
    temp_arr = [];


    for (let i = 0; i < len1; i++) {
      flag = 0;

      for (let j = 0; j < len2; j++) {
        // console.log(after_unique1[i][column1],"j=====",after_unique2[j][column2])
        if (after_unique1[i][column1] == after_unique2[j][column2]) {

          // console.log("j=====",j)
          // ==============for date compare==========
          temp_arr = [];
          temp_arr1 = [];
          temp_arr1.push(after_unique1[i][date1]);
          temp_arr1.push(after_unique1[i][amount1]);
          admin_dates_only.push(temp_arr1);
          temp_arr.push(after_unique2[j][date2])
          temp_arr.push(after_unique2[j][amount2])
          temp_arr.push(after_unique2[j][column2])
          gateway_dates_and_amount.push(temp_arr);


          // ==============End for date compare==========

          var utc_value = Math.floor(after_unique1[i][date1] - 25569) * 86400;
          var date_info = new Date(utc_value * 1000);
          var month = parseInt(date_info.getMonth()) + 1;
          after_unique1[i][date1] = date_info.getFullYear() + "/" + month + "/" + date_info.getDate();
          count_match = count_match + 1
          flag = 1;
          sum_of_match = sum_of_match + parseInt(after_unique1[i][amount1])
          diff_of_amt = parseInt(after_unique1[i][amount1]) - parseInt(after_unique2[j][amount2])
          after_unique1[i].push(after_unique2[j][amount2])
          after_unique1[i].push(diff_of_amt)
          match_arr = match_arr + `<tr><td>` + after_unique1[i][column1] + `</td><td>` + after_unique1[i][date1] +
            `</td><td>` + after_unique1[i][amount1] + `</td><td>` + after_unique2[j][amount2] + `</td><td>` + diff_of_amt + `</td></tr>`;
          admin_matched_csv.push(after_unique1[i])
          break;
        }
      }

      if (flag == 0) {


        // =====date conversion=======
        var utc_value = Math.floor(after_unique1[i][date1] - 25569) * 86400;
        var date_info = new Date(utc_value * 1000);
        var month = parseInt(date_info.getMonth()) + 1;
        after_unique1[i][date1] = date_info.getFullYear() + "/" + month + "/" + date_info.getDate();

        //============================
        match_arr = match_arr + `<tr style="background-color: #f9f9f9;color: #ec153d;"><td>` + after_unique1[i][column1] + `</td><td>` + after_unique1[i][date1] +
          `</td><td>` + after_unique1[i][amount1] + `</td><td>N/A</td><td>N/A</td></tr>`;
        // console.log("after_unique1[i][amount1]",after_unique1[i][amount1])
        sum_of_match = sum_of_match + parseInt(after_unique1[i][amount1])
        count_match = count_match + 1
        after_unique1[i].push('N/a')
        after_unique1[i].push('N/a')
        admin_matched_csv.push(after_unique1[i])
      }

    }


    var dupli_admin = []
    if (duplicates.length > 0) {
      for (let i = 0; i < duplicates.length; i++) {
        let str = duplicates[i] + ",N/a,Duplicate\n";
        str = str.toString().replace(/&/g, ',');
        str = str.split(",")
        dupli_admin.push(str);

      }
      admin_matched_csv.push(dupli_admin)
    }
    admin_matched_csv.unshift(Admin_head)
    count_match1 = 0;
    sum_of_gateway = 0;
    flag1 = 0
    diff_of_amt1 = 0;
    logger.info(len1, ":", len2);
    console.log(len1, ":", len2)
    c1 = 0;
    s1 = 0;
    for (let i = 0; i < len2; i++) {
      flag1 = 0;

      for (let j = 0; j < len1; j++) {

        if (after_unique2[i][column2] == after_unique1[j][column1]) {

          let utc_value = Math.floor(after_unique2[i][date2] - 25569) * 86400;
          let date_info = new Date(utc_value * 1000);
          var month = parseInt(date_info.getMonth()) + 1;
          after_unique2[i][date2] = date_info.getFullYear() + "/" + month + "/" + date_info.getDate();
          count_match1 = count_match1 + 1
          flag1 = 1;
          sum_of_gateway = sum_of_gateway + parseInt(after_unique2[i][amount2])
          diff_of_amt1 = parseInt(after_unique2[i][amount2]) - parseInt(after_unique1[j][amount1])
          after_unique2[i].push(after_unique1[j][amount1])
          after_unique2[i].push(diff_of_amt1)
          gateway_match_arr = gateway_match_arr + `<tr><td>` + after_unique2[i][column2] + `</td><td>` + after_unique2[i][date2] +
            `</td><td>` + after_unique2[i][amount2] + `</td><td>` + after_unique1[j][amount1] + `</td><td>` + diff_of_amt1 + `</td></tr>`;
          gateway_match.push(after_unique2[i])
          break;
        }
      }
      if (flag1 == 0) {

        let utc_value = Math.floor(parseInt(after_unique2[i][date2]) - 25569) * 86400;
        let date_info = new Date(utc_value * 1000);
        var month = parseInt(date_info.getMonth()) + 1;
        after_unique2[i][date2] = date_info.getFullYear() + "/" + month + "/" + date_info.getDate();

        gateway_match_arr = gateway_match_arr + `<tr style="background-color: #f9f9f9;color: #ec153d;"><td>` + after_unique2[i][column2] + `</td><td>` + after_unique2[i][date2] +
          `</td><td>` + after_unique2[i][amount2] + `</td><td>N/A</td><td>N/A</td></tr>`;
        sum_of_gateway = sum_of_gateway + parseInt(after_unique2[i][amount2])
        count_match1 = count_match1 + 1
        after_unique2[i].push("N/a")
        after_unique2[i].push("N/a")
        gateway_match.push(after_unique2[i])
      }
    }
    gateway_match.unshift(Gateway_head)


    var dupli_gateway = []

    if (duplicates1.length > 0) {
      for (let i = 0; i < duplicates1.length; i++) {
        let str = duplicates1[i] + ",N/a,Duplicate\n";
        str = str.toString().replace(/&/g, ',');
        str = str.split(",")
        dupli_gateway.push(str);
      }
      gateway_match.push(dupli_gateway)
    }
    // =======================Date wise amount==========================================

    gateway_len = 0;
    admin_len = 0;
    admin_len = admin_dates_only.length;
    gateway_len = gateway_dates_and_amount.length;
    // console.log(gateway_len);
    // ===================================================
    for (let i = 0; i < admin_len; i++) {
      if (date_admin.indexOf(admin_dates_only[i][0]) === -1) {
        date_admin.push(admin_dates_only[i][0]);
      }
    }
    console.log("uniq", date_admin)
    // =================================================
    // console.log("gateway_dates_and_amount", gateway_dates_and_amount)
    dates = ''
    for (let i = 0; i < date_admin.length; i++) {
      gateway_date_total = 0
      for (let j = 0; j < gateway_len; j++) {
        if (parseInt(date_admin[i]) == parseInt(gateway_dates_and_amount[j][0])) {
          gateway_date_total = gateway_date_total + parseInt(gateway_dates_and_amount[j][1]);
        }
      }
      console.log(date_admin[i], "date_admin")
      let utc_value = Math.floor(parseInt(date_admin[i]) - 25569) * 86400;
      let date_info = new Date(utc_value * 1000);
      var month = parseInt(date_info.getMonth()) + 1;
      dates = date_info.getFullYear() + "/" + month + "/" + date_info.getDate();
      date_wise_amount.push(dates);
      date_wise_amount.push(gateway_date_total);
    }
    admin_matched_csv.push(date_wise_amount)
    console.log("444", date_wise_amount, "pppppp")

    gateway_amount_datewise = []
    date_wise_row = []
    console.log("999", gateway_len, "jjj");

    date_gateway = []
    for (let i = 0; i < gateway_len; i++) {
      if (date_gateway.indexOf(gateway_dates_and_amount[i][0]) === -1) {
        date_gateway.push(gateway_dates_and_amount[i][0]);
      }
    }

    sum_gateway_date = 0;
    gateway_date_wise = []
    temp_date = '';
    for (let i = 0; i < date_gateway.length; i++) {
      for (let j = 0; j < admin_len; j++) {

        if (parseInt(date_gateway[i]) == parseInt(admin_dates_only[j][0])) {
          sum_gateway_date = sum_gateway_date + parseInt(admin_dates_only[j][1]);
        }
      }
      let utc_value = Math.floor(parseInt(date_gateway[i]) - 25569) * 86400;
      let date_info = new Date(utc_value * 1000);
      var month = parseInt(date_info.getMonth()) + 1;
      temp_date = date_info.getFullYear() + "/" + month + "/" + date_info.getDate();
      gateway_date_wise.push(temp_date)
      gateway_date_wise.push(sum_gateway_date)
    }
    console.log(gateway_date_wise, "gateway_date_wise")

    gateway_match.push(gateway_date_wise)
    // =======================End Date wise amount=======================================

    const Admin_csv_file = await convertArrayToCSV(admin_matched_csv, {
      separator: ',',
    });
    const gateway_csv_file = await convertArrayToCSV(gateway_match, {
      separator: ',',
    });

    fs.writeFile("public/deposit/unmatch/gateway.csv", gateway_csv_file, function (err) {
      if (err) {
        console.log(err, "error")
      } else {
        console.log("success2")
      }
    });
    fs.writeFile("public/deposit/unmatch/admin_csv_file.csv", Admin_csv_file, function (err) {
      if (err) {
        console.log(err, "error")
      } else {
        console.log("success3")
      }
    });
    match_amount_word = inWords(sum_of_match)
    sum_of_gateway_word = inWords(sum_of_gateway)
    sum_of_match = comma_in_INR(sum_of_match)
    sum_of_gateway = comma_in_INR(sum_of_gateway);
    count_match1 = comma_in_INR(count_match1);
    count_match = comma_in_INR(count_match);
    res.send({
      success: true,
      "match_arr": match_arr,
      "gateway_match_arr": gateway_match_arr,
      "unmatch_gateway": unmatch_gateway,
      "match_amount": sum_of_match,
      "sum_of_gateway": sum_of_gateway,
      "match_amount_word": match_amount_word,
      "sum_of_gateway_word": sum_of_gateway_word,
      "count_match1": count_match1,
      "count_match": count_match,

    })
  } catch (error) {
    res.send({
      success: false,
      data: error.message
    })
  }
});

var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function inWords(num) {
  if ((num = num.toString()).length > 9) return 'overflow';
  n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  var str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only ' : '';
  return str;
}

function comma_in_INR(amt) {
  x = amt.toString();
  var lastThree = x.substring(x.length - 3);
  var otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers != '')
    lastThree = ',' + lastThree;
  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return res;
}


router.post('/p1', (req, res, next) => {});
router.get('/progress', (req, res, next) => {
  // pr = 0;
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  for (let i = 0; i < 10; i++) {
    if (i % 2 == 0) {
      res.write("i");
    }

  }
  res.end();

});


module.exports = router;