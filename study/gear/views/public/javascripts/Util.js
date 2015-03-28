(function(module, factory){
    if (module.util) {
        return;
    } else {
        module.util = factory();
    }
})(window, function() {
    var $ = {};
    $.extend = function(Child, Parent) {
        Child.prototype = new Parent();
    }
    return $;
});