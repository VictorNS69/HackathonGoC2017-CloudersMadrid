var mainCanvas, mainCtx, raf, shapes, settings, cursors, localCanvas, localCtx;

function Shape (params) {
	this.pos = [0, 0];
	this.points = params.points;
	this.type = params.type;
	this.id = params.id_shape;
	this.angle = params.angle || 0;
	this.color = settings.color;
	this.size = [1, 1];
	if (this.type == "circle") {
		this.radio = params.radio;
	}
}

$(document).ready(function () {
	mainCanvas = document.getElementById("main-canvas");
	mainCanvas.width = $(mainCanvas).innerWidth();
	mainCanvas.height = $(mainCanvas).innerHeight();
	mainCtx = mainCanvas.getContext("2d");
	localCanvas = document.createElement("canvas");
	localCanvas.width = mainCanvas.width;
	localCanvas.height = mainCanvas.height;
	//$(".container").append($(localCanvas));
	localCtx = localCanvas.getContext("2d");
	init();
});

// Create a client instance
client = new Paho.MQTT.Client("o0w5l9.messaging.internetofthings.ibmcloud.com", 1883, "a:o0w5l9:display");

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
var options = {
	userName: 'a:o0w5l9:voilftw4gg',
	password: '0gycFD*5r?q40(@A(x',
	timeout: 3,
	//Gets Called if the connection has sucessfully been established
	onSuccess: function () {
		alert("Connected");    	 
	},
	//Gets Called if the connection could not be established
	onFailure: function (message) {
		alert("Connection failed: " + message.errorMessage);
	}
};
client.connect(options);


// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  client.subscribe("iot-2/evt/accion/fmt/json");
  //message = new Paho.MQTT.Message("Hello");
  //message.destinationName = "World";
  //client.send(message);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);
}

// function requestFromServer() {
// 	$.ajax({
// 		url: "https://url.com",
// 		//accepts: "application/json",
// 		dataType: 'json',
// 		contentType: 'text/json',
// 		data: {},
// 		success: function (data, status, jqxhr) {

// 		},
// 		error: function (jqxhr, status, error) {

// 		},
// 	});
// }

function init () {
	shapes = {};
	settings = {
		color: "#000000",
		size: "3",
	}
	requestAnimationFrame(bucle);
}

function bucle () {
	// Petición
	//var json = getJson();
	var json = {
		cursors: [{x: 0.4, y: 0.4, state: 0}, {x: 0.5, y: 0.7, state: 0}],
		actions: [{
			action: "graphic",
			type: "rect",
			id_shape: 1,
			points: [[0.2, 0.1], [0.5, 0.3]],
		}, {
			action: "graphic",
			type: "circle",
			id_shape: 2,
			points: [[0.2, 0.1], [0.5, 0.3]],
			radio: 0.2,
		}, {
			action: "graphic",
			type: "free",
			id_shape: 3,
			points: [[0.2, 0.1], [0.5, 0.3], [0.5, 0.4], [0.7, 0.2]],
		}],
	};
	cursors = json.cursors;
	// Procesado
	for (var p in json.actions) {
		recibirAccion(json.actions[p]);
	}
	// Pinto
	pintar(mainCanvas, mainCtx);

	// Siguiente
	return;
	requestAnimationFrame(bucle);
}

function recibirAccion (acc) {
	switch(acc.action) {
		case "graphic":
			var shape;
			// if (!(shape.id in shapes)) { // Nueva forma
			shape = new Shape(acc);
			shapes[acc.id_shape] = shape;
			// }
			switch(acc.type) {
				case "free":

					break;
				case "rect":

					break;
				case "line":

					break;
				case "circle":

					break;
				default:
					console.error("Acción graphic, type desconocido: ", acc.type);
					return;
			}
			break;
		case "set":
			settings[acc.type] = acc.value;
			break;
		case "change":
			var shape = shapes[acc.id_shape];
			switch(acc.type) {
				case "move":
					shape.pos = acc.param;
					break;
				case "resize":
					shape.size = acc.param;
					break;
				case "rotate":
					shape.angle = acc.param;
					break;
				case "delete":
					delete shapes[acc.id_shape];
					break;
				default:
					console.error("Acción graphic, type desconocido: ", acc.type);
					return;
			}
			break;
		default:
			console.error("Acción desconocida: ", acc.action);
			return;
	}
}

function pintar(canvas, ctx) {
	var w = canvas.width, h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	console.log(shapes);
	for (var p in shapes) {
		console.log(p);
		localCtx.clearRect(0, 0, w, h);
		shape = shapes[p];
		localCtx.save();
		localCtx.lineWidth = settings.size;
		localCtx.strokeStyle = shape.color;
		switch(shape.type) {
			case "free":
				localCtx.lineCap = "round";
				localCtx.beginPath();
				localCtx.moveTo(parseInt(shape.points[0][0]*w), parseInt(shape.points[0][1]*h));
				for (var q in shape.points) {
					localCtx.lineTo(parseInt(shape.points[q][0]*w), parseInt(shape.points[q][1]*h));
				}
				//localCtx.closePath();
				localCtx.stroke();
				break;
			case "rect":
				// localCtx.strokeStyle = "#000000";
				// localCtx.fillStyle = shape.color;
				//localCtx.fillRect(shape.points[0][0]*w, shape.points[0][1]*h, shape.points[1][0]*w, shape.points[1][1]*h);
				localCtx.strokeRect(parseInt(shape.points[0][0]*w), 
									parseInt(shape.points[0][1]*h), 
									parseInt(shape.points[1][0]*w), 
									parseInt(shape.points[1][1]*h));
				break;
			case "line":
				// localCtx.strokeStyle = shape.color;
				localCtx.beginPath();
				localCtx.moveTo(parseInt(shape.points[0][0]*w), parseInt(shape.points[0][1]*h));
				localCtx.lineTo(parseInt(shape.points[1][0]*w), parseInt(shape.points[1][1]*h));
				//localCtx.closePath();
				localCtx.stroke();
				break;
			case "circle":
				// localCtx.strokeStyle = "#000000";
				// localCtx.fillStyle = shape.color;
				localCtx.beginPath();
				localCtx.arc(parseInt(shape.points[0][0]*w), parseInt(shape.points[0][1]*h), parseInt(shape.radio*w), 0, 2*Math.PI, false);
				//localCtx.closePath();
				localCtx.stroke();
				//localCtx.fill();
				break;
			default:
				console.error("Acción graphic, type desconocido: ", acc.type);
				return;
		}
		localCtx.rotate(shape.angle);
		localCtx.translate(parseInt(shape.pos[0]*w), parseInt(shape.pos[1]*h));
		localCtx.scale(shape.size[0], shape.size[1]);
		localCtx.restore();
		// Zoom:
		//localCtx.scale(settings.zoom, settings.zoom);
		// Pongo la forma anterior
		ctx.drawImage(localCanvas, 0, 0);
	}
	// Pinto el cursor:
	ctx.save();
	ctx.fillStyle = "#ff8888";
	ctx.beginPath();
	ctx.arc(parseInt(cursors[0].x*w), parseInt(cursors[0].y*h), 10, 0, 2*Math.PI, false);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.arc(parseInt(cursors[1].x*w), parseInt(cursors[1].y*h), 10, 0, 2*Math.PI, false);
	ctx.closePath();
	ctx.fill();
	ctx.scale(1, 1);
	ctx.restore();
}
