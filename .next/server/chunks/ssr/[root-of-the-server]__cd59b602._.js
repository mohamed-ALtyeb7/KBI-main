module.exports=[36313,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.HooksClientContext},18341,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.ServerInsertedHtml},56704,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},20635,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},32319,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},9270,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.AppRouterContext},38783,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactServerDOMTurbopackClient},41710,a=>{"use strict";let b=(0,a.i(70106).default)("Clock",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16 14",key:"68esgv"}]]);a.s(["Clock",()=>b],41710)},45222,a=>{"use strict";let b=(0,a.i(70106).default)("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);a.s(["MessageCircle",()=>b],45222)},87532,a=>{"use strict";let b=(0,a.i(70106).default)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);a.s(["Search",()=>b],87532)},24987,a=>{"use strict";let b=(0,a.i(70106).default)("MapPin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);a.s(["MapPin",()=>b],24987)},70106,a=>{"use strict";var b=a.i(72131);let c=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var d={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let e=(0,b.forwardRef)(({color:a="currentColor",size:e=24,strokeWidth:f=2,absoluteStrokeWidth:g,className:h="",children:i,iconNode:j,...k},l)=>(0,b.createElement)("svg",{ref:l,...d,width:e,height:e,stroke:a,strokeWidth:g?24*Number(f)/Number(e):f,className:c("lucide",h),...k},[...j.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(i)?i:[i]])),f=(a,d)=>{let f=(0,b.forwardRef)(({className:f,...g},h)=>(0,b.createElement)(e,{ref:h,iconNode:d,className:c(`lucide-${a.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,f),...g}));return f.displayName=`${a}`,f};a.s(["default",()=>f],70106)},46058,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},39118,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={DEFAULT_SEGMENT_KEY:function(){return l},PAGE_SEGMENT_KEY:function(){return k},addSearchParamsIfPageSegment:function(){return i},computeSelectedLayoutSegment:function(){return j},getSegmentValue:function(){return f},getSelectedLayoutSegmentPath:function(){return function a(b,c,d=!0,e=[]){let g;if(d)g=b[1][c];else{let a=b[1];g=a.children??Object.values(a)[0]}if(!g)return e;let h=f(g[0]);return!h||h.startsWith(k)?e:(e.push(h),a(g,c,!1,e))}},isGroupSegment:function(){return g},isParallelRouteSegment:function(){return h}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});function f(a){return Array.isArray(a)?a[1]:a}function g(a){return"("===a[0]&&a.endsWith(")")}function h(a){return a.startsWith("@")&&"@children"!==a}function i(a,b){if(a.includes(k)){let a=JSON.stringify(b);return"{}"!==a?k+"?"+a:k}return a}function j(a,b){if(!a||0===a.length)return null;let c="children"===b?a[0]:a[a.length-1];return c===l?null:c}let k="__PAGE__",l="__DEFAULT__"},54427,(a,b,c)=>{"use strict";function d(){let a,b,c=new Promise((c,d)=>{a=c,b=d});return{resolve:a,reject:b,promise:c}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"createPromiseWithResolvers",{enumerable:!0,get:function(){return d}})},79808,a=>{"use strict";let b=(0,a.i(70106).default)("Wrench",[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",key:"cbrjhi"}]]);a.s(["Wrench",()=>b],79808)},67900,a=>{"use strict";let b=(0,a.i(70106).default)("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]]);a.s(["Building2",()=>b],67900)},92258,a=>{"use strict";let b=(0,a.i(70106).default)("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);a.s(["Mail",()=>b],92258)},42021,a=>{"use strict";var b=a.i(87924),c=a.i(68114);function d({children:a,className:d,hoverEffect:e=!0}){return(0,b.jsxs)("div",{className:(0,c.cn)("glass rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden group transition-transform duration-300 will-change-transform",e&&"glass-hover hover:-translate-y-1 hover:shadow-2xl",d),children:[(0,b.jsx)("div",{className:"absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"}),a]})}a.s(["GlassCard",()=>d])},63519,a=>{"use strict";let b=(0,a.i(70106).default)("Phone",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]]);a.s(["Phone",()=>b],63519)},60246,a=>{"use strict";let b=(0,a.i(70106).default)("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);a.s(["Users",()=>b],60246)},1631,a=>{"use strict";let b=(0,a.i(70106).default)("Smartphone",[["rect",{width:"14",height:"20",x:"5",y:"2",rx:"2",ry:"2",key:"1yt0o3"}],["path",{d:"M12 18h.01",key:"mhygvu"}]]);a.s(["Smartphone",()=>b],1631)},1027,a=>{"use strict";let b=(0,a.i(70106).default)("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);a.s(["Zap",()=>b],1027)},93518,a=>{"use strict";let b=(0,a.i(70106).default)("Award",[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]);a.s(["Award",()=>b],93518)},4416,a=>{"use strict";let b=(0,a.i(70106).default)("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);a.s(["ShieldCheck",()=>b],4416)},11300,a=>{"use strict";let b=(0,a.i(70106).default)("ClipboardList",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);a.s(["ClipboardList",()=>b],11300)},10227,a=>{"use strict";let b=(0,a.i(70106).default)("Truck",[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]]);a.s(["Truck",()=>b],10227)},46864,a=>{"use strict";let b=(0,a.i(70106).default)("UserCheck",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["polyline",{points:"16 11 18 13 22 9",key:"1pwet4"}]]);a.s(["UserCheck",()=>b],46864)},43204,a=>{"use strict";var b=a.i(87924),c=a.i(46271),d=a.i(32860),e=a.i(45222),f=a.i(63519),g=a.i(38246),h=a.i(1312);function i(){let a=(0,h.useT)();return(0,b.jsx)("section",{className:"py-24 relative",children:(0,b.jsx)("div",{className:"container mx-auto px-6 relative z-10",children:(0,b.jsxs)(c.motion.div,{initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:!0},className:"glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden",children:[(0,b.jsx)("div",{className:"absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none"}),(0,b.jsxs)("div",{className:"relative z-10",children:[(0,b.jsx)("h2",{className:"text-3xl md:text-5xl font-bold mb-4",children:a("Ready to Fix Your Device?")}),(0,b.jsx)("p",{className:"text-xl text-white/60 mb-8 max-w-2xl mx-auto",children:a("Book a technician now and get your device repaired at your doorstep. Fast, reliable, and guaranteed.")}),(0,b.jsxs)("div",{className:"flex flex-col sm:flex-row items-center justify-center gap-4",children:[(0,b.jsxs)(g.default,{href:"/book",className:"group px-8 py-4 bg-cyan-500 text-black rounded-full font-semibold text-lg transition-all hover:scale-105 hover:bg-cyan-400 flex items-center gap-2",children:[a("Book a Technician")," ",(0,b.jsx)(d.ArrowRight,{className:"w-5 h-5 group-hover:translate-x-1 transition-transform"})]}),(0,b.jsxs)("a",{href:"https://wa.me/971507313446",target:"_blank",rel:"noopener noreferrer",className:"px-8 py-4 bg-green-500 rounded-full font-semibold text-lg text-white hover:bg-green-600 transition-all hover:scale-105 flex items-center gap-2",children:[(0,b.jsx)(e.MessageCircle,{className:"w-5 h-5"}),a("WhatsApp")]}),(0,b.jsxs)("a",{href:"tel:+971507313446",className:"px-8 py-4 glass rounded-full font-semibold text-lg text-white hover:bg-white/10 transition-all hover:scale-105 flex items-center gap-2",children:[(0,b.jsx)(f.Phone,{className:"w-5 h-5"}),a("Call Us")]})]})]})]})})})}a.s(["CTASection",()=>i])},80175,71931,72857,36656,49179,39646,13513,92826,a=>{"use strict";var b=a.i(70106);let c=(0,b.default)("Laptop",[["path",{d:"M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16",key:"tarvll"}]]);a.s(["Laptop",()=>c],80175);let d=(0,b.default)("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);a.s(["Printer",()=>d],71931);let e=(0,b.default)("Monitor",[["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["line",{x1:"8",x2:"16",y1:"21",y2:"21",key:"1svkeh"}],["line",{x1:"12",x2:"12",y1:"17",y2:"21",key:"vw1qmm"}]]);a.s(["Monitor",()=>e],72857);let f=(0,b.default)("Tv",[["rect",{width:"20",height:"15",x:"2",y:"7",rx:"2",ry:"2",key:"10ag99"}],["polyline",{points:"17 2 12 7 7 2",key:"11pgbg"}]]);a.s(["Tv",()=>f],36656);let g=(0,b.default)("Watch",[["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["polyline",{points:"12 10 12 12 13 13",key:"19dquz"}],["path",{d:"m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05",key:"18k57s"}],["path",{d:"m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05",key:"16ny36"}]]);a.s(["Watch",()=>g],49179);let h=(0,b.default)("Gamepad2",[["line",{x1:"6",x2:"10",y1:"11",y2:"11",key:"1gktln"}],["line",{x1:"8",x2:"8",y1:"9",y2:"13",key:"qnk9ow"}],["line",{x1:"15",x2:"15.01",y1:"12",y2:"12",key:"krot7o"}],["line",{x1:"18",x2:"18.01",y1:"10",y2:"10",key:"1lcuu1"}],["path",{d:"M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",key:"mfqc10"}]]);a.s(["Gamepad2",()=>h],39646);let i=(0,b.default)("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);a.s(["Camera",()=>i],13513);let j=(0,b.default)("MonitorUp",[["path",{d:"m9 10 3-3 3 3",key:"11gsxs"}],["path",{d:"M12 13V7",key:"h0r20n"}],["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["path",{d:"M12 17v4",key:"1riwvh"}],["path",{d:"M8 21h8",key:"1ev6f3"}]]);a.s(["MonitorUp",()=>j],92826)},66493,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(68114),e=a.i(70106);let f=(0,e.default)("Pause",[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]]),g=(0,e.default)("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);function h({items:a,speed:e=60,pauseOnHover:h=!0,enableBlur:i=!0,blurIntensity:j=1,height:k="100px",width:l="100%",gap:m="0.5rem",scale:n=1,direction:o="horizontal",autoPlay:p=!0,backgroundColor:q,showGridBackground:r=!1,className:s,onItemClick:t,enableSpillEffect:u=!1,animationSteps:v=8,showControls:w=!0}){let x=(0,c.useRef)(null),[y,z]=(0,c.useState)(p),[A,B]=(0,c.useState)({width:0,height:0});(0,c.useEffect)(()=>{let a=()=>{if(x.current){let a=x.current.getBoundingClientRect();B({width:a.width,height:a.height})}};return a(),window.addEventListener("resize",a),()=>window.removeEventListener("resize",a)},[]);let C=Array.from({length:v},(a,c)=>(0,b.jsx)("div",{style:{"--index":c}},c));return(0,b.jsxs)("div",{ref:x,className:(0,d.cn)("sliding-marquee-container",s),style:{backgroundColor:q,...r?{backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 1px)",backgroundSize:"20px 20px"}:{}},children:[(0,b.jsx)("style",{children:`
         .sliding-marquee-container {
           --speed: ${e};
           --count: ${a.length};
           --scale: ${n};
           --blur: ${j};
           --blurs: ${v};
         }

         .sliding-marquee-resizable {
           overflow: clip;
           container-type: size;
           scale: var(--scale);
           width: 100%;
           height: ${k};
           min-height: 100px;
           min-width: 300px;
         }

         @media (min-width: 600px) {
           .sliding-marquee-resizable { min-width: 500px; }
         }
         @media (min-width: 1024px) {
           .sliding-marquee-resizable { min-width: 800px; }
         }

         .sliding-marquee-resizable[data-spill="true"] .sliding-marquee-inner::after {
           content: "";
           position: fixed;
           top: 50%;
           left: 50%;
           width: calc(var(--scale) * 10000vw);
           height: calc(var(--scale) * 10000vh);
           pointer-events: none;
           translate: -50% -50%;
           mask: linear-gradient(white, white) 50% 50% / 100% 100% no-repeat,
               linear-gradient(white, white) 50% 50% / 100cqi 100cqh no-repeat;
           mask-composite: exclude;
         }

         .sliding-marquee-inner {
           height: 100%;
           width: 100%;
           position: relative;
           mask: linear-gradient(90deg, transparent, black 15% 85%, transparent);
           display: grid;
           min-height: 100px;
           min-width: 300px;
           pointer-events: none;
         }

         .sliding-marquee-blur {
           position: absolute;
           top: 0;
           bottom: 0;
           width: 25%;
           z-index: 2;
           pointer-events: none;
         }
         .sliding-marquee-blur--right { right: 0; }
         .sliding-marquee-blur--left { left: 0; rotate: 180deg; }
         .sliding-marquee-blur div {
           position: absolute;
           inset: 0;
           z-index: var(--index);
           mask: linear-gradient(90deg,
               transparent calc(var(--index) * calc((100 / var(--blurs)) * 1%)),
               black calc((var(--index) + 1) * calc((100 / var(--blurs)) * 1%)),
               black calc((var(--index) + 2) * calc((100 / var(--blurs)) * 1%)),
               transparent calc((var(--index) + 3) * calc((100 / var(--blurs)) * 1%)));
           backdrop-filter: blur(calc((var(--index, 0) * var(--blur, 0)) * 1px));
         }

         .sliding-marquee-list {
           display: flex;
           gap: ${m};
           padding: 0;
           margin: 0;
           list-style-type: none;
           height: 100%;
           width: fit-content;
           align-items: center;
           pointer-events: auto;
           will-change: transform;
           animation-timing-function: linear;
           animation-iteration-count: infinite;
         }

         .sliding-marquee-item {
           height: 80%;
           aspect-ratio: 16 / 9;
           font-size: clamp(1rem, 3vw + 0.5rem, 4rem);
           display: grid;
           place-items: center;
           cursor: pointer;
           transition: transform 0.2s ease;
           pointer-events: auto;
           color: white;
         }
         .sliding-marquee-item:hover { transform: scale(1.05); }
         .sliding-marquee-item svg { height: 65%; }

         @media (max-width: 767px) {
           .sliding-marquee-list { gap: 0.25rem !important; }
           .sliding-marquee-item { height: 60% !important; font-size: 0.875rem !important; }
         }

         @keyframes marqueeX { from { transform: translateX(0); } to { transform: translateX(-50%); } }
         @keyframes marqueeY { from { transform: translateY(0); } to { transform: translateY(-50%); } }
      `}),(0,b.jsx)("div",{className:"sliding-marquee-resizable","data-spill":u?"true":"false",style:{width:l,height:k},children:(0,b.jsxs)("div",{className:"sliding-marquee-inner",children:[i&&(0,b.jsx)("div",{className:"sliding-marquee-blur sliding-marquee-blur--left",children:C}),i&&(0,b.jsx)("div",{className:"sliding-marquee-blur sliding-marquee-blur--right",children:C}),(0,b.jsx)("ul",{className:"sliding-marquee-list",style:{animationPlayState:y?"running":"paused",animationName:"vertical"===o?"marqueeY":"marqueeX",animationDuration:`${e}s`},onMouseEnter:()=>h&&z(!1),onMouseLeave:()=>h&&z(p),children:[...a,...a].map((a,c)=>(0,b.jsx)("li",{className:"sliding-marquee-item",onClick:()=>{a.href&&window.open(a.href,"_blank","noopener,noreferrer"),t?.(a)},children:a.content},`${a.id}-${c}`))}),w&&(0,b.jsx)("button",{className:"absolute right-4 bottom-4 z-10 bg-white/10 border border-white/20 rounded-full p-2",onClick:()=>{z(!y)},"aria-label":y?"Pause":"Play",children:y?(0,b.jsx)(f,{className:"w-4 h-4"}):(0,b.jsx)(g,{className:"w-4 h-4"})})]})})]})}a.s(["SlidingLogoMarquee",()=>h],66493)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__cd59b602._.js.map