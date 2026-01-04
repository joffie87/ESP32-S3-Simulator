(function(g){"use strict";let o=null;const d=new Array(40).fill(0);function a(n,s){return{id:n,mode:s,_value:0,value(e){return e!==void 0?(this._value=e,self.postMessage({type:"PIN_UPDATE",pin:this.id,value:e}),e):this.mode===a.IN?d[this.id]||0:this._value},on(){this.value(1)},off(){this.value(0)}}}a.OUT=1,a.IN=0,a.PULL_UP=1,a.PULL_DOWN=2;const _={Pin:a,OUT:1,IN:0,PULL_UP:1,PULL_DOWN:2};function m(n){const s=n.split(`
`),i=[];for(let e=0;e<s.length;e++){const t=s[e],r=t.trim(),c=t.length-t.trimStart().length,u=r.startsWith("while "),p=r.startsWith("for ");if(u||p){const l=t.indexOf(":");if(l!==-1&&t.substring(l+1).trim().length>0)i.push(t);else{i.push(t);let f=c+4;if(e+1<s.length){const P=s[e+1],h=P.length-P.trimStart().length;h>c&&(f=h)}i.push(" ".repeat(f)+"await asyncio.sleep(0.02)")}}else i.push(t)}return i.join(`
`)}async function y(){if(!o)try{console.log("[Pyodide Worker] Starting initialization..."),self.postMessage({type:"STATUS",status:"loading"}),console.log("[Pyodide Worker] Loading Pyodide from CDN..."),o=await g.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"}),console.log("[Pyodide Worker] Pyodide loaded successfully"),o.registerJsModule("machine",_),console.log("[Pyodide Worker] Machine module registered"),self.postMessage({type:"STATUS",status:"ready"}),console.log("[Pyodide Worker] Initialization complete")}catch(n){console.error("[Pyodide Worker] Initialization failed:",n),self.postMessage({type:"ERROR",error:`Failed to load Pyodide: ${n.message}`}),self.postMessage({type:"STATUS",status:"error"})}}self.onmessage=async n=>{const{type:s,code:i,pin:e,value:t}=n.data;if(s==="INIT"){await y();return}if(s==="INPUT_UPDATE"){e!==void 0&&t!==void 0&&(d[e]=t,console.log(`Worker received INPUT_UPDATE: pin=${e}, value=${t}`),console.log("INPUT_STATES:",d));return}if(s==="RUN_CODE")try{o||await y();const r=o.runPython(`
import io
import sys

class OutputCapture(io.StringIO):
    def write(self, text):
        super().write(text)
        return len(text)

capture = OutputCapture()
sys.stdout = capture
capture
      `),u=`
import asyncio

async def __main__():
    try:
${m(i).split(`
`).map(l=>"        "+l).join(`
`)}
    except asyncio.CancelledError:
        pass  # Gracefully handle stop button

asyncio.ensure_future(__main__())
      `;await o.runPythonAsync(u),await new Promise(l=>setTimeout(l,100));const p=r.getvalue();o.runPython("sys.stdout = sys.__stdout__"),self.postMessage({type:"OUTPUT",output:p}),self.postMessage({type:"EXECUTION_COMPLETE"})}catch(r){self.postMessage({type:"ERROR",error:r.message})}if(s==="STOP"){if(o)try{await o.runPythonAsync(`
import asyncio
for task in asyncio.all_tasks():
    task.cancel()
        `)}catch{}self.postMessage({type:"STOPPED"})}}})(pyodide_mjs);
