const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const app = express()


var serviceAccount = require("./configs/volunteer-network-8af21-firebase-adminsdk-6omh5-f1a7a9a6c8.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://volunteer-network-8af21.firebaseio.com"
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zce5.mongodb.net/${process.DB_NAME}?retryWrites=true&w=majority`;
app.use(bodyParser.json())
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("volunteerNetwork").collection("volunteerTasks");
    const registerCollection = client.db("volunteerNetwork").collection("register");

    app.post('/addRegister', (req, res) => {
        const registers = req.body;
        console.log(registers);
        registerCollection.insertOne(registers)
            .then(result => {
                // console.log(result.insertedCount);        
                res.send(result.insertedCount > 0)
            })
    })

    //addevent
    app.post('/addNewEvents', (req, res) => {
        const registers = req.body;
        console.log(registers);
        collection.insertOne(registers)
            .then(result => {
                // console.log(result.insertedCount);        
                res.send(result.insertedCount > 0)
            })
    })

    //endevent

    app.post('/addProduct', (req, res) => {
        const products = req.body;
        collection.insertMany(products)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount)
            })
    })

    app.get('/products', (req, res) => {
        collection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    //volunteer list
    app.get('/volunteerList', (req, res) => {
        registerCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    //jwt
    app.get('/registeredEvent', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log(idToken)
            admin.auth().verifyIdToken(idToken)
                .then(function (decodedToken) {
                    let tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    console.log(tokenEmail, queryEmail);
                    if (tokenEmail == req.query.email) {
                        registerCollection.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.send(documents)
                            })

                    }
                }).catch(function (error) {

                })
        }

    })

    //Delete button

    app.delete('/delete/:id', (req, res) => {
        console.log(req.params.id);
        registerCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                console.log(result);
            })

    })


});


    app.get('/', (req, res) => {
        res.send('Hello World!')
})

    app.listen(5000, () => {
        console.log("Listening is working port 5000");
})