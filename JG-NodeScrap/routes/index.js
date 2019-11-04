var express = require('express');
var router = express.Router();
let request = require('request');
let cheerio = require('cheerio');
let top_free = require('../models/TOP_FREE')
let top_grossing = require('../models/TOP_GROSSING')
let top_paid = require('../models/TOP_PAID')
let schedule = require('node-schedule');

/* GET home page. */
let type = [];
let all_url = [];
top_paid1 = 'https://play.google.com/store/apps/collection/cluster?clp=0g4cChoKFHRvcHNlbGxpbmdfcGFpZF9HQU1FEAcYAw%3D%3D:S:ANO1ljLtt38&gsr=Ch_SDhwKGgoUdG9wc2VsbGluZ19wYWlkX0dBTUUQBxgD:S:ANO1ljJCqyI&hl=en_IN';
top_free1 = 'https://play.google.com/store/apps/collection/cluster?clp=0g4cChoKFHRvcHNlbGxpbmdfZnJlZV9HQU1FEAcYAw%3D%3D:S:ANO1ljJ_Y5U&gsr=Ch_SDhwKGgoUdG9wc2VsbGluZ19mcmVlX0dBTUUQBxgD:S:ANO1ljL4b8c&hl=en_IN';
top_grossing1 = 'https://play.google.com/store/apps/collection/cluster?clp=0g4YChYKEHRvcGdyb3NzaW5nX0dBTUUQBxgD:S:ANO1ljLhYwQ&gsr=ChvSDhgKFgoQdG9wZ3Jvc3NpbmdfR0FNRRAHGAM%3D:S:ANO1ljIKta8';
all_url.push(top_free1);
all_url.push(top_paid1);
all_url.push(top_grossing1);

function StoreInMongo(seq_count) {
  // console.log(all_url[seq_count])
  const options = {
    url: all_url[seq_count],
    headers: {
      'User-Agent': 'request'
    }
  };
  let data_array = [];
  request(options, async (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let count = 1;
      data = [];
      obj = {}
      let all_app_url = [];
      let all_app = [];
      let all_app_price = [];
      let current_type;
      const $ = cheerio.load(body);
      // console.log(body)
      try {

        await $(".mpg5gc").each((i, el) => {
          url1 = $(el).find(".RZEgze .p63iDd a").attr('href');
          obj = {
            global_rank: count + i,
            icon: $(el).find(".buPxGf span img").attr("data-src"),
            url: 'https://play.google.com' + url1,
            developer: $(el).find(".RZEgze .p63iDd a .KoLSrc").html(),
            title: $(el).find(".RZEgze .p63iDd .Q9MA7b a .nnK0zc").text(),
            price: $(el).find(".i5DZme span").text()
          }

          if (obj.price == '') {
            obj.price = 'FREE'
          }
          var idApp = obj.url.match(/id=([^&]*)/);
          if (idApp[1]) {
            obj.app_id = idApp[1];
          } else {
            obj.app_id = ''
          }

          all_app_url.push(obj.url)
          all_app_price.push(obj.price)
          all_app.push(obj)

        })
        await fetchInfo(all_app_url, all_app_price, [], function (data) {
          console.log("--------", seq_count)
          let all_data = [];
          for (let i = 0; i < 50; i++) {
            all_data.push(Object.assign(data[i], all_app[i]))
          }
          // ==================check if data already inserted or not=================
          var now = new Date();
          var next = new Date();
          next.setDate(next.getDate() + 1);
          mt = parseInt(now.getMonth() + 1)
          dt = parseInt(now.getDate())
          nmt = parseInt(next.getMonth() + 1)
          ndt = parseInt(next.getDate())
          if (mt < 10) {
            mt = "0" + mt;
          }
          if (dt < 10) {
            dt = "0" + dt;
          }
          if (nmt < 10) {
            nmt = "0" + nmt;
          }
          if (ndt < 10) {
            ndt = "0" + ndt;
          }
          cr = now.getFullYear() + "-" + mt + "-" + dt + "T00:00:00.000Z";
          nt = next.getFullYear() + "-" + nmt + "-" + ndt + "T00:00:00.000Z";
          // console.log(cr)
          // console.log(nt)
          if (seq_count == 0) {
            current_type = top_free
          } else if (seq_count == 1) {
            current_type = top_paid
          } else if (seq_count == 2) {
            current_type = top_grossing
          }
          current_type.findOne({
            "time": {
              "$gte": new Date(cr),
              "$lt": new Date(nt)
            }
          }, function (err, user) {
            if (err) {
              console.log("error", err)
            } else {
              if (!user) {
                current_type.insertMany(all_data).then((data) => {
                  seq_count = seq_count + 1;
                  StoreInMongo(seq_count)
                }).catch((err) => {
                  console.log("Error", err.message)
                });
              } else {
                console.log("Already Exist today data ")
              }
            }
          });
          // =========================================

        })

      } catch (error) {
        console.log(error.message)
      }

    }
  });
}

var a = 0;
var b = 0;
var c = 0;
var d = 0;
var e = 0;
var f = 0;
var g = 0;
var h = 0;
var i = 0;
var j = 0;
var k = 0;
var l1 = 0;
var m = 0;
var n = 0;
var o = 0;
var p = 0;
var q = 0;
var r = 0;

fetchInfo = async (data, all_app_price, final_resp, get_details) => {
  console.log(data.length)
  var flag = 0;
  try {
    if (data.length) {
      let options = data.splice(0, 1)[0]
      let price = all_app_price.splice(0, 1)[0]
      if (price != 'FREE') {
        flag = 1
      }

      await request(options, async function (error, response, body) {
        let obj1 = {};
        let update;
        if (!error && response.statusCode == 200) {
          const $ = cheerio.load(body);
          if (flag == 0) {
            obj1 = {
              updated: $(".IxB2fe .hAyfc span.htlgb div.IQ1z0d .htlgb").html(),
              size: $(".IxB2fe .hAyfc:nth-child(2) span.htlgb div.IQ1z0d .htlgb").html(),
              install: $(".IxB2fe .hAyfc:nth-child(3) span.htlgb div.IQ1z0d .htlgb").html(),
              current_version: $(".IxB2fe .hAyfc:nth-child(4) span.htlgb div.IQ1z0d .htlgb").html(),
              editor_choice: $(".GcFlrd").text(),
              category: $(".qQKdcc span:nth-child(2) a").html(),
              score: $(".K9wGie .BHMmbe").html(),
              developer_email: $(".hAyfc .htlgb .IQ1z0d .htlgb div:nth-child(2) .hrTbp ").html(),
              developer_url: $(".hAyfc .htlgb .IQ1z0d .htlgb div:nth-child(3) .hrTbp ").attr("href"),
            }
          } else if (flag == 1) {
            obj1 = {
              updated: $(".IxB2fe .hAyfc:nth-child(2) span.htlgb div.IQ1z0d .htlgb").html(),
              size: $(".IxB2fe .hAyfc:nth-child(3) span.htlgb div.IQ1z0d .htlgb").html(),
              install: $(".IxB2fe .hAyfc:nth-child(4) span.htlgb div.IQ1z0d .htlgb").html(),
              current_version: $(".IxB2fe .hAyfc:nth-child(5) span.htlgb div.IQ1z0d .htlgb").html(),
              editor_choice: $(".GcFlrd").text(),
              category: $(".qQKdcc span:nth-child(2) a").html(),
              score: $(".K9wGie .BHMmbe").html(),
              developer_email: $(".hAyfc .htlgb .IQ1z0d .htlgb div:nth-child(2) .hrTbp ").html(),
              developer_url: $(".hAyfc .htlgb .IQ1z0d .htlgb div:nth-child(3) .hrTbp ").attr("href"),
            }

          }

          if (obj1.editor_choice == '') {
            obj1.editor_choice = false
          } else {
            obj1.editor_choice = true
          }
          // console.log(obj1.category);
          if (!obj1.category) {
            obj1.category = "NO Category";
          }
          obj1.category = obj1.category.toUpperCase();
          obj1.category = "GAME_" + obj1.category
          //==========================================================================

          var ans = 0;
          if (obj1.category == 'GAME_ACTION') {
            a = a + 1;
          }
          if (obj1.category == 'GAME_CASUAL') {
            b = b + 1
          }
          if (obj1.category == 'GAME_PUZZLE') {
            c = c + 1
          }
          if (obj1.category == 'GAME_SIMULATION') {
            d = d + 1
          }
          if (obj1.category == 'GAME_RACING') {
            e = e + 1
          }
          if (obj1.category == 'GAME_SPORTS') {
            f = f + 1
          }
          if (obj1.category == 'GAME_ARCADE') {
            g = g + 1
          }
          if (obj1.category == 'GAME_BOARD') {
            h = h + 1
          }
          if (obj1.category == 'GAME_CARD') {
            i = i + 1
          }
          if (obj1.category == 'GAME_ROLE_PLAYING') {
            j = j + 1
          }
          if (obj1.category == 'GAME_EDUCATIONAL') {
            k = k + 1
          }
          if (obj1.category == 'GAME_CASINO') {
            l1 = l1 + 1
          }
          if (obj1.category == 'GAME_TRIVIA') {
            m = m + 1
          }
          if (obj1.category == 'GAME_STRATEGY') {
            n = n + 1
          }
          if (obj1.category == 'GAME_ADVENTURE') {
            o = o + 1
          }
          if (obj1.category == 'GAME_MUSIC') {
            p = p + 1
          }

          if (obj1.category == 'GAME_WORD') {
            q = q + 1
          }
          if (obj1.category == 'GAME_ROLE PLAYING') {
            r = r + 1;
          }

          if (obj1.category == 'GAME_ACTION') {
            ans = a;
          }
          if (obj1.category == 'GAME_CASUAL') {
            ans = b
          }
          if (obj1.category == 'GAME_PUZZLE') {
            ans = c
          }
          if (obj1.category == 'GAME_SIMULATION') {
            ans = d
          }
          if (obj1.category == 'GAME_RACING') {
            ans = e
          }
          if (obj1.category == 'GAME_SPORTS') {
            ans = f
          }
          if (obj1.category == 'GAME_ARCADE') {
            ans = g
          }
          if (obj1.category == 'GAME_BOARD') {
            ans = h
          }
          if (obj1.category == 'GAME_CARD') {
            ans = i
          }
          if (obj1.category == 'GAME_ROLE_PLAYING') {
            ans = j
          }
          if (obj1.category == 'GAME_EDUCATIONAL') {
            ans = k
          }
          if (obj1.category == 'GAME_CASINO') {
            ans = l1
          }
          if (obj1.category == 'GAME_TRIVIA') {
            ans = m
          }
          if (obj1.category == 'GAME_STRATEGY') {
            ans = n
          }
          if (obj1.category == 'GAME_ADVENTURE') {
            ans = o
          }
          if (obj1.category == 'GAME_MUSIC') {
            ans = p
          }
          if (obj1.category == 'GAME_WORD') {
            ans = q
          }
          if (obj1.category == 'GAME_ROLE PLAYING') {
            ans = r
          }

          if (Number.isNaN(ans)) {
            ans = 0;
          }
          obj1.genre_rank = ans;
          // ===========================================================================

          var l = Date(Date.now());
          // console.log(l);
          obj1.time = l
        }
        try {
          final_resp.push(obj1)
          await fetchInfo(data, all_app_price, final_resp, get_details)
        } catch (error) {
          console.log(error.message)
        }

      })
    } else {
      try {
        await get_details(final_resp)
      } catch (error) {
        console.log(error.message)
      }

    }
  } catch (error) {
    console.log(error.message)

  }
} // end of function

var job = schedule.scheduleJob('0 0 8 * * *', function () {
  StoreInMongo(0);
});
module.exports = router;