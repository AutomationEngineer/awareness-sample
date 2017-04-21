var a = require('awareness');
var fs = require("fs");

a.Neuron.setDB({host:'192.168.0.125'});

a.Neuron.projectPath = __dirname;

var users = JSON.parse(fs.readFileSync(a.Neuron.projectPath + '/users.json', "utf8"));


var node = new a.Neuron({
    name: "Узел редуцирования газа", children: {
        valve1: new a.Valve({name: "Кран1"}),
        csd: new a.CSD({name: "Сигнализация"})
    }
});


a.Neuron.afterInit = function() {
    var web = new a.Web({secure: false, port: 3000, grafana: 'http://192.168.0.125:3001', users: users}, node);
};
