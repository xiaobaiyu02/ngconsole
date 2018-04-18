angular.module("app.controllers", [])

.controller("PageViewController", ["$scope", "$route", "$animate", function($scope, $route, $animate) {
	// controler of the dynamically loaded views, for DEMO purposes only.
	// $scope.$on("$viewContentLoaded", function() {
	// 	console.log("ffffffff")
	// })
}])
.controller("LangController", ["$scope", "settings", "localize", function($scope, settings, localize) {
	$scope.languages = settings.languages;
	$scope.currentLang = settings.currentLang || $scope.languages[0];
	$scope.setLang = function(lang) {
		settings.currentLang = lang;
		$scope.currentLang = lang;
		localize.setLang(lang);
		$$$storage.setSessionStorage('lang_code', lang.langCode)
	};
	// set the default language
	$scope.setLang($scope.currentLang);
}]);