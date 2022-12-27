module.exports = function (RED) {

    "use strict";

    const Bacnet = require('node-bacnet');

    function ReadObjectProperties(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        this.name = config.name;

        node.status({fill: 'green', shape: 'dot', text: 'active'});

        node.on('input', function (msg) {
            var randNum = Math.floor(Math.random() * 7100);
            msg.communicationPort = 47808 + randNum;

            if (msg.interface === "" || msg.interface === null) {
                msg.interface = "0.0.0.0";
            }

            if (msg.broadcastAddress === "" || msg.broadcastAddress === null) {
                msg.broadcastAddress = "255.255.255.255";
            }

            if (msg.apduTimeout === "" || msg.apduTimeout === null) {
                msg.apduTimeout = 7000;
            }

            if (msg.reuseAddr === "" || msg.reuseAddr === null) {
                msg.reuseAddr = true;
            }

            if (msg.requestArray === "" || msg.requestArray === null) {
                node.send("requestArray is invalid");
                return;
            }

            if (msg.address === "" || msg.address === null) {
                msg.address = "address is invalid";
                node.send(msg);
                return;
            }

            var bacnetClient = new Bacnet({
                port: msg.communicationPort,
                interface: msg.interface,
                broadcastAddress: msg.broadcastAddress,
                apduTimeout: msg.apduTimeout,
                reuseAddr: msg.reuseAddr
            });

            try {
                bacnetClient.readPropertyMultiple(msg.address, msg.requestArray, function (err, value) {
                    if (err !== null) {
                        msg.payload = err;
                    } else {
                        msg.payload = value;
                    }
                    node.send(msg);
                });
            } catch (e) {
                msg.payload = e;
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("read-object-properties", ReadObjectProperties);
};
