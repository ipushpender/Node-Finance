let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let TopGrossingSchema = new Schema({
   time:{
        type:Date,
        // default:new Date,
        required:true
    },
    global_rank: {
        type: Number ,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    developer: {
        type: String,
        required: true
    },
    score: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    app_id: {
        type: String,
        required: true
    },
    url: {
        type: String,
        // required: true
    },
    category: {
        type: String,
        required: true
    },
    genre_rank: {
        type: Number ,
        // default:"1",
        required: true
    },
    editor_choice: {
        type: Boolean,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    install: {
        type: String,
        required: true
    },
    current_version: {
        type: String,
        required: true
    },
    updated: {
        type: String,
        required: true
    },
    developer_email: {
        type: String,
        // required: true
    },
    developer_url: {
        type: String,
        // required: true
    }},{ collection: 'TOP_GROSSING' }
);

module.exports = mongoose.model('TOP_GROSSING', TopGrossingSchema);