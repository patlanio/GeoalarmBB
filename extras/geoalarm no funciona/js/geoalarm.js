var latitud, longitud, precision, t = 1, restante;
var mapa, origen, destino, posicionActual, marcadorOrigen, marcadorDestino, marcadorActual, zonaAlarma;
var polyOptions;
var marcadorAzul = "img/destino.png";
var marcadorNaranja = "img/actual.png";
var radioAlarma, rangoAlarma, zonaAlarma;
var propPunto, punto;
var beep = new Audio("rsc/beep.mp3");

var opcionesMapa;

$(document).on("ready", main);

function main(){
	//alert("Esto funciona!");
	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(iniciarCarga, errores);
		navigator.geolocation.watchPosition(localizar, errores);
	}else{
		alert("No funciona la geolocalizacion, por favor verifica que tu dispositivo puede y permite geolocalizar");
	}
}

function iniciarCarga(posicion){
	latitud = posicion.coords.latitude;
	longitud = posicion.coords.longitude;
	precision = posicion.coords.accuracy;

	origen = new google.maps.LatLng(latitud,longitud);
	//destino = origen;
	destino = new google.maps.LatLng(25.785749004249868, -108.97858888885498);
	posicionActual = origen;
	cargarMapa();
	actualizarEtiquetas();
}

function localizar(posicion){
	latitud = posicion.coords.latitude;
	longitud = posicion.coords.longitude;
	posicionActual = new google.maps.LatLng(latitud, longitud);
	marcadorActual.setPosition(posicionActual);
	mapa.setCenter(posicionActual);

	restante = distanciaEntrePuntos(latitud, longitud, 25.785749004249868, -108.97858888885498);
	if(restante <= rangoAlarma.radio){
		$("#tit").text("Faltan "+restante+" metros para llegar");
		beep.play();
		//document.getElementById('beep').play();
	}else{
		$("#tit").text("Todavia no ("+restante+")m.");
		beep.stop();
	}
}

function distanciaEntrePuntos(current_lat, current_lon, target_lat, target_lon){
	var distance = 0;
	try
	{
		//Radius of the earth in meters:
		var earth_radius = 6378137;
		
		//Calculate the distance, in radians, between each of the points of latitude/longitude:
		var distance_lat = (target_lat - current_lat) * Math.PI / 180;
		var distance_lon = (target_lon - current_lon) * Math.PI / 180;

		//Using the haversine formula, calculate the distance between two points (current & target coordinates) on a sphere (earth):
		//More info: http://www.movable-type.co.uk/scripts/latlong.html
		var a = Math.pow(Math.sin(distance_lat / 2), 2) + (Math.cos(current_lat * Math.PI / 180) * Math.cos(target_lat * Math.PI / 180) * Math.pow(Math.sin(distance_lon / 2), 2));
		var b = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		distance = Math.floor(earth_radius * b);
	} 
	catch (e) {
		errorMessage("exception (distanceBetweenPoints): " + e);
	}
	return distance;
}

function errores(error){
	if (error.code == 0){		alert("Se ha producido un problema");}
	else if (error.code == 1){	alert("No has aceptado compartir tu posicion");}
	else if (error.code == 2){	alert("No se puede obtener la posicion actual");}
	else (error.code == 3) {	alert("Se ha superado el tiempo de espera");}
}
 
function cargarMapa() {

	opcionesMapa = {
		zoom: 16,
		center: origen,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	mapa = new google.maps.Map($("#mapa").get(0), opcionesMapa);
	
	marcadorOrigen = new google.maps.Marker({
		map: mapa,
		position: origen,
		title: "Te encuentras aqui"
	});

	marcadorDestino = new google.maps.Marker({
		map: mapa,
		draggable:true,
		position: destino,
		icon: marcadorAzul,
		title: "Este es tu destino"
	});

	marcadorActual = new google.maps.Marker({
		map: mapa,
		draggable:true,
		position: posicionActual,
		icon: marcadorNaranja,
		title: "Estas aqui"
	});

	rangoAlarma = {
		centro: marcadorDestino.position,
		radio: 100
	};

	radioAlarma = {
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: 0.35,
		map: mapa,
		center: rangoAlarma.centro,
		radius: rangoAlarma.radio
	};

	polyOptions = {
		strokeColor: '#000000',
		strokeOpacity: 1.0,
		strokeWeight: 3
	}
	poly = new google.maps.Polyline(polyOptions);
	poly.setMap(mapa);

	zonaAlarma = new google.maps.Circle(radioAlarma);

	google.maps.event.addListener(marcadorDestino, 'click', animarBrincando);
	google.maps.event.addListener(marcadorDestino, 'drag', actualizarMarcador);
}

function actualizarMarcador(){
	var nuevaPosicion = marcadorDestino.getPosition();
	mapa.setCenter(nuevaPosicion);
	zonaAlarma.setCenter(nuevaPosicion);
	$("#coordenadasDestino").text(nuevaPosicion);
	radioAlarma.center = nuevaPosicion;
}

function animarBrincando() {
  if (marcadorDestino.getAnimation() != null) {
	marcadorDestino.setAnimation(null);
  } else {
	marcadorDestino.setAnimation(google.maps.Animation.BOUNCE);
  }
}

function mostrarEtiquetas(){
	$("#coordenadasOrigen").text(latitud+","+longitud);
	$("#precision").text(precision/1000);
	$("#tiempo").text(t);
	
	if(t == 50) {
		t = 0;
	}
	
	t++;
}

function agregarPunto() {/*
 * Handles click events on a map, and adds a new point to the Polyline.
 * @param {MouseEvent} mouseEvent
 */

  var path = poly.getPath();

  // Because path is an MVCArray, we can simply append a new coordinate
  // and it will automatically appear
  path.push(marcadorActual.getPosition);

  // Add a new marker at the new plotted point on the polyline.
  var marker = new google.maps.Marker({
	position: marcadorActual.getPosition,
	title: '#' + path.getLength(),
	map: mapa
  });
}

google.maps.event.addListener(mapa, 'center_changed', function() {
	// 3 seconds after the center of the mapa has changed, pan back to the
	// marker.
	window.setTimeout(function() {
	  mapa.panTo(marker.getPosition());
	}, 3000);
  });

//google.maps.event.addDomListener(window, 'load', cargarMapa);