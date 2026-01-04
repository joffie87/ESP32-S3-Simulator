(function(){"use strict";const g=async()=>(await import("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.mjs")).loadPyodide;let n=null;const d=new Array(40).fill(0);function a(s,o){return{id:s,mode:o,_value:0,value(e){return e!==void 0?(this._value=e,self.postMessage({type:"PIN_UPDATE",pin:this.id,value:e}),e):this.mode===a.IN?d[this.id]||0:this._value},on(){this.value(1)},off(){this.value(0)}}}a.OUT=1,a.IN=0,a.PULL_UP=1,a.PULL_DOWN=2;const m={Pin:a,OUT:1,IN:0,PULL_UP:1,PULL_DOWN:2};function _(s){const o=s.split(`
`),i=[];for(let e=0;e<o.length;e++){const t=o[e],r=t.trim(),c=t.length-t.trimStart().length,u=r.startsWith("while "),p=r.startsWith("for ");if(u||p){const l=t.indexOf(":");if(l!==-1&&t.substring(l+1).trim().length>0)i.push(t);else{i.push(t);let f=c+4;if(e+1<o.length){const P=o[e+1],h=P.length-P.trimStart().length;h>c&&(f=h)}i.push(" ".repeat(f)+"await asyncio.sleep(0.02)")}}else i.push(t)}return i.join(`
`)}async function y(){if(!n)try{console.log("[Pyodide Worker] Starting initialization..."),self.postMessage({type:"STATUS",status:"loading"}),console.log("[Pyodide Worker] Loading Pyodide from CDN..."),n=await(await g())({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"}),console.log("[Pyodide Worker] Pyodide loaded successfully"),n.registerJsModule("machine",m),console.log("[Pyodide Worker] Machine module registered"),self.postMessage({type:"STATUS",status:"ready"}),console.log("[Pyodide Worker] Initialization complete")}catch(s){console.error("[Pyodide Worker] Initialization failed:",s),self.postMessage({type:"ERROR",error:`Failed to load Pyodide: ${s.message}`}),self.postMessage({type:"STATUS",status:"error"})}}self.onmessage=async s=>{const{type:o,code:i,pin:e,value:t}=s.data;if(o==="INIT"){await y();return}if(o==="INPUT_UPDATE"){e!==void 0&&t!==void 0&&(d[e]=t,console.log(`Worker received INPUT_UPDATE: pin=${e}, value=${t}`),console.log("INPUT_STATES:",d));return}if(o==="RUN_CODE")try{n||await y();const r=n.runPython(`
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
${_(i).split(`
`).map(l=>"        "+l).join(`
`)}
    except asyncio.CancelledError:
        pass  # Gracefully handle stop button

asyncio.ensure_future(__main__())
      `;await n.runPythonAsync(u),await new Promise(l=>setTimeout(l,100));const p=r.getvalue();n.runPython("sys.stdout = sys.__stdout__"),self.postMessage({type:"OUTPUT",output:p}),self.postMessage({type:"EXECUTION_COMPLETE"})}catch(r){self.postMessage({type:"ERROR",error:r.message})}if(o==="STOP"){if(n)try{await n.runPythonAsync(`
import asyncio
for task in asyncio.all_tasks():
    task.cancel()
        `)}catch{}self.postMessage({type:"STOPPED"})}}})();
