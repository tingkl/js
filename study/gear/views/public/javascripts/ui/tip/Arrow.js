/**
 * Created with IntelliJ IDEA.
 * User: dingye
 * Date: 14-1-22
 * Time: 下午1:23
 * To change this template use File | Settings | File Templates.
 */
define(['ui.Widget'], 'ui.tip.Arrow', function (Widget) {
    function Arrow(config) {
        Arrow.superClass.call(this, config);
    }
    ClassManager.extend(Arrow, Widget);
    Arrow.wrap = function($dom, config) {
        var tip = ClassManager.create('ui.tip.Arrow', config);
        tip.render(function() {

        });
        $dom.hover(function() {
            tip.tip($dom.offset());
        }, function() {
            tip.hide();
        });
    }
    Arrow.prototype.tip = function(coordinate) {
        coordinate = coordinate || {};
        coordinate.display = 'block';
        $(this.root).css(coordinate);
    }
    return Arrow;
});
