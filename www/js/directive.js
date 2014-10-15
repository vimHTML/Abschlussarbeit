angular.module('starter').directive('betriebsrichtungsprognose', function (betriebsrichtungsprognoseService) {
	return {
		templateUrl: 'templates/_betriebsrichtungsprognose.html',
		restrict: 'E',
		replace: true,
		link: function (scope, elem) {		
			var days = { 0 : 'Sonntag',  1 : 'Montag', 2 : 'Dienstag', 3 : 'Mittwoch', 4 : 'Donnerstag',  5 : 'Freitag', 6 : 'Samstag' };
			var months = {0: 'Januar', 1: 'Februar', 2: 'März', 3: 'April', 4: 'Mai', 5: 'Juni', 6: 'Juli', 7: 'August', 8: 'September', 9: 'Oktober', 10: 'November', 11: 'Dezember' };
			var translator = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11};
			var hours = 0;
			var steps = 64;

			var userAgent = navigator.userAgent.toLowerCase();
			var userBrowserName  = navigator.appName.toLowerCase();

			var jQuerywindow = jQuery(window);
			var Browser = {
				name: userBrowserName,
				version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [0,'0'])[1],
				safari: /webkit/.test( userAgent ) && !/chrome/.test( userAgent ),
				chrome: /chrome/.test( userAgent ),
				opera: /opera/.test( userAgent ),
				android: /android/.test( userAgent ),
				msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
				mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent ),
			  ie11: !!navigator.userAgent.match(/Trident\/7\./),
				ios: /ipad/.test( userAgent ) || /ipod/.test( userAgent ) || /iphone/.test( userAgent),
			  ie8: /ie 8/.test( userAgent ),
			  mac: /mac/.test( userAgent ),
			  win: /windows/.test( userAgent )
			}
			  
			function hideDynamic(){
				 jQuery('#content #betriebsrichtungsprognose').hide();
				 jQuery(jQuery('.tx-unhtoolwind-pi1 p')[5]).hide();
			}
			
			var model = scope.model = {
				info: '',
				rangeValue: 0
			};
			betriebsrichtungsprognoseService.getData().then(function (data) {
			//wird ausgeführt wenn die Funktion Daten zuruückliefert
				model.info = data.info;
			
				scope.$watch('model.rangeValue', function (newVal) {
					  if(newVal % steps  == 0)
					  {
						renderData(data, newVal / steps);
					  }else{
						factor = newVal % steps;
						renderData(data, (newVal - factor)/steps, factor);
					  }
				});
				initGradient(data);
			}, function (err) {
			//wird ausgeführt wenn die Funktion keine Ddaten zuruückliefert
			});

			function initGradient(parsedData){
			  var areas = [];
			  var lastState = parseInt(parsedData.items[0]['state']);
			  var curState = lastState;
			  var lastIndex = 0;
			  var counter = 1;
			  while(counter < parsedData.items.length){
				curState = parsedData.items[counter]['state'];
				
				if(curState != lastState){
				  areas.push({ 'state': lastState, 'from':lastIndex, 'to':counter-1});
				  lastState = curState;
				  lastIndex = counter;
				}
				
				if(counter == parsedData.items.length-1){
				  areas.push({ 'state': lastState, 'from':lastIndex, 'to':counter-1});
				}    
				counter++;
			  }
			  
				// console.log('areas:' );


			  
			  var cssStringChrome = '-webkit-linear-gradient(left, ';
			  if(Browser.mozilla && !Browser.ie11)
				cssStringChrome = '-moz-linear-gradient(left, ';
			  else if(Browser.msie || Browser.android && !Browser.ie11)
				cssStringChrome = "filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#8AA315', endColorstr='#8AA315',GradientType=1 )"
			  
			  for(i=0; i<areas.length; i++)
			  {
				upper = areas[i]['from'];
				percentage = 100 * (upper/steps);
				color = getColor(areas[i]['state']);
				cssStringChrome += color + ' ' + percentage.toString() + '%, ';
			  }
			  if(!Browser.msie && !Browser.ie11)
				cssStringChrome = cssStringChrome.substring(0, cssStringChrome.length - 2) + ', #8AA315 100%)';
			  // cssStringChrome = '-webkit-linear-gradient(left, #45813E 0%, #8AA315 6.5%)';

			  var myDynClass = {
				"background": cssStringChrome
			  }
			//  alert(Browser.android.toString());

			  if(!Browser.msie && !Browser.ie11){
				   if(Browser.android)
							jQuery('.layer.slider').css('background', '#8AA315');
						 else
				jQuery('.layer.slider').css(myDynClass);
			  }else 
				jQuery('.layer.slider').css('background', '#8AA315');

			}


			function getColor(state){
			  switch(parseInt(state)){
				case 13:
				case 12:
				case 1:
				  return "#8AA315";
				  break;
				case 23:
				case 21:
				case 2:
				  return "#45813E";
				  break;
				case 31:
				case 32:
				case 3:
				  return "#114044";
				  break;
				default:
				  return "#000";
				  break;
				}
			}


			function renderData(parsedData, index, offset){
			  curDate = null;
			  if(index < parsedData.items.length){
				splitted = parsedData.items[index]['from'].split(' ');
				time_spl = splitted[3].split(':');
				curDate = new Date(splitted[5], translator[splitted[1]], splitted[2], time_spl[0], time_spl[1], time_spl[2]);
				if(offset == undefined)
				  jQuery('#display>h1').html(formatToDisplay(curDate));
				else{
				  curDate.setMinutes(curDate.getMinutes() + (factor*30));
				  jQuery('#display>h1').html(formatToDisplay(curDate));  
				}
				if(curDate.getHours() > 22 || curDate.getHours() < 6 || (curDate.getHours() >= 22 && curDate.getMinutes() > 0))
					jQuery('#nightmode').stop(true, false).fadeTo(300, 1);
				else 
				  jQuery('#nightmode').stop(true, false).fadeTo(300, 0);
				
				jQuery('#display>h2').html('Wahrscheinlichkeit der Prognose ' + parsedData.items[index]['probability'].replace('.', '') + '%');
				lastState = parsedData.items[index]['state'];
				switch(parseInt(lastState)){
				  case 1:
					jQuery('#container #display .layer.west img').fadeTo(1, 1);
					jQuery('#container #display .layer.east img').fadeTo(1, 0);
					break;
				  case 12:
					jQuery('#container #display .layer.east img').fadeTo(1, offset/steps);
					break;
				  case 2:
					jQuery('#container #display .layer.west img').fadeTo(1, 1);
					jQuery('#container #display .layer.east img').fadeTo(1, 1);
					break;
				  case 21:
					jQuery('#container #display .layer.east img').fadeTo(1, 1-(offset/steps));
					break;
				  case 13:
					jQuery('#container #display .layer.west img').fadeTo(1, 1-(offset/steps));
					jQuery('#container #display .layer.east img').fadeTo(1, offset/steps);
					break;
				  case 3:
					jQuery('#container #display .layer.west img').fadeTo(1, 0);
					jQuery('#container #display .layer.east img').fadeTo(1, 1);
					break;
				  case 31:
					jQuery('#container #display .layer.east img').fadeTo(1, 1-(offset/steps));
					break;
				  case 23:
					jQuery('#container #display .layer.west img').fadeTo(1, 1-(offset/steps));
					break;
				  case 32:
					jQuery('#container #display .layer.west img').fadeTo(1, offset/steps);
					break;
				  default:
					break;
				}
			  }
			  else if(index == parsedData.items.length){
				splitted = parsedData.items[parsedData.items.length-1]['from'].split(' ');
				time_spl = splitted[3].split(':');
				curDate = new Date(splitted[5], translator[splitted[1]], splitted[2], time_spl[0], time_spl[1], time_spl[2]);
				curDate.setHours(curDate.getHours() + 8);
				jQuery('#display>h1').html(formatToDisplay(curDate));
				jQuery('#display>h2').html('Wahrscheinlichkeit der Prognose ' + parsedData.items[parsedData.items.length-1]['probability'].replace('.', '') + '%');
			  }
			}

			function renderLayers(s){
			  if(s == 1){
				jQuery(jQuery('#display .layer img')[0]).fadeTo(1, 1);
				jQuery(jQuery('#display .layer img')[1]).fadeTo(1, 0);
			  }else if(s == 12 || s == 21)
				jQuery('#display .layer img').fadeTo(1, 1);
			  else if(s == 2)
				jQuery(jQuery('#display .layer img')[1]).fadeTo(1, 1);
			}


			function formatToDisplay(curDate){
			  formatted = days[curDate.getDay()] + ' ' + curDate.getDate() + '. ' + months[curDate.getMonth()] + ', ' + (curDate.getHours().toString().length < 2 ? '0' + curDate.getHours() : curDate.getHours()) + ':' + (curDate.getMinutes().toString().length < 2 ? '0'+curDate.getMinutes() : curDate.getMinutes());
			  return formatted;
			}
		}
	};
});