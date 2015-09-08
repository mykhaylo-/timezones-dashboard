(function () {
    'use strict';

    angular
        .module('app')
        .controller('UsersController', UsersController)
        .controller('UserPopupController', UserPopupController);

    /** @ngInject */
    function UsersController($scope, $log, $window, $modal, toaster) {

        var vm = this;

        vm.users = [];
        activate();

        function activate() {

            var query = new Parse.Query(Parse.User);
            query.find({
                success: function (results) {
                    $log.info("Successfully retrieved " + results.length + " users");
                    vm.users = results.map(function (item) {
                        return item.toJSON();
                    });
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        };

        vm.deleteUser = function (userIndex) {
            Parse.Cloud.run('deleteUser', vm.users[userIndex], {
                success: function(result) {
                    vm.users.splice(userIndex, 1);
                    toaster.pop('success', "User deleted", "User deleted successfully");
                },
                error: function(error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        };

        vm.openUserPopup = function (user) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'userPopup.html',
                controller: 'UserPopupController',
                controllerAs: 'userPopupCtrl',
                size: 'sm',
                resolve: {
                    user: function () {
                        return angular.copy(user);
                    }
                }
            });

            modalInstance.result.then(function (user) {
                activate();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

        };

    }

    /** @ngInject */
    function UserPopupController($modalInstance, user, $log, toaster) {
        var vm = this;
        vm.title = user ? "Edit user" : "New User";
        vm.user = user ? user : {};
        vm.save = function () {
            if (vm.user.objectId) {
                Parse.Cloud.run('updateUser', vm.user, {
                    success: function(result) {
                        toaster.pop('success', "User updated", "User updated successfully");
                        $modalInstance.close(result);
                    },
                    error: function(error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            }
        };

        vm.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        vm.closeAlert = function () {
            vm.alert = undefined;
        }
    };

})();
