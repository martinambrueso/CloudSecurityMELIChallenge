const jwt = require('jsonwebtoken');
const crypto = require('../complements/CryptoJS')
const connection = require('../db/db')
var sha1 = require('sha1');


//------------------------------------------- AUXILIARY FUNCTIONS -----------------------------------//

//Get user from database
function getUserFromDB (usr) {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM users WHERE user = ? ", 
            usr
            , (err, result) => {
                if (err) {
                    console.log("error: ", err) ;
                } else {
                    if (result[0]) {
                        resolve(result[0]);
                    } else {
                        resolve(false);
                    }
                }
        })
    })
}

//Verify if credentials match witch hash
function verifyCredentials (apiToken, user, pass, email) {
    return new Promise(async (resolve) => {
        const userResult = await getUserFromDB(user);
        if (userResult || userResult !== false) {
            if(crypto.compare(pass, userResult.pass) && crypto.compare(apiToken, userResult.apiToken) && email === userResult.email) {
                resolve(true);
            } else {
                resolve(false);
            }
        } else {
            resolve(false);
        }
    })
}

//------------------------------------------- END AUXILIARY FUNCTIONS -----------------------------------//

exports.login = async (req, res) => {
    const { user, pass, email } = req.body;
    const apiToken = req.query.apiToken;
    if(apiToken && user && pass && email) {
        if(await verifyCredentials(apiToken, user, pass, email)) {
            // my_secret_key tiene que estar resguardado en vault de credenciales o cuidado en variables de entorno con politicas de credenciales
            const token = jwt.sign({ user, email }, 'my_secret_key', { expiresIn: 120 });
            res.json({token, expire: '120'});
        } else {
            res.status(401).send({error: 'Credentials not valid'})
        }
    } else {
        res.status(400).send({message: 'One or more params are missing'});
    }
}

exports.signUp = (req, res) => {
    const { user, email, pass, admin } = req.body;
    const apiToken = sha1(user + Date() + email)
    if (user && email && pass && admin) {
        connection.query("INSERT INTO users (user, email, pass, apiToken, admin) VALUES (?, ?, ?, ?, ?) ", 
            [
                user, 
                email, 
                crypto.encryptWithAES(pass),
                crypto.encryptWithAES(apiToken),
                admin
            ]
            , (err, result) => {
                if (err) {
                    console.log("error: ", err);
                    res.status(500).send({message: 'An internal error ocurrered' }); // ES CONVENIENTE HACE UN HANDLER DE ERRORES INTERNOS
                    return;
                }
                console.log({ user: user, email: email, apiToken: apiToken });
                res.status(201).send({ user: user, email: email, apiToken: apiToken });
        })
    } else {
        res.status(400).send({message: 'One or more params are missing'});
    }    
}