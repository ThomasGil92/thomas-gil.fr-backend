const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        require: true,
        index: true,
        unique: true
    },
    role:{
        type:Number,
        default:0
    }
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)