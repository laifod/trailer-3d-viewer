import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SYSTEMS,build} from '../dist/src/systems.mjs';
import {initialState,isVisible,soloSystem,showAll,chassisOnly,VIEWS,cameraAngles} from '../dist/src/state.mjs';
const model=build(),parts=[],systems=new Set(SYSTEMS.map(([id])=>id));
model.traverse(o=>{if(!o.isMesh)return;assert(systems.has(o.userData.system),o.name+' has no system');assert([0,1,2].includes(o.userData.detail));
 o.userData.shell=o.material.name==='shell';parts.push(o);const p=o.geometry.attributes.position;assert(p&&p.count>0,o.name);for(const n of p.array)assert(Number.isFinite(n),'nonfinite vertex in '+o.name);
});
const state=initialState(SYSTEMS),count=()=>parts.filter(o=>isVisible(o.userData,state)).length;
assert.equal(count(),parts.length);
for(const[id]of SYSTEMS){soloSystem(state,id);const subset=parts.filter(o=>isVisible(o.userData,state));assert(subset.length>0,id);assert(subset.every(o=>o.userData.system===id));}
showAll(state);const full=count();state.detail=1;const structural=count();state.detail=0;const basic=count();assert(basic>0&&basic<structural&&structural<full,'detail levels must change visible geometry');
state.detail=2;state.visible.cargo=false;state.opacity=1;assert(parts.filter(o=>o.userData.system==='cargo').every(o=>!isVisible(o.userData,state)),'opacity must not override hidden category');
chassisOnly(state);const before=count();state.view='coupling';assert.equal(count(),before,'camera focus must not alter visibility');
assert(parts.filter(o=>o.userData.assembly==='upper').length>=5,'kingpin must be independently separable');
showAll(state);state.opacity=0;assert(parts.filter(o=>o.userData.shell).every(o=>!isVisible(o.userData,state)));state.opacity=.48;assert.equal(count(),full);
for(const[id]of SYSTEMS)assert(VIEWS[id]);for(const id of ['iso','left','right','top','bottom','front','back'])assert(cameraAngles(id).every(Number.isFinite));
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');for(const file of [...html.matchAll(/(?:href|src)="(\.\/[^"#]+)"/g)].map(m=>m[1])){if(file.endsWith('trailer.glb'))continue;assert(fs.existsSync(new URL('../dist/'+file.slice(2),import.meta.url)),'missing local asset '+file);}
console.log(JSON.stringify({parts:parts.length,full,structural,basic,systems:SYSTEMS.map(([id])=>({id,parts:parts.filter(o=>o.userData.system===id).length}))},null,2));
