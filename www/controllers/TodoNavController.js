(function(){
    var activeTodoNavList;
    var module = angular.module("todoApp");
    var loggedIn= false;


    var TodoNavController = function($rootScope, $scope, $routeParams,$window, $timeout, $location, $anchorScroll, $interval, ModelManager, NavManager,ViewManager){
        var loginData =  {
            userName : 'sageknives',
            password : ''
        };
        $scope.loginData = loginData;

        //shared nav
        $scope.updateViewNode = function (node, type) {
            $scope.openNav('');
            if(type == 'home'){
                $location.path('/home');
                return;
            }
            ViewManager.setCurrentNode(node);
            $location.path('/'+type+'-list/'+node.id);
        };
        //shared nav
        $scope.addForm = function(node){
            $scope.node = $scope.createTodo("", "", Date.now(), node);
            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };
            $scope.noDueDate = false;
            $scope.format = 'M-dd-yyyy';
            $scope.minDate = Date.now();
            $scope.maxDate = node.dueDate;
            $scope.openNav('addFormOpen');
        };
        //shared nav
        $scope.editForm = function(node){
            $scope.node = node;
            $scope.rollback = {title: node.title, desc: node.desc, dueDate: node.dueDate};
            $scope.noDueDate = node.dueDate === null;
            $scope.format = 'M-dd-yyyy';
            $scope.minDate = Date.now();
            $scope.maxDate = node.parentNode.dueDate;
            $scope.openNav('addFormOpen');
        }; 
        //shared nav
        $scope.errorWindow = function(message){
            $scope.errorMessage = message + ' is not Implemented yet.';
            $scope.openNav('error');
        };
        //shared nav
        $scope.openNav = function(nav){
            if($scope.activeNav == nav){
                $scope.activeNav = "";
            }
            else{
                $scope.previousMenu = $scope.activeNav;
                $scope.activeNav = nav;
            }
        };
        //shared nav
        $scope.moveForm = function(node){
            $scope.moveNode = node;
            $scope.openNav('moveFormOpen');
            $scope.todoNode = node.parentNode;
        };
        NavManager.setNav($scope);
        $scope.activeRepoList = ModelManager.getRepos();

        if(loggedIn){
            $scope.loggedIn = loggedIn;
        }
        else{
    	   $scope.loggedIn = false;
    	   $scope.loneButton = "loneButton";
        }
        $scope.loginError = '';    
        $scope.logIn = function(){
    	    var userName = angular.element(document.getElementById('username')).val();
    	    var password = angular.element(document.getElementById('password')).val();
    	    ModelManager.login(userName,password)
    	        .then(function(result){
    		        if(result == 'invalid log in'){
    		          	$scope.loginError = result;
    		        }
    		        else{
                        $scope.activeNav = '';
                        $scope.loneButton = '';
                        $scope.todos = ModelManager.getTodoModel().listOfTodos;
                        $scope.logItems = ModelManager.getNotifications();
                        $scope.loggedIn = true;
                        ModelManager.getTodoActions($scope);
                        ModelManager.bindTodoVariables($scope);
                        //check for updates
                        $interval(ModelManager.checkForUpdates, 30000);
                    }
            });
        };
    
        //private nav maybe
        $scope.change = function (node) {
    	    if(node === null){
    	        $scope.openNav("");
    	        return;
    	    }
            console.log(node.id);
            $scope.activeList.currentClass = "";
            $timeout(function(){
                node.currentClass = 'active';
                $scope.activeList = node;
            }, 200); 
        };

        //private nav this should be changed to use a model if possible.
        $scope.showOptions = function(node){
            console.log(node.id);
            var newSubMenu = 'list-bottom-' + node.id;
            if($scope.activeSubMenu == newSubMenu){
                angular.element(document.getElementById($scope.activeSubMenu)).removeClass('active');
                $scope.activeSubMenu = "";
            }
            else{
                angular.element(document.getElementById($scope.activeSubMenu)).removeClass('active');
                $scope.activeSubMenu = newSubMenu;
                angular.element(document.getElementById($scope.activeSubMenu)).addClass('active');
            }
        };

        //private nav
        $scope.updateDueDate = function(noDate){
            if(noDate){
                $scope.node.dueDate = null;
            }
            else{
                $scope.node.dueDate = new Date();
            }
        };

        $scope.cancelEditAdd = function(node, rollback){
            if(node.id != ''){
                node.dueDate = rollback.dueDate;
                node.title = rollback.title;
                node.desc = rollback.desc;
            }
            $scope.scrollToTop('add-form');
            $scope.openNav($scope.previousMenu);
        };
        $scope.scrollToTop = function(id){
            $location.hash(id);
            $anchorScroll();
            $location.hash('');
        };
        //private nav
        $scope.submitAddForm = function(){
            console.log('in submit add form');
      	    $scope.addTodo($scope.node);
      	    $scope.openNav($scope.previousMenu);
            $scope.scrollToTop('add-form');
        };
        
        //private nav
        $scope.submitMoveForm = function(node,parent){
      	    $scope.moveTodo(node, parent);
      	    $scope.openNav($scope.previousMenu);
        };

        

        //override back button
        $rootScope.$on("$routeChangeStart", function(event, next, current) {
            if($scope.activeNav === undefined|| $scope.activeNav != ''){
                event.preventDefault();
                $scope.activeNav = '';
            }
            
        });
    };

    module.controller("TodoNavController",TodoNavController);
}());