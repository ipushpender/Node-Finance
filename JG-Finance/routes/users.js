let express = require('express');
let router = express.Router();
let bcrypt = require('bcrypt');
let usermodel = require('../models/users');
let middleware = require('../provider/middleware');
let fs = require('fs');
let path = require('path');
const saltRounds = 10;
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

router.post('/', async (req, res, next) => {
  try {

    let verify = await usermodel.login(req.body);
    if (verify.username) {
      logger.info(verify.username);
      req.session.username = verify.username;
      req.session.user_type = 0;
      try {
        var data = await fs.readFileSync('./public/admin_list/admin.csv')
          .toString() // convert Buffer to string
          .split('\n') // split string to lines
          .map(e => e.trim()) // remove white spaces for each line
          .map(e => e.split(',').map(e => e.trim())); // split each line to array

        let reqPath = path.join(__dirname, '../' + '/public/uploads/' + req.session.username);
        fs.stat(reqPath, function (err) {
          if (!err) {
            console.log('file or directory  exists');
          } else if (err.code === 'ENOENT') {
            fs.mkdirSync("public/uploads/" + req.session.username);
          }
        });
      } catch (error) {
        console.log("req.session.user_type", error);

      }


      for (let i = 0; i < data.length; i++) {
        if (data[i] == verify.username) {
          req.session.user_type = 1;
        }
      }
     
      res.send({
        success: true
      })
    } else {
      res.send({
        success: false,
        msg: "Invalid Credentials"
      })
    }
  } catch (err) {
    res.send({
      error: err.message
    });
  }

});

router.get('/reset_password', middleware.checksession, async (req, res, next) => {
  res.render('reset_password');
})
router.post('/reset_password', middleware.checksession, async (req, res, next) => {
  try {
    req.body.username = req.session.username;
    let reset_password = await usermodel.reset_password(req.body);
    if (reset_password.username) {
      req.session.destroy(function (err) {
        console.log(err);
      })
      res.send({
        success: true,
      });
    } else {
      res.send({
        success: false,
        msg: reset_password
      });
    }

  } catch (error) {
    res.send({
      success: false,
      msg: error.message
    });
  }
})
module.exports = router;