var winston = require('winston');
var os = require("os");

module.exports = function(app, options) {

	var options = options || {};
	var defaultTransport = {type: 'Console'};
	var defaultName = 'log';
	var name = options.name || defaultName;

	delete options.name;

	// Parses transports JSON array
	// Returns array of winston transport objects
	function parseTransports(t) {
		var transports = t || [defaultTransport];

		if (transports.constructor.name !== 'Array') {throw new Error('transports should be Array');}
		if (transports.length === 0) {throw new Error('No transport was specified');}

		return transports.map(function(transport) {
			if (transport.constructor.name === 'Object') {
				// Expects transport is POJO descriptor from componentes JSON file
				var transportType = transport.type;

				if (!transportType) {
					throw new Error('type property is not specified for transport descriptor: ' +
						JSON.stringify(transport));
				}

				var winstonTtransportType = winston.transports[transportType];

				if (!winstonTtransportType) {
					throw new Error('unsupported transport type specified: ' + transportType);
				}
				if (transport.type = "File" && process.env.pm_id && transport.filename) {
					var newFilename = transport.filename.split('.');					
					transport.filename = newFilename[0]+"_N"+process.env.pm_id+"_"+os.hostname()+"."+newFilename[1];
				}
				delete transport.type;
				return new winston.transports[transportType](transport);
			} else {
				// Expects transport is already created,
				// no parsing needed
				return transport;
			}
		});
	}
	options.transports = parseTransports(options.transports);
	app[name] = new winston.Logger(options);

	options.transports = parseTransports(options.publicTransports);
	app[name+"Public"] = new winston.Logger(options);
};

