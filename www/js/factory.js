angular.module('starter').factory('betriebsrichtungsprognoseService', function ($http, $q) {
	function parseData(data) {
		var parsedData = {};
		parsedData.items = [];
		jQuery(data).find('period').each(function(curIndex){
		 parsedData.items[curIndex] = {
		   from : jQuery(this).attr('from'),
		   state: jQuery(this).attr('state'), 
		   probability: jQuery(this).attr('probability')
			};
		});
		parseData.info = jQuery(data).find('info').text();
		return parsedData;
	}
	return {
		getData: function () {
			var deferred = $q.defer();
			$http.get('http://www.forum-flughafen-region.de/fileadmin/files/unhtools/data.xml').
				success(function(data, status, headers, config) {
				//	console.log(data,'success');
					deferred.resolve(parseData(data));
				// this callback will be called asynchronously
				// when the response is available
				}).
				error(function(data, status, headers, config) {
				//	console.log(data,'error');
					deferred.reject(null);
				// called asynchronously if an error occurs
				// or server returns response with an error status.
				});
			return deferred.promise;
		}
	};
});