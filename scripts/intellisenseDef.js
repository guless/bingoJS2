
window.intellisenseAnnotate = function (obj, objDoc) {
    /// <summary>
    /// 对像添加注释
    /// </summary>
    /// <param name="obj"></param>
    /// <param name="objDoc"></param>
    window.intellisense && intellisense.annotate(obj, objDoc);
};

window.intellisenseSetCallContext = function (func, thisArg, args) {
    /// <summary>
    /// 设置方法上下文
    /// </summary>
    /// <param name="func" type="function">要设置方法</param>
    /// <param name="thisArg">设置方法this对象</param>
    /// <param name="args">设置方法参数, 数组(多个参数)或单个参数</param>
    if (!window.intellisense) return;
    var context = { thisArg: thisArg };
    if (arguments.length > 2)
        context.args = pxj.isArray(args) ? args : [args];

    intellisense.setCallContext(func, context);
};

window.intellisenseRedirectDefinition = function (item, defintion) {
    /// <summary>
    /// 设置定义引用
    /// </summary>
    /// <param name="item">要设置变量</param>
    /// <param name="defintion">定义变量</param>

    window.intellisense && intellisense.redirectDefinition(item, defintion);
};
window.intellisenseLogMessage = function (msg) {
    /// <summary>
    /// 打印信息
    /// </summary>
    var list = [];
    for (var i = 0, len = arguments.length; i < len; i++) {
        list.push(arguments[i]);
    }

    window.intellisense && intellisense.logMessage(list.join(','));
};
