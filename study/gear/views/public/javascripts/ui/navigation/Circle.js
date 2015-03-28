/**
 * Created with IntelliJ IDEA.
 * User: dingye
 * Date: 14-1-22
 * Time: 下午1:23
 * To change this template use File | Settings | File Templates.
 */
define(['ui.Widget'], 'ui.navigation.Circle', function (Widget) {
    function Circle(config) {
        Circle.superClass.call(this, config);
    }
    Circle.event = {
        click: 'click'
    };
    var dc = { up_icon: '/public/images/up.gif',
        icon: '/public/images/empty.gif'};
    var nodeInject = $.injection(dc, 'up_icon', 'icon');
    var leafInject = $.injection(dc, 'icon');
    /*Circle.Config = dc;*/
    ClassManager.extend(Circle, Widget);
    Circle.prototype.patchConfig = function (config, children) {

        if ('children' in config) {
            config.leaf = false;
            children = config.children;
            nodeInject(config);
            for (var i = 0, l = children.length; i < l; i++) {
                this.patchConfig(children[i]);
            }
        } else {
            leafInject(config);
            config.leaf = true;
        }
    }
    Circle.prototype.initTrigger = function() {
        var that = this;
        $('li', this.root).on('click', function(evt) {
            var target = evt.target;
            while(target.nodeName.toLowerCase() !== 'li') {
                target = target.parentNode;
            }
            that.emit(Circle.event.click, target);
            evt.stopPropagation();
        });
    }
    /* Widget.prototype.afterRender = blank;
     Widget.prototype.beforeRender = blank;
     Widget.prototype.delegateTrigger = blank;
     Widget.prototype.domReady = blank;
     Widget.prototype.initTrigger = blank;*/
    return Circle;
});
