var min	= 8;
var max	= 30;

var addTo = 4;

function increaseFontSize() {

	var p = document.getElementsByTagName('p');
	for( i=0; i < p.length; i++ ){
	
		if ( p[i].style.fontSize ){
			var s = parseInt(p[i].style.fontSize.replace("px",""));
		} else {
			var s = 12;
		}
		
		if ( s != max ){
			s += addTo;
		}
		
		p[i].style.fontSize = s + "px"
	}
	
	var p = document.getElementsByTagName('strong');
	for( i=0; i < p.length; i++ ){
	
		if ( p[i].style.fontSize ){
			var s = parseInt(p[i].style.fontSize.replace("px",""));
		} else {
			var s = 12;
		}
		
		if ( s != max ){
			s += addTo;
		}
		
		p[i].style.fontSize = s + "px"
	}
	
	var p = document.getElementsByTagName('a');
	for( i=0; i < p.length; i++ ){
	
		if ( p[i].style.fontSize ){
			var s = parseInt(p[i].style.fontSize.replace("px",""));
		} else {
			var s = 12;
		}
		
		if ( s != max ){
			s += addTo;
		}
		
		p[i].style.fontSize = s + "px"
	}
	
	
	var p = document.getElementsByTagName('span');
	for( i=0; i < p.length; i++ ){
	
		if ( p[i].style.fontSize ){
			var s = parseInt(p[i].style.fontSize.replace("px",""));
		} else {
			var s = 12;
		}
		
		if ( s != max ){
			s += addTo;
		}
		
		p[i].style.fontSize = s + "px"
	}
	
	
	var p = document.getElementsByTagName('div');
	for( i=0; i < p.length; i++ ){
	
		if ( p[i].style.fontSize ){
			var s = parseInt(p[i].style.fontSize.replace("px",""));
		} else {
			var s = 12;
		}
		
		if ( s != max ){
			s += addTo;
		}
		
		p[i].style.fontSize = s + "px"
	}
	
	
}

increaseFontSize();