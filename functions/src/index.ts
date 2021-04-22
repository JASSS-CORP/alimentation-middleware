/* eslint-disable */

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript


const functions = require('firebase-functions');
const admin = require("firebase-admin");
const express = require("express"); ``

admin.initializeApp()
/*
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://alimentation-851c0-default-rtdb.firebaseio.com"
*/
const db = admin.firestore();

const addUserDoc = (user) => {
    return db.collection("users").doc(user.uid).set({
        bankaccount: null,
        credit_card: { nameOnCard: "", number: "", expiry: null, cvc: "" },
        email: user.email,
        main_address: {
            address1: null,
            address2: null,
            city: null,
            name: null,
            state: null,
            zip: null
        },
        name: {
            first: user.displayName,
            middle: null,
            last: null
        },
        other_addresses: [],
        password: null,
        phone_number: null,
        profile_pic_url: user.photoURL
    })
}

const addCustomer = async (user) => {
    await db.collection("users").doc(user.uid).collection("customer").doc().set({
        favoite_items: [],
        favorite_stores: [],
        previous_bought_stores: []
    })

    return db.collection("users").doc(user.uid).collection("customer").get().then(snapshot => {
        snapshot.forEach(customerDoc => {
            customerDoc.ref.collection("shopping_cart").doc().set({
                items: [],
                total_cost: 0
            })
        })
    })
}

const createPublicProfile = async (user) => {
    return db.collection("users").doc(user.uid).collection("public_profile").doc().set({
        average_rating: "5",
        name: {
            fname: null,
            lname: null,
            mname: null
        },
        phone_number: null,
        profile_pic_url: user.photoURL
    })
}


exports.processSignUp = functions.auth.user().onCreate(async user => {
    console.log(user)
    await addUserDoc(user);
    await addCustomer(user);
    await createPublicProfile(user);

})

const SALES_TAX = 0.09;
const DELIVERY_FEE = 10;

exports.shopCartCalc =
    functions.firestore.document('users/{userId}/customer/{customerId}/shopping_cart/{shoppingCartId}')
        .onWrite((change, context) => {
            let totalCost = 0;
            change.after.data().items.forEach(item => {
                totalCost += item.price * parseInt(item.quantity.amount)
            })
            let tax = totalCost * SALES_TAX;
            totalCost = tax + totalCost + DELIVERY_FEE;
            change.after.ref.set({
                delivery: DELIVERY_FEE,
                tax: tax,
                total_cost: totalCost
            }, { merge: true })

        })

        /*
const getItems = async (user) => {
    const items = db.collection("users").doc(user).get().
}

exports.createTransaction = functions.https.onCall((data, context) => {
    console.log("data", data)
    const customer_id = data.customer_id;
    const customerRef = db.collection("users").doc(customer_id).get()
    const shopping_cart = customerRef.collection("shopping_cart").onSnapshot(snapshot => {
        snapshot.forEach((doc) => {
            
        })
    })
    const payment_time = new Date().toISOString();
    const customer_name = {
        first: customerRef.data().name.first,
        middle: customerRef.data().name.middle,
        last: customerRef.data().name.last
    }
    const items = getItems(data.customer_id)
    // const total_cost = customerRef.collection("shopping_cart").get().data().total_cost
    const transaction_state = "Paid";
    const delivery_address = {
        address1: customerRef.data().main_address.address1,
        address2: customerRef.data().main_address.address2,
        city: customerRef.data().main_address.city,
        state: customerRef.data().main_address.state,
        zip: customerRef.data().main_address.zip
    };
    
})
*/