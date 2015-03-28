MyClass=function(a){this.b=a};MyClass.prototype.a=function(){alert(this.b)};window.MyClass=MyClass;MyClass.prototype.myMethod=MyClass.prototype.a;
