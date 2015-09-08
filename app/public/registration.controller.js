(function() {
    'use strict';

    angular
        .module('app')
        .controller('RegistrationController', RegistrationController);

    /** @ngInject */
    function RegistrationController($log, $location, $window) {

        var vm= this;
        vm.user = {};
        vm.register = function() {

            var user = new Parse.User();
            user.set("username", vm.user.username);
            user.set("password", vm.user.password);
            user.set("email", vm.user.email);
            user.set("name", vm.user.name);

            var userACL = new Parse.ACL();
            userACL.setRoleReadAccess("Managers", true);
            userACL.setPublicReadAccess(false);
            user.setACL(userACL);

            user.signUp(null, {
                success: function(user) {
                    $log.info("registration successful")
                    $window.location.href= "/login";//$location.path = "/home";
                },
                error: function(user, error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        }
    }
})();