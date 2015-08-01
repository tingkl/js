angular.module('app', []).controller('PhoneListCtrl', ['$scope', function($scope) {
    $scope.phones = [
        {
            name: 'Nexus s',
            snippet: 'Fast jst got faster with Nexus S.',
            age: 3
        },
        {
            name: 'Nexus s1',
            snippet: 'Fast jst got faster with Nexus S1.',
            age: 1
        },
        {
            name: 'Nexus s2',
            snippet: 'Fast jst got faster with Nexus S2.',
            age: 2
        }
    ];
    $scope.orderProp = 'age';

}]);