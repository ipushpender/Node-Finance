const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const {
  fork
} = require('child_process');

const middleware = require('../provider/middleware');
const path = require('path');
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

router.get('/', middleware.checksession, async (req, res, next) => {
  res.render('withdrawal_reconcile');
})

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/' + req.session.username)
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, "Withdrawal_Admin" + ext)
  }
})

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 80
  }
})

router.post('/admin_file_upload', upload.single('admin_filename'), async (req, res, next) => {
  // req.session.id = [];
  // req.session.admin_ + req.session.id = []
  logger.info(req.file.path);
  if (typeof req.file !== "undefined") {
    let com = await fork('./routes/child_parse.js')
    com.send(req.file.path);
    com.on('message', (msg) => {
      if (msg.isCompleted) {
       fs.writeFileSync('./public/uploads/' + req.session.username + '/Withdrawal_Admin.txt', JSON.stringify(msg.obj, null, 2), 'utf-8');
        res.send({
          "success": true,
          "header": msg.header
        });
      } else {
        res.send({
          "success": false
        });
      }

    })
  } else {
    res.send({
      "success": false,
    })
  }
})


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/' + req.session.username)
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, "Withdrawal_cashfree" + ext)
  }
})

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 80
  }
})

router.post('/cashfree_file_upload', upload.single('cashfree_filename'), async (req, res, next) => {
  if (typeof req.file !== "undefined") {
    let com = await fork('./routes/child_parse.js')
    com.send(req.file.path);
    com.on('message', (msg) => {
      if (msg.isCompleted) {
        fs.writeFileSync('./public/uploads/' + req.session.username + '/Withdrawal_cashfree.txt', JSON.stringify(msg.obj, null, 2), 'utf-8');
        res.send({
          "success": true,
          "header": msg.header,
          // "path": msg.path
        });
      } else {
        res.send({
          "success": false
        });
      }

    })
  } else {
    res.send({
      "success": false,
    })
  }

})
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/' + req.session.username)
  },
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, "Withdrawal_bank" + ext)
  }
})

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 80
  }
})
// bank_obj = {};
router.post('/bank_file_upload', upload.single('bank_filename'), async (req, res, next) => {
  if (typeof req.file !== "undefined") {
    let com = await fork('./routes/child_parse.js')
    com.send(req.file.path);
    com.on('message', (msg) => {
      if (msg.isCompleted) {
        fs.writeFileSync('./public/uploads/' + req.session.username + '/Withdrawal_bank.txt', JSON.stringify(msg.obj, null, 2), 'utf-8');
      res.send({
          "success": true,
          "header": msg.header,
        });
      } else {
        res.send({
          "success": false
        });
      }

    })
  } else {
    res.send({
      "success": false,
    })
  }

});

router.post('/compare', async (req, res, next) => {

  total_percent = 0;
  let total = 0;
  let second_file = 0
  req.body.obj = './public/uploads/' + req.session.username + '/Withdrawal_Admin.txt';
  req.body.obj1 = './public/uploads/' + req.session.username + '/Withdrawal_cashfree.txt';
  req.body.obj2 = './public/uploads/' + req.session.username + '/Withdrawal_bank.txt';
  req.body.userName = req.session.username;
  try {
    const com = await fork('./routes/compare_child.js')
    await com.send(req.body);
    com.on('message', (msg) => {
      total = parseInt(msg.total_count)
      second_file = msg.data_1;
      if (!second_file || second_file == 'undefined') {
        second_file = 0;
      }
    
      total_percent = ((parseInt(msg.data) + parseInt(second_file)) / total) * 100;

      if (total_percent > 99 || msg.data === "undefined" || isNaN(total)) {
        total_percent = 100
      }
      if (msg.isCompleted) {

        res.send({
          "success": true,
          "cashfree_html": msg.cashfree_html,
          "admin_html": msg.admin_html,
          "bank_html": msg.bank_html,
          "admin_count": msg.admin_count,
          "cashfree_count": msg.cashfree_count,
          "bank_count": msg.bank_count,
          "cashfree_amount_total": msg.cashfree_amount_total,
          "bank_amount_total": msg.bank_amount_total,
          "admin_amount_total": msg.admin_amount_total,
          "userName": req.session.username
        });
      } 
    })
  } catch (error) {
    res.send({
      success: false,
      msg: error.msg
    })
  }

})

router.get("/get_parsing_status", (req, res, next) => {
  console.log();
  res.send({
    "success": true,
    "total_percent": total_percent
  })
})
module.exports = router;