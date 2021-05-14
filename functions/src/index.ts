/* eslint-disable */

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

export{};
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const fetch = require("node-fetch")


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
            street1: null,
            street2: null,
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


const addTransaction = async (cart, userId) => {

    await db.collection("users").doc(userId).get().then(async  docRef => {
        let name = docRef.data().name;
        let address = docRef.data().main_address;
        await db.collection("transactions").doc().set({
            customer_id: userId,
            customer_name: name,
            delivery_address: address,
            delivery_cost: DELIVERY_FEE,
            delivery_notes: "hello world",
            delivery_time: new Date(Date.now() + 1000 * 60 * 2 * 60).toString(), //two hours later
            driver_id: null,
            driver_name: null,
            items: cart.items,
            payment_method: "MasterCard",
            payment_time: new Date().toString(),
            total_cost: cart.total_cost,
            tax: cart.tax,
            transaction_state: "paid",
            rating: null
        })
    })


}

const getItems = async (userId) => {
    return db.collection("users").doc(userId).collection("customer").get().then(customerSnap => {
        customerSnap.forEach(async doc => {
            await doc.ref.collection("shopping_cart").get().then(shoppingSnap => {
                shoppingSnap.forEach(shopDoc => {
                    shopDoc.ref.get().then(async shopDocSnap => {
                        addTransaction(shopDocSnap.data(), userId);
                        await shopDocSnap.ref.set({
                            tax: 0,
                            delivery: DELIVERY_FEE,
                            total_cost: 0,
                            items:[]
                        })
                    })
                })
            })
        })
    })
}

exports.createTransaction = functions.https.onCall(async (data, context) => {
    console.log("data", data)
    const customer_id = data.customer_id;
    await getItems(customer_id)
    return "Done";
})

exports.getDistance = functions.https.onCall(async (data, context) => {
    console.log("data", data)
    const user_address = data.user_address;
    const store_address = data.store_address;
    let distRes = 
        await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${user_address}&destinations=${store_address}&key=${functions.config().geo.key}`)
    let distJSON = await distRes.json();
    if (distJSON.status === "OK")
    {
        return(distJSON.rows[0].elements[0].distance.text)
    }
    return null;
})