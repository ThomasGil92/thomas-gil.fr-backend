const { authCheck } = require('../helpers/auth')
const Site = require('../models/site')
const User = require('../models/user')
//Subscription

// queries


// mutation
const siteCreate = async (parents, args, { req }) => {
    const currentUser = await authCheck(req)

    const currentUserFromDb = await User.findOne({
        email: currentUser.email
    })
console.log(args.input)
    let newSite = await new Site({
        ...args.input,
        postedBy: currentUserFromDb._id
    })
        .save()
        .then(site => site.populate('postedBy', '_id name email')
            .execPopulate()
        )
    console.log(currentUserFromDb)
    console.log(newSite)
    return newSite
}

const siteDelete = async (parent, args, { req }) => {
    const currentUser = await authCheck(req);
    const currentUserFromDb = await User.findOne({
        email: currentUser.email
    })
        .exec();

    const siteToDelete = await Site.findById({
        _id: args.siteId
    })
        .exec();

    if (currentUserFromDb._id.toString() !== siteToDelete.postedBy._id.toString()) {
        throw new Error('Unauthorized action');
    }

    let deletedSite = await Site.findByIdAndDelete({
        _id: args.siteId
    })
        .exec()
        .then((site) => site.populate('postedBy', '_id name email').execPopulate());



    return deletedSite;
}

const allSites = async (parent, args) => {
    return await Site.find({})
        .sort({ createdAt: -1 })
        .populate('postedBy', '_id name email')
        .exec()
}

const singleSite = async (parent, args) => {
    return await Site.findById({ _id: args.siteId })
        .exec()
}
/* const postedBy = async (parent, args) => {
    console.log(args)
    return await User.findById({ _id: args._id })
        .exec()
} */

const siteUpdate = async (parent, args, { req }) => {
    const currentUser = await authCheck(req)
    console.log(args.input)
    /* if (args.input.title.trim() === "" || args.input.description.trim()) {
        throw new Error('All fields must be provided')
    } */

    const currentUserFromDb = await User.findOne({
        email: currentUser.email
    })
        .exec()

    const siteToUpdate = await Site.findById({
        _id: args.input._id
    })
        .exec()

    /* if (currentUserFromDb._id.toString() !== siteToUpdate.postedBy._id.toString()) {
        throw new Error('Unauthorized action')
    } */

    let updatedSite = await Site.findByIdAndUpdate(
        args.input._id,
        {
            ...args.input,
            missions: Array.isArray(args.input.missions) ? args.input.missions : args.input.missions.split(',').map(mission => mission.trim()),
            technos: Array.isArray(args.input.technos) ? args.input.technos : args.input.technos[0].split(',').map(techno => techno.trim())
        },

        { new: true })
        .exec()
        .then(site => site.populate('postedBy', '_id name email')
            .execPopulate())


    /* pubsub.publish(POST_UPDATED, {
        postUpdated: updatedPost
    }) */
    return updatedSite
}

module.exports = {
    Query: {
        allSites,
        singleSite
    },
    Mutation: {
        siteCreate,
        siteUpdate,
        siteDelete
    }
}
