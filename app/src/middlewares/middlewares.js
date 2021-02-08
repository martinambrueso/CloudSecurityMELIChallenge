const jwt = require('jsonwebtoken');
const connection = require('../db/db')
const crypto = require('../complements/CryptoJS')
const jwt_decode = require('jwt-decode');

exports.isAuthenticated = (req, res, next) => {
    const bearerHeader = req.headers["authorization"];
	console.log(bearerHeader)
	
	if(typeof bearerHeader !== 'undefined') {
		const bearer = bearerHeader.split(" ");
		const bearerToken = bearer[1];
		req.token = bearerToken;
		jwt.verify(req.token, 'my_secret_key', (err, data) => {
			if(err) {
				res.status(401).send({ message: "Token not match" });
			} else {
				next();
			}
		});
	} else {
		res.status(403).send({ error: "Token is required" });
	}
}

exports.isAuthorized = (req, res, next) => {
	const { user, apiToken } = req.query;
    if(user && apiToken) {
		connection.query("SELECT * FROM users WHERE user = ? ", 
			user
			, (err, result) => {
				if (err) {
					console.log("error: ", err) ;
					res.status(500).send({ message: "Internal error" });
				} else {
					if (result[0] && crypto.compare(apiToken, result[0].apiToken) && jwt_decode(req.token).user === user && result[0].admin === 1) {
						next()
					} else {
						res.status(401).send({ message: "Unauthorized" });
					}
				}
		})
	} else {
		res.status(400).send({ message: "Check parameters" });
	}
}