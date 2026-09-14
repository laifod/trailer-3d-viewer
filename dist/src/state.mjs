export const VIEWS = {
overview:{title:'整车总成',target:[-1.1,1.7,0],theta:1.10,phi:1.02,distance:25},
frame:{title:'车架',target:[-3.4,1.25,0],theta:1.22,phi:.84,distance:20},
coupling:{title:'牵引销与鞍座',target:[2.8,1.47,0],theta:2.4,phi:1.09,distance:3.0},
suspension:{title:'悬挂系统',target:[-7.3,.95,0],theta:1.02,phi:1.08,distance:7.6},
axle:{title:'车桥与制动',target:[-7.3,.63,0],theta:1.14,phi:1.21,distance:7.4},
support:{title:'支撑装置',target:[.25,.8,0],theta:.85,phi:1.2,distance:5.1},
guard:{title:'防护装置',target:[-4.5,.95,0],theta:1.35,phi:1.06,distance:16},
accessory:{title:'挂车附件',target:[-3.2,.9,0],theta:-1.1,phi:1.01,distance:10},
wheels:{title:'轮胎与轮毂',target:[-7.3,.75,0],theta:1.23,phi:1.28,distance:7.5},
cargo:{title:'挂车厢体',target:[-3.4,2.4,0],theta:1.15,phi:1.02,distance:22},
cab:{title:'驾驶室外观',target:[6.15,2.25,0],theta:.85,phi:1.12,distance:8.5},
interior:{title:'驾驶室内饰',target:[6.1,2.38,0],theta:1.85,phi:.55,distance:7.5},
engine:{title:'动力系统',target:[6.10,1.1,0],theta:1.05,phi:.65,distance:6.8}
};
export function initialState(systems){return {visible:Object.fromEntries(systems.map(([id])=>[id,true])),detail:2,view:'overview',opacity:.48,separation:0,cutaway:false};}
export function isVisible(meta,state){if(!state.visible[meta.system]||meta.detail>state.detail)return false;if(meta.shell&&state.opacity===0)return false;if(state.cutaway&&meta.cutawayHide)return false;return true;}
export function soloSystem(state,id){for(const key of Object.keys(state.visible))state.visible[key]=key===id;state.cutaway=id==='interior';}
export function showAll(state){for(const key of Object.keys(state.visible))state.visible[key]=true;state.cutaway=false;}
export function chassisOnly(state){const ids=['frame','coupling','suspension','axle','support','guard','accessory','wheels'];for(const key of Object.keys(state.visible))state.visible[key]=ids.includes(key);state.cutaway=false;}
export function cameraAngles(direction){return {iso:[1.10,1.02],left:[Math.PI/2,Math.PI/2],right:[-Math.PI/2,Math.PI/2],top:[Math.PI/2,.001],bottom:[Math.PI/2,Math.PI-.001],front:[0,Math.PI/2],back:[Math.PI,Math.PI/2]}[direction];}
