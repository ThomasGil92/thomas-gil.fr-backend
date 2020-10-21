const { gql } = require('apollo-server-express')

module.exports = gql`

type Site{
    _id:ID!
    title:String!
    description:String!
    url:String!
    github:String
    postedBy:User!
    image:Image
}

type Query{
    users:[User!]!
    allSites:[Site!]!
    singleSite(siteId:ID!):Site!
}

# input type
input SiteInput{
    title:String!
    description:String!
    image:ImageInput
    url:String!
    github:String
}

input SiteUpdateInput {
    _id:String!
    title:String!
    description:String!
    url:String!
    github:String
    image:ImageInput
}

type Mutation{
    siteCreate(input:SiteInput!):Site!
    siteUpdate(input:SiteUpdateInput!):Site!
    siteDelete(siteId:String!):Site!
}
`
