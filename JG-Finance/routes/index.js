var express = require('express');
var router = express.Router();
let employeeModel = require("../models/employees");
let middleware = require("../provider/middleware")
let ifsc = require('ifsc');
let fastCsv = require('fast-csv');
var fs = require('fs');
/* GET home page. */
router.get('/', middleware.isLogin, function (req, res, next) {
  res.render("login", {
    title: "Login",
    error: req.flash(err)
  });
});
router.get('/main_page', middleware.checksession, function (req, res, next) {
  var ip = req.headers['x-forwarded-for'];
  let ip1 = req.connection.remoteAddress;
  console.log(ip1, "ip", ip, "--", req.session.id)
  res.render("main");
});

router.get('/index', middleware.checksession, async (req, res, next) => {
  try {
    let employeeDetail = await employeeModel.getAllEmployees();
    if (employeeDetail) {
      res.render("index.ejs", {
        title: 'Payment Report',
        employeeData: employeeDetail,
        len: employeeDetail.length,
        user_status: req.session.user_type
      });
    } else {
      console.log("No employeeDetail");
    }
  } catch (error) {
    console.log("No employeeDetail err", error);

  }


});
router.get('/signout', middleware.checksession, function (req, res, next) {
  req.session.destroy(function (err) {
    console.log(err);
  })
  res.render('login', {
    title: 'Login'
  });
});

router.post('/getBankDetails', middleware.checksession, async (req, res, next) => {
  let n = 0;
  n = req.body.ifsc.length;
  let arr = ''
  var data = fs.readFileSync('./bank-ifsc/new-ifsc.csv')
    .toString() // convert Buffer to string
    .split('\n') // split string to lines
    .map(e => e.trim()) // remove white spaces for each line
    .map(e => e.split(',').map(e => e.trim())); // split each line to array

  if (n > 0) {
    // console.log(data.length)
    for (i = 0; i < data.length; i++) {
      if (data[i][0].substring(0, n) == req.body.ifsc.substring(0, n).toUpperCase()) {
        arr = arr + '<a href="#" value="' + data[i][0] + '" class="form-control ddn">' + data[i][0] + '</a>'
      }
    }
    res.send({
      success: true,
      msg: arr
    })
  }
});

router.post('/getBank', middleware.checksession, async (req, res, next) => {
  try {
    let check = await ifsc.validate(req.body.ifsc)
    if (check) {
      let details = await ifsc.fetchDetails(req.body.ifsc);
      if (details) {
        res.send({
          success: true,
          msg: details
        });
      } else {
        res.send({
          success: false,
          msg: "Details not found"
        });
      }

    } else {
      res.send({
        success: false,
        msg: "Invalid Ifsc"
      });
    }
  } catch (error) {
    res.send({
      success: false,
      msg: error.message
    });
  }

});

module.exports = router