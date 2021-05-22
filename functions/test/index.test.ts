import "jest"
import * as admin from 'firebase-admin'
// import { firebaseConfig } from "firebase-functions";
/* eslint-disable no-unused-vars */
const testEnv = require('firebase-functions-test')({
    databaseURL: 'https://alimentation-851c0-default-rtdb.firebaseio.com',
    storageBucket: 'alimentation-851c0.appspot.com',
    projectId: 'alimentation-851c0',
}, './alimentation.json');

// const functions = require('firebase-functions');
// const geo_key = functions.config().geo.key;

const myFunction = require('../src/index.ts');

// const wrapped2 = test.wrap(myFunction.createTransaction)
// const wrapped3 = test.wrap(myFunction.getDistance)

// const snap = test.firestore.makeDocumentSnapshot({},)
// const snap = test.firestore.exampleDocumentSnapshot();
// const wrapped1 = test.wrap(myFunction.processSignUp)
// wrapped1(snap)

// describe('shopCartCalc', () => {
//     // Make snapshot for state of database beforehand
//     const address = "/users/XF5Lk5XGI8gpnR2hEKgOBvdo5TE2/customer/779w0BZTO7Afxulqq8vF/shopping_cart/6FBwTCmxF71niz2zHZJL"
//     const input = { 'tax': 1.989, 'items': [{ 'image_url': '111JB5KRUHIS_p.jpeg', 'store_id': 'yoIN3OVFUye8pCwBrjxA', 'name': 'Quaker Life Multigrain Breakfast Cereal, Cinnamon, 24.8 oz Box', 'item_id': '111JB5KRUHIS', 'quantity': { 'amount': 1 }, 'notes': '', 'price': 3.9 }, { 'image_url': '14FPWIILF9ZX_p.jpeg', 'item_id': '14FPWIILF9ZX', 'name': 'Doritos Nacho Cheese Flavored Tortilla Chips, Party Size, 14.5 oz', 'quantity': { 'amount': 1 }, 'notes': '', 'store_id': 'yoIN3OVFUye8pCwBrjxA', 'price': 3.98 }, { 'notes': '', 'price': 14.22, 'item_id': '14Z7DWKABFXQ', 'quantity': { 'amount': 1 }, 'name': 'KIND Bars Dark Chocolate Nuts & Sea Salt Gluten Free Snack Bars, 1.4 Oz, 12 Count', 'store_id': '6ZDTIAkz1RA97GGoSw1f', 'image_url': '14Z7DWKABFXQ_p.jpeg' }], 'total_cost': 0, 'delivery': 10 }
//     const snap = test.firestore.makeDocumentSnapshot(input, address);
//     beforeAll(() => {
//         const wrapped = test.wrap(myFunction.shopCartCalc)
//     })
//     // it('price is correct', () => {
//     //     return wrapped(snap).then(() => {
//     //         return admin.database().ref(address).once('value').then((createdSnap) => {
//     //             expect(createdSnap.val()).toBe(34.089)
//     //         })
//     //     })
//     // })


// })


// test.cleanup();


describe("onCreateUser",  () => {
    let uid;
    let authWrap;
    // const path = "users/123456"

    beforeAll(() => {
        authWrap = testEnv.wrap(myFunction.processSignUp)
    })

    afterAll(() => {
        admin.auth().deleteUser(uid);
    })

    it("creates user document when user is created", async () => {
        const authSnap = await admin.auth().createUser({ email: "bruhbruh1234567@test.com", password: "babababa" }).then(userRecord => {
            uid = userRecord.uid
        });
        // const authSnap = await testEnv.firestore.makeDocumentSnapshot({ email: "bruhbruh@test.com", password: "babababa" }, path)
        authWrap(authSnap);

        const after = await admin.firestore().doc(`users/${uid}`).get();
        // const after = await admin.firestore().doc(path).get();
        expect(after.exists).toBe(true);
    })


})