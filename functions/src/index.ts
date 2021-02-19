//import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require("express");
const {ApolloServer, gql} = require("apollo-server-express")

const serviceAccount = require('../alimentation-851c0-firebase-adminsdk-ghv68-74b1927583.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://alimentation-851c0-default-rtdb.firebaseio.com"

})

const db = admin.firestore();

const typeDefs = gql`
    type User {
        addresses: [String],
        username: String,
        zip: Int
    }

    type Query {
        users: [User]
        myUser(id: String!): User
    }
`

const resolvers = {
    Query: {
        users: () => {
            return admin.firestore().collection('users').get().then((snap) => {
                const tempDoc = [];
                snap.docs.map((doc) => {
                    tempDoc.push(doc.data())
                })
                console.log(tempDoc)
                return tempDoc;
            })
        },
        myUser: (parent, {id}) => {
            
            return admin.firestore().collection('users').doc(id).get().then(doc => {

                    return doc.data()
                
            })
        }
    }
}

const app = express()
const server = new ApolloServer({typeDefs, resolvers})
server.applyMiddleware({app, path: "/", cors: true})

exports.graphql = functions.https.onRequest(app)