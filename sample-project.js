var a = require('awareness');
var fs = require("fs");

a.Neuron.setDB({host:'192.168.0.139'});

a.Neuron.projectPath = __dirname;

var users = JSON.parse(fs.readFileSync(a.Neuron.projectPath + '/users.json', "utf8"));


var node = new a.Neuron({
    name: "Узел редуцирования газа", children: {
        valve1: new a.Valve({name: "Кран1"}),
        csd: new a.CSD({name: "Сигнализация"}),
        level: new a.Neuron({name: 'Уровень', value: 0, fixed: 2, rw: true, setValueHandler: a.Neuron.setValueFloatHandler}),
        flow: new a.Neuron({name: 'Расход', value: 0, rw: true, setValueHandler: a.Neuron.setValueFloatHandler}),
        pid: new a.Pid({name: "ПИД", pV: 'level', t: 100, n: 10, fixed: 2}),
        calls: new a.Neuron({name: 'Вызовы', value: 0}),
        writes: new a.Neuron({name: 'Записи', value: 0}),
        esp: new a.EspBridge({name: 'ESP'}),
    }
});


a.Neuron.afterInit = function() {
    var web = new a.Web({secure: false, port: 3000, grafana: 'http://192.168.0.139:3001', users: users}, node);

    setInterval(level, 50);
};





level.lastTime = Date.now();
level.lastSpeed = 0;
level.pendingD = 0;
level.level = 0;

function level(callers){
    var e = 0.001;
    var volume = 100;

    var now = Date.now();

    level.level += level.lastSpeed * (now - level.lastTime) / 1000;
    node.children.level.value = level.level; + (Math.random() - 0.5) / 50;
    level.pendingD = 0;


    level.lastTime = now;
    level.lastSpeed = (node.children.pid.value - node.children.flow.value) / volume;
    if(!level.lastSpeed) level.lastSpeed = 0;

}