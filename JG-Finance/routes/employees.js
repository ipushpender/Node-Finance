let express = require('express');
let router = express.Router();
let employeeModel = require('../models/employees');
let middleware = require('../provider/middleware')

router.post("/save", middleware.checksession, async (req, res, next) => {
    try {
        let savedData = await employeeModel.save(req.body);
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
        let deletedUser = await employeeModel.deleteEmployee(req.params.id);
        if (deletedUser && deletedUser.deletedCount > 0) {
            res.send({
                'success': true,
                'msg': deletedUser
            });
        } else {
            res.send({
                'success': false,
                'msg': "Record is not deleted"
            });
        }
    } catch (error) {
        res.send({
            'success': false,
            'msg': error
        });
    }
})
router.get('/getEmployee/:id', middleware.checksession, async (req, res, next) => {
    try {
        let getUser = await employeeModel.getUserById(req.params.id);
        if (getUser) {
            res.send({
                'success': true,
                'msg': getUser
            });
        } else {
            res.send({
                'success': false,
                'msg': "No Employee Found "
            });
        }
    } catch (error) {
        res.send({
            'success': false,
            'msg': error
        });
    }
});

router.post("/updateEmployeeData/:id", middleware.checksession, async (req, res, next) => {
    try {
        // console.log(req.body)
        let updatedEmployee = await employeeModel.updateEmployee(req.params.id, req.body);
        // console.log("after"+updatedEmployee)
        if (updatedEmployee) {
            res.send({
                'success': true,
                'msg': updatedEmployee
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
module.exports = router