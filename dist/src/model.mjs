import * as T from './three.module.mjs';
export function build(){
const root=new T.Group();root.name='Simplified tractor semitrailer';
const mats={white:new T.MeshStandardMaterial({color:0xf5f6f4,roughness:.62}),edge:new T.MeshStandardMaterial({color:0xcdd5db,roughness:.55}),glass:new T.MeshStandardMaterial({color:0x93a9ba,roughness:.3,metalness:.12}),blue:new T.MeshStandardMaterial({color:0x1854ab,roughness:.4,metalness:.18}),tire:new T.MeshStandardMaterial({color:0xdce1e3,roughness:.85}),shell:new T.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.48,roughness:.55,depthWrite:false,side:T.DoubleSide})};
for(const [n,m]of Object.entries(mats))m.name=n;
function mesh(n,g,m,x,y,z){const a=new T.Mesh(g,mats[m]);a.name=n;a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;root.add(a);return a;}
const box=(n,x,y,z,a,b,c,m='white')=>mesh(n,new T.BoxGeometry(a,b,c),m,x,y,z);
function cyl(n,x,y,z,r,len,m='white',axis='z'){const a=mesh(n,new T.CylinderGeometry(r,r,len,48),m,x,y,z);if(axis==='z')a.rotation.x=Math.PI/2;if(axis==='x')a.rotation.z=Math.PI/2;return a;}
function rounded(n,x,y,z,w,h,d,r=.05,m='white'){const sh=new T.Shape();sh.moveTo(-w/2+r,-h/2);sh.lineTo(w/2-r,-h/2);sh.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);sh.lineTo(w/2,h/2-r);sh.quadraticCurveTo(w/2,h/2,w/2-r,h/2);sh.lineTo(-w/2+r,h/2);sh.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);sh.lineTo(-w/2,-h/2+r);sh.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return mesh(n,new T.ExtrudeGeometry(sh,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:3,curveSegments:8}),m,x,y,z-d/2+r);}
function tube(n,pts,r,m='edge'){return mesh(n,new T.TubeGeometry((n.includes('perimeter seal') ? (()=>{const path=new T.CurvePath();for(let i=1;i<pts.length;i++)path.add(new T.LineCurve3(new T.Vector3(...pts[i-1]),new T.Vector3(...pts[i])));return path;})() : new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)))),Math.max(12,pts.length*8),r,8,false),m,0,0,0);}
function ring(n,x,y,z,r,t,m='edge',arc=Math.PI*2){return mesh(n,new T.TorusGeometry(r,t,8,64,arc),m,x,y,z);}
function perforatedDisc(n,x,y,z,outer,inner,count,hole,orbit,depth,m='white'){
const sh=new T.Shape();sh.absarc(0,0,outer,0,Math.PI*2,false);
if(inner){const h=new T.Path();h.absarc(0,0,inner,0,Math.PI*2,true);sh.holes.push(h);}
for(let i=0;i<count;i++){const a=i*Math.PI*2/count,h=new T.Path();h.absarc(Math.sin(a)*orbit,Math.cos(a)*orbit,hole,0,Math.PI*2,true);sh.holes.push(h);}
return mesh(n,new T.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelSegments:2,bevelSize:.002,bevelThickness:.002,curveSegments:32}),m,x,y,z-depth/2);
}
function profile(n,pts,depth,z,m='white'){const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(...p):s.moveTo(...p));s.closePath();const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035});return mesh(n,g,m,0,0,z-depth/2);}
// X longitudinal; front toward +X. Ground at Y=0. Units metres.
for(const z of [-.72,.72]){box('Tractor chassis rail',4.85,1.05,z,5.2,.23,.15);box('Trailer chassis rail',-3.45,1.26,z,12.6,.24,.16);}
for(let x=-9.4;x<2.8;x+=.85)box('Trailer floor crossmember',x,1.39,0,.07,.12,2.42);
box('Trailer deck',-3.4,1.51,0,13,.12,2.55);
// Tall cab with softly chamfered roof and sloping front windscreen.
const cabShape=new T.Shape();cabShape.moveTo(4.77,1.18);cabShape.lineTo(7.36,1.18);cabShape.quadraticCurveTo(7.48,1.18,7.48,1.34);cabShape.lineTo(7.48,2.48);cabShape.quadraticCurveTo(7.48,2.58,7.45,2.71);cabShape.lineTo(7.25,3.50);cabShape.quadraticCurveTo(7.18,3.73,6.91,3.89);cabShape.quadraticCurveTo(6.82,3.95,6.64,3.95);cabShape.lineTo(5.20,3.95);cabShape.quadraticCurveTo(4.79,3.94,4.70,3.52);cabShape.lineTo(4.70,1.28);cabShape.quadraticCurveTo(4.70,1.18,4.77,1.18);
// Hollow cab: independent side panels with genuine side-window openings.
const opening=new T.Path();opening.moveTo(6.005,2.56);opening.lineTo(6.005,3.37);opening.lineTo(7.20,3.37);opening.lineTo(7.415,2.56);opening.closePath();cabShape.holes.push(opening);
for(const s of [-1,1])mesh('Cab body side panel',new T.ExtrudeGeometry(cabShape,{depth:.04,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:3,curveSegments:18}),'white',-.025,0,s*1.20-.02);
const outline=cabShape.extractPoints(28).shape,skin=[];
for(let i=0;i<outline.length-1;i++){const a=outline[i],b=outline[i+1],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;if(mx>7.16&&my>2.51&&my<3.53)continue;skin.push(a.x-.025,a.y,-1.2,b.x-.025,b.y,-1.2,b.x-.025,b.y,1.2,a.x-.025,a.y,-1.2,b.x-.025,b.y,1.2,a.x-.025,a.y,1.2);}
const skinGeo=new T.BufferGeometry();skinGeo.setAttribute('position',new T.Float32BufferAttribute(skin,3));skinGeo.computeVertexNormals();const skinMesh=mesh('Cab body roof front and rear skin',skinGeo,'white',0,0,0);skinMesh.material=mats.white.clone();skinMesh.material.side=T.DoubleSide;
rounded('Sculpted roof cap',5.97,3.95,0,1.85,.11,2.22,.055);
rounded('Roof hatch',5.95,4.08,0,.76,.045,.82,.02,'edge');
for(const z of [-.86,.86])box('Roof raised rib',5.86,4.075,z,1.37,.025,.045);
for(const z of [-1.245,1.245]){
profile('Side window',[[5.9,2.55],[7.32,2.55],[7.10,3.38],[5.9,3.38]],.025,z,'glass');
box('Window pillar',6.47,2.98,z,.065,.81,.04);
rounded('Door lower panel',6.62,1.99,z,1.32,.78,.038,.016);
box('Door handle',6.02,2.34,z*1.01,.19,.045,.045,'edge');
box('Cab sleeper seam',5.62,2.36,z,.025,2.37,.028,'edge');
box('Mirror bracket',7.22,2.77,z*1.11,.11,.08,.30,'edge');
rounded('Mirror housing',7.19,2.97,z*1.23,.19,.43,.14,.04);
rounded('Mirror reflective insert',7.17,2.97,z*1.30,.12,.32,.025,.01,'glass');
rounded('Lower convex mirror',7.19,2.58,z*1.23,.18,.19,.13,.03);
box('Lower step',5.92,.64,z,.56,.13,.28);
box('Upper step',5.92,.89,z,.56,.12,.22);
for(let x=5.69;x<6.2;x+=.08){box('Step anti slip strip',x,.713,z,.025,.013,.22,'edge');box('Step anti slip strip',x,.958,z,.025,.013,.19,'edge');}
const s=Math.sign(z);
profile('Wheel arch lower cab skirt',[[5.55,.49],[6.07,.49],[6.08,.69],[6.20,.97],[6.41,1.16],[6.7,1.22],[6.99,1.16],[7.20,.97],[7.32,.69],[7.33,.49],[7.49,.49],[7.49,1.48],[5.55,1.48]],.10,z);
ring('Front wheel arch trim',6.70,.57,s*1.31,.645,.045,'white',Math.PI);
tube('Door panel seam',[[5.84,2.49,s*1.282],[5.84,1.55,s*1.282],[6.08,1.30,s*1.282],[6.83,1.30,s*1.282]],.009,'edge');
for(let y=2.68;y<3.2;y+=.105)box('Sleeper side vent',5.13,y,z*1.013,.40,.032,.02,'edge');
profile('Cab rear aerodynamic fin',[[4.48,1.48],[4.62,3.67],[4.85,3.94],[4.88,1.48]],.08,s*1.2);
}
const wind=box('Front windscreen',7.41,3.02,0,.035,.80,2.14,'glass');wind.rotation.z=.244;
box('Windscreen divider',7.44,3.03,0,.045,.80,.035,'edge').rotation.z=.244;
box('Front fascia',7.51,2.26,0,.07,.42,2.16);
box('Front grille recess',7.535,1.76,0,.07,.44,1.38,'edge');
for(let y=1.59;y<1.95;y+=.09)box('Grille slat',7.58,y,0,.055,.035,1.38);
box('Bumper',7.55,1.17,0,.15,.29,2.44);
for(const z of [-.92,.92])box('Headlamp',7.64,1.43,z,.04,.19,.37,'glass');
box('Number plate',7.645,1.15,0,.025,.12,.36,'edge');
for(const z of [-.6,.6]){tube('Wiper arm',[[7.52,2.58,z-.2],[7.49,2.73,z],[7.43,2.81,z+.22]],.014,'edge');const w=box('Wiper blade',7.465,2.78,z+.07,.026,.035,.48,'edge');w.rotation.x=.14;}
box('Sun visor',7.19,3.52,0,.23,.075,2.30);
for(const z of [-.96,-.48,0,.48,.96])box('Roof marker lamp',7.11,3.75,z,.11,.055,.13,'glass');
for(const z of [-.95,.95]){for(const zz of [-.09,.09])cyl('Headlight projector',7.672,1.45,z+zz,.059,.024,'white','x');box('LED daytime strip',7.68,1.34,z,.03,.03,.34);cyl('Lower fog lamp',7.66,1.06,z,.057,.024,'glass','x');}
for(let z=-.57;z<.65;z+=.12)box('Grille inner vane',7.576,1.77,z,.028,.37,.018,'glass');
cyl('Front badge',7.574,2.23,0,.11,.025,'edge','x');
for(const z of [-1,1]){cyl('Fuel tank',4.17,.91,z,.35,1.03,'edge','x');for(const x of [3.81,4.53])box('Tank strap',x,.95,z,.06,.61,.63);box('Rear wheel fender',2.57,1.53,z,1.61,.12,.55);}
box('Fifth wheel support',2.83,1.28,0,1.15,.16,1.3,'blue');cyl('Fifth wheel coupling',2.8,1.44,0,.57,.13,'blue','y');
function wheels(x,trailer){cyl('Blue axle',x,.57,0,.105,2.17,'blue');cyl('Axle central housing',x,.57,0,.19,.36,'blue');for(const s of [-1,1]){const z=s*1.10;
const pts=[[.32,-.165],[.42,-.17],[.50,-.145],[.545,-.10],[.55,-.045],[.541,-.034],[.55,-.022],[.55,.022],[.541,.034],[.55,.045],[.545,.10],[.50,.145],[.42,.17],[.32,.165],[.32,-.165]].map(p=>new T.Vector2(...p));const tyre=mesh('Rounded tyre with tread channels',new T.LatheGeometry(pts,64),'tire',x,.57,z);tyre.rotation.x=Math.PI/2;
ring('Sidewall raised bead',x,.57,s*1.255,.443,.012,'tire');ring('Rim polished lip',x,.57,s*1.28,.316,.022,'white');
const barrel=mesh('Open wheel barrel',new T.CylinderGeometry(.303,.285,.18,64,1,true),'edge',x,.57,s*1.20);barrel.rotation.x=Math.PI/2;
perforatedDisc('Wheel dish with ten true vent holes',x,.57,s*1.325,.294,.085,10,.038,.226,.026);
cyl('Wheel hub',x,.57,s*1.36,.105,.075,trailer?'blue':'edge');
for(let i=0;i<10;i++){const t=i*Math.PI/5;const nut=mesh('Hexagonal wheel nut',new T.CylinderGeometry(.023,.023,.03,6),'edge',x+Math.sin(t)*.15,.57+Math.cos(t)*.15,s*1.36);nut.rotation.x=Math.PI/2;ring('Wheel nut washer',x+Math.sin(t)*.15,.57+Math.cos(t)*.15,s*1.34,.025,.005,'edge');}
for(let i=0;i<48;i++){const t=i*Math.PI/24;const tread=box('Tyre transverse siping',x+Math.cos(t)*.545,.57+Math.sin(t)*.545,z,.015,.004,.22,'edge');tread.rotation.z=t-Math.PI/2;}
if(trailer||x<3){cyl('Inner dual tyre',x,.57,s*.76,.54,.28,'tire');box('Blue suspension arm',x+.15,.85,s*.73,.64,.10,.12,'blue');cyl('Air suspension bellows',x+.32,1.04,s*.73,.145,.27,'blue','y');for(const y of [.95,1.02,1.09]){const b=ring('Air spring convolution',x+.32,y,s*.73,.144,.015,'blue');b.rotation.x=Math.PI/2;}tube('Shock absorber',[[x-.27,.68,s*.74],[x-.10,1.20,s*.74]],.044,'edge');cyl('Brake chamber',x-.18,.62,s*.55,.11,.18,'blue','x');}
}}
[6.70,2.64].forEach(x=>wheels(x,false));[-8.55,-7.30,-6.05].forEach(x=>wheels(x,true));
for(const s of [-1,1]){box('Trailer side guard',-2.42,.94,s*1.19,4.3,.11,.10);for(const x of [-4.35,-.48])box('Side guard bracket',x,1.14,s*1.19,.08,.42,.08);box('Landing leg',.25,.83,s*.94,.15,1.12,.15,'blue');box('Landing foot',.25,.26,s*.94,.40,.09,.32,'blue');box('Trailer wheel cover',-7.30,1.30,s*1.17,3.72,.10,.40);}
box('Landing crossbar',.25,1.07,0,.12,.12,1.95,'blue');
box('Cargo left translucent wall',-3.4,2.84,-1.275,13,2.55,.045,'shell');box('Cargo right translucent wall',-3.4,2.84,1.275,13,2.55,.045,'shell');
box('Cargo roof',-3.4,4.13,0,13.02,.06,2.57,'shell');box('Cargo front wall',3.1,2.84,0,.06,2.55,2.55,'shell');box('Cargo rear wall',-9.9,2.84,0,.06,2.55,2.55,'shell');
for(const z of [-1.29,1.29]){box('Upper trailer edge',-3.4,4.13,z,13.06,.045,.045);box('Lower trailer edge',-3.4,1.57,z,13.06,.065,.05);for(const x of [-9.92,3.12])box('Cargo corner pillar',x,2.84,z,.05,2.58,.05);}
box('Rear door split',-9.94,2.84,0,.035,2.48,.027,'edge');for(const z of [-.72,.72])box('Rear door lock rod',-9.96,2.78,z,.035,2.2,.035,'edge');
box('Rear underrun bumper',-9.82,.54,0,.15,.15,2.38);for(const z of [-.9,.9])box('Rear bumper support',-9.70,.92,z,.12,.7,.1);
// Hardware remains restrained and follows the industrial white / blue palette.
for(const s of [-1,1]){
for(let x=-9.5;x<3;x+=.62){box('Curtain lower buckle',x,1.70,s*1.313,.065,.145,.035,'edge');box('Curtain buckle latch',x,1.68,s*1.338,.039,.043,.015);}
for(let x=-9.5;x<3;x+=2.5)box('Trailer side marker',x,1.48,s*1.329,.17,.055,.035,'glass');
for(const x of [-8.55,-7.30,-6.05,2.64]){ring('Mudguard arch',x,.57,s*1.09,.66,.055,'white',Math.PI);box('Mudflap',x-.59,.59,s*1.10,.035,.62,.40,'edge');}
for(const x of [-9.85,3.05])for(let y=1.9;y<4;y+=.67)box('Corner fastening plate',x,y,s*1.322,.12,.16,.025,'edge');
for(const y of [1.94,2.65,3.45]){box('Rear door hinge',-10.003,y,s*1.1,.055,.11,.28,'edge');cyl('Rear hinge pin',-10.015,y,s*1.15,.037,.19,'white','y');}
box('Rear lamp assembly',-9.95,1.24,s*.9,.09,.16,.47,'edge');for(const z of [.75,.91,1.07])cyl('Rear lamp lens',-10.007,1.24,s*z,.052,.018,'glass','x');
box('Landing telescopic inner leg',.25,.40,s*.94,.105,.55,.105,'edge');box('Landing gearbox',.25,1.12,s*1.04,.24,.22,.17,'blue');
tube('Landing crank',[[.25,1.13,s*1.12],[.25,1.13,s*1.37],[.45,.98,s*1.37],[.6,.98,s*1.37]],.022,'edge');
for(const x of [3.81,4.53]){const strap=ring('Fuel tank circumferential strap',x,.91,s,.354,.024,'white');strap.rotation.y=Math.PI/2;}
}
for(let x=1.8;x<4.5;x+=.48)box('Tractor chassis crossmember',x,1.11,0,.085,.13,1.48,'edge');
box('Catwalk platform',3.82,1.37,0,1.4,.07,1.28,'edge');for(let x=3.17;x<4.5;x+=.10)box('Catwalk traction ridge',x,1.414,0,.025,.018,1.18);
for(const z of [-.21,.21]){const pts=[];for(let i=0;i<=150;i++){const t=i/150;pts.push([4.67-t*.85,1.66+Math.sin(t*Math.PI)*.2+Math.cos(t*Math.PI*24)*.065,z+Math.sin(t*Math.PI*24)*.065]);}tube('Coiled tractor service line',pts,.014,'blue');}
for(const z of [-.43,.43])cyl('Trailer air reservoir',-4.8,1.05,z,.18,.78,'blue','x');
tube('Trailer brake line',[[-8.8,1.15,0],[-6,1.15,0],[-3,1.18,0],[.4,1.22,0],[2.8,1.30,0]],.021,'blue');
// Third pass: cab contours, seals, structural joints and service hardware.
for(const s of [-1,1]){
const z=s*1.297;
tube('Side window perimeter seal',[[5.92,2.56,z],[7.28,2.56,z],[7.08,3.36,z],[5.92,3.36,z],[5.92,2.56,z]],.016,'edge');
rounded('Door handle surround',6.02,2.34,s*1.302,.25,.09,.022,.009,'edge');rounded('Door pull',6.02,2.345,s*1.322,.15,.029,.025,.01);
cyl('Door lock cylinder',5.85,2.34,s*1.325,.023,.014,'edge');
tube('Upper mirror support',[[7.15,3.23,s*1.24],[7.24,3.30,s*1.43],[7.20,3.17,s*1.52]],.025);
rounded('Side indicator bezel',7.22,1.86,s*1.304,.18,.075,.026,.01,'edge');
rounded('Cab sill molding',5.11,1.22,s*1.285,.57,.16,.07,.025);
for(let y=1.48;y<2.33;y+=.12)box('Cab rear louver',4.66,y,s*.68,.055,.025,.42,'edge');
for(const x of [4.03,4.23])cyl('Tank filler boss',x,1.245,s,.064,.05,'white','y');
for(const x of [3.81,4.53])for(const y of [.76,1.05])cyl('Fuel strap fixing',x,y,s*1.355,.025,.018,'edge');
box('Trailer I beam upper flange',-3.45,1.405,s*.72,12.6,.025,.25,'edge');box('Trailer I beam lower flange',-3.45,1.128,s*.72,12.6,.025,.25,'edge');
for(let x=-9.3;x<2.8;x+=.85){box('Chassis joint reinforcement',x,1.26,s*.811,.18,.20,.024,'blue');for(const dx of [-.05,.05])for(const y of [1.21,1.31])cyl('Frame joint bolt',x+dx,y,s*.834,.017,.018,'white');}
for(const x of [-8.55,-7.3,-6.05,2.64]){
box('Suspension hanger plate',x+.43,1.10,s*.72,.22,.40,.075,'blue');cyl('Suspension pivot bolt',x+.43,.94,s*.775,.065,.055,'edge');
tube('Air spring supply hose',[[x+.32,1.17,s*.73],[x+.51,1.24,s*.55],[x+.10,1.18,s*.33]],.012,'blue');
for(const dx of [-.14,.14])tube('Axle U bolt',[[x+dx,.77,s*.63],[x+dx,.49,s*.63],[x+dx,.46,s*.80],[x+dx,.77,s*.80]],.016,'edge');
box('Spring clamp plate',x,.79,s*.72,.4,.055,.25,'blue');
}
for(let x=-9.55;x<3.05;x+=.42){cyl('Side rail rivet',x,1.545,s*1.329,.012,.014,'edge');}
for(const x of [-7.65,-4.35,-1.05]){box('Cargo removable upright',x,2.84,s*1.241,.055,2.52,.055,'edge');box('Upright foot bracket',x,1.64,s*1.24,.16,.14,.095);}
box('Rear door inner frame',-9.96,2.84,s*1.22,.07,2.49,.055);box('Rear door top frame',-9.96,4.065,s*.63,.07,.045,1.20);box('Rear door bottom frame',-9.96,1.63,s*.63,.07,.045,1.20);
for(const z0 of [.30,.87]){
const rz=s*z0;cyl('Rear locking rod',-10.035,2.84,rz,.026,2.36,'edge','y');
for(const y of [1.74,2.35,3.23,3.94]){box('Lock rod guide',-10.045,y,rz,.085,.065,.14);for(const dz of [-.052,.052])cyl('Lock guide screw',-10.093,y,rz+dz,.011,.014,'edge','x');}
box('Lock handle base',-10.05,2.19,rz,.08,.18,.11,'edge');tube('Door lock lever',[[-10.10,2.2,rz],[-10.15,2.12,rz+s*.14],[-10.15,2.12,rz+s*.23]],.018,'edge');
}
for(const y of [1.94,2.65,3.45])for(const dz of [-.08,.02])cyl('Door hinge fastener',-10.043,y,s*(1.1+dz),.018,.015,'white','x');
box('Rear reflector mount',-10.003,1.5,s*.75,.06,.14,.22,'edge');
rounded('Landing foot pivot housing',.25,.32,s*.94,.23,.12,.22,.02,'blue');cyl('Foot articulation pin',.25,.32,s*1.065,.033,.06,'edge');
for(let y=.46;y<.75;y+=.085)cyl('Landing leg adjustment hole',.25,y,s*1.005,.016,.014,'blue');
}
// Sloped front windshield surround follows the cab face.
for(const z of [-1.10,1.10])tube('Front windshield gasket',[[7.51,2.61,z],[7.31,3.41,z]],.021,'edge');
tube('Windshield lower gasket',[[7.51,2.61,-1.1],[7.51,2.60,0],[7.51,2.61,1.1]],.02,'edge');
tube('Windshield upper gasket',[[7.31,3.41,-1.1],[7.31,3.42,0],[7.31,3.41,1.1]],.02,'edge');
for(const y of [2.02,2.48])box('Front panel separation line',7.563,y,0,.014,.014,2.16,'edge');
for(const z of [-1.1,1.1]){box('Front corner intake recess',7.56,1.8,z,.07,.33,.14,'glass');for(let y=1.67;y<1.97;y+=.065)box('Corner intake vane',7.605,y,z,.025,.02,.14);}
rounded('Lower bumper chin',7.51,.92,0,.16,.13,2.25,.045);
for(const z of [-.55,.55]){cyl('Tow eye recess',7.655,1.12,z,.055,.018,'edge','x');cyl('Tow eye cover',7.669,1.12,z,.038,.012,'white','x');}
// Detailed powertrain replaces the earlier placeholder block.
cyl('Driveshaft',3.99,.68,0,.066,2.05,'blue','x');
for(const x of [3.08,4.90])cyl('Driveshaft universal joint',x,.68,0,.10,.13,'edge','x');
box('Battery enclosure',3.76,1.01,-.23,.68,.36,.55,'edge');
for(const z of [-.27,.27])tube('Chassis service pipe',[[4.85,1.19,z],[4.45,1.19,z],[3.7,1.20,z],[2.75,1.21,z]],.013,'blue');
for(let x=-9.3;x<2.9;x+=1.05)box('Cargo roof bow',x,4.075,0,.025,.045,2.45,'white');
// Fourth pass: brake assemblies, damper joints and fabricated brackets.
for(const x of [6.70,2.64,-8.55,-7.30,-6.05])for(const s of [-1,1]){
perforatedDisc('Ventilated brake rotor',x,.57,s*.96,.267,.12,18,.015,.225,.035,'edge');
rounded('Brake caliper body',x+.215,.62,s*.96,.16,.24,.22,.035,'blue');
for(const yy of [.55,.69])cyl('Caliper guide pin',x+.215,yy,s*1.09,.023,.07,'edge');
tube('Brake flexible hose',[[x+.22,.72,s*.90],[x+.34,.85,s*.65],[x+.08,1.08,s*.59]],.015,'blue');
ring('Hub grease cap seam',x,.57,s*1.404,.082,.006,'white');
cyl('Hub center plug',x,.57,s*1.413,.032,.016,'edge');
const va=.46;tube('Tyre inflation valve',[[x+Math.cos(va)*.276,.57+Math.sin(va)*.276,s*1.34],[x+Math.cos(va)*.27,.57+Math.sin(va)*.27,s*1.385]],.009,'edge');
if(x<3){
const top=[x-.10,1.20,s*.74],bottom=[x-.27,.68,s*.74];
const dir=new T.Vector3(...top).sub(new T.Vector3(...bottom));const damper=mesh('Damper lower pressure body',new T.CylinderGeometry(.058,.058,.32,32),'blue',x-.22,.83,s*.74);damper.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());
for(const p of [top,bottom]){ring('Damper mounting eye',p[0],p[1],p[2],.052,.017,'edge');cyl('Damper through bolt',p[0],p[1],s*.80,.023,.11,'white');}
box('Axle saddle',x,.70,s*.73,.24,.09,.31,'blue');
for(const dx of [-.14,.14])for(const zz of [.63,.80])cyl('U bolt locking nut',x+dx,.80,s*zz,.028,.055,'edge','y');
}
}
for(const s of [-1,1]){
for(const x of [-4.35,-.48]){profile('Side guard triangular gusset',[[x-.15,1.35],[x+.15,1.35],[x,.99]],.07,s*1.15,'edge');for(const y of [1.1,1.27])cyl('Side guard fastening nut',x,y,s*1.21,.025,.025,'white');}
for(let x=-9.5;x<3;x+=.62){const z=s*1.36;tube('Curtain buckle open loop',[[x-.027,1.70,z],[x-.027,1.64,z],[x+.027,1.64,z],[x+.027,1.70,z]],.008,'white');cyl('Buckle pivot pin',x,1.72,z,.012,.055,'edge','x');}
for(const x of [-9.85,3.05])for(let y=1.9;y<4;y+=.67)for(const dx of [-.034,.034])cyl('Corner plate rivet',x+dx,y,s*1.344,.013,.014,'white');
for(const x of [2.40,3.15]){box('Fifth wheel mounting pedestal',x,1.25,s*.51,.27,.27,.18,'blue');for(const xx of [-.075,.075])cyl('Fifth wheel base bolt',x+xx,1.40,s*.51,.032,.04,'edge','y');}
rounded('Wheel chock storage bracket',-5.0,1.03,s*1.15,.45,.19,.18,.025);profile('Stowed wheel chock',[[-5.16,1.05],[-4.85,1.05],[-4.85,1.23]],.15,s*1.16,'blue');
}
tube('Fifth wheel release handle',[[2.73,1.34,0],[2.57,1.32,.9],[2.34,1.32,1.05],[2.28,1.32,.91]],.025,'edge');
for(const z of [-.43,.43]){for(const x of [-5.08,-4.52]){const hoop=ring('Air reservoir retaining strap',x,1.05,z,.185,.015,'edge');hoop.rotation.y=Math.PI/2;}tube('Reservoir drain valve',[[-4.8,.88,z],[-4.8,.81,z],[-4.73,.81,z]],.014,'edge');}
for(const s of [-1,1])tube('Pneumatic distribution line',[[-5.0,1.16,s*.43],[-5.5,1.11,s*.40],[-6.2,1.12,s*.40],[-7.4,1.12,s*.40],[-8.55,1.10,s*.55]],.015,'blue');
box('Brake distribution valve block',-5.24,1.05,0,.26,.18,.35,'blue');for(const s of [-1,1])for(const x of [-5.31,-5.19])cyl('Pneumatic valve fitting',x,1.05,s*.20,.026,.055,'edge');
// Fifth pass: actual cabin furnishings, visible through the open window geometry.
box('Interior cab floor',6.04,1.60,0,2.36,.10,2.25,'edge');
rounded('Interior dashboard upper',7.03,2.43,0,.52,.18,2.13,.06,'edge');
rounded('Interior dashboard lower',7.10,2.18,0,.35,.42,2.02,.055);
rounded('Interior central console',6.83,2.20,0,.42,.52,.43,.05,'edge');
box('Interior media display bezel',6.61,2.33,0,.025,.23,.30,'blue');box('Interior media display glass',6.59,2.33,0,.01,.175,.245,'glass');
for(const z of [-.115,0,.115])cyl('Interior climate control knob',6.59,2.09,z,.035,.03,'white','x');
for(const z of [-.71,.71]){
box('Interior seat pedestal',6.02,1.86,z,.48,.34,.50,'blue');
for(const x of [5.86,6.19])box('Interior seat slide rail',x,1.68,z,.04,.055,.61,'edge');
rounded('Interior seat cushion',6.03,2.07,z,.62,.17,.61,.065,'edge');
const back=rounded('Interior seat backrest',5.73,2.49,z,.16,.72,.59,.055,'edge');back.rotation.z=-.10;
rounded('Interior seat headrest',5.72,2.98,z,.20,.25,.43,.05);
for(const ss of [-1,1])rounded('Interior seat side bolster',6.02,2.16,z+ss*.25,.56,.11,.11,.045);
for(const xx of [5.91,6.06,6.20])box('Interior cushion seam',xx,2.162,z,.012,.005,.36,'white');
tube('Interior seat belt',[[5.71,2.92,z-.23],[5.95,2.31,z+.22],[6.10,2.17,z+.26]],.022,'blue');
rounded('Interior door trim',6.45,2.04,Math.sign(z)*1.13,1.35,.53,.05,.02,'edge');
rounded('Interior door armrest',6.38,2.28,Math.sign(z)*1.07,.41,.075,.12,.025);
for(let x=6.23;x<6.48;x+=.07)box('Interior window switch',x,2.325,Math.sign(z)*1.075,.045,.018,.04,'blue');
}
// Left-hand-drive controls, ring and spokes lie on a tilted plane.
const steering=new T.Group();steering.name='Interior steering assembly';steering.position.set(6.64,2.57,.70);steering.rotation.z=-.45;
const sw=new T.Mesh(new T.TorusGeometry(.22,.024,12,64),mats.edge);sw.name='Interior steering rim';sw.rotation.y=Math.PI/2;steering.add(sw);
for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const sp=new T.Mesh(new T.BoxGeometry(.035,.20,.035),mats.white);sp.name='Interior steering spoke';sp.position.set(0,Math.cos(a)*.105,Math.sin(a)*.105);sp.rotation.x=a;steering.add(sp);}
const hub=new T.Mesh(new T.CylinderGeometry(.075,.075,.06,32),mats.blue);hub.name='Interior steering boss';hub.rotation.z=Math.PI/2;steering.add(hub);root.add(steering);
tube('Interior steering column',[[6.64,2.57,.7],[6.81,2.19,.7]],.045,'edge');
rounded('Interior instrument binnacle',6.83,2.55,.70,.16,.20,.54,.035,'blue');
for(const z of [.55,.83]){cyl('Interior instrument dial',6.739,2.57,z,.071,.015,'white','x');tube('Interior gauge needle',[[6.729,2.57,z],[6.728,2.61,z+.027]],.003,'blue');}
for(const z of [.56,.71,.88]){const pedal=box('Interior pedal',6.79,1.78,z,.13,.025,.075,'edge');pedal.rotation.z=-.40;}
rounded('Interior sleeper mattress',5.08,1.96,0,.57,.16,2.12,.05,'edge');rounded('Interior sleeper pillow',5.09,2.09,-.72,.40,.10,.49,.045);
for(const z of [-.7,.7])rounded('Interior overhead storage',5.91,3.63,z,.67,.24,.76,.045);
box('Interior dome light',6.36,3.75,0,.23,.025,.34,'glass');
for(const z of [-.54,.54])box('Interior sun visor',7.11,3.37,z,.09,.16,.79,'edge');
for(const z of [-.11,.11]){const cup=ring('Interior cup holder rim',6.47,1.98,z,.065,.012,'edge');cup.rotation.x=Math.PI/2;cyl('Interior cup holder recess',6.47,1.95,z,.053,.025,'blue','y');}
// Glazing is separate from lamp lenses and can be inspected in cabin mode.
box('Cab body windshield header',7.29,3.46,0,.105,.14,2.34);
for(const z of [-.22,0,.22]){cyl('Rear cab service socket',4.65,1.82,z,.065,.055,'blue','x');ring('Rear cab service collar',4.615,1.82,z,.046,.008,'edge').rotation.y=Math.PI/2;}
box('Trailer connector mounting panel',3.145,1.91,0,.06,.23,.67,'edge');for(const z of [-.22,0,.22])cyl('Trailer coupling socket',3.19,1.92,z,.055,.055,'blue','x');
const glazing=mats.glass.clone();glazing.name='Cab glazing';glazing.transparent=true;glazing.opacity=.30;glazing.depthWrite=false;glazing.side=T.DoubleSide;
root.traverse(o=>{if(o.isMesh&&(o.name==='Side window'||o.name==='Front windscreen'))o.material=glazing;});
// Sixth pass: concept inline-six diesel, cooling pack and transmission.
rounded('Powertrain cast crankcase',6.24,1.035,0,1.28,.39,.55,.045,'edge');
rounded('Powertrain oil sump',6.21,.76,0,1.13,.20,.45,.035,'white');
rounded('Powertrain cylinder head',6.24,1.32,0,1.29,.19,.56,.035,'white');
rounded('Powertrain rocker cover',6.24,1.455,0,1.17,.085,.40,.035,'blue');
for(let i=0;i<6;i++){
const x=5.73+i*.205;
box('Powertrain block reinforcing rib',x,1.01,0,.034,.36,.58,'white');
cyl('Powertrain injector cap',x,1.51,0,.042,.038,'edge','y');
for(const s of [-1,1]){cyl('Powertrain head bolt',x,1.425,s*.235,.020,.025,'edge','y');
tube('Powertrain exhaust runner',[[x,1.30,s*.28],[x,1.22,s*.40],[x+.065,1.17,s*.44]],.034,s>0?'edge':'blue');}
tube('Powertrain injection feed',[[x,1.48,.05],[x,1.46,.24],[x-.025,1.24,.31]],.008,'edge');
}
tube('Powertrain intake collector',[[5.66,1.19,-.44],[6.20,1.19,-.44],[6.87,1.19,-.44]],.065,'blue');
tube('Powertrain exhaust manifold',[[5.70,1.17,.44],[6.23,1.17,.44],[6.82,1.17,.44]],.053,'edge');
const turbo=ring('Powertrain turbocharger compressor housing',5.77,1.21,.49,.11,.045,'blue');
cyl('Powertrain turbo center cartridge',5.77,1.21,.49,.075,.23,'edge');
tube('Powertrain charge air pipe',[[5.77,1.32,.49],[5.82,1.50,.51],[6.51,1.50,.51],[6.99,1.30,.43]],.042,'blue');
for(const x of [5.89,6.50]){const c=ring('Powertrain charge pipe clamp',x,1.50,.51,.046,.007,'edge');c.rotation.y=Math.PI/2;}
cyl('Powertrain air filter canister',5.21,1.24,-.48,.18,.41,'white','x');
for(const x of [5.06,5.35]){const c=ring('Powertrain air cleaner retaining clip',x,1.24,-.48,.184,.009,'edge');c.rotation.y=Math.PI/2;}
tube('Powertrain intake air hose',[[5.42,1.24,-.48],[5.60,1.27,-.52],[5.74,1.22,-.44]],.072,'edge');
for(let x=5.43;x<5.60;x+=.035){const r=ring('Powertrain intake hose convolution',x,1.25,-.49,.075,.006,'edge');r.rotation.y=Math.PI/2;}
for(const x of [5.82,6.06]){cyl('Powertrain oil filter cartridge',x,.88,-.36,.062,.23,'white','y');cyl('Powertrain filter housing flange',x,1.005,-.36,.072,.027,'blue','y');}
cyl('Powertrain sump drain plug',6.30,.65,0,.029,.025,'edge','y');
// Accessory belt plane at the front of the engine.
for(const [y,z,r] of [[.94,0,.12],[1.19,-.23,.075],[1.22,.23,.068]]){
cyl('Powertrain accessory pulley',6.93,y,z,r,.045,'edge','x');const lip=ring('Powertrain pulley flange',6.959,y,z,r-.005,.008,'white');lip.rotation.y=Math.PI/2;
}
tube('Powertrain serpentine belt',[[6.953,.83,0],[6.953,.91,-.11],[6.953,1.17,-.30],[6.953,1.27,-.25],[6.953,1.29,.22],[6.953,1.20,.30],[6.953,.87,.09],[6.953,.83,0]],.012,'blue');
cyl('Powertrain alternator housing',6.72,1.19,-.23,.084,.25,'white','x');for(let x=6.62;x<6.84;x+=.035){const r=ring('Powertrain alternator vent fin',x,1.19,-.23,.086,.007,'edge');r.rotation.y=Math.PI/2;}
// Cooling pack, fan and hoses remain below the cabin floor.
box('Cooling radiator frame',7.18,1.03,0,.10,.94,.99,'edge');box('Cooling radiator core',7.245,1.03,0,.025,.81,.86,'blue');
for(let z=-.41;z<.43;z+=.028)box('Cooling radiator fin',7.265,1.03,z,.016,.79,.007,'edge');
for(const y of [.56,1.49])rounded('Cooling radiator header tank',7.18,y,0,.18,.10,.91,.035);
const fanRing=ring('Cooling fan shroud',7.06,1.03,0,.375,.027,'white');fanRing.rotation.y=Math.PI/2;
cyl('Cooling fan hub',7.065,1.03,0,.084,.08,'blue','x');
for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const blade=box('Cooling fan blade',7.066,1.03+Math.cos(a)*.225,Math.sin(a)*.225,.034,.28,.092,'white');blade.rotation.x=a;blade.rotation.y=.30;}
tube('Cooling upper coolant hose',[[6.83,1.40,-.20],[7.03,1.43,-.32],[7.17,1.46,-.34]],.040,'edge');
tube('Cooling lower coolant hose',[[7.17,.59,.30],[6.99,.59,.32],[6.74,.87,.27]],.042,'edge');
rounded('Cooling expansion reservoir',5.13,1.38,.53,.31,.25,.23,.035);cyl('Cooling pressure cap',5.13,1.52,.53,.052,.035,'blue','y');
// Transmission with bellhousing, ribs, service cover and flexible mounts.
cyl('Powertrain flywheel bellhousing',5.46,.99,0,.275,.28,'edge','x');
rounded('Powertrain gearbox main case',4.98,.91,0,.67,.40,.42,.055,'white');
for(let x=4.7;x<5.32;x+=.085)box('Powertrain gearbox stiffening rib',x,.91,0,.024,.43,.45,'edge');
cyl('Powertrain gearbox output housing',4.57,.86,0,.13,.26,'edge','x');
box('Powertrain transmission service cover',4.99,1.135,0,.38,.045,.27,'blue');
for(const x of [4.84,5.12])for(const z of [-.10,.10])cyl('Powertrain service cover bolt',x,1.165,z,.018,.018,'white','y');
for(const x of [5.65,6.73])for(const s of [-1,1]){box('Powertrain engine mounting arm',x,.92,s*.43,.17,.10,.35,'blue');cyl('Powertrain rubber engine mount',x,.84,s*.58,.069,.10,'edge','y');cyl('Powertrain mount through bolt',x,.95,s*.58,.026,.04,'white','y');}
tube('Powertrain exhaust downpipe',[[5.77,1.21,.64],[5.58,1.07,.67],[5.38,.71,.58],[4.93,.66,.62]],.047,'edge');
cyl('Powertrain exhaust aftertreatment canister',4.82,.73,.64,.12,.48,'white','x');
for(const x of [4.66,4.98]){const r=ring('Powertrain aftertreatment clamp',x,.73,.64,.125,.009,'edge');r.rotation.y=Math.PI/2;}
root.updateMatrixWorld(true);return root;
}



