const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const VendorSchema = new Schema({
    vendorid: {
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
let vendor = mongoose.model('Vendor', VendorSchema);

vendor.save = async (data) => {
    try {
        let checkname = await vendor.find({
            name: data.name
        })
        if (checkname && checkname.length > 0) {
            return "Name Already exist!"
        }
        let vendordetail = await vendor.create(data)
        if (!vendordetail) {
            return "Data not Saved"
        } else {
            return vendordetail;
        }
    } catch (error) {
        console.log("inside model", error.message)
        return error.message
    }
}

vendor.getAllVendors = async (data) => {
    try {
        let allVendordetail = await vendor.find();
        if (!allVendordetail) {
            return "No data recieved"
        } else {
            return allVendordetail;
        }
    } catch (error) {
        console.log("inside model", error.message)
        return error.message
    }
}


vendor.getUserById = async (id) => {
    try {
        let user = await vendor.findOne({
            vendorid: id
        });
        if (!user) {
            return "Vendor Not Found"
        } else {
            return user;
        }
    } catch (error) {
        console.log(error.message, "hgkkjj");
        return error.message
    }
}
vendor.deleteVendor = async (id) => {
    try {
        let deletedVendor = await vendor.deleteOne({
            vendorid: id
        });
        if (!deletedVendor) {
            return "No Vendor deleted"
        } else {
            return deletedVendor;
        }
    } catch (error) {
        console.log("inside model", error.message)
        return error.message
    }
}

vendor.updateVendor = async (id, body) => {
    try {
        let updates = {
            $set: {
                vendorid: body.vendorid,
                name: body.name,
                account_name: body.account_name,
                bank: body.bank,
                location: body.location,
                account_no: body.account_no,
                ifsc: body.ifsc
            }
        }
        let updatedVendor = await vendor.findOneAndUpdate({
            vendorid: id
        }, updates, {
            new: true
        });
        if (!updatedVendor) {
            return "No Vendor updated"
        } else {
            return updatedVendor;
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
vendor.getName = async (body) => {
    try {
        let input = ''
        input = body.val;
        input1 = input.toUpperCase();
        input2 = toTitleCase(input);
        input3 = toSentenceCase(input);
        let getName = await vendor.find({
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
vendor.getUserByName = async (name) => {
    try {
        let getUser = await vendor.findOne({
            name: name
        })
        if (!getUser) {
            return "vendor Not Found"
        } else {
            return getUser;
        }
    } catch (error) {
        console.log(error.message, "hgkkjj");
        return error.message
    }
}
module.exports = vendor