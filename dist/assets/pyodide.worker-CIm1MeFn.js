(function(P){"use strict";let n=null;const l=new Array(40).fill(0);function r(u,s){return{id:u,mode:s,_value:0,value(e){return e!==void 0?(this._value=e,self.postMessage({type:"PIN_UPDATE",pin:this.id,value:e}),e):this.mode===r.IN?l[this.id]||0:this._value},on(){this.value(1)},off(){this.value(0)}}}r.OUT=1,r.IN=0,r.PULL_UP=1,r.PULL_DOWN=2;const T={Pin:r,OUT:1,IN:0,PULL_UP:1,PULL_DOWN:2};function g(u){const s=u.split(`
`),i=[];for(let e=0;e<s.length;e++){const t=s[e],o=t.trim(),c=t.length-t.trimStart().length,p=o.startsWith("while "),d=o.startsWith("for ");if(p||d){const a=t.indexOf(":");if(a!==-1&&t.substring(a+1).trim().length>0)i.push(t);else{i.push(t);let y=c+4;if(e+1<s.length){const h=s[e+1],_=h.length-h.trimStart().length;_>c&&(y=_)}i.push(" ".repeat(y)+"await asyncio.sleep(0.02)")}}else i.push(t)}return i.join(`
`)}async function f(){n||(self.postMessage({type:"STATUS",status:"loading"}),n=await P.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"}),n.registerJsModule("machine",T),self.postMessage({type:"STATUS",status:"ready"}))}self.onmessage=async u=>{const{type:s,code:i,pin:e,value:t}=u.data;if(s==="INIT"){await f();return}if(s==="INPUT_UPDATE"){e!==void 0&&t!==void 0&&(l[e]=t,console.log(`Worker received INPUT_UPDATE: pin=${e}, value=${t}`),console.log("INPUT_STATES:",l));return}if(s==="RUN_CODE")try{n||await f();const o=n.runPython(`
import io
import sys

class OutputCapture(io.StringIO):
    def write(self, text):
        super().write(text)
        return len(text)

capture = OutputCapture()
sys.stdout = capture
capture
      `),p=`
import asyncio

async def __main__():
    try:
${g(i).split(`
`).map(a=>"        "+a).join(`
`)}
    except asyncio.CancelledError:
        pass  # Gracefully handle stop button

asyncio.ensure_future(__main__())
      `;await n.runPythonAsync(p),await new Promise(a=>setTimeout(a,100));const d=o.getvalue();n.runPython("sys.stdout = sys.__stdout__"),self.postMessage({type:"OUTPUT",output:d}),self.postMessage({type:"EXECUTION_COMPLETE"})}catch(o){self.postMessage({type:"ERROR",error:o.message})}if(s==="STOP"){if(n)try{await n.runPythonAsync(`
import asyncio
for task in asyncio.all_tasks():
    task.cancel()
        `)}catch{}self.postMessage({type:"STOPPED"})}}})(pyodide_mjs);
