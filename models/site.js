const mongoose = require('mongoose')
const {ObjectId}=mongoose.Schema

const siteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        text: true
    },
    description: {
        type: String,
        required: true,
        text: true
    },
    github:{
        type:String,
        trim:true
    },
    url:{
        type:String,
        trim:true,
        default:"https://thomas-g.herokuapp.com"
    },
    missions:{
        type:Array
    },
    technos:{
        type:Array
    },
    postedBy:{
        type:ObjectId,
        ref:'User'
    },
    image:{
        url:{
            type:String,
            default:'https://via.placeholder.com/300?text=SiteImg'
        },
        public_id:{
            type:String,
            default:Date.now
        }
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Site', siteSchema)