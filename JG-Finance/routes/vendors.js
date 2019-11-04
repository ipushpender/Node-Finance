let express = require('express');
let router = express.Router();
let vendorModel = require('../models/vendors');
let middleware = require('../provider/middleware')

router.post("/save", middleware.checksession, async (req, res, next) => {
    try {
        let savedData = await vendorModel.save(req.body);
        if (savedData.name) {
            res.send({
                'success': true,
                'msg': savedData
            });
        } else {
            res.send({
                'success': false,
                'msg': savedData
            });

        }
    } catch (err) {
        res.send({
            'success': false,
            'msg': err
        });
    }

});

router.get('/delete/:id', middleware.checksession, async (req, res, next) => {
    try {
        let deletedUser = await vendorModel.deleteVendor(req.params.id);
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
router.get('/getVendor/:id', middleware.checksession, async (req, res, next) => {
    try {

        let getUser = await vendorModel.getUserById(req.params.id);
        if (getUser) {
            res.send({
                'success': true,
                'msg': getUser
            });
        } else {
            res.send({
                'success': false,
                'msg': "No Vendor Found "
            });
        }
    } catch (error) {
        res.send({
            'success': false,
            'msg': error
        });
    }

});

router.post("/updateVendorData/:id", middleware.checksession, async (req, res, next) => {
    try {
        let updatedVendor = await vendorModel.updateVendor(req.params.id, req.body);
        if (updatedVendor) {
            res.send({
                'success': true,
                'msg': updatedVendor
            });
        } else {
            res.send({
                'success': false,
                'msg': "Not Updated "
            });
        }
    } catch (error) {
        res.send({
            'success': false,
            'msg': error
        });
    }
});

router.get('/getAllVendor', middleware.checksession, async (req, res, next) => {
    try {
        let vendorDetail = await vendorModel.getAllVendors();
        if (vendorDetail && vendorDetail.length > 0) {
            res.send({
                'success': true,
                'msg': vendorDetail
            });
        } else {
            res.send({
                'success': false,
                'msg': " "
            });
        }
    } catch (error) {
        res.send({
            'success': false,
            'msg': error
        });
    }
});
module.exports = router