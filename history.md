#### 2.0.0.160814

1. 增强bingo.compile 

```javascript
  bingo.compile({ tmpl:'{{include src="inc1" /}}', node:document.body, ctrl:null}).then(....)
```

2. app.tmpl 与 cp.$loadTmpl 支持子模板 

```javascript
  app.tmpl('user/tmpls', { tmplid:'userinof'}).then(....)
  cp.$loadTmpl('user/tmpls', { tmplid:'userinof'}).then(....)
```

3. route promise 添加参数 context 

```javascript
  app.route({
	promise:function(url, p , context){
	  //context 为route解释后的内容
	  return bingo.Promise(....);
	}
  });
```

4. 强化{{route}} 

5. {{include}} 的$export为cp, 并支持src属性

6. {{view with="true/false" /}} 添加with属性支持默认为true, 使用with模式； 如果为false时{{this.userName}}指令内容要添加this

7. 优化代码(编译性能提升30%)

