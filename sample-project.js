var a = require('awareness');
var fs = require("fs");

a.Neuron.setDB({host:'192.168.0.139'});

a.Neuron.setMessaging(new a.Telegram({user:'user1', pass:'kjbkjb', to:'-1001105811074', service: 'awareness-telegramm-bot.herokuapp.com', proxy:{host: '192.168.0.54', port: 3128}}));

a.Neuron.projectPath = __dirname;

var users = JSON.parse(fs.readFileSync(a.Neuron.projectPath + '/users.json', "utf8"));

var sR1 = new a.TcpResource('192.168.0.200', 4001, a.reportError('serialResource1'));//ЩУН
var sMoMa1 = new a.SerialModbusMaster(sR1, {}, false);//ЩУН


var node = new a.Neuron({
    name: "Узел редуцирования газа", children: {
        valve1: new a.Valve({name: "Кран1"}),
        csd: new a.CSD({name: "Сигнализация"}),
        level: new a.Neuron({name: 'Уровень', value: 0, fixed: 2, rw: true, setValueHandler: a.Neuron.setValueFloatHandler, states:[
            {condition:function(val){return val > 60}, level: 2, text: "Предупредительный верхний уровень"},
            {condition:function(val){return val > 80}, level: 3, text: "Аварийный верхний уровень"},
        ]}),
        flow: new a.Neuron({name: 'Расход', value: 0, rw: true, setValueHandler: a.Neuron.setValueFloatHandler}),
        pid: new a.Pid({name: "ПИД", pV: 'level', t: 100, n: 10, fixed: 2}),
        calls: new a.Neuron({name: 'Вызовы', value: 0}),
        writes: new a.Neuron({name: 'Записи', value: 0}),
        esp: new a.EspBridge({name: 'ESP', ip: '192.168.0.133', outputs:[2,4]}),
        esp2: new a.EspBridge({name: 'ESP2', ip: '192.168.0.137', outputs:[2], inputs:[4,5]}),
        rr: new a.Neuron({name: 'rr', rw:true}),
        pC: new a.PumpsControl({name: 'ЩУН', master: sMoMa1, address: 16, nP: 3}),
        do: new a.Mu110({name: "A4 модуль дискретного вывода", master: sMoMa1, address: 64, channels: 16}),
    }
});


a.Neuron.afterInit = function() {
    var web = new a.Web({secure: false, port: 3000, grafana: 'http://192.168.0.139:3001', users: users}, node);

    setInterval(level, 10);

    sR1.startQueue();

};

node.children.esp2.children.i04.onChange = (caller)=>{
    if(caller.value === 1 && caller.quality === 'good') node.children.esp.children.o04.value = 1;
};

node.children.esp2.children.i05.onChange = (caller)=>{
    if(caller.value === 1 && caller.quality === 'good') node.children.esp.children.o04.value = 0;
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