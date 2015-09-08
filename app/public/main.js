(function () {
    'use strict';

    angular.module('app', ['ngRoute', 'ui.bootstrap', 'toaster', 'parse-angular'])
        .config(routesConfig)
        .controller('RootController', RootController)
        .factory('AuthFactory', AuthFactory)
        .run(Run);

    /** @ngInject */
    function routesConfig($routeProvider, $locationProvider) {
        $routeProvider.when('/register', {
            templateUrl: 'register.html',
            controller: 'RegistrationController',
            controllerAs: 'registerController'
        }).when('/login', {
            templateUrl: 'login.html',
            controller: 'LoginController',
            controllerAs: 'loginController'
        }).when('/home', {
            templateUrl: 'home.html',
            controller: 'HomeController',
            controllerAs: 'homeController'
        }).when('/admin', {
            templateUrl: 'admin.html',
            controller: 'AdminController',
            controllerAs: 'adminController'
        }).when('/users', {
            templateUrl: 'users.html',
            controller: 'UsersController',
            controllerAs: 'usersController'
        }).when('/', {
                templateUrl: 'welcome.html',
            }
        ).otherwise('/');

        $locationProvider.html5Mode(true);

    };

    function AuthFactory($log) {
        var user;

        var isManager = false;
        var isAdmin = false;

        return{
            setUser : function(aUser){
                user = aUser;
                if(aUser) {
                    (new Parse.Query(Parse.Role)).equalTo("users", Parse.User.current())
                        .find({
                            success: function (roles) {
                                $log.info("Retrieved " + roles.length + " roles for user");

                                var currentUserRoles = roles.map(function (item) {
                                    return item.toJSON().name;
                                });
                                if (currentUserRoles.indexOf("Administrators") >= 0) {
                                    isAdmin = true;
                                    isManager = true;
                                } else if (currentUserRoles.indexOf("Managers") >= 0) {
                                    isManager = true;
                                }
                            },
                            error: function(error) {
                                alert("Error: " + error.code + " " + error.message);
                            }}
                    );
                } else {
                    isAdmin = false;
                    isManager = false;
                }
            },
            isLoggedIn : function() {
                return (user) ? true : false;
            },
            isManager : function() {
                return isManager;
            },
            isAdmin : function() {
                return isAdmin;
            }
        }
    };

    function Run($rootScope, $route, $location, AuthFactory) {
        Parse.initialize("9xRp8EUVxXCVXb2QGQL2Yn8hw1mdK3bY7yr3CR9y", "udoqwBwXF4Txg8qIe8chSf851EOYzGWyTHT6rRmQ");

        AuthFactory.setUser(Parse.User.current());

        $rootScope.$on('$routeChangeStart', function (event, next, current) {

            if (!AuthFactory.isLoggedIn()) {
                if(next.originalPath !== "/" && next.originalPath !== "/register") {
                    console.log('DENY');
                    //event.preventDefault();
                    $location.path('/login');
                }
            } else {
                if(next.originalPath === "/") {
                    $location.path("/home");
                }
            }
        });
    };

    function RootController(AuthFactory, $location, $scope, $rootScope, $log) {
        var vm = this;
        vm.currentUser = Parse.User.current();
        vm.isAdmin = AuthFactory.isAdmin;
        vm.isManager = AuthFactory.isManager;
        vm.loggedIn = AuthFactory.isLoggedIn;

        //$scope.$watch(AuthFactory.isManager(), function (value, oldValue) {
        //
        //    if(!value && oldValue) {
        //        vm.isAdmin = false;
        //        vm.isManager = false;
        //    }
        //
        //    if(value) {
        //        vm.isAdmin = AuthFactory.isAdmin();
        //        vm.isManager = AuthFactory.isManager();
        //    }
        //}, false);

        $scope.$watch(AuthFactory.isLoggedIn, function (value, oldValue) {

            if(!value && oldValue) {
                vm.currentUser = Parse.User.current();
                //vm.loggedIn = false;
            }

            if(value) {
                vm.currentUser = Parse.User.current();
                //vm.loggedIn = AuthFactory.isLoggedIn();
            }
        }, false);


        if(vm.currentUser) {
            //(new Parse.Query(Parse.Role)).equalTo("users", Parse.User.current())
            //    .find({
            //        success: function (roles) {
            //            $log.info("Retrieved " + roles.length + " roles for user");
            //
            //            var currentUserRoles = roles.map(function (item) {
            //                return item.toJSON().name;
            //            });
            //            if (currentUserRoles.indexOf("Administrators") >= 0) {
            //                vm.isAdmin = true;
            //                vm.isManager = true;
            //            } else if (currentUserRoles.indexOf("Managers") >= 0) {
            //                vm.isManager = true;
            //            }
            //        },
            //        error: function(error) {
            //            alert("Error: " + error.code + " " + error.message);
            //        }}
            //);
        }
        //

        vm.logout = function() {
            //vm.currentUser = null;
            Parse.User.logOut();
            AuthFactory.setUser(Parse.User.current())
            $location.path("/login");
            //vm.isAdmin = false;
            //vm.isManager = false;
        };
    };

})();
