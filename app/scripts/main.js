/* global angular */

'use strict';

var app = angular.module('materialCombinations', ['ui.router', 'ngMaterial', 'LocalStorageModule']);

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

// Declared route
app.config(['$urlRouterProvider', '$stateProvider', '$mdThemingProvider', '$mdIconProvider',
    function ($urlRouterProvider, $stateProvider, $mdThemingProvider, $mdIconProvider) {

        $urlRouterProvider.otherwise('/');

        $mdIconProvider
            .icon('textsms', '/images/icons/android-textsms.svg', 24)
            .icon('hamburger', '/images/icons/android-menu.svg', 24)
            .icon('star', '/images/icons/android-star.svg', 24)
            .icon('detail', '/images/icons/android-search.svg', 24)
            .icon('search', '/images/icons/android-search.svg', 24)
            .icon('ion-merge', '/images/icons/merge.svg', 24)
            .icon('more', '/images/icons/android-more-vertical.svg', 24)
            .icon('thumbsup', '/images/icons/thumbsup.svg', 24)
            .icon('thumbsdown', '/images/icons/thumbsdown.svg', 24);

        $mdThemingProvider.theme('altTheme')
            .primaryPalette('grey')
            .accentPalette('orange').dark();

        $stateProvider
            .state('combine', {
                url: '/',
                templateUrl: '_combine.html',
                controller: ['$scope', function ($scope) {
                    $scope.showCombination = function (combination) {
                        return combination.primary.usePrimary && combination.accent.useAccent && combination.hate === combination.love;
                    };
                }]

            }).state('loved', {
                url: '/loved',
                templateUrl: '_loved.html',
                controller: ['$scope', function ($scope) {
                    $scope.showCombination = function (combination) {
                        return combination.love;
                    };
                }]

            }).state('hated', {
                url: '/hated',
                templateUrl: '_hated.html',
                controller: ['$scope', function ($scope) {
                    $scope.showCombination = function (combination) {
                        return combination.hate;
                    };
                }]
            });

    }]);

app.controller('SubheaderController', ['$scope', '$state', function ($scope, $state) {

    $scope.goTo = function (route) {
        $state.go(route);
    };
}]);

app.run(['$http', '$templateCache', '$rootScope', '$mdColorPalette', 'localStorageService', function ($http, $templateCache, $rootScope, $mdColorPalette, localStorageService) {
    var urls = [
            '/images/icons/android-textsms.svg',
            '/images/icons/android-menu.svg',
            '/images/icons/android-star.svg',
            '/images/icons/android-search.svg',
            '/images/icons/android-search.svg',
            '/images/icons/android-more-vertical.svg',
            '/images/icons/merge.svg',
            '/images/icons/thumbsup.svg',
            '/images/icons/thumbsdown.svg'
        ],
        colors = [],
        loved = [],
        hated = [],
        color,
        key,
        combinations = [],
        primary,
        accent,
        colorCount = 0;

    function rgbToText(rgb) {
        return 'rgb(' + rgb.join(',') + ')';
    }

    function store() {
        localStorageService.set('loved', loved);
        localStorageService.set('hated', hated);
    }

    function updateCount() {
        $rootScope.lovedCount = loved.length;
        $rootScope.hatedCount = hated.length;
    }

    angular.forEach(urls, function (url) {
        $http.get(url, {cache: $templateCache});
    });

    loved = localStorageService.get('loved') || [];
    hated = localStorageService.get('hated') || [];

    $rootScope.lovedCount = loved.length;
    $rootScope.hatedCount = hated.length;

    for (var c in $mdColorPalette) {
        if (c !== 'black' && c !== 'white') {
            colorCount++;
            color = $mdColorPalette[c]['500'];
            colors.push({
                color: rgbToText(color.value),
                //contrast: rgbToText(color.contrast),
                contrast: '#ffffff',
                usePrimary: false,
                useAccent: false,
                name: c
            });
        }
    }

    for (var i = 0; i < colorCount; i++) {
        for (var k = 0; k < colorCount; k++) {
            if (i !== k) {
                primary = colors[i];
                accent = colors[k];
                key = primary.name + '-' + accent.name;
                combinations.push({
                    key: key,
                    primary: primary,
                    accent: accent,
                    love: loved.indexOf(key) > -1,
                    hate: hated.indexOf(key) > -1
                });
            }
        }
    }

    $rootScope.colors = colors;
    $rootScope.combinations = combinations;

    $rootScope.love = function ($event, combination) {
        $event.preventDefault();
        combination.hate = false;
        combination.love = true;

        key = combination.key;

        if (loved.indexOf(key) < 0) {
            loved.push(key);
        }

        if (hated.indexOf(key) > -1) {
            hated.splice(hated.indexOf(key), 1);
        }

        updateCount();
        store();
    };

    $rootScope.hate = function ($event, combination) {
        $event.preventDefault();
        combination.hate = true;
        combination.love = false;

        key = combination.key;

        if (hated.indexOf(key) < 0) {
            hated.push(key);
        }

        if (loved.indexOf(key) > -1) {
            loved.splice(loved.indexOf(key), 1);
        }

        updateCount();
        store();
    };

    $rootScope.shuffle = function () {
        shuffle($rootScope.combinations)
    };

    $rootScope.clearAll = function () {
        loved = [];
        hated = [];
        for (var i = 0; i < combinations.length; i++) {
            combinations[i].love = false;
            combinations[i].hate = false;
        }
        updateCount();
        store();
    };

    $rootScope.clearHated = function () {
        hated = [];
        for (var i = 0; i < combinations.length; i++) {
            combinations[i].hate = false;
        }
        updateCount();
        store();
    };

    $rootScope.clearLoved = function () {
        loved = [];
        for (var i = 0; i < combinations.length; i++) {
            combinations[i].love = false;
        }
        updateCount();
        store();
    };

}]);
