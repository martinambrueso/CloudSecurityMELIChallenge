const connection = require('../db/db')
const util = require('util');
const query = util.promisify(connection.query).bind(connection);
const ipcollector = require('../complements/chargeIPCollector')

function formatCollection(list) {
    var lista = []
    list.forEach(element => {
        lista.push(element.ip)
    });
    return lista
}

exports.getAllIPCollector = async (req, res) => {
    connection.query("SELECT * FROM blacklist", (err, rows) => {
        if (err) res.status(500).send({ message: "Internal error" }); // ES CONVENIENTE HACE UN HANDLER DE ERRORES INTERNOS
        res.status(200).send(JSON.stringify(rows)) // SE RETORNA COMO CADENA SIN FORMATO JSON PORQUE ES MAS LIGERO, LUEGO EN CLIENTE SE PUEDE PARSEAR
    });
}

exports.getWithoutWhiteList = async (req, res) => {
    const blacklist = formatCollection(Object.values(JSON.parse(JSON.stringify(await query('SELECT * FROM blacklist')))))
    const whitelist = formatCollection(Object.values(JSON.parse(JSON.stringify(await query('SELECT * FROM whitelist')))))
    var purge = blacklist.filter((value) => !whitelist.includes(value))
    res.status(200).send(JSON.stringify(purge)) // SE RETORNA COMO CADENA SIN FORMATO JSON PORQUE ES MAS LIGERO, LUEGO EN CLIENTE SE PUEDE PARSEAR
}

exports.delete = (req, res) => {
    if(req.query.ip) {
        connection.query("DELETE FROM whitelist WHERE ip = ?", req.query.ip, (err, rows) => {
            if (err) res.status(500).send({ message: "Internal error" }); // ES CONVENIENTE HACE UN HANDLER DE ERRORES INTERNOS
            res.status(200).send({ message: "Ip deleted" });
        });
    } else {
        res.status(400).send({message: 'One or more params are missing'});
    }
}

exports.create = (req, res) => {
    if(req.body.ip){
        connection.query("INSERT INTO whitelist (ip) VALUES (?) ", req.body.ip, (err, rows) => {
            if (err) res.status(500).send({ message: "Internal error" }); // ES CONVENIENTE HACE UN HANDLER DE ERRORES INTERNOS
            res.status(200).send({ message: "Ip added" });
        });
    } else {
        res.status(400).send({message: 'One or more params are missing'});
    }
}

exports.replicate = async (req, res) => {
    var dataSources = req.body.ds;

    if(dataSources) {
        var resultSet = await ipcollector.collectData(dataSources)
        if(resultSet.length !== 0) {
            ipcollector.replicateDatasources(resultSet)
            res.status(200).send({message: 'Replicated ok'});
        } else {
            res.status(404).send({message: 'No data collected'});
        }
    } else {
        res.status(400).send({message: 'One or more params are missing'});
    }
}