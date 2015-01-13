var latitud, longitud, precision, t = 1;
var mapa, origen, destino, posicionActual, marcadorOrigen, marcadorDestino, marcadorActual, zonaAlarma;
var marcadorAzul = "img/destino.png";
var marcadorNaranja = "img/actual.png";
var radioAlarma, rangoAlarma, zonaAlarma;
var opcionesMapa;

$(document).on("ready", main);

function main(){
	//alert("Esto funciona!");
	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(iniciarCarga, errores);
	}else{
		alert("No funciona la geolocalizacion, por favor verifica que tu dispositivo puede y permite geolocalizar");
	}
}

function iniciarCarga(posicion){
	latitud = posicion.coords.latitude;
	longitud = posicion.coords.longitude;
	precision = posicion.coords.accuracy;

	origen = new google.maps.LatLng(latitud,longitud);
	destino = origen;
	posicionActual = origen;
	cargarMapa();
	actualizar();

	navigator.geolocation.watchPosition(localizar, errores);
}

function localizar(posicion) {
//	latitud = posicion.coords.latitude;
//	longitud = posicion.coords.longitude;
//	posicionActual.position = new google.maps.LatLng(latitud,longitud);
}

function errores(error) {
	if (error.code == 0) {
	  alert("Oops! Algo ha salido mal");
	}
	if (error.code == 1) {
	  alert("Oops! No has aceptado compartir tu posición");
	}
	if (error.code == 2) {
	  alert("Oops! No se puede obtener la posición actual");
	}
	if (error.code == 3) {
	  alert("Oops! Hemos superado el tiempo de espera");
	}
}
 
function cargarMapa() {

	opcionesMapa = {
		zoom: 17,
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

    zonaAlarma = new google.maps.Circle(radioAlarma);

	google.maps.event.addListener(marcadorDestino, 'click', animarBrincando);

	google.maps.event.addListener(marcadorDestino, 'drag', actualizarMarcador);

}

function actualizarMarcador(){
	var nuevaPosicion = marcadorDestino.getPosition();
    mapa.setCenter(nuevaPosicion);
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

 google.maps.event.addListener(mapa, 'center_changed', function() {
    // 3 seconds after the center of the mapa has changed, pan back to the
    // marker.
    window.setTimeout(function() {
      mapa.panTo(marker.getPosition());
    }, 3000);
  });

//google.maps.event.addDomListener(window, 'load', cargarMapa);

function mostrar(){
	$("#coordenadasOrigen").text(latitud+","+longitud);
	$("#precision").text(precision/1000);
	$("#tiempo").text(t);
	
	if(t == 5) {
		actualizarCoordernadas();
		t = 0;
	}
	
	t++;
}

function actualizarCoordernadas(){
	
}

function actualizar(){
	setInterval("mostrar()", 1000);
}
