var Module=typeof Module!=="undefined"?Module:{};try{this["Module"]=Module;Module.test}catch(e){this["Module"]=Module={}}if(typeof process==="object"){if(typeof FS==="object"){Module["preRun"]=Module["preRun"]||[];Module["preRun"].push(function(){FS.init();FS.mkdir("/test-data");FS.mount(NODEFS,{root:"."},"/test-data")})}}else{Module["print"]=function(x){var event=new Event("test-output");event.data=x;window.dispatchEvent(event)}}var moduleOverrides={};var key;for(key in Module){if(Module.hasOwnProperty(key)){moduleOverrides[key]=Module[key]}}Module["arguments"]=[];Module["thisProgram"]="./this.program";Module["quit"]=function(status,toThrow){throw toThrow};Module["preRun"]=[];Module["postRun"]=[];var ENVIRONMENT_IS_WEB=false;var ENVIRONMENT_IS_WORKER=false;var ENVIRONMENT_IS_NODE=false;var ENVIRONMENT_IS_SHELL=false;ENVIRONMENT_IS_WEB=typeof window==="object";ENVIRONMENT_IS_WORKER=typeof importScripts==="function";ENVIRONMENT_IS_NODE=typeof process==="object"&&typeof require==="function"&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}else{return scriptDirectory+path}}if(ENVIRONMENT_IS_NODE){scriptDirectory=__dirname+"/";var nodeFS;var nodePath;Module["read"]=function shell_read(filename,binary){var ret;ret=tryParseAsDataURI(filename);if(!ret){if(!nodeFS)nodeFS=require("fs");if(!nodePath)nodePath=require("path");filename=nodePath["normalize"](filename);ret=nodeFS["readFileSync"](filename)}return binary?ret:ret.toString()};Module["readBinary"]=function readBinary(filename){var ret=Module["read"](filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}assert(ret.buffer);return ret};if(process["argv"].length>1){Module["thisProgram"]=process["argv"][1].replace(/\\/g,"/")}Module["arguments"]=process["argv"].slice(2);if(typeof module!=="undefined"){module["exports"]=Module}process["on"]("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});process["on"]("unhandledRejection",abort);Module["quit"]=function(status){process["exit"](status)};Module["inspect"]=function(){return"[Emscripten Module object]"}}else if(ENVIRONMENT_IS_SHELL){if(typeof read!="undefined"){Module["read"]=function shell_read(f){var data=tryParseAsDataURI(f);if(data){return intArrayToString(data)}return read(f)}}Module["readBinary"]=function readBinary(f){var data;data=tryParseAsDataURI(f);if(data){return data}if(typeof readbuffer==="function"){return new Uint8Array(readbuffer(f))}data=read(f,"binary");assert(typeof data==="object");return data};if(typeof scriptArgs!="undefined"){Module["arguments"]=scriptArgs}else if(typeof arguments!="undefined"){Module["arguments"]=arguments}if(typeof quit==="function"){Module["quit"]=function(status){quit(status)}}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(document.currentScript){scriptDirectory=document.currentScript.src}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.lastIndexOf("/")+1)}else{scriptDirectory=""}Module["read"]=function shell_read(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText}catch(err){var data=tryParseAsDataURI(url);if(data){return intArrayToString(data)}throw err}};if(ENVIRONMENT_IS_WORKER){Module["readBinary"]=function readBinary(url){try{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}catch(err){var data=tryParseAsDataURI(url);if(data){return data}throw err}}}Module["readAsync"]=function readAsync(url,onload,onerror){var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=function xhr_onload(){if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}var data=tryParseAsDataURI(url);if(data){onload(data.buffer);return}onerror()};xhr.onerror=onerror;xhr.send(null)};Module["setWindowTitle"]=function(title){document.title=title}}else{}var out=Module["print"]||(typeof console!=="undefined"?console.log.bind(console):typeof print!=="undefined"?print:null);var err=Module["printErr"]||(typeof printErr!=="undefined"?printErr:typeof console!=="undefined"&&console.warn.bind(console)||out);for(key in moduleOverrides){if(moduleOverrides.hasOwnProperty(key)){Module[key]=moduleOverrides[key]}}moduleOverrides=undefined;var asm2wasmImports={"f64-rem":function(x,y){return x%y},"debugger":function(){debugger}};var functionPointers=new Array(8);if(typeof WebAssembly!=="object"){err("no native wasm support detected")}var wasmMemory;var wasmTable;var ABORT=false;var EXITSTATUS=0;function assert(condition,text){if(!condition){abort("Assertion failed: "+text)}}var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(u8Array,idx,maxBytesToRead){var endIdx=idx+maxBytesToRead;var endPtr=idx;while(u8Array[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder){return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))}else{var str="";while(idx<endPtr){var u0=u8Array[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=u8Array[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=u8Array[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|u8Array[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}}return str}function UTF8ToString(ptr,maxBytesToRead){return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""}function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;outU8Array[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;outU8Array[outIdx++]=192|u>>6;outU8Array[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;outU8Array[outIdx++]=224|u>>12;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;outU8Array[outIdx++]=240|u>>18;outU8Array[outIdx++]=128|u>>12&63;outU8Array[outIdx++]=128|u>>6&63;outU8Array[outIdx++]=128|u&63}}outU8Array[outIdx]=0;return outIdx-startIdx}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;if(u<=127)++len;else if(u<=2047)len+=2;else if(u<=65535)len+=3;else len+=4}return len}var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;function allocateUTF8OnStack(str){var size=lengthBytesUTF8(str)+1;var ret=stackAlloc(size);stringToUTF8Array(str,HEAP8,ret,size);return ret}var PAGE_SIZE=16384;var WASM_PAGE_SIZE=65536;var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateGlobalBufferViews(){Module["HEAP8"]=HEAP8=new Int8Array(buffer);Module["HEAP16"]=HEAP16=new Int16Array(buffer);Module["HEAP32"]=HEAP32=new Int32Array(buffer);Module["HEAPU8"]=HEAPU8=new Uint8Array(buffer);Module["HEAPU16"]=HEAPU16=new Uint16Array(buffer);Module["HEAPU32"]=HEAPU32=new Uint32Array(buffer);Module["HEAPF32"]=HEAPF32=new Float32Array(buffer);Module["HEAPF64"]=HEAPF64=new Float64Array(buffer)}var DYNAMIC_BASE=5248688,DYNAMICTOP_PTR=5552;var TOTAL_STACK=5242880;var TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;if(TOTAL_MEMORY<TOTAL_STACK)err("TOTAL_MEMORY should be larger than TOTAL_STACK, was "+TOTAL_MEMORY+"! (TOTAL_STACK="+TOTAL_STACK+")");if(Module["buffer"]){buffer=Module["buffer"]}else{if(typeof WebAssembly==="object"&&typeof WebAssembly.Memory==="function"){wasmMemory=new WebAssembly.Memory({"initial":TOTAL_MEMORY/WASM_PAGE_SIZE});buffer=wasmMemory.buffer}else{buffer=new ArrayBuffer(TOTAL_MEMORY)}Module["buffer"]=buffer}updateGlobalBufferViews();HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;function callRuntimeCallbacks(callbacks){while(callbacks.length>0){var callback=callbacks.shift();if(typeof callback=="function"){callback();continue}var func=callback.func;if(typeof func==="number"){if(callback.arg===undefined){Module["dynCall_v"](func)}else{Module["dynCall_vi"](func,callback.arg)}}else{func(callback.arg===undefined?null:callback.arg)}}}var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;var runtimeExited=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function ensureInitRuntime(){if(runtimeInitialized)return;runtimeInitialized=true;callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function exitRuntime(){runtimeExited=true}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}Module["preloadedImages"]={};Module["preloadedAudios"]={};var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0}var wasmBinaryFile="data:application/octet-stream;base64,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CyEFIAQgACABEDMaIAIgASACKAIUajYCFCABIAVqIQQLIAQLYQEBfyAAIAAsAEoiASABQf8BanI6AEogACgCACIBQQhxBH8gACABQSByNgIAQX8FIABBADYCCCAAQQA2AgQgACAAKAIsIgE2AhwgACABNgIUIAAgASAAKAIwajYCEEEACwvhAgEHfyMBIQcjAUEwaiQBIAdBIGohBSAHIgMgACgCHCIENgIAIAMgACgCFCAEayIENgIEIAMgATYCCCADIAI2AgwgA0EQaiIBIAAoAjw2AgAgASADNgIEIAFBAjYCCAJAAkAgAiAEaiIEQZIBIAEQAxATIgZGDQBBAiEIIAMhASAGIQMDQCADQQBOBEAgAUEIaiABIAMgASgCBCIJSyIGGyIBIAMgCUEAIAYbayIJIAEoAgBqNgIAIAEgASgCBCAJazYCBCAFIAAoAjw2AgAgBSABNgIEIAUgCCAGQR90QR91aiIINgIIIAQgA2siBEGSASAFEAMQEyIDRg0CDAELCyAAQQA2AhAgAEEANgIcIABBADYCFCAAIAAoAgBBIHI2AgAgCEECRgR/QQAFIAIgASgCBGsLIQIMAQsgACAAKAIsIgEgACgCMGo2AhAgACABNgIcIAAgATYCFAsgByQBIAILCQAgACABNwAAC0wBAX9BHhAJIgBBAEoEQEH0HiAANgIABUH0HigCACEACyAAQRBJBEAQBQVBACEAA0AgAEHQFmpBABACOgAAIABBAWoiAEEQRw0ACwsLKwECfyMBIQAjAUEQaiQBIAAiARAWIAAoAgAEfyABEBZBAAVBfwsaIAAkAQsMAEEHIAAgASACEAALDABBBiAAIAEgAhAACwwAQQUgACABIAIQAAsMAEEEIAAgASACEAALDABBAyAAIAEgAhAAC5wBAQd/IwEhASMBQfAAaiQBIAFB4ABqIQMgAUEgaiEEIAFBEGohBSABIQYDQCAAIAZqIAA6AAAgAEEBaiIAQRBHDQALQQAhAANAIAAgBGogADoAACAFIAQgAK0gBhBDQQAhAgNAIAMgAiAFai0AADYCACADEDYgAkEBaiICQRBHDQALQeALKAIAEDUgAEEBaiIAQcAARw0ACyABJAELDABBAiAAIAEgAhAACwwAQQEgACABIAIQAAsMAEEAIAAgASACEAALCABBByAAEAELCABBBiAAEAEL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YXJkID0gZnVuY3Rpb24oKSB7IHZhciBidWYgPSBuZXcgVWludDMyQXJyYXkoMSk7IGNyeXB0b18uZ2V0UmFuZG9tVmFsdWVzKGJ1Zik7IHJldHVybiBidWZbMF0gPj4+IDA7IH07IHJhbmRvbVZhbHVlc1N0YW5kYXJkKCk7IE1vZHVsZS5nZXRSYW5kb21WYWx1ZSA9IHJhbmRvbVZhbHVlc1N0YW5kYXJkOyB9IGNhdGNoIChlKSB7IHRyeSB7IHZhciBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKTsgdmFyIHJhbmRvbVZhbHVlTm9kZUpTID0gZnVuY3Rpb24oKSB7IHZhciBidWYgPSBjcnlwdG9bJ3JhbmRvbUJ5dGVzJ10oNCk7IHJldHVybiAoYnVmWzBdIDw8IDI0IHwgYnVmWzFdIDw8IDE2IHwgYnVmWzJdIDw8IDggfCBidWZbM10pID4+PiAwOyB9OyByYW5kb21WYWx1ZU5vZGVKUygpOyBNb2R1bGUuZ2V0UmFuZG9tVmFsdWUgPSByYW5kb21WYWx1ZU5vZGVKUzsgfSBjYXRjaCAoZSkgeyB0aHJvdyAnTm8gc2VjdXJlIHJhbmRvbSBudW1iZXIgZ2VuZXJhdG9yIGZvdW5kJzsgfSB9IH0gfQAtKyAgIDBYMHgAKG51bGwpAC0wWCswWCAwWC0weCsweCAweABpbmYASU5GAG5hbgBOQU4ALg==";if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile)}function getBinary(){try{if(Module["wasmBinary"]){return new Uint8Array(Module["wasmBinary"])}var binary=tryParseAsDataURI(wasmBinaryFile);if(binary){return binary}if(Module["readBinary"]){return Module["readBinary"](wasmBinaryFile)}else{throw"both async and sync fetching of the wasm failed"}}catch(err){abort(err)}}function getBinaryPromise(){if(!Module["wasmBinary"]&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)&&typeof fetch==="function"){return fetch(wasmBinaryFile,{credentials:"same-origin"}).then(function(response){if(!response["ok"]){throw"failed to load wasm binary file at '"+wasmBinaryFile+"'"}return response["arrayBuffer"]()}).catch(function(){return getBinary()})}return new Promise(function(resolve,reject){resolve(getBinary())})}function createWasm(env){var info={"env":env,"global":{"NaN":NaN,Infinity:Infinity},"global.Math":Math,"asm2wasm":asm2wasmImports};function receiveInstance(instance,module){var exports=instance.exports;Module["asm"]=exports;removeRunDependency("wasm-instantiate")}addRunDependency("wasm-instantiate");if(Module["instantiateWasm"]){try{return Module["instantiateWasm"](info,receiveInstance)}catch(e){err("Module.instantiateWasm callback failed with error: "+e);return false}}function receiveInstantiatedSource(output){receiveInstance(output["instance"])}function instantiateArrayBuffer(receiver){getBinaryPromise().then(function(binary){return WebAssembly.instantiate(binary,info)}).then(receiver,function(reason){err("failed to asynchronously prepare wasm: "+reason);abort(reason)})}if(!Module["wasmBinary"]&&typeof WebAssembly.instantiateStreaming==="function"&&!isDataURI(wasmBinaryFile)&&typeof fetch==="function"){WebAssembly.instantiateStreaming(fetch(wasmBinaryFile,{credentials:"same-origin"}),info).then(receiveInstantiatedSource,function(reason){err("wasm streaming compile failed: "+reason);err("falling back to ArrayBuffer instantiation");instantiateArrayBuffer(receiveInstantiatedSource)})}else{instantiateArrayBuffer(receiveInstantiatedSource)}return{}}Module["asm"]=function(global,env,providedBuffer){env["memory"]=wasmMemory;env["table"]=wasmTable=new WebAssembly.Table({"initial":32,"maximum":32,"element":"anyfunc"});env["__memory_base"]=1024;env["__table_base"]=0;var exports=createWasm(env);return exports};var ASM_CONSTS=[function(){return Module.getRandomValue()},function(){if(Module.getRandomValue===undefined){try{var window_="object"===typeof window?window:self;var crypto_=typeof window_.crypto!=="undefined"?window_.crypto:window_.msCrypto;var randomValuesStandard=function(){var buf=new Uint32Array(1);crypto_.getRandomValues(buf);return buf[0]>>>0};randomValuesStandard();Module.getRandomValue=randomValuesStandard}catch(e){try{var crypto=require("crypto");var randomValueNodeJS=function(){var buf=crypto["randomBytes"](4);return(buf[0]<<24|buf[1]<<16|buf[2]<<8|buf[3])>>>0};randomValueNodeJS();Module.getRandomValue=randomValueNodeJS}catch(e){throw"No secure random number generator found"}}}}];function _emscripten_asm_const_i(code){return ASM_CONSTS[code]()}var SYSCALLS={buffers:[null,[],[]],printChar:function(stream,curr){var buffer=SYSCALLS.buffers[stream];if(curr===0||curr===10){(stream===1?out:err)(UTF8ArrayToString(buffer,0));buffer.length=0}else{buffer.push(curr)}},varargs:0,get:function(varargs){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret},getStr:function(){var ret=UTF8ToString(SYSCALLS.get());return ret},get64:function(){var low=SYSCALLS.get(),high=SYSCALLS.get();return low},getZero:function(){SYSCALLS.get()}};function ___syscall140(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(),offset_high=SYSCALLS.get(),offset_low=SYSCALLS.get(),result=SYSCALLS.get(),whence=SYSCALLS.get();var offset=offset_low;FS.llseek(stream,offset,whence);HEAP32[result>>2]=stream.position;if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall146(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.get(),iov=SYSCALLS.get(),iovcnt=SYSCALLS.get();var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAP32[iov+i*8>>2];var len=HEAP32[iov+(i*8+4)>>2];for(var j=0;j<len;j++){SYSCALLS.printChar(stream,HEAPU8[ptr+j])}ret+=len}return ret}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall54(which,varargs){SYSCALLS.varargs=varargs;try{return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function ___syscall6(which,varargs){SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD();FS.close(stream);return 0}catch(e){if(typeof FS==="undefined"||!(e instanceof FS.ErrnoError))abort(e);return-e.errno}}function _abort(){Module["abort"]()}function _emscripten_memcpy_big(dest,src,num){HEAPU8.set(HEAPU8.subarray(src,src+num),dest)}function ___setErrNo(value){if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;return value}function _sysconf(name){switch(name){case 30:return PAGE_SIZE;case 85:var maxHeapSize=2*1024*1024*1024-65536;return maxHeapSize/PAGE_SIZE;case 132:case 133:case 12:case 137:case 138:case 15:case 235:case 16:case 17:case 18:case 19:case 20:case 149:case 13:case 10:case 236:case 153:case 9:case 21:case 22:case 159:case 154:case 14:case 77:case 78:case 139:case 80:case 81:case 82:case 68:case 67:case 164:case 11:case 29:case 47:case 48:case 95:case 52:case 51:case 46:return 200809;case 79:return 0;case 27:case 246:case 127:case 128:case 23:case 24:case 160:case 161:case 181:case 182:case 242:case 183:case 184:case 243:case 244:case 245:case 165:case 178:case 179:case 49:case 50:case 168:case 169:case 175:case 170:case 171:case 172:case 97:case 76:case 32:case 173:case 35:return-1;case 176:case 177:case 7:case 155:case 8:case 157:case 125:case 126:case 92:case 93:case 129:case 130:case 131:case 94:case 91:return 1;case 74:case 60:case 69:case 70:case 4:return 1024;case 31:case 42:case 72:return 32;case 87:case 26:case 33:return 2147483647;case 34:case 1:return 47839;case 38:case 36:return 99;case 43:case 37:return 2048;case 0:return 2097152;case 3:return 65536;case 28:return 32768;case 44:return 32767;case 75:return 16384;case 39:return 1e3;case 89:return 700;case 71:return 256;case 40:return 255;case 2:return 100;case 180:return 64;case 25:return 20;case 5:return 16;case 6:return 6;case 73:return 4;case 84:{if(typeof navigator==="object")return navigator["hardwareConcurrency"]||1;return 1}}___setErrNo(22);return-1}var ASSERTIONS=false;function intArrayToString(array){var ret=[];for(var i=0;i<array.length;i++){var chr=array[i];if(chr>255){if(ASSERTIONS){assert(false,"Character code "+chr+" ("+String.fromCharCode(chr)+")  at offset "+i+" not in 0x00-0xFF.")}chr&=255}ret.push(String.fromCharCode(chr))}return ret.join("")}var decodeBase64=typeof atob==="function"?atob:function(input){var keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{enc1=keyStr.indexOf(input.charAt(i++));enc2=keyStr.indexOf(input.charAt(i++));enc3=keyStr.indexOf(input.charAt(i++));enc4=keyStr.indexOf(input.charAt(i++));chr1=enc1<<2|enc2>>4;chr2=(enc2&15)<<4|enc3>>2;chr3=(enc3&3)<<6|enc4;output=output+String.fromCharCode(chr1);if(enc3!==64){output=output+String.fromCharCode(chr2)}if(enc4!==64){output=output+String.fromCharCode(chr3)}}while(i<input.length);return output};function intArrayFromBase64(s){if(typeof ENVIRONMENT_IS_NODE==="boolean"&&ENVIRONMENT_IS_NODE){var buf;try{buf=Buffer.from(s,"base64")}catch(_){buf=new Buffer(s,"base64")}return new Uint8Array(buf.buffer,buf.byteOffset,buf.byteLength)}try{var decoded=decodeBase64(s);var bytes=new Uint8Array(decoded.length);for(var i=0;i<decoded.length;++i){bytes[i]=decoded.charCodeAt(i)}return bytes}catch(_){throw new Error("Converting base64 string to bytes failed.")}}function tryParseAsDataURI(filename){if(!isDataURI(filename)){return}return intArrayFromBase64(filename.slice(dataURIPrefix.length))}function jsCall_ii(index,a1){return functionPointers[index](a1)}function jsCall_iiii(index,a1,a2,a3){return functionPointers[index](a1,a2,a3)}var asmGlobalArg={};var asmLibraryArg={"e":abort,"b":jsCall_ii,"a":jsCall_iiii,"i":___syscall140,"d":___syscall146,"h":___syscall54,"g":___syscall6,"f":_abort,"c":_emscripten_asm_const_i,"k":_emscripten_memcpy_big,"j":_sysconf};var asm=Module["asm"](asmGlobalArg,asmLibraryArg,buffer);Module["asm"]=asm;var ___errno_location=Module["___errno_location"]=function(){return Module["asm"]["l"].apply(null,arguments)};var _main=Module["_main"]=function(){return Module["asm"]["m"].apply(null,arguments)};var stackAlloc=Module["stackAlloc"]=function(){return Module["asm"]["n"].apply(null,arguments)};Module["asm"]=asm;function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}ExitStatus.prototype=new Error;ExitStatus.prototype.constructor=ExitStatus;var calledMain=false;dependenciesFulfilled=function runCaller(){if(!Module["calledRun"])run();if(!Module["calledRun"])dependenciesFulfilled=runCaller};Module["callMain"]=function callMain(args){args=args||[];ensureInitRuntime();var argc=args.length+1;var argv=stackAlloc((argc+1)*4);HEAP32[argv>>2]=allocateUTF8OnStack(Module["thisProgram"]);for(var i=1;i<argc;i++){HEAP32[(argv>>2)+i]=allocateUTF8OnStack(args[i-1])}HEAP32[(argv>>2)+argc]=0;try{var ret=Module["_main"](argc,argv,0);exit(ret,true)}catch(e){if(e instanceof ExitStatus){return}else if(e=="SimulateInfiniteLoop"){Module["noExitRuntime"]=true;return}else{var toLog=e;if(e&&typeof e==="object"&&e.stack){toLog=[e,e.stack]}err("exception thrown: "+toLog);Module["quit"](1,e)}}finally{calledMain=true}};function run(args){args=args||Module["arguments"];if(runDependencies>0){return}preRun();if(runDependencies>0)return;if(Module["calledRun"])return;function doRun(){if(Module["calledRun"])return;Module["calledRun"]=true;if(ABORT)return;ensureInitRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(Module["_main"]&&shouldRunNow)Module["callMain"](args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}Module["run"]=run;function exit(status,implicit){if(implicit&&Module["noExitRuntime"]&&status===0){return}if(Module["noExitRuntime"]){}else{ABORT=true;EXITSTATUS=status;exitRuntime();if(Module["onExit"])Module["onExit"](status)}Module["quit"](status,new ExitStatus(status))}function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}if(what!==undefined){out(what);err(what);what=JSON.stringify(what)}else{what=""}ABORT=true;EXITSTATUS=1;throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."}Module["abort"]=abort;if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"]){shouldRunNow=false}Module["noExitRuntime"]=true;run();
