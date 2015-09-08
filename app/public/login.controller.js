(function() {
    'use strict';

    angular
        .module('app')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($log, $window, $rootScope, $location, AuthFactory) {

        var vm= this;
        vm.user = {};
        vm.login = function() {

            Parse.User.logIn(vm.user.username, vm.user.password, {
                success: function(user) {
                    $log.info("login successful")
                    AuthFactory.setUser(Parse.User.current());
                    $location.path("/home");
                    //$window.location.href = "/home";
                },
                error: function(user, error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        };
    }
})();