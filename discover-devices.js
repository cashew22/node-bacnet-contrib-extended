module.exports = function (RED) {
    "use strict";

    const Bacnet = require('node-bacnet');

    function DiscoverDevices(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        const node = this;

        node.status({fill: 'green', shape: 'dot', text: 'active'});

        node.on('input', function (msg) {
            var bacnetClient = new Bacnet({
                port: msg.communicationPort,
                interface: msg.interface,
                broadcastAddress: msg.broadcastAddress,
                apduTimeout: msg.apduTimeout,
                reuseAddr: msg.reuseAddr
            });

            const knownDevices = [];

            // emmitted when Bacnet server listens for incoming UDP packages
            bacnetClient.on('listening', function () {
                console.log('discovering devices for 2 seconds ...');
                // discover devices once we are listening
                bacnetClient.whoIs();

                setTimeout(function () {

                    try {
                        bacnetClient.close();
                        console.log('closed transport ' + Date.now());
                    } catch (e) {
                        console.log(e);
                    }

                    msg.payload = knownDevices;
                    node.send(msg);
                }, msg.transportClosedDuration);
            });

            bacnetClient.on('iAm', function (device) {
                console.log("device0 ---> ", device);
                console.log("device0-0 ---> ", "found device with Bacnet id " + device.payload.deviceId + " on address " + device.header.sender.address);

                try {
                    console.log("device ---> " + device);

                    knownDevices.push({
                        deviceId: device.payload.deviceId,
                        Address: device.header.sender.address
                    });
                } catch (e) {
                    console.log("exception -> ", e);
                }
            });
        });
    }
    RED.nodes.registerType("discover-devices", DiscoverDevices);
};
