module.exports=[35112,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactDOM},36313,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.HooksClientContext},18341,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.ServerInsertedHtml},56704,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},20635,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},32319,(a,b,c)=>{b.exports=a.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},9270,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored.contexts.AppRouterContext},38783,(a,b,c)=>{"use strict";b.exports=a.r(42602).vendored["react-ssr"].ReactServerDOMTurbopackClient},45222,a=>{"use strict";let b=(0,a.i(70106).default)("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);a.s(["MessageCircle",()=>b],45222)},87532,a=>{"use strict";let b=(0,a.i(70106).default)("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);a.s(["Search",()=>b],87532)},24987,a=>{"use strict";let b=(0,a.i(70106).default)("MapPin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);a.s(["MapPin",()=>b],24987)},70106,a=>{"use strict";var b=a.i(72131);let c=(...a)=>a.filter((a,b,c)=>!!a&&""!==a.trim()&&c.indexOf(a)===b).join(" ").trim();var d={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let e=(0,b.forwardRef)(({color:a="currentColor",size:e=24,strokeWidth:f=2,absoluteStrokeWidth:g,className:h="",children:i,iconNode:j,...k},l)=>(0,b.createElement)("svg",{ref:l,...d,width:e,height:e,stroke:a,strokeWidth:g?24*Number(f)/Number(e):f,className:c("lucide",h),...k},[...j.map(([a,c])=>(0,b.createElement)(a,c)),...Array.isArray(i)?i:[i]])),f=(a,d)=>{let f=(0,b.forwardRef)(({className:f,...g},h)=>(0,b.createElement)(e,{ref:h,iconNode:d,className:c(`lucide-${a.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,f),...g}));return f.displayName=`${a}`,f};a.s(["default",()=>f],70106)},46058,(a,b,c)=>{"use strict";function d(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(d=function(a){return a?c:b})(a)}c._=function(a,b){if(!b&&a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=d(b);if(c&&c.has(a))return c.get(a);var e={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(e,g,h):e[g]=a[g]}return e.default=a,c&&c.set(a,e),e}},39118,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={DEFAULT_SEGMENT_KEY:function(){return l},PAGE_SEGMENT_KEY:function(){return k},addSearchParamsIfPageSegment:function(){return i},computeSelectedLayoutSegment:function(){return j},getSegmentValue:function(){return f},getSelectedLayoutSegmentPath:function(){return function a(b,c,d=!0,e=[]){let g;if(d)g=b[1][c];else{let a=b[1];g=a.children??Object.values(a)[0]}if(!g)return e;let h=f(g[0]);return!h||h.startsWith(k)?e:(e.push(h),a(g,c,!1,e))}},isGroupSegment:function(){return g},isParallelRouteSegment:function(){return h}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});function f(a){return Array.isArray(a)?a[1]:a}function g(a){return"("===a[0]&&a.endsWith(")")}function h(a){return a.startsWith("@")&&"@children"!==a}function i(a,b){if(a.includes(k)){let a=JSON.stringify(b);return"{}"!==a?k+"?"+a:k}return a}function j(a,b){if(!a||0===a.length)return null;let c="children"===b?a[0]:a[a.length-1];return c===l?null:c}let k="__PAGE__",l="__DEFAULT__"},54427,(a,b,c)=>{"use strict";function d(){let a,b,c=new Promise((c,d)=>{a=c,b=d});return{resolve:a,reject:b,promise:c}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"createPromiseWithResolvers",{enumerable:!0,get:function(){return d}})},79808,a=>{"use strict";let b=(0,a.i(70106).default)("Wrench",[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",key:"cbrjhi"}]]);a.s(["Wrench",()=>b],79808)},67900,a=>{"use strict";let b=(0,a.i(70106).default)("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]]);a.s(["Building2",()=>b],67900)},92258,a=>{"use strict";let b=(0,a.i(70106).default)("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]);a.s(["Mail",()=>b],92258)},42021,a=>{"use strict";var b=a.i(87924),c=a.i(68114);function d({children:a,className:d,hoverEffect:e=!0}){return(0,b.jsxs)("div",{className:(0,c.cn)("glass rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden group transition-transform duration-300 will-change-transform",e&&"glass-hover hover:-translate-y-1 hover:shadow-2xl",d),children:[(0,b.jsx)("div",{className:"absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"}),a]})}a.s(["GlassCard",()=>d])},63519,a=>{"use strict";let b=(0,a.i(70106).default)("Phone",[["path",{d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",key:"foiqr5"}]]);a.s(["Phone",()=>b],63519)},67453,a=>{"use strict";let b=(0,a.i(70106).default)("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);a.s(["CheckCircle2",()=>b],67453)},11300,a=>{"use strict";let b=(0,a.i(70106).default)("ClipboardList",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"M12 11h4",key:"1jrz19"}],["path",{d:"M12 16h4",key:"n85exb"}],["path",{d:"M8 11h.01",key:"1dfujw"}],["path",{d:"M8 16h.01",key:"18s6g9"}]]);a.s(["ClipboardList",()=>b],11300)},10227,a=>{"use strict";let b=(0,a.i(70106).default)("Truck",[["path",{d:"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2",key:"wrbu53"}],["path",{d:"M15 18H9",key:"1lyqi6"}],["path",{d:"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14",key:"lysw3i"}],["circle",{cx:"17",cy:"18",r:"2",key:"332jqn"}],["circle",{cx:"7",cy:"18",r:"2",key:"19iecd"}]]);a.s(["Truck",()=>b],10227)},66493,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(68114),e=a.i(70106);let f=(0,e.default)("Pause",[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]]),g=(0,e.default)("Play",[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]]);function h({items:a,speed:e=60,pauseOnHover:h=!0,enableBlur:i=!0,blurIntensity:j=1,height:k="100px",width:l="100%",gap:m="0.5rem",scale:n=1,direction:o="horizontal",autoPlay:p=!0,backgroundColor:q,showGridBackground:r=!1,className:s,onItemClick:t,enableSpillEffect:u=!1,animationSteps:v=8,showControls:w=!0}){let x=(0,c.useRef)(null),[y,z]=(0,c.useState)(p),[A,B]=(0,c.useState)({width:0,height:0});(0,c.useEffect)(()=>{let a=()=>{if(x.current){let a=x.current.getBoundingClientRect();B({width:a.width,height:a.height})}};return a(),window.addEventListener("resize",a),()=>window.removeEventListener("resize",a)},[]);let C=Array.from({length:v},(a,c)=>(0,b.jsx)("div",{style:{"--index":c}},c));return(0,b.jsxs)("div",{ref:x,className:(0,d.cn)("sliding-marquee-container",s),style:{backgroundColor:q,...r?{backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 1px)",backgroundSize:"20px 20px"}:{}},children:[(0,b.jsx)("style",{children:`
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

//# sourceMappingURL=%5Broot-of-the-server%5D__43ca068b._.js.map