#### 2.0.0.160731

- 1.增强bingo.compile 

```javascript
  bingo.compile({ tmpl:'{{include src="inc1" /}}', node:document.body, ctrl:null}).then(....)
```

- 2.app.tmpl 与 cp.$loadTmpl 支持子模板 

```javascript
  app.tmpl('user/tmpls', { tmplid:'userinof'}).then(....)
  cp.$loadTmpl('user/tmpls', { tmplid:'userinof'}).then(....)
```

- 3. route promise 添加参数 context 

```javascript
  app.route({
	promise:function(url, p , context){
	  //context 为route解释后的内容
	  return bingo.Promise(....);
	}
  });
```

- 4.强化{{route}} 

- 5.优化代码 

