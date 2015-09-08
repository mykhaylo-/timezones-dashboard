(function () {
    'use strict';

    angular
        .module('app')
        .controller('AdminController', AdminController)
        .controller('AdminNewTimezonePopupController', AdminNewTimezonePopupController);

    /** @ngInject */
    function AdminController($scope, $log, $window, $modal, toaster) {

        var vm = this;

        vm.timezones = [];
        vm.users = [];
        activate();

        function activate() {
            var TimeZone = Parse.Object.extend("TimeZone");
            var query = new Parse.Query(TimeZone);
            query.include("createdBy");
            query.find({
                success: function (results) {
                    $log.info("Successfully retrieved " + results.length + " timezones");
                    vm.timezones = results.map(function (item) {
                        var converted = item.toJSON();
                        converted.createdBy = item.get("createdBy").toJSON();
                        return converted;
                    });
                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });

            (new Parse.Query(Parse.User))
                .find({
                    success: function (results) {
                        $log.info("Successfully retrieved " + results.length + " users");
                        //vm.users = results.reduce(function(map, obj) {
                        //    map[obj.toJSON().objectId] = obj.toJSON();
                        //    return map;
                        //}, {});
                        vm.parseUsers = results.reduce(function(map, obj) {
                                    map[obj.id] = obj;
                                    return map;
                                }, {});
                        vm.users = results.map(function (item) {
                            return item.toJSON();
                        });
                    },
                    error: function (error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
        };

        vm.deleteTimezone = function (timezoneIndex) {

            var TimeZone = Parse.Object.extend("TimeZone");
            var timeZone = new TimeZone();
            timeZone.set("objectId", vm.timezones[timezoneIndex].objectId);

            timeZone.destroy({
                success: function (timeZone) {
                    $log.info("Successfully deleted timeZone " + timeZone.get("name"));
                    vm.timezones.splice(timezoneIndex, 1);
                },
                error: function (timeZone, error) {
                    alert("Error: " + error.code + " " + error.message);
                    toaster.pop('error', "Error", "Error deleting timezone");
                    $log.error(error);
                }
            });
        };

        vm.openTimezonePopup = function (timezone) {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'adminTimezonePopup.html',
                controller: 'AdminNewTimezonePopupController',
                controllerAs: 'tzPopupCtrl',
                size: 'sm',
                resolve: {
                    timezone: function () {
                        return angular.copy(timezone);
                    },
                    users: function() {
                        return vm.users;
                    },
                    parseUsers : function() {
                        return vm.parseUsers;
                    }
                }
            });

            modalInstance.result.then(function (timezone) {
                activate();
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

        };
    }

    /** @ngInject */
    function AdminNewTimezonePopupController($modalInstance, timezone, users, parseUsers, $log, toaster) {
        var vm = this;
        vm.title = timezone ? "Edit timezone" : "New Timezone";
        vm.timezone = timezone ? timezone : {};
        vm.users = users;
        vm.parseUsers = parseUsers;
        vm.usersMap =  vm.users.reduce(function(map, obj) {
                map[obj.objectId] = obj;
                return map;
            }, {});

        if(timezone) {
            vm.timezone.createdBy = vm.usersMap[vm.timezone.createdBy.objectId];
        }

        vm.save = function () {
            if (vm.timezone.objectId) {
                var TimeZone = Parse.Object.extend("TimeZone");
                var timeZone = new TimeZone();
                timeZone.set("city", vm.timezone.city);
                timeZone.set("name", vm.timezone.name);
                timeZone.set("zoneOffset", vm.timezone.zoneOffset);
                timeZone.set("objectId", vm.timezone.objectId);
                timeZone.set("createdBy", vm.parseUsers[vm.timezone.createdBy.objectId]);
                timeZone.save(null, {
                    success: function (timeZone) {
                        $log.info('Updated timezone with objectId: ' + timeZone.id)
                        $modalInstance.close(timeZone);
                    },
                    error: function (timeZone, error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            } else {
                var TimeZone = Parse.Object.extend("TimeZone");
                var timeZone = new TimeZone();
                timeZone.set("city", vm.timezone.city);
                timeZone.set("name", vm.timezone.name);
                timeZone.set("zoneOffset", vm.timezone.zoneOffset);
                timeZone.set("createdBy", vm.parseUsers[vm.timezone.createdBy.objectId]);
                timeZone.save(null, {
                        success: function (timeZone) {
                            $log.info('Created timezone with objectId: ' + timeZone.id)
                            $modalInstance.close(timeZone);
                        },
                        error: function (timeZone, error) {
                            vm.alert = {type: 'danger', msg: 'Error saving timezone'};
                            //toaster.pop('error', "Error", "Error saving timezone");
                            $log.error(error);
                            alert("Error: " + error.code + " " + error.message);
                        }
                    }
                );
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
