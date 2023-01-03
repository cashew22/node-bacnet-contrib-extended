module.exports = function (RED) {
    "use strict";

    function ReadObjectsListWithinDevice(config) {
        RED.nodes.createNode(this, config);

        const Bacnet = require('node-bacnet');
        const node = this;
        this.name = config.name;

        node.on('input', function (msg) {
            node.status({fill: 'green', shape: 'dot', text: 'Sending...'});

            var bacnetClient = new Bacnet({
                port: msg.communicationPort,
                interface: msg.interface,
                broadcastAddress: msg.broadcastAddress,
                apduTimeout: msg.apduTimeout,
                reuseAddr: msg.reuseAddr
            });

            const requestArray = [
                {objectId: {type: 8, instance: msg.deviceId}, properties: [{id: 76}]}
            ];

            try {
                bacnetClient.readPropertyMultiple(msg.address, requestArray, function (err, value) {
                    if (err !== null) {
                        node.status({fill: 'red', shape: 'dot', text: 'error'});
                        msg.payload = err;
                    } else {
                        node.status({fill: 'green', shape: 'dot', text: 'Success'});
                        msg.payload = value.values[0].values[0].value;
                    }
                    bacnetClient.close();
                    node.send(msg);
                });
            } catch (e) {
                console.log(e);
            }
        });
    }
    RED.nodes.registerType("read-objects-list-within-device", ReadObjectsListWithinDevice);
};
