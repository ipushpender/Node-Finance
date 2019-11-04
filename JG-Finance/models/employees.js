const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EmployeeSchema = new Schema({
    empid: {
        type: mongoose.Schema.Types.ObjectId,
        default: mongoose.Types.ObjectId,
        index: {
            unique: true
        }
    },

    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    account_name: {
        type: String,
        required: true
    },
    bank: {
        type: String,
        required: true
    },
    account_no: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },

    ifsc: {
        type: String,
        required: true
    }
});
let employee = mongoose.model('Employee', EmployeeSchema);

employee.save = async (data) => {
    try {
        let checkname = await employee.find({
            name: data.name
        })
        if (checkname && checkname.length > 0) {
            return "Name Already exist!"
        }
        let employeedetail = await employee.create(data)
        if (!employeedetail) {
            return "Data not Saved"
        } else {

            return employeedetail;
        }
    } catch (error) {
        console.log("inside model", error.message)
        return error.message
    }
}

employee.getAllEmployees = async (data) => {
    try {
        let allEmployeedetail = await employee.find();
        if (!allEmployeedetail) {
            return "No data recieved"
        } else {
            return allEmployeedetail;
        }
    } catch (error) {
        console.log("inside model", error.message)
        return error.message
    }
}


employee.getUserById = async (id) => {
    try {
        let user = await employee.findOne({
            empid: id
        });
        if (!user) {
            return "Employee Not Found"
        } else {
            return user;
        }
    } catch (error) {
        console.log(error.message, "hgkkjj");
        return error.message
    }
}
employee.getUserByName = async (name) => {
    try {
        let getUser = await employee.findOne({
            name: name
        })
        if (!getUser) {
            return "Employee Not Found"
        } else {
            return getUser;
        }
    } catch (error) {
        console.log(error.message, "hgkkjj");
        return error.message
    }
}
employee.deleteEmployee = async (id) => {
    try {
        let deletedEmployee = await employee.deleteOne({
            empid: id
        }, {
            lean: true
        });
        if (!deletedEmployee) {
            return "No Employee deleted"
        } else {
            return deletedEmployee;
        }
    } catch (error) {
        console.log("inside model", error.message)
        return error.message
    }
}

employee.updateEmployee = async (id, body) => {
    try {
        let updates = {
            $set: {
                empid: body.empid,
                name: body.name,
                account_name: body.account_name,
                location: body.location,
                bank: body.bank,
                account_no: body.account_no,
                ifsc: body.ifsc,
            }
        }
        let updatedEmployee = await employee.findOneAndUpdate({
            empid: id
        }, updates, {
            new: true
        });
        //    console.log(updatedEmployee)
        if (!updatedEmployee) {
            return "No Employee updated"
        } else {
            return updatedEmployee;
        }
    } catch (error) {
        console.log("inside model", error.message)
        return error.message
    }
}

function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

function toSentenceCase(string) {
    // var string="hi all, this is derp. thank you all to answer my query.";
    var n = string.split(".");
    var vfinal = ""
    for (i = 0; i < n.length; i++) {
        var spaceput = ""
        var spaceCount = n[i].replace(/^(\s*).*$/, "$1").length;
        n[i] = n[i].replace(/^\s+/, "");
        var newstring = n[i].charAt(n[i]).toUpperCase() + n[i].slice(1);
        for (j = 0; j < spaceCount; j++)
            spaceput = spaceput + " ";
        vfinal = vfinal + spaceput + newstring + ".";
    }
    vfinal = vfinal.substring(0, vfinal.length - 1);
    return vfinal;
}
employee.getName = async (body) => {
    try {
        let input = ''
        input = body.val;
        input1 = input.toUpperCase();
        input2 = toTitleCase(input);
        input3 = toSentenceCase(input);
        let getName = await employee.find({
            "$or": [{
                    name: {
                        $regex: input + "(.*)"
                    }
                },
                {
                    name: {
                        $regex: input1 + "(.*)"
                    }
                },
                {
                    name: {
                        $regex: input2 + "(.*)"
                    }
                },
                {
                    name: {
                        $regex: input3 + "(.*)"
                    }
                }
            ]
        }, {
            name: 1,
            _id: 0
        })
        if (getName) {
            return getName;
        } else {
            return "Not found";
        }
    } catch (error) {
        return error.message;
    }
}

module.exports = employee