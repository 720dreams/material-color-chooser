/* global angular */

'use strict';

var app = angular.module('materialCombinations', ['ui.router', 'ngMaterial', 'LocalStorageModule']);

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {
    }
    return o;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

function rgbToText(rgb) {
    if (rgb.length > 3) {
        return 'rgba(' + rgb.join(',') + ')';
    }
    return 'rgb(' + rgb.join(',') + ')';
}

function rgb2hex(rgb) {

    var r = rgb[0],
        g = rgb[1],
        b = rgb[2];
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function findByKey(source, key) {
    for (var i = 0; i < source.length; i++) {
        if (source[i].key === key) {
            return source[i];
        }
    }
}

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
            .icon('open', '/images/icons/android-open.svg', 24)
            .icon('back', '/images/icons/android-arrow-back.svg', 24)
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

            }).state('detail', {
                url: '/detail/:primary/:accent',
                templateUrl: '_detail.html',
                controller: ['$scope', '$stateParams', '$mdColorPalette', '$state', function ($scope, $stateParams, $mdColorPalette, $state) {

                    $scope.primaryName = $stateParams.primary;
                    $scope.accentName = $stateParams.accent;

                    $scope.primaryPalette = $mdColorPalette[$stateParams.primary];
                    $scope.accentPalette = $mdColorPalette[$stateParams.accent];

                    $scope.$watch(function () {
                            return $scope.primaryMain;
                        },
                        function () {
                            $scope.primary = {
                                value: rgb2hex($scope.primaryPalette[$scope.primaryMain].value),
                                contrast: rgb2hex($scope.primaryPalette[$scope.primaryMain].contrast)
                            };

                        }
                    );

                    $scope.$watch(function () {
                            return $scope.accentMain;
                        },
                        function () {
                            $scope.accent = {
                                value: rgb2hex($scope.accentPalette[$scope.accentMain].value),
                                contrast: rgb2hex($scope.accentPalette[$scope.accentMain].contrast)
                            };
                        }
                    );

                    $scope.primaryMain = 500;
                    $scope.accentMain = 500;

                    $scope.combination = findByKey($scope.combinations, $stateParams.primary + '-' + $stateParams.accent);

                    $scope.back = function () {
                        $state.go('combine');
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

app.run(['$http', '$templateCache', '$rootScope', '$mdColorPalette', 'localStorageService', '$state',
    function ($http, $templateCache, $rootScope, $mdColorPalette, localStorageService, $state) {
        var urls = [
                '/images/icons/android-textsms.svg',
                '/images/icons/android-menu.svg',
                '/images/icons/android-star.svg',
                '/images/icons/android-search.svg',
                '/images/icons/android-search.svg',
                '/images/icons/android-more-vertical.svg',
                '/images/icons/merge.svg',
                '/images/icons/thumbsup.svg',
                '/images/icons/thumbsdown.svg',
                '/images/icons/android-arrow-back.svg',
                '/images/icons/android-open.svg'

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
            shuffle($rootScope.combinations);
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

        $rootScope.goToDetail = function (primary, accent) {
            $state.go('detail', {primary: primary, accent: accent});
        };

    }]);

app.filter('rgb2hex', function () {
    return function (rgb) {
        return rgb2hex(rgb);
    };
});
