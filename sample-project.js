require('awareness');

Neuron.setDB({host:'192.168.0.125'});

var node = new Neuron({
    name: "Узел редуцирования газа", children: {
        valve1: new Valve({name: "Кран1"}),
        csd: new CSD({name: "Сигнализация"})
    }
});


Neuron.afterInit = function(){
    var web = new Web({secure: false, port: 3000, grafana:'http://192.168.0.125:3001'}, node);
};
