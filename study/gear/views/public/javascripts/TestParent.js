/**
 * Created by dingye on 2014/5/7.
 */
define(['a.b.a', 'a.b.b', 'a.b.c'], 'TestParent', function () {
    function TestParent() {
        this.name = "parent";
        this.style = 'parent';
    }

    return TestParent;
});