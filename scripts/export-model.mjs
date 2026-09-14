import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build,SYSTEMS} from '../dist/src/systems.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const model=build(),chunks=[],materialIds=new Map();let byteOffset=0,triangles=0;
const g={asset:{version:'2.0',generator:'Trailer Lab / seven systems'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],bufferViews:[],accessors:[],buffers:[]};
const parents=new Map();for(const[id,label]of SYSTEMS){parents.set(id,g.nodes.length);g.scenes[0].nodes.push(g.nodes.length);g.nodes.push({name:label,children:[],extras:{system:id}});}
function accessor(attr,target){let array=attr.array,componentType=array instanceof Float32Array?5126:array instanceof Uint16Array?5123:array instanceof Uint32Array?5125:null;if(!componentType)throw Error('Unsupported attribute');const data=Buffer.from(array.buffer,array.byteOffset,array.byteLength),view=g.bufferViews.length;g.bufferViews.push({buffer:0,byteOffset,byteLength:data.length,target});chunks.push(data);byteOffset+=data.length;const padding=(4-byteOffset%4)%4;if(padding){chunks.push(Buffer.alloc(padding));byteOffset+=padding;}
 const a={bufferView:view,componentType,count:attr.count,type:attr.itemSize===1?'SCALAR':attr.itemSize===2?'VEC2':'VEC3'};
 if(target===34962&&attr.itemSize===3){a.min=[Infinity,Infinity,Infinity];a.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<array.length;i++){const j=i%3;a.min[j]=Math.min(a.min[j],array[i]);a.max[j]=Math.max(a.max[j],array[i]);}}
 const id=g.accessors.length;g.accessors.push(a);return id;
}
model.updateMatrixWorld(true);model.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone().applyMatrix4(o.matrixWorld),m=o.material;let material=materialIds.get(m);if(material===undefined){material=g.materials.length;materialIds.set(m,material);g.materials.push({name:m.name,pbrMetallicRoughness:{baseColorFactor:[m.color.r,m.color.g,m.color.b,m.opacity],roughnessFactor:m.roughness,metallicFactor:m.metalness},alphaMode:m.transparent?'BLEND':'OPAQUE',doubleSided:m.side===2});}
 const primitive={attributes:{POSITION:accessor(geo.attributes.position,34962),NORMAL:accessor(geo.attributes.normal,34962)},material};if(geo.index)primitive.indices=accessor(geo.index,34963);triangles+=(geo.index?.count||geo.attributes.position.count)/3;
 const node=g.nodes.length;g.nodes[parents.get(o.userData.system)].children.push(node);g.nodes.push({name:o.name,mesh:g.meshes.length,extras:{system:o.userData.system,detail:o.userData.detail,assembly:o.userData.assembly||'fixed'}});g.meshes.push({primitives:[primitive]});geo.dispose();
});
g.buffers.push({byteLength:byteOffset});let json=Buffer.from(JSON.stringify(g));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const binary=Buffer.concat(chunks),head=Buffer.alloc(20),bh=Buffer.alloc(8);head.writeUInt32LE(0x46546c67,0);head.writeUInt32LE(2,4);head.writeUInt32LE(28+json.length+binary.length,8);head.writeUInt32LE(json.length,12);head.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(binary.length,0);bh.writeUInt32LE(0x004e4942,4);const file=path.join(root,'dist/assets/trailer.glb');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.concat([head,json,bh,binary]));
const summary={parts:g.meshes.length,triangles,bytes:fs.statSync(file).size,systems:SYSTEMS.length};fs.writeFileSync(path.join(root,'dist/assets/model-info.json'),JSON.stringify(summary,null,2));console.log(summary);
