const { gql } = require('apollo-server-express')

module.exports = gql`
scalar DateTime


type User{
    _id:ID!
    name:String
    email:String
    role:Int
    createdAt:DateTime
    updatedAt:DateTime
}

type Image {
    url:String
    public_id:String
}

type UserCreateResponse{
    name:String!
    email:String!
}

input ImageInput {
    url:String
    public_id:String
}

type Query{
    profile:User!
}

type Mutation{
    userCreate:UserCreateResponse!
}
`