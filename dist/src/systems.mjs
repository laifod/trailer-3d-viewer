import * as T from './three.module.mjs';
import { build as buildBase } from './model.mjs';

export const SYSTEMS = [
  ['frame','车架','变截面纵梁、横梁、加劲板'],
  ['coupling','牵引销与鞍座','安装板、牵引销、锁止与释放机构'],
  ['suspension','悬挂系统','导向臂、气囊、减振器、调平连杆'],
  ['axle','车桥与制动','轴管、轮端、制动盘与气室'],
  ['support','支撑装置','伸缩支腿、传动轴、摇柄、底脚'],
  ['guard','防护装置','侧防护、后防护、挡泥板'],
  ['accessory','挂车附件','工具箱、备胎架、气路与灯具'],
  ['wheels','轮胎与轮毂','轮胎、通风轮毂与紧固件'],
  ['cargo','挂车厢体','车厢、顶弓、帘扣与后门'],
  ['cab','驾驶室外观','车头外壳、玻璃和外饰'],
  ['interior','驾驶室内饰','座椅、仪表台和卧铺'],
  ['engine','动力系统','发动机、冷却与传动']
];

function classify(n, c) {
  if (/^Interior/.test(n)) return 'interior';
  if (/^Powertrain|^Cooling|Driveshaft/.test(n)) return 'engine';
  if (/chock/i.test(n)) return 'accessory';
  if (n==='Trailer deck') return 'cargo';
  if (/Fifth wheel|kingpin/i.test(n)) return 'coupling';
  if (/Landing|Foot articulation|Side guard|underrun|Rear bumper|Mudflap|Mudguard|wheel cover/i.test(n))
    return /Landing|Foot articulation/i.test(n)?'support':'guard';
  if (/Air spring|Air suspension|Suspension|Damper|Shock|Spring clamp|U bolt|Axle saddle/i.test(n)) return 'suspension';
  if (/Blue axle|Axle central|Brake|Caliper|rotor|Pneumatic/i.test(n)) return 'axle';
  if (/tyre|wheel|rim|lug|hub/i.test(n) && !/arch|fender/i.test(n)) return 'wheels';
  if (/Cargo|Curtain|Upright|Upper trailer|Lower trailer|Corner fastening|Corner plate|Side rail rivet|Rear door|Rear locking|Rear hinge|Lock rod|Lock guide|Lock handle|Door lock lever|Door hinge|Buckle/.test(n)) return 'cargo';
  if (/chassis|crossmember|I beam|joint reinforcement|Frame joint|Catwalk/i.test(n)) return 'frame';
  if (c.x<4.6 && /hose|pipe|line|reservoir|service|socket|connector|chock|lamp|reflector/i.test(n)) return 'accessory';
  return c.x<3.3 ? 'accessory':'cab';
}

