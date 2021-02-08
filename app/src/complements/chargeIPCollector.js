const connection = require('../db/db')
const fetch = require('node-fetch');

exports.collectData = async (ds) => {
    var result = []
    for(url of ds) {
        var reultSet = (await fetch(url)
        .then(res => res.text())
        .then(body => {return body.split('\n')})
        .catch(e => {console.log('La siguiente fuente de datos fallo: ', url)}))
        result.push(reultSet)
    }

    var joinedList = result.join(',').split(',')
    var purgedList = joinedList.filter((value, index) => joinedList.indexOf(value) === index && value !== '')

    return purgedList;
}

exports.replicateDatasources = (list) => {
    connection.query('TRUNCATE TABLE blacklist', function(err) {});
    list.forEach(element => {
        var sql = "INSERT INTO blacklist (ip) VALUES (?)";
        connection.query(sql, element, function(err) {
            if (err) throw err;
        });
    });
}