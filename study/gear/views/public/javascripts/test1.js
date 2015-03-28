/**
 * Created by dingye on 2014/5/7.
 */
define(['TestParent','a.b.b'], 'Test1', function(TestParent) {
    function Test1() {
        arguments.callee.superClass.call(this);
        this.name = 'test1';
    }
    ClassManager.extend(Test1, TestParent);
    return Test1;
});