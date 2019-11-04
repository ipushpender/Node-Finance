let express = require('express');
let router = express.Router();
let employeeModel = require('../models/employees');
let userModel = require('../models/users');
let pfgModel = require('../models/pfg')
let vendorModel = require('../models/vendors')
let fs = require('fs')
let http = require('http');
let middleware = require('../provider/middleware')
let schedule = require('node-schedule');
const path = require('path');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotalySecretKey');

let puppeteer = require('puppeteer');
var ext = 0;
var ext1 = 0;
router.get('/get_All_Beneficiary_OnClick', middleware.checksession, async (req, res, next) => {
    try {
        let users = await pfgModel.getAllUser();
        if (users.name || users[0].name && users.length > 0) {
            res.send({
                success: true,
                msg: users,
            });
        } else {
            res.send({
                success: false,
                msg: users,

            });
        }
    } catch (error) {
        res.send({
            success: false,
            msg: error.message
        });
    }
})
router.post('/get_beneficiary_details', middleware.checksession, async (req, res, next) => {
    try {
        if (req.body.type == 'Employee') {
            let empDetails = await employeeModel.getUserByName(req.body.name);

            if (empDetails && empDetails.name) {
                res.send({
                    success: true,
                    msg: empDetails,
                    type: "Employee"
                });
            } else {
                res.send({
                    success: false,
                    msg: empDetails,
                });
            }
        } else if (req.body.type == 'Vendor') {
            let vendorDetails = await vendorModel.getUserByName(req.body.name);
            if (vendorDetails && vendorDetails.name) {
                res.send({
                    success: true,
                    msg: vendorDetails,
                    type: "Vendor"
                });
            } else {
                res.send({
                    success: false,
                    msg: vendorDetails,
                });
            }
        }
    } catch (error) {
        res.send({
            success: false,
            msg: error.message
        });
    }

});

router.get('/delete/:id', middleware.checksession, async (req, res, next) => {
    try {
        let deletedUser = await pfgModel.deleteBenefit(req.params.id);
        if (deletedUser && deletedUser.deletedCount > 0) {
            res.send({
                'success': true,
                'msg': deletedUser
            });
        } else {
            res.send({
                'success': false,
                'msg': "Record not deleted!"
            });
        }
    } catch (error) {
        res.send({
            'success': false,
            'msg': error
        });
    }
})

router.post('/get_user_names', middleware.checksession, async (req, res, next) => {
    try {
        if (req.body.type == 'Employee') {
            let getName = await employeeModel.getName(req.body);
            if (getName && getName.length > 0) {
                res.send({
                    'success': true,
                    'msg': getName
                })
            } else {
                res.send({
                    'success': false,
                    'msg': getName
                })
            }
        } else if (req.body.type == 'Vendor') {
            let getName = await vendorModel.getName(req.body);
            if (getName && getName.length > 0) {
                res.send({
                    'success': true,
                    'msg': getName
                })
            } else {
                res.send({
                    'success': false,
                    'msg': getName
                })
            }
        }
    } catch (error) {
        res.send({
            'success': false,
            'msg': error.message
        })
    }
})

router.post('/generatefile', middleware.checksession, async (req, res, next) => {

    try {
        req.body.person = req.session.username;
        let save_benficial = await pfgModel.save_benficial(req.body);

        if (save_benficial) {

            let detailCsv = await pfgModel.getLastRecord();
            if (detailCsv) {
                let d1 = ''
                let d, m, y;
                let start;
                start = new Date(detailCsv.date);
                d = start.getDate();
                m = start.getMonth();
                if (d < 10) {
                    d = '0' + d;
                }
                if (m < 10) {
                    m = '0' + m;
                }
                y = start.getFullYear();
                d1 = detailCsv.file_content;

                var job = schedule.scheduleJob('0 0 0 * * *', function () {
                    fs.readdir('public/file', (err, files) => {
                        if (err) console.log(err);
                        for (const file of files) {
                            fs.unlink(path.join('public/file', file), err => {
                                if (err) console.log(err);
                            });
                        }
                    });
                    ext = 0;
                    ext1 = 0;
                });
                ext = ext + 1;
                fs.writeFile("public/file/user.000" + ext, d1, function (err) {
                    if (err) {
                        res.send({
                            success: false,
                            msg: err
                        })
                    } else {
                        res.send({
                            success: true,
                            msg: 'user.000' + ext
                        })
                    }
                });
            }
        } else {
            res.send({
                success: false,
                msg: "Not Saved"
            })
        }

    } catch (error) {
        res.send({
            success: false,
            msg: error.message
        })
    }

});


router.post('/get_beneficial_by_date', middleware.checksession, async (req, res, next) => {
    try {
        let get_beneficial_by_date = await pfgModel.get_beneficial_by_date(req.body);
        if (get_beneficial_by_date && get_beneficial_by_date.length > 0) {

            res.send({
                success: true,
                msg: get_beneficial_by_date,
                len: get_beneficial_by_date.length
            })
        } else {
            res.send({
                success: false,
                msg: get_beneficial_by_date
            })
        }
    } catch (error) {
        res.send({
            success: false,
            msg: error.message
        })
    }

});

router.post('/get_myreport', middleware.checksession, async (req, res, next) => {
    try {
        let get_myreport = await pfgModel.get_myreport(req.body.id);
        if (get_myreport) {
            s1 = get_myreport.file_content;
            ext1 = ext1 + 1;
            fs.writeFile("public/file/report.00" + ext1, s1, function (err) {
                if (err) {
                    res.send({
                        success: false,
                        msg: err
                    })
                } else {
                    res.send({
                        success: true,
                        msg: "report.00" + ext1
                    })
                }
            });
        } else {
            res.send({
                success: false,
                msg: get_myreport
            })
        }
    } catch (error) {
        res.send({
            success: false,
            msg: error.message
        })
    }
});

router.post('/check_beneficial_name', async (req, res, next) => {
    try {
        let check_beneficial_name = await pfgModel.check_beneficial_name(req.body);
        if (check_beneficial_name) {
            res.send({
                success: true,
                msg: check_beneficial_name
            })
        } else {
            res.send({
                success: false,
                msg: check_beneficial_name
            })
        }
    } catch (error) {
        res.send({
            success: false,
            msg: error.message
        })
    }
});

router.post('/pdf_download', middleware.checksession, async (req, res, next) => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        let d1 = '<div style="margin-top:50px;"><div style="float: left;">Approver Name:______________</div><div style="float: right;margin-right:40px">Approver Signature:______________</div></div>'
        await page.setContent(req.body.top + req.body.main_content + req.body.bottom + d1);
        await page.emulateMedia('screen');
        let ans = await page.pdf({
            path: 'public/file/mypdf.pdf',
            format: 'A4',
            printBackground: true,
            margin: {
                left: '60px',
                top: '50px',
                right: '0px',
                bottom: '0px'
            }
        })

        if (ans) {
            res.send({
                success: true,
            });
        } else {
            res.send({
                success: false,
            });
        }
        // await browser.close();
        // process.exit();
    } catch (error) {
        res.send({
            success: false,
            msg: error.message
        })
    }
});

router.post("/report_download", middleware.checksession, async (req, res, next) => {
    try {
        let get_myreport = await pfgModel.get_myreport(req.body.id);
        if (get_myreport) {
            var s1 = '';
            var str = '';
            var sum_of_amount = 0;
            var date ;
            date =get_myreport.date;
            s1 = get_myreport.file_content;
            len_of_s1 = s1.split("\n").length - 1;
            array_of_s1 = s1.split("\n")
            var d2 = '';
            var incre = 0;
            for (let i = 0; i < len_of_s1; i++) {
                incre = i + 1;
                let my_row = array_of_s1[i].split(",");
                d2 = `<tr scope="row">
                <th style="border: 1px solid black;text-align: center;">` + incre + `</th>
                <td style="border: 1px solid black;text-align: center;">` + my_row[4] + `</td>
                <td style="border: 1px solid black;text-align: center;">` + my_row[13] + `</td>
                <td style="border: 1px solid black;text-align: center;">` + my_row[22] + `</td>
                <td style="border: 1px solid black;text-align: center;">` + my_row[3] + `</td></tr>`;
                str = str + d2;
            }
            var dateString = date;
            dateString = dateString.split(' ').slice(0, 5).join(' ');
            table_head = "<div style='width: 100px; margin: auto; text-align: center;'><img style='margin-top: 0px; width: 60px; height: 60px;' src='http://13.235.184.241:4000/images/jg-icon.png' /></div><div style='float: left;'>" + dateString + "</div><div style='text-align: center;'><div style='text-align:center'><h3 style='margin-top: 40px'><b>Payout Approval Document</b></h3></div><table style='border: 1px solid black;border-collapse: collapse;width: 70%;margin: auto; '><thead ><tr><th style='border: 1px solid black;'>#</th><th style='border: 1px solid black;'>Name</th><th style='border: 1px solid black;'>Comment</th><th style='border: 1px solid black;'>Date</th><th style='border: 1px solid black;'>Amount</th></tr></thead><tbody>";
            sum_of_amount = cryptr.decrypt(get_myreport.amount);
            table_bottom = '<tr style="text-align:center";><td colspan=4>Total</td><td style="border:1px solid">' + sum_of_amount + '</td></tr></tbody></table>';
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            let d1 = '<div style="margin-top:50px;"><div style="float: left;">Approver Name:______________</div><div style="float: right;margin-right:40px">Approver Signature:______________</div></div>'

            await page.setContent(table_head + str + table_bottom + d1);
            await page.emulateMedia('screen');
            let ans = await page.pdf({
                path: 'public/file/myreportpdf.pdf',
                format: 'A4',
                printBackground: true,
                margin: {
                    left: '60px',
                    top: '50px',
                    right: '0px',
                    bottom: '0px'
                }
            })

            if (ans) {
                res.send({
                    success: true,
                });
            } else {
                res.send({
                    success: false,
                });
            }
        }
    } catch (error) {
        res.send({
            success: false,
            msg: error.message
        })
    }
})
module.exports = router;