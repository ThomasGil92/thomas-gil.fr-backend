const { gql } = require('apollo-server-express')
const { authCheck } = require('../helpers/auth')
const User = require('../models/user')
const shortid = require('shortid')

const userCreate = async (parent, args, { req }) => {
    const currentUser = await authCheck(req)
    const user = await User.findOne({ email: currentUser.email })
    return user ? user : new User({
        email: currentUser.email,
        name: shortid.generate()
    })
        .save()
}

const profile = async (parent, args, { req }) => {
    const currentUser = await authCheck(req)
    return await User.findOne({ email: currentUser.email })
        .exec()
}

module.exports = {
    Query: {
        profile
    },
    Mutation: {
        userCreate
    }
}
