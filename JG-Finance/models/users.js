const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let bcrypt = require('bcrypt');
const UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
let user = mongoose.model('User', UserSchema);

user.login = async (data) => {
    try {
        let userinfo = await user.findOne({
            'username': data.username
        })
        if (!userinfo.username) {
            return "User doesn't Exists"
        } else if (userinfo.username) {
            let pass = await bcrypt.compare(data.password, userinfo.password)
            if (pass) {
                return userinfo
            } else {
                return "Enter Valid Password";
            }
        }
    } catch (err) {
        return err.message
    }
}
user.reset_password = async (body) => {
    try {
        let userinfo = await user.findOne({
            'username': body.username
        });
        if (userinfo) {
            let pass = await bcrypt.compare(body.current_password, userinfo.password);
            if (pass) {
                let password = await bcrypt.hash(body.password, 10);
                let reset_password = await user.findOneAndUpdate({
                    username: body.username
                }, {
                    $set: {
                        password: password
                    }
                }, {
                    new: true
                });
                if (!reset_password.username) {
                    return "User doesn't Exists"
                } else {
                    return reset_password
                }
            } else {
                return "Current Password Not Match"
            }
        } else {
            return "user not found"
        }

    } catch (err) {
        return err.message
    }
}
module.exports = user;