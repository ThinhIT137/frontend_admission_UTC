const ts = require('typescript');
module.exports = function(source) {
 if (this.resourcePath.endsWith('.css')) return '';
 return ts.transpileModule(source, {compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext,esModuleInterop:true},fileName:this.resourcePath}).outputText;
};