export function build() {
  const root=buildBase();root.name='Trailer Lab / seven-system detailed assembly';
  const mats={};root.traverse(o=>{if(o.isMesh&&!mats[o.material.name])mats[o.material.name]=o.material;});
  const removed=[];
  root.traverse(o=>{if(!o.isMesh)return;
    const c=new T.Box3().setFromObject(o).getCenter(new T.Vector3());
    o.userData.system=classify(o.name,c);
    o.userData.detail=/bolt|screw|nut|rivet|washer|needle|siping|seam|clip|lug|fin$|vent fin|guide pin/i.test(o.name)?2:/hose|pipe|line|valve|clamp|bracket|handle|hinge|rib|gasket/i.test(o.name)?1:0;
    o.userData.label=o.name;o.userData.originalPosition=o.position.toArray();
    if (/^(Trailer chassis rail|Trailer I beam upper flange|Trailer I beam lower flange|Fifth wheel coupling)$/.test(o.name))removed.push(o);
  });
  removed.forEach(o=>{o.removeFromParent();o.geometry.dispose();});
  function add(system,label,geo,position,material='white',detail=0,assembly='fixed') {
    const m=new T.Mesh(geo,mats[material]||mats.white);m.name=label;m.position.fromArray(position);m.castShadow=m.receiveShadow=true;
    m.userData={system,label,detail,assembly,originalPosition:[...position]};root.add(m);return m;
  }
  const box=(s,n,p,d,m='white',l=0,a='fixed')=>add(s,n,new T.BoxGeometry(...d),p,m,l,a);
  function cylinder(s,n,p,r,h,m='blue',axis='y',l=0,a='fixed',rTop=r){const o=add(s,n,new T.CylinderGeometry(rTop,r,h,32),p,m,l,a);if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;return o;}
  function rod(s,n,a,b,r,m='edge',l=1){const va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va);const o=add(s,n,new T.CylinderGeometry(r,r,d.length(),12),va.add(vb).multiplyScalar(.5).toArray(),m,l);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
  function pipe(s,n,pts,r=.015,m='blue',l=1){const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)));return add(s,n,new T.TubeGeometry(curve,Math.min(100,pts.length*12),r,8,false),[0,0,0],m,l);}
  function profile(s,n,pts,depth,z,m='white',l=0,a='fixed') {const sh=new T.Shape();pts.forEach((p,i)=>i?sh.lineTo(...p):sh.moveTo(...p));sh.closePath();return add(s,n,new T.ExtrudeGeometry(sh,{depth,bevelEnabled:false}),[0,0,z-depth/2],m,l,a);}
  function bolt(s,p,axis='z',r=.018,a='fixed') {const o=add(s,'六角螺栓与垫圈',new T.CylinderGeometry(r,r,.027,6),p,'edge',2,a);if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;cylinder(s,'螺栓垫圈',p,r*1.4,.006,'white',axis,2,a);return o;}
  function annulus(s,n,p,outer,inner,depth,axis='z',m='edge',l=1){const sh=new T.Shape();sh.absarc(0,0,outer,0,Math.PI*2);const hole=new T.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);sh.holes.push(hole);const o=add(s,n,new T.ExtrudeGeometry(sh,{depth,bevelEnabled:false,curveSegments:24}),p,m,l);if(axis==='y')o.rotation.x=-Math.PI/2;if(axis==='x')o.rotation.y=Math.PI/2;return o;}

  // Fabricated tapered I beams, with lighter front neck and full-depth rear web.
  for(const z of [-.72,.72]){
    profile('frame','变截面纵梁腹板',[[-9.85,1.12],[-.8,1.12],[1.10,1.30],[3.05,1.30],[3.05,1.41],[-9.85,1.41]],.032,z);
    box('frame','纵梁上翼缘',[-3.4,1.425,z],[12.9,.026,.25]);
    box('frame','主梁下翼缘',[-5.325,1.107,z],[9.05,.026,.25]);
    const slope=box('frame','鹅颈过渡翼缘',[.15,1.197,z],[1.91,.026,.25]);slope.rotation.z=Math.atan2(.18,1.9);
    box('frame','鹅颈前段下翼缘',[2.075,1.287,z],[1.95,.026,.25]);
    for(let x=-9.2;x<2.7;x+=.85){const lower=x<-.8?1.12:x<1.1?1.12+(x+.8)*.18/1.9:1.30;
      box('frame','腹板竖向加劲肋',[x,(lower+1.41)/2,z],[.025,1.41-lower,.18],'edge',1);
      rod('frame','纵梁角焊缝',[x-.024,lower,z+.016],[x-.024,1.40,z+.016],.006,'edge',2);
    }
    for(const x of [-9.55,-5.45,-.55,2.7])profile('frame','横梁三角连接板',[[x-.14,1.41],[x+.14,1.41],[x,1.18]],.018,z+Math.sign(z)*.095,'blue',1);
  }
  for(const x of [-8.9,-5.6,-2.1,.8]){rod('frame','车架斜撑',[x-.38,1.34,-.67],[x+.38,1.34,.67],.03,'edge');rod('frame','车架交叉斜撑',[x-.38,1.34,.67],[x+.38,1.34,-.67],.03,'edge');}

  // Actual stepped kingpin and slotted fifth wheel, independently separable in the UI.
  box('coupling','牵引销上安装板',[2.80,1.525,0],[1.24,.06,1.13],'white',0,'upper');
  cylinder('coupling','牵引销安装法兰',[2.80,1.485,0],.16,.035,'edge','y',0,'upper');
  cylinder('coupling','牵引销承载肩部',[2.80,1.425,0],.055,.095,'blue','y',0,'upper');
  cylinder('coupling','牵引销锁止颈部',[2.80,1.352,0],.032,.055,'edge','y',0,'upper');
  cylinder('coupling','牵引销底部止挡',[2.80,1.311,0],.050,.027,'blue','y',0,'upper');
  for(let i=0;i<8;i++){const t=i*Math.PI/4;bolt('coupling',[2.8+Math.cos(t)*.116,1.555,Math.sin(t)*.116],'y',.016,'upper');}
  // Shape coordinates are in plan (X/Z), extruded down from the bearing surface.
  const saddle=new T.Shape();saddle.moveTo(-.54,-.47);saddle.lineTo(.32,-.51);saddle.quadraticCurveTo(.65,-.47,.65,0);saddle.quadraticCurveTo(.65,.47,.32,.51);saddle.lineTo(-.54,.47);saddle.lineTo(-.54,.18);saddle.lineTo(.06,.042);saddle.absarc(.06,0,.042,Math.PI/2,-Math.PI/2,true);saddle.lineTo(-.54,-.18);saddle.closePath();
  const fifth=add('coupling','开口鞍座承载面',new T.ExtrudeGeometry(saddle,{depth:.065,bevelEnabled:true,bevelSize:.015,bevelThickness:.008,bevelSegments:2,curveSegments:24}),[2.74,1.465,0],'blue');fifth.rotation.x=Math.PI/2;
  for(const z of [-.06,.06])box('coupling','锁止钳口',[2.80,1.352,z],[.18,.035,.045],'edge',1);
  rod('coupling','释放联动杆',[2.64,1.33,.065],[2.35,1.33,.80],.018,'edge',1);
  cylinder('coupling','鞍座摆动铰轴',[2.8,1.30,0],.067,1.20,'edge','z',1);
  for(const z of [-.36,.36])pipe('coupling','鞍座润滑油槽',[[2.31,1.478,z],[2.63,1.48,z],[2.95,1.48,z*.87],[3.21,1.478,z*.55]],.007,'edge',2);

  for(const x of [-8.55,-7.30,-6.05]){
    for(const s of [-1,1]){
      const z=s*.73;
      profile('suspension','空气悬挂导向臂',[[x-.47,.92],[x-.17,.71],[x+.24,.68],[x+.43,.88],[x+.32,.95],[x+.08,.85],[x-.2,.86]],.14,z,'blue');
      annulus('suspension','导向臂橡胶衬套',[x-.38,.89,z+s*.095],.075,.032,.024,'z','edge');
      cylinder('suspension','气囊上压盘',[x+.32,1.19,z],.174,.032,'white','y');
      cylinder('suspension','气囊下活塞',[x+.32,.89,z],.142,.055,'edge','y');
      for(const yy of [.965,1.025,1.085]){const b=add('suspension','气囊橡胶褶皱',new T.TorusGeometry(.146,.022,10,32),[x+.32,yy,z],'blue',1);b.rotation.x=Math.PI/2;}
      box('suspension','调平阀安装支架',[x-.15,1.19,s*.49],[.12,.10,.06],'white',1);
      cylinder('suspension','高度调节阀',[x-.15,1.14,s*.48],.036,.07,'edge','z',1);
      rod('suspension','调平阀连杆',[x-.15,1.13,s*.44],[x+.02,.67,s*.44],.012,'blue',1);
      for(const zz of [s*.66,s*.80])bolt('suspension',[x+.32,1.213,zz],'y');
      cylinder('axle','轮端轴颈',[x,.57,s*.85],.105,.32,'edge','z');
      annulus('axle','制动支架法兰',[x,.57,s*.89],.20,.11,.023,'z','blue');
      for(let i=0;i<6;i++){const t=i*Math.PI/3;bolt('axle',[x+Math.cos(t)*.163,.57+Math.sin(t)*.163,s*.917]);}
      cylinder('axle','双腔弹簧制动气室',[x-.29,.64,s*.52],.109,.27,'blue','x');
      cylinder('axle','气室抱箍',[x-.26,.64,s*.52],.118,.020,'edge','x',1);
      rod('axle','制动推杆',[x-.15,.64,s*.52],[x+.09,.64,s*.52],.022,'edge',1);
      rod('axle','制动调整臂',[x+.09,.64,s*.52],[x+.12,.52,s*.60],.030,'blue',1);
      pipe('axle','ABS传感线',[[x,.69,s*.90],[x+.10,.81,s*.65],[x-.11,1.02,s*.39]],.006,'edge',2);
      bolt('axle',[x-.3,.75,s*.52],'y');
    }
    annulus('axle','轴管焊接加强环',[x,.57,-.12],.117,.105,.025,'z','edge',1);
  }

  for(const s of [-1,1]){
    const z=s*.94;
    box('support','支腿纵梁连接座',[.25,1.30,z],[.32,.29,.09],'white');
    for(const xx of [.16,.34])for(const yy of [1.23,1.36])bolt('support',[xx,yy,z+s*.065]);
    rod('support','支腿纵向撑杆',[.25,.65,z],[1.14,1.37,z],.030,'edge');
    rod('support','支腿横向斜撑',[.25,.77,z],[.25,1.37,s*.21],.026,'edge');
    box('support','伸缩腿口防尘圈',[.25,.68,z],[.17,.04,.17],'edge',1);
    cylinder('support','伸缩丝杠示意',[.25,.85,z],.032,.84,'edge','y',1);
    for(let y=.66;y<1.17;y+=.034){const r=add('support','丝杠螺纹示意',new T.TorusGeometry(.033,.005,6,20),[.25,y,z],'edge',2);r.rotation.x=Math.PI/2;}
    box('support','加宽支撑底脚',[.25,.16,z],[.44,.045,.38],'white');
    for(const zz of [-.12,.12])profile('support','底脚加强筋',[[.07,.18],[.43,.18],[.25,.29]],.02,z+zz,'blue',1);
    cylinder('support','两速齿轮箱盖',[.25,1.15,z+s*.17],.09,.05,'white','z',1);
    for(let i=0;i<4;i++){const t=i*Math.PI/2;bolt('support',[.25+Math.cos(t)*.063,1.15+Math.sin(t)*.063,z+s*.205]);}
    pipe('support','摇柄防脱挂钩',[[.66,1.22,s*1.12],[.66,1.12,s*1.20],[.63,1.10,s*1.22]],.012,'edge',2);
    box('guard','双层侧防护下横梁',[-2.42,.67,s*1.20],[4.3,.09,.095],'white');
    for(const x of [-4.35,-2.45,-.48]){
      box('guard','侧防护铰接支架',[x,.91,s*1.15],[.085,.64,.095],'edge');
      cylinder('guard','侧防护折叠铰销',[x,1.17,s*1.2],.032,.11,'blue','z',1);
      for(const y of [.71,.96])bolt('guard',[x,y,s*1.26]);
    }
    box('guard','后防护连接板',[-9.67,.99,s*.85],[.18,.49,.05],'blue');
    for(const yy of [.83,1.13])bolt('guard',[-9.67,yy,s*.887]);
    box('guard','后防护梁端盖',[-9.83,.54,s*1.215],[.155,.16,.026],'edge',1);
    for(const x of [-8.55,-7.30,-6.05])box('guard','挡泥板压条',[x-.61,.82,s*1.10],[.048,.055,.40],'white',1);
  }
  cylinder('support','支腿同步传动轴',[.25,1.15,0],.033,1.93,'edge','z');

  box('accessory','挂车工具箱壳体',[-3.6,.97,-1.0],[1.08,.43,.43],'white');
  box('accessory','工具箱门密封框',[-3.6,.97,-1.231],[.99,.35,.025],'edge',1);
  box('accessory','工具箱门板',[-3.6,.97,-1.249],[.95,.31,.022],'white');
  for(const x of [-3.97,-3.23]){box('accessory','工具箱锁扣',[x,.99,-1.272],[.075,.12,.023],'blue',1);bolt('accessory',[x,1.028,-1.29]);}
  const spare=add('accessory','吊装备用轮胎',new T.TorusGeometry(.38,.145,12,48),[-2.8,.70,0],'tire');spare.rotation.x=Math.PI/2;
  annulus('accessory','备胎轮圈',[-2.8,.57,0],.28,.12,.07,'y','white');
  for(const z of [-.37,.37])rod('accessory','备胎吊架',[-3.38,.50,z],[-2.22,.50,z],.025,'edge');
  for(const x of [-3.25,-2.35])rod('accessory','备胎固定吊杆',[x,.53,0],[x,1.35,0],.018,'blue',1);
  box('accessory','制动接线盒',[-4.28,1.05,.34],[.24,.20,.16],'blue',1);
  for(const x of [-4.35,-4.22])cylinder('accessory','防水电缆接头',[x,1.05,.46],.022,.08,'edge','z',2);
  pipe('accessory','尾灯线束走向',[[-4.25,1.14,.35],[-6,1.18,.34],[-8.7,1.18,.34],[-9.65,1.17,.80]],.012,'blue',1);
  for(const s of [-1,1]){box('accessory','后部橡胶缓冲块',[-10.02,1.43,s*1.08],[.14,.20,.17],'edge');}
  box('accessory','车架铭牌',[-1.14,1.29, .753],[.22,.09,.012],'edge',2);
  root.updateMatrixWorld(true);
  root.traverse(o=>{if(o.isMesh){o.userData.originalPosition=o.position.toArray();o.userData.originalQuaternion=o.quaternion.toArray();}});
  return root;
}
