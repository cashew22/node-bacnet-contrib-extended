module.exports = function (RED) {
    "use strict";

    function ReadObjectProperties(config) {
        RED.nodes.createNode(this, config);

        const Bacnet = require('node-bacnet');
        const node = this;
        this.name = config.name;

        node.on('input', function (msg) {
            node.status({fill: 'green', shape: 'dot', text: 'Sending...'});

            var bacnetClient = new Bacnet({
                port: 47808 + Math.floor(Math.random() * 7100),
                interface: msg.interface,
                broadcastAddress: msg.broadcastAddress,
                apduTimeout: msg.apduTimeout,
                reuseAddr: msg.reuseAddr
            });

            bacnetClient.readPropertyMultiple(msg.address, msg.requestArray, function (err, value) {
                if (err !== null) {
                    node.status({fill: 'red', shape: 'dot', text: 'error'});
                    msg.payload = err;
                } else {
                    node.status({fill: 'green', shape: 'dot', text: 'Success'});
                    msg.payload = value;
                }
                node.send(msg);
            });
        });
    }
    RED.nodes.registerType("read-object-properties", ReadObjectProperties);
};
