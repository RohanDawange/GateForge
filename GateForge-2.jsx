import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────
const DARK = {
  bg:"#0B0F1A",bgAlt:"#0E1320",surface:"#111827",surfaceHigh:"#1A2235",
  border:"rgba(255,255,255,0.07)",borderAccent:"rgba(99,102,241,0.4)",
  primary:"#6366F1",primaryDim:"rgba(99,102,241,0.12)",primaryGlow:"rgba(99,102,241,0.3)",
  green:"#22C55E",greenDim:"rgba(34,197,94,0.1)",yellow:"#F59E0B",red:"#EF4444",purple:"#8B5CF6",
  textPrimary:"#E2E8F0",textSecond:"#94A3B8",textMuted:"#475569",
  gradPrimary:"linear-gradient(135deg,#6366F1,#8B5CF6)",gradGreen:"linear-gradient(135deg,#22C55E,#16A34A)",
  cardShadow:"0 4px 24px rgba(0,0,0,0.4)",
};
const LIGHT = {
  bg:"#F8FAFC",bgAlt:"#F1F5F9",surface:"#FFFFFF",surfaceHigh:"#F8FAFC",
  border:"rgba(15,23,42,0.08)",borderAccent:"rgba(79,70,229,0.3)",
  primary:"#4F46E5",primaryDim:"rgba(79,70,229,0.07)",primaryGlow:"rgba(79,70,229,0.2)",
  green:"#16A34A",greenDim:"rgba(22,163,74,0.07)",yellow:"#D97706",red:"#DC2626",purple:"#7C3AED",
  textPrimary:"#0F172A",textSecond:"#64748B",textMuted:"#94A3B8",
  gradPrimary:"linear-gradient(135deg,#4F46E5,#7C3AED)",gradGreen:"linear-gradient(135deg,#16A34A,#15803D)",
  cardShadow:"0 2px 12px rgba(15,23,42,0.07), 0 1px 3px rgba(15,23,42,0.05)",
};

// ─────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────
const EXAM_DATE = new Date("2027-02-06T09:00:00");
const SUBJECTS = ["Mathematics","Digital Logic","Computer Organization","Programming & DS","Algorithms","Theory of Computation","Compiler Design","Operating Systems","Databases","Computer Networks","General Aptitude"];
const MOODS = [
  {id:"happy",label:"Happy",emoji:"😊",color:"#22C55E"},
  {id:"neutral",label:"Neutral",emoji:"😐",color:"#F59E0B"},
  {id:"sad",label:"Sad",emoji:"😢",color:"#60A5FA"},
  {id:"lazy",label:"Lazy",emoji:"😴",color:"#A78BFA"},
];
const MOTIVATION = {
  happy:["You're in the zone! Make today count.","Momentum is everything — ride this wave all day.","Champions train hardest when already motivated. Use it!"],
  neutral:["Consistency beats inspiration every single time.","You don't need to feel great to do great work.","Show up fully today. That's 80% of the battle."],
  sad:["Even your worst day is still a step forward.","GATE doesn't care about feelings. Neither should your calendar.","Pain is temporary. IIT on your résumé is permanent."],
  lazy:["Your competition studied today. Did you?","Discipline is choosing what you want MOST over what you want now.","Get up. Open the book. That is the only rule."],
};
const BADGES = [
  {id:"first_entry",icon:"🚀",label:"First Step",desc:"Logged your first diary entry",check:s=>s.entries.length>=1},
  {id:"streak_3",icon:"🔥",label:"3-Day Warrior",desc:"Maintained a 3-day streak",check:s=>s.streak>=3},
  {id:"streak_7",icon:"🏆",label:"Week Champion",desc:"Maintained a 7-day streak",check:s=>s.streak>=7},
  {id:"streak_30",icon:"⚔️",label:"Iron Monk",desc:"Maintained a 30-day streak",check:s=>s.streak>=30},
  {id:"hours_10",icon:"⏱️",label:"10 Hours",desc:"Logged 10+ total study hours",check:s=>s.totalHours>=10},
  {id:"hours_100",icon:"💯",label:"Centurion",desc:"Logged 100+ total study hours",check:s=>s.totalHours>=100},
  {id:"mock_5",icon:"📝",label:"Test Veteran",desc:"Completed 5 mock tests",check:s=>s.mocks.length>=5},
  {id:"pomo_10",icon:"🍅",label:"Focus Master",desc:"Completed 10 Pomodoro sessions",check:s=>s.pomoCount>=10},
  {id:"no_distract",icon:"🛡️",label:"Steel Mind",desc:"A day with zero distractions",check:s=>s.distLog.some(d=>d.count===0)},
];
const NAV=[
  {id:"dashboard",icon:"⬡",label:"Dashboard"},
  {id:"diary",icon:"📓",label:"Diary"},
  {id:"planner",icon:"📋",label:"Planner"},
  {id:"mocks",icon:"📊",label:"Mocks"},
  {id:"focus",icon:"⏱️",label:"Focus"},
  {id:"motivation",icon:"✦",label:"Motivation"},
  {id:"future",icon:"💌",label:"Future"},
  {id:"rewards",icon:"🏆",label:"Rewards"},
  {id:"distraction",icon:"⊘",label:"Distract"},
];

// ─────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────
const todayStr=()=>new Date().toISOString().slice(0,10);
const fmtDate=d=>new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
const getCD=()=>{
  const diff=EXAM_DATE-new Date();
  if(diff<=0)return{d:0,h:0,m:0,s:0};
  return{d:Math.floor(diff/86400000),h:Math.floor((diff%86400000)/3600000),m:Math.floor((diff%3600000)/60000),s:Math.floor((diff%60000)/1000)};
};
const useLS=(key,init)=>{
  const[v,setV]=useState(()=>{try{const s=localStorage.getItem(key);return s?JSON.parse(s):init;}catch{return init;}});
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(v));}catch{}},[key,v]);
  return[v,setV];
};

// ─────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────
export default function App(){
  const[theme,setTheme]=useState("dark");
  const[page,setPage]=useState("dashboard");
  const[focusMode,setFocusMode]=useState(false);
  const[drawerOpen,setDrawerOpen]=useState(false);
  const[cd,setCD]=useState(getCD());
  const[entries,setEntries]=useLS("gf3_entries",[]);
  const[tasks,setTasks]=useLS("gf3_tasks",[]);
  const[mocks,setMocks]=useLS("gf3_mocks",[]);
  const[futureMsgs,setFutureMsgs]=useLS("gf3_future",[]);
  const[distLog,setDistLog]=useLS("gf3_dist",[]);
  const[customQ,setCustomQ]=useLS("gf3_quotes",[]);
  const[badges,setBadges]=useLS("gf3_badges",[]);
  const[streak,setStreak]=useLS("gf3_streak",0);
  const[lastStudy,setLastStudy]=useLS("gf3_lastStudy","");
  const[totalHours,setTotalHours]=useLS("gf3_hours",0);
  const[pomoCount,setPomoCount]=useLS("gf3_pomo",0);
  const T=theme==="dark"?DARK:LIGHT;

  useEffect(()=>{const t=setInterval(()=>setCD(getCD()),1000);return()=>clearInterval(t);},[]);

  const state={entries,mocks,streak,totalHours,pomoCount,distLog};
  useEffect(()=>{
    const nb=BADGES.filter(b=>!badges.includes(b.id)&&b.check(state)).map(b=>b.id);
    if(nb.length)setBadges(p=>[...p,...nb]);
  },[entries,mocks,streak,totalHours,pomoCount,distLog]);

  useEffect(()=>{
    if(!lastStudy)return;
    const diff=Math.round((new Date(todayStr())-new Date(lastStudy))/86400000);
    if(diff>1)setStreak(0);
  },[]);

  const logEntry=e=>{
    setEntries(p=>[{...e,id:Date.now(),date:todayStr()},...p]);
    setTotalHours(p=>p+Number(e.hours));
    const t=todayStr();
    if(lastStudy!==t){
      const diff=Math.round((new Date(t)-new Date(lastStudy))/86400000);
      setStreak(p=>diff===1?p+1:1);
      setLastStudy(t);
    }
  };

  const todayDist=distLog.find(d=>d.date===todayStr())?.count||0;
  const addDist=()=>setDistLog(p=>{
    const t=todayStr(),ex=p.find(d=>d.date===t);
    return ex?p.map(d=>d.date===t?{...d,count:d.count+1}:d):[...p,{date:t,count:1}];
  });

  const goTo=id=>{setPage(id);setDrawerOpen(false);};
  const sideNav=focusMode?NAV.filter(n=>["dashboard","diary","focus","planner"].includes(n.id)):NAV;
  const sp={T,theme,entries,setEntries,tasks,setTasks,mocks,setMocks,futureMsgs,setFutureMsgs,distLog,addDist,todayDist,customQ,setCustomQ,badges,streak,totalHours,pomoCount,setPomoCount,cd,logEntry,focusMode};

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.textPrimary,fontFamily:"'Poppins','Segoe UI',sans-serif",transition:"background .35s,color .25s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{overflow-x:hidden}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${T.textMuted};border-radius:4px}
        input,select,textarea{font-family:'Poppins','Segoe UI',sans-serif}
        select option{background:${T.surface};color:${T.textPrimary}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px ${T.primaryGlow}}50%{box-shadow:0 0 24px ${T.primaryGlow},0 0 48px ${T.primaryDim}}}
        @keyframes gradMove{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.65;transform:scale(1.15)}}
        @keyframes tickIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        .pg{animation:scaleIn .3s cubic-bezier(.34,1.4,.64,1) forwards}
        .r1{opacity:0;animation:fadeUp .35s ease .04s forwards}
        .r2{opacity:0;animation:fadeUp .35s ease .08s forwards}
        .r3{opacity:0;animation:fadeUp .35s ease .12s forwards}
        .r4{opacity:0;animation:fadeUp .35s ease .16s forwards}
        .r5{opacity:0;animation:fadeUp .35s ease .20s forwards}
        .r6{opacity:0;animation:fadeUp .35s ease .24s forwards}
        .r7{opacity:0;animation:fadeUp .35s ease .28s forwards}
        .r8{opacity:0;animation:fadeUp .35s ease .32s forwards}
        .card{background:${T.surface};border:1px solid ${T.border};border-radius:16px;box-shadow:${T.cardShadow};transition:border-color .2s,transform .2s,box-shadow .2s;${theme==="dark"?"backdrop-filter:blur(8px);":""}}
        .ch:hover{border-color:${T.borderAccent};transform:translateY(-2px);box-shadow:${theme==="dark"?"0 8px 32px rgba(99,102,241,.14)":"0 8px 28px rgba(79,70,229,.08)"}}
        .btn{font-family:'Poppins',sans-serif;font-weight:600;font-size:13px;border:none;cursor:pointer;border-radius:12px;outline:none;transition:transform .15s,box-shadow .2s,filter .15s;display:inline-flex;align-items:center;justify-content:center;gap:6px}
        .btn:active{transform:scale(.96)!important}
        .bp{background:${T.gradPrimary};background-size:200% 200%;color:#fff;padding:10px 22px;box-shadow:0 4px 14px ${T.primaryGlow};animation:gradMove 4s ease infinite}
        .bp:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 20px ${T.primaryGlow}}
        .bo{background:${T.primaryDim};border:1px solid ${T.borderAccent};color:${T.primary};padding:9px 20px}
        .bo:hover{filter:brightness(1.1);transform:translateY(-1px)}
        .bg{background:transparent;border:1px solid ${T.border};color:${T.textSecond};padding:8px 18px}
        .bg:hover{border-color:${T.borderAccent};color:${T.primary};background:${T.primaryDim}}
        .bd{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:${T.red};padding:7px 14px;font-size:12px;border-radius:10px}
        .bd:hover{background:rgba(239,68,68,.18)}
        .fld{width:100%;padding:10px 14px;background:${theme==="dark"?T.surfaceHigh:T.bgAlt};border:1.5px solid ${T.border};border-radius:12px;color:${T.textPrimary};font-size:13px;outline:none;transition:border-color .2s,box-shadow .2s}
        .fld:focus{border-color:${T.primary};box-shadow:0 0 0 3px ${T.primaryDim}}
        .fld::placeholder{color:${T.textMuted}}
        .pill{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600;letter-spacing:.3px}
        .ni{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;cursor:pointer;transition:all .2s;font-size:13px;font-weight:500;border:1px solid transparent;color:${T.textSecond};white-space:nowrap}
        .ni:hover{color:${T.primary};background:${T.primaryDim};border-color:${T.borderAccent}}
        .ni.on{color:${T.primary};background:${T.primaryDim};border-color:${T.borderAccent};font-weight:600}
        .seg{display:flex;gap:4px;background:${theme==="dark"?T.surfaceHigh:T.bgAlt};padding:4px;border-radius:12px;border:1px solid ${T.border};flex-wrap:wrap}
        .sb{padding:7px 16px;border-radius:9px;border:none;cursor:pointer;font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;transition:all .2s;background:transparent;color:${T.textSecond}}
        .sb.on{background:${T.gradPrimary};color:#fff;box-shadow:0 3px 10px ${T.primaryGlow}}
        .pb{height:7px;border-radius:99px;background:${theme==="dark"?T.surfaceHigh:T.bgAlt};overflow:hidden}
        .pf{height:100%;border-radius:99px;transition:width 1s cubic-bezier(.25,1,.5,1)}
        .lbl{font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${T.textMuted};margin-bottom:12px;display:block}
        .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .bnav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:${theme==="dark"?"rgba(11,15,26,.95)":"rgba(248,250,252,.96)"};backdrop-filter:blur(16px);border-top:1px solid ${T.border};padding:6px 0 env(safe-area-inset-bottom,8px)}
        .bni{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;padding:5px 2px;border-radius:8px;transition:all .15s;min-width:0}
        .bnil{font-size:9px;font-weight:600;letter-spacing:.3px;text-transform:uppercase;color:${T.textMuted};white-space:nowrap}
        .bni.on .bnil{color:${T.primary}}
        .drawer{position:fixed;top:0;left:0;bottom:0;width:260px;z-index:400;background:${theme==="dark"?"rgba(11,15,26,.98)":T.surface};border-right:1px solid ${T.border};padding:20px 12px;overflow-y:auto;transform:translateX(-100%);transition:transform .3s cubic-bezier(.4,0,.2,1);backdrop-filter:blur(20px)}
        .drawer.open{transform:translateX(0)}
        .ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:399}
        .ov.open{display:block}
        .tb{display:none;align-items:center;justify-content:space-between;padding:12px 16px;background:${theme==="dark"?"rgba(11,15,26,.96)":T.surface};border-bottom:1px solid ${T.border};position:sticky;top:0;z-index:100;backdrop-filter:blur(12px)}
        @media(max-width:768px){
          .sd{display:none!important}
          .tb{display:flex}
          .bnav{display:flex}
          main{padding:16px 14px 90px!important}
          .g4{grid-template-columns:1fr 1fr!important}
          .g3{grid-template-columns:1fr 1fr!important}
          .g2{grid-template-columns:1fr!important}
          .hmb{display:none!important}
          .hi{flex-direction:column!important;align-items:flex-start!important}
        }
        @media(min-width:769px){.tb{display:none}.bnav{display:none!important}.drawer{display:none!important}.ov{display:none!important}}
      `}</style>

      {focusMode&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9000,opacity:.08,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,#000 3px,#000 4px)"}}/>}

      {/* MOBILE TOPBAR */}
      <header className="tb">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:T.gradPrimary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,boxShadow:`0 4px 12px ${T.primaryGlow}`}}>⚡</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,letterSpacing:"-0.3px",lineHeight:1.1}}>GATE<span style={{color:T.primary}}>Forge</span></div>
            <div style={{fontSize:9,color:T.textMuted,fontWeight:500}}>MISSION 2027</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,color:T.yellow,fontWeight:700}}>{streak}🔥</span>
          <div onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} style={{width:42,height:24,borderRadius:99,cursor:"pointer",background:theme==="dark"?T.primary:"#E2E8F0",display:"flex",alignItems:"center",padding:"3px",transition:"background .3s",boxShadow:theme==="dark"?`0 0 10px ${T.primaryGlow}`:"none"}}>
            <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,.25)",transform:theme==="dark"?"translateX(18px)":"translateX(0)",transition:"transform .25s cubic-bezier(.34,1.56,.64,1)"}}/>
          </div>
          <button className="btn bg" style={{padding:"6px 10px",fontSize:18,borderRadius:10}} onClick={()=>setDrawerOpen(true)}>☰</button>
        </div>
      </header>

      {/* DRAWER */}
      <div className={`ov${drawerOpen?" open":""}`} onClick={()=>setDrawerOpen(false)}/>
      <div className={`drawer${drawerOpen?" open":""}`}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:16,marginBottom:12,borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontWeight:800,fontSize:16}}>GATE<span style={{color:T.primary}}>Forge</span></div>
          <button className="btn bg" style={{padding:"5px 10px"}} onClick={()=>setDrawerOpen(false)}>✕</button>
        </div>
        {sideNav.map(n=>(
          <div key={n.id} className={`ni${page===n.id?" on":""}`} onClick={()=>goTo(n.id)}>
            <span style={{fontSize:17}}>{n.icon}</span><span>{n.label}</span>
          </div>
        ))}
        <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.border}`}}>
          <button className={`btn ${focusMode?"bp":"bg"}`} style={{width:"100%",padding:"10px"}} onClick={()=>setFocusMode(f=>!f)}>
            ◎ Focus Mode {focusMode?"ON":"OFF"}
          </button>
        </div>
      </div>

      {/* LAYOUT */}
      <div style={{display:"flex"}}>
        {/* DESKTOP SIDEBAR */}
        <aside className="sd" style={{width:220,flexShrink:0,background:theme==="dark"?"rgba(11,15,26,.97)":T.surface,borderRight:`1px solid ${T.border}`,padding:"20px 10px",display:"flex",flexDirection:"column",gap:3,position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
          <div style={{padding:"6px 8px 18px",borderBottom:`1px solid ${T.border}`,marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:34,height:34,borderRadius:10,background:T.gradPrimary,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 4px 14px ${T.primaryGlow}`,flexShrink:0}}>⚡</div>
              <div>
                <div style={{fontSize:16,fontWeight:800,letterSpacing:"-0.3px",lineHeight:1.1}}>GATE<span style={{color:T.primary}}>Forge</span></div>
                <div style={{fontSize:9,color:T.textMuted,fontWeight:600,letterSpacing:.8}}>MISSION 2027</div>
              </div>
            </div>
          </div>
          {sideNav.map(n=>(
            <div key={n.id} className={`ni${page===n.id?" on":""}`} onClick={()=>goTo(n.id)}>
              <span style={{fontSize:16,flexShrink:0}}>{n.icon}</span>
              <span>{n.label}</span>
              {page===n.id&&<div style={{marginLeft:"auto",width:5,height:5,borderRadius:"50%",background:T.primary,boxShadow:`0 0 6px ${T.primaryGlow}`}}/>}
            </div>
          ))}
          <div style={{flex:1}}/>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:14,marginTop:8,display:"flex",flexDirection:"column",gap:8}}>
            <button className={`btn ${focusMode?"bp":"bg"}`} style={{width:"100%",padding:"10px",fontSize:12,animation:focusMode?"glow 2s infinite":"none"}} onClick={()=>setFocusMode(f=>!f)}>
              ◎ Focus Mode {focusMode?"ON":"OFF"}
            </button>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:10,background:theme==="dark"?T.surfaceHigh:T.bgAlt,border:`1px solid ${T.border}`}}>
              <span style={{fontSize:12,color:T.textSecond,fontWeight:500}}>{theme==="dark"?"🌙 Dark":"☀️ Light"}</span>
              <div onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} style={{width:40,height:22,borderRadius:99,cursor:"pointer",background:theme==="dark"?T.primary:"#CBD5E1",display:"flex",alignItems:"center",padding:"2px",transition:"background .3s",boxShadow:theme==="dark"?`0 0 8px ${T.primaryGlow}`:"none"}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,.25)",transform:theme==="dark"?"translateX(18px)":"translateX(0)",transition:"transform .25s cubic-bezier(.34,1.56,.64,1)"}}/>
              </div>
            </div>
            <div style={{fontSize:10,color:T.textMuted,textAlign:"center",paddingBottom:4}}>Streak: <span style={{color:T.yellow,fontWeight:700}}>{streak} days 🔥</span></div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{flex:1,padding:"24px 24px",overflowY:"auto",maxHeight:"100vh",minWidth:0}}>
          <div className="pg" key={page}>
            {page==="dashboard"  &&<PDashboard {...sp}/>}
            {page==="diary"      &&<PDiary {...sp}/>}
            {page==="planner"    &&<PPlanner {...sp}/>}
            {page==="mocks"      &&<PMocks {...sp}/>}
            {page==="focus"      &&<PFocus {...sp}/>}
            {page==="motivation" &&<PMotivation {...sp}/>}
            {page==="future"     &&<PFuture {...sp}/>}
            {page==="rewards"    &&<PRewards {...sp}/>}
            {page==="distraction"&&<PDistraction {...sp}/>}
          </div>
        </main>
      </div>

      {/* BOTTOM NAV */}
      <nav className="bnav">
        {NAV.map(n=>(
          <div key={n.id} className={`bni${page===n.id?" on":""}`} onClick={()=>goTo(n.id)}>
            <div style={{fontSize:20,color:page===n.id?T.primary:T.textMuted}}>{n.icon}</div>
            <div className="bnil">{n.label}</div>
          </div>
        ))}
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SHARED
// ─────────────────────────────────────────────────────────────────
function PH({icon,title,sub,T}){
  return(
    <div className="r1" style={{marginBottom:22}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
        <span style={{fontSize:22}}>{icon}</span>
        <h1 style={{fontSize:22,fontWeight:800,letterSpacing:"-0.4px",lineHeight:1}}>{title}</h1>
      </div>
      {sub&&<p style={{fontSize:13,color:T.textSecond,marginLeft:32,fontWeight:400}}>{sub}</p>}
      <div style={{height:1,background:`linear-gradient(90deg,${T.primary}66,transparent)`,marginTop:12}}/>
    </div>
  );
}

function SC({icon,val,label,sub,color,T,theme}){
  return(
    <div className="card ch" style={{padding:"18px 16px",background:theme==="dark"?`${color}0d`:T.surface,borderColor:`${color}22`,textAlign:"center"}}>
      <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
      <div style={{fontSize:28,fontWeight:800,color,lineHeight:1}}>{val}</div>
      <div style={{fontSize:11,color:T.textMuted,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",marginTop:4}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:T.textSecond,marginTop:3}}>{sub}</div>}
    </div>
  );
}

function PBar({pct,color,T}){
  const g=color?`linear-gradient(90deg,${color},${color}cc)`:pct>=75?"linear-gradient(90deg,#22C55E,#16A34A)":pct>=50?"linear-gradient(90deg,#F59E0B,#FBBF24)":"linear-gradient(90deg,#EF4444,#F87171)";
  return(<div className="pb"><div className="pf" style={{width:`${pct}%`,background:g}}/></div>);
}

function MPill({mood,T}){
  const m=MOODS.find(x=>x.id===mood);
  if(!m)return null;
  return(<span className="pill" style={{background:`${m.color}18`,color:m.color,border:`1px solid ${m.color}30`}}>{m.emoji} {m.label}</span>);
}

// ─────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────
function PDashboard({T,theme,cd,streak,totalHours,entries,tasks,mocks,todayDist,addDist,badges}){
  const todayH=entries.filter(e=>e.date===todayStr()).reduce((s,e)=>s+Number(e.hours),0);
  const weekH=(()=>{const d=new Date();d.setDate(d.getDate()-7);return entries.filter(e=>new Date(e.date)>=d).reduce((s,e)=>s+Number(e.hours),0);})();
  const pending=tasks.filter(t=>!t.completed).length;
  const lastMock=mocks.length?mocks[mocks.length-1].score:null;
  const todayMood=entries.find(e=>e.date===todayStr())?.mood;
  const heatData=Array.from({length:84},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(83-i));const iso=d.toISOString().slice(0,10);return{iso,h:entries.filter(e=>e.date===iso).reduce((s,e)=>s+Number(e.hours),0)};});
  const maxH=Math.max(1,...heatData.map(c=>c.h));
  const hc=h=>{if(!h)return theme==="dark"?"#1A2235":"#F1F5F9";const t=h/maxH;return theme==="dark"?(t<.25?"#1E3A5F":t<.5?"#2563EB":t<.75?"#4F46E5":"#6366F1"):(t<.25?"#DBEAFE":t<.5?"#BFDBFE":t<.75?"#93C5FD":"#4F46E5");};
  const subH=SUBJECTS.map(s=>({name:s,h:entries.filter(e=>e.subject===s).reduce((a,e)=>a+Number(e.hours),0)})).sort((a,b)=>b.h-a.h).slice(0,6);
  const maxSH=Math.max(1,...subH.map(s=>s.h));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* HERO */}
      <div className="r1 card" style={{padding:"22px 20px",background:theme==="dark"?"linear-gradient(135deg,#0D1B3E 0%,#130E2F 50%,#0D1B3E 100%)":"linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 50%,#EEF2FF 100%)",borderColor:T.borderAccent,position:"relative",overflow:"hidden",boxShadow:`0 0 32px ${T.primaryGlow}`}}>
        <div style={{position:"absolute",right:-60,top:-60,width:220,height:220,borderRadius:"50%",pointerEvents:"none",background:`radial-gradient(circle,${T.primaryGlow} 0%,transparent 70%)`}}/>

        {/* Mission tag */}
        <div style={{fontSize:10,color:T.primary,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10,position:"relative"}}>⚡ GATE 2027 · MISSION ACTIVE</div>

        {/* Title — solid color, no gradient text */}
        <h1 style={{fontSize:22,fontWeight:800,letterSpacing:"-0.3px",lineHeight:1.25,color:theme==="dark"?"#E2E8F0":"#0F172A",position:"relative",marginBottom:6}}>
          Rohan's <span style={{color:T.primary}}>Command</span> Centre
        </h1>

        <p style={{color:T.textSecond,fontSize:13,lineHeight:1.6,position:"relative",marginBottom:14}}>
          {todayH>0?`Studied ${todayH}h today — keep the momentum!`:"No study logged yet today. Start now!"}
          {todayMood&&<> · <MPill mood={todayMood} T={T}/></>}
        </p>

        {/* COUNTDOWN BOX — full width on mobile */}
        <div style={{background:theme==="dark"?"rgba(99,102,241,0.15)":"rgba(79,70,229,0.08)",border:`1px solid ${T.borderAccent}`,borderRadius:14,padding:"16px 14px",position:"relative"}}>
          <div style={{fontSize:10,color:T.primary,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",textAlign:"center",marginBottom:12}}>🎯 Exam Countdown — Feb 6, 2027</div>
          <div style={{display:"flex",justifyContent:"center",gap:8,alignItems:"center"}}>
            {[{v:cd.d,u:"DAYS"},{v:cd.h,u:"HRS"},{v:cd.m,u:"MIN"},{v:cd.s,u:"SEC"}].map((c,i)=>(
              <div key={c.u} style={{textAlign:"center",flex:1}}>
                <div style={{fontSize:34,fontWeight:800,color:T.primary,lineHeight:1,fontFamily:"'JetBrains Mono','Courier New',monospace",fontVariantNumeric:"tabular-nums",letterSpacing:"-1px"}}>{String(c.v).padStart(2,"0")}</div>
                <div style={{fontSize:9,color:T.textMuted,fontWeight:700,letterSpacing:1,marginTop:4}}>{c.u}</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:12,fontSize:12,color:T.yellow,fontWeight:700}}>Every second counts. Stay locked in! 🔥</div>
        </div>

        <div style={{marginTop:12,fontSize:11,color:T.textMuted,fontStyle:"italic",position:"relative",textAlign:"center"}}>"This is not just an app. This is your discipline system."</div>
      </div>

      {/* STAT ROWS */}
      <div className="r2 g4">
        <SC icon="📖" val={`${todayH}h`} label="Today" sub="Hours studied" color={T.primary} T={T} theme={theme}/>
        <SC icon="📅" val={`${weekH.toFixed(1)}h`} label="This Week" sub="Hours studied" color={T.purple} T={T} theme={theme}/>
        <SC icon="⏱️" val={`${totalHours.toFixed(0)}h`} label="Total" sub="All time" color={T.green} T={T} theme={theme}/>
        <SC icon="🔥" val={`${streak}d`} label="Streak" sub="Consecutive days" color={T.yellow} T={T} theme={theme}/>
      </div>
      <div className="r3 g4">
        <SC icon="📋" val={pending} label="Pending Tasks" color={T.red} T={T} theme={theme}/>
        <SC icon="📊" val={mocks.length} label="Mocks Done" color={T.primary} T={T} theme={theme}/>
        <SC icon="🏅" val={badges.length} label="Badges" color={T.yellow} T={T} theme={theme}/>
        <SC icon="⊘" val={todayDist} label="Distractions" sub="Today" color={todayDist===0?T.green:T.red} T={T} theme={theme}/>
      </div>

      {/* HEATMAP + SUBJECT */}
      <div className="r4 g2">
        <div className="card" style={{padding:20}}>
          <span className="lbl">Study Activity — Last 12 Weeks</span>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:12}}>
            {heatData.map((c,i)=>(
              <div key={i} title={`${c.iso}: ${c.h}h`} style={{width:12,height:12,borderRadius:3,background:hc(c.h),cursor:"pointer",flexShrink:0,transition:"transform .1s"}} onMouseEnter={e=>e.target.style.transform="scale(1.5)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
            ))}
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <span style={{fontSize:10,color:T.textMuted}}>Less</span>
            {(theme==="dark"?["#1A2235","#1E3A5F","#2563EB","#4F46E5","#6366F1"]:["#F1F5F9","#DBEAFE","#BFDBFE","#93C5FD","#4F46E5"]).map((c,i)=><div key={i} style={{width:11,height:11,borderRadius:2,background:c}}/>)}
            <span style={{fontSize:10,color:T.textMuted}}>More</span>
          </div>
        </div>
        <div className="card" style={{padding:20}}>
          <span className="lbl">Subject Hours</span>
          {subH.map(s=>(
            <div key={s.name} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,color:T.textSecond,fontWeight:500}}>{s.name.slice(0,22)}</span>
                <span style={{fontSize:12,color:T.primary,fontWeight:700}}>{s.h.toFixed(1)}h</span>
              </div>
              <PBar pct={Math.round((s.h/maxSH)*100)} T={T} color={T.primary}/>
            </div>
          ))}
          {subH.length===0&&<div style={{color:T.textMuted,fontSize:13}}>Log entries to see breakdown.</div>}
        </div>
      </div>

      {/* DISTRACTION QUICK */}
      <div className="r5 card" style={{padding:"18px 20px",borderColor:todayDist===0?`${T.green}33`:T.border,background:todayDist===0?(theme==="dark"?"rgba(34,197,94,.06)":"rgba(22,163,74,.04)"):"transparent",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:todayDist===0?T.green:T.textPrimary}}>{todayDist===0?"🛡️ Zero Distractions Today — Steel Mind!":"⊘ Distraction Tracker"}</div>
          <div style={{fontSize:12,color:T.textSecond,marginTop:3}}>{todayDist} distractions logged today. Tap every time you lose focus.</div>
        </div>
        <button className="btn bd" style={{fontSize:13,padding:"10px 22px",borderRadius:12}} onClick={addDist}>⚡ I Got Distracted</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DIARY
// ─────────────────────────────────────────────────────────────────
function PDiary({T,theme,entries,setEntries,logEntry}){
  const em={subject:"",topic:"",hours:"",mood:"neutral",notes:""};
  const[form,setForm]=useState(em);
  const[editId,setEditId]=useState(null);
  const[tab,setTab]=useState("list");
  const sub=()=>{
    if(!form.subject||!form.hours)return;
    if(editId){setEntries(p=>p.map(e=>e.id===editId?{...e,...form}:e));setEditId(null);}
    else logEntry(form);
    setForm(em);
  };
  const se=e=>{setForm({subject:e.subject,topic:e.topic,hours:e.hours,mood:e.mood,notes:e.notes});setEditId(e.id);};
  const del=id=>setEntries(p=>p.filter(e=>e.id!==id));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <PH icon="📓" title="Daily Diary" sub="Log every session. Build the habit." T={T}/>

      <div className="r2 card" style={{padding:22}}>
        <div style={{fontSize:12,fontWeight:700,color:T.primary,letterSpacing:1,textTransform:"uppercase",marginBottom:16}}>{editId?"✏️ Editing Entry":"＋ New Study Entry"}</div>
        <div className="g2" style={{marginBottom:14}}>
          <div><label className="lbl">Subject</label>
            <select className="fld" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>
              <option value="">Select subject...</option>
              {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="lbl">Hours Studied</label>
            <input className="fld" type="number" min=".5" max="16" step=".5" placeholder="e.g. 2.5" value={form.hours} onChange={e=>setForm({...form,hours:e.target.value})}/>
          </div>
        </div>
        <div style={{marginBottom:14}}><label className="lbl">Topic Covered</label>
          <input className="fld" placeholder="e.g. Dijkstra's Algorithm, Normalization, PYQ Set 4..." value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}/>
        </div>
        <div style={{marginBottom:14}}><label className="lbl">Mood</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {MOODS.map(m=>(
              <button key={m.id} onClick={()=>setForm({...form,mood:m.id})} style={{padding:"8px 16px",borderRadius:10,cursor:"pointer",border:"1px solid",outline:"none",borderColor:form.mood===m.id?m.color:`${m.color}33`,background:form.mood===m.id?`${m.color}18`:"transparent",color:form.mood===m.id?m.color:T.textSecond,fontFamily:"'Poppins',sans-serif",fontSize:13,fontWeight:600,transition:"all .15s"}}>{m.emoji} {m.label}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:18}}><label className="lbl">Reflection / Notes</label>
          <textarea className="fld" rows={3} placeholder="What did you learn? Struggles? Thoughts for tomorrow..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{resize:"vertical"}}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn bp" onClick={sub}>{editId?"Update Entry":"Log Entry"}</button>
          {editId&&<button className="btn bg" onClick={()=>{setEditId(null);setForm(em);}}>Cancel</button>}
        </div>
      </div>

      <div className="r3 seg" style={{alignSelf:"flex-start"}}>
        {["list","heatmap"].map(t=><button key={t} className={`sb${tab===t?" on":""}`} onClick={()=>setTab(t)}>{t==="list"?"📋 List View":"🟦 Heatmap"}</button>)}
      </div>

      {tab==="heatmap"&&(
        <div className="r4 card" style={{padding:22}}>
          <span className="lbl">Activity — Last 90 Days</span>
          <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
            {Array.from({length:90},(_,i)=>{
              const d=new Date();d.setDate(d.getDate()-(89-i));
              const iso=d.toISOString().slice(0,10);
              const h=entries.filter(e=>e.date===iso).reduce((s,e)=>s+Number(e.hours),0);
              const mx=Math.max(1,...entries.map(e=>Number(e.hours)));
              const t=h/mx;
              const c=theme==="dark"?(!h?"#1A2235":t<.25?"#1E3A5F":t<.5?"#2563EB":t<.75?"#4F46E5":"#6366F1"):(!h?"#F1F5F9":t<.25?"#DBEAFE":t<.5?"#BFDBFE":t<.75?"#93C5FD":"#4F46E5");
              return(<div key={iso} title={`${iso}: ${h}h`} style={{width:12,height:12,borderRadius:3,background:c,cursor:"pointer",flexShrink:0,transition:"transform .1s"}} onMouseEnter={e=>e.target.style.transform="scale(1.5)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}/>);
            })}
          </div>
        </div>
      )}

      {tab==="list"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {entries.length===0&&<div className="r4 card" style={{padding:24,textAlign:"center",color:T.textMuted}}>No entries yet. Log your first session above!</div>}
          {entries.map((e,i)=>(
            <div key={e.id} className={`card ch r${Math.min(i+4,8)}`} style={{padding:"16px 18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
                    <span className="pill" style={{background:T.primaryDim,color:T.primary,border:`1px solid ${T.borderAccent}`}}>{e.subject}</span>
                    <MPill mood={e.mood} T={T}/>
                    <span style={{fontSize:11,color:T.textMuted}}>{fmtDate(e.date)}</span>
                  </div>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{e.topic||"—"}</div>
                  {e.notes&&<div style={{fontSize:12,color:T.textSecond,lineHeight:1.65}}>{e.notes}</div>}
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:26,fontWeight:800,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>{e.hours}h</div>
                  <div style={{display:"flex",gap:6,marginTop:8,justifyContent:"flex-end"}}>
                    <button className="btn bg" style={{padding:"4px 12px",fontSize:11}} onClick={()=>se(e)}>Edit</button>
                    <button className="btn bd" onClick={()=>del(e.id)}>✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PLANNER
// ─────────────────────────────────────────────────────────────────
function PPlanner({T,theme,tasks,setTasks}){
  const em={title:"",subject:"",deadline:"",priority:"medium"};
  const[form,setForm]=useState(em);
  const[filter,setFilter]=useState("all");
  const add=()=>{if(!form.title)return;setTasks(p=>[...p,{...form,id:Date.now(),completed:false}]);setForm(em);};
  const tog=id=>setTasks(p=>p.map(t=>t.id===id?{...t,completed:!t.completed}:t));
  const del=id=>setTasks(p=>p.filter(t=>t.id!==id));
  const PC={high:T.red,medium:T.yellow,low:T.green};
  const isOD=t=>t.deadline&&!t.completed&&new Date(t.deadline)<new Date();
  const shown=tasks.filter(t=>filter==="all"?true:filter==="pending"?!t.completed:filter==="done"?t.completed:t.priority===filter);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <PH icon="📋" title="Study Planner" sub="Organize tasks. Crush deadlines." T={T}/>
      <div className="r2 card" style={{padding:22}}>
        <div style={{fontSize:12,fontWeight:700,color:T.primary,letterSpacing:1,textTransform:"uppercase",marginBottom:16}}>＋ Add Task</div>
        <div style={{marginBottom:14}}><label className="lbl">Task Title</label>
          <input className="fld" placeholder="e.g. Solve 25 PYQs — Algorithms" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        </div>
        <div className="g3" style={{marginBottom:18}}>
          <div><label className="lbl">Subject</label>
            <select className="fld" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>
              <option value="">General</option>{SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="lbl">Deadline</label>
            <input className="fld" type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})}/>
          </div>
          <div><label className="lbl">Priority</label>
            <select className="fld" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
              <option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
            </select>
          </div>
        </div>
        <button className="btn bp" onClick={add}>Add to Queue</button>
      </div>
      <div className="r3 seg" style={{alignSelf:"flex-start",flexWrap:"wrap"}}>
        {["all","pending","done","high","medium","low"].map(f=><button key={f} className={`sb${filter===f?" on":""}`} onClick={()=>setFilter(f)} style={{textTransform:"capitalize"}}>{f}</button>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {shown.length===0&&<div className="r4 card" style={{padding:24,textAlign:"center",color:T.textMuted}}>Nothing here!</div>}
        {shown.map((t,i)=>(
          <div key={t.id} className={`card ch r${Math.min(i+4,8)}`} style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,opacity:t.completed?.55:1,borderColor:isOD(t)?`${T.red}44`:t.completed?`${T.green}33`:T.border,background:isOD(t)?(theme==="dark"?"rgba(239,68,68,.05)":"rgba(220,38,38,.03)"):undefined}}>
            <div onClick={()=>tog(t.id)} style={{width:20,height:20,borderRadius:6,flexShrink:0,cursor:"pointer",border:`2px solid ${t.completed?T.green:T.textMuted}`,background:t.completed?T.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white",transition:"all .2s"}}>{t.completed?"✓":""}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontSize:14,fontWeight:t.completed?400:600,color:t.completed?T.textMuted:T.textPrimary,textDecoration:t.completed?"line-through":"none"}}>{t.title}</span>
                <span className="pill" style={{background:`${PC[t.priority]}18`,color:PC[t.priority],border:`1px solid ${PC[t.priority]}33`,fontSize:10}}>{t.priority}</span>
                {isOD(t)&&<span className="pill" style={{background:`${T.red}18`,color:T.red,border:`1px solid ${T.red}33`,fontSize:10}}>Overdue</span>}
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {t.subject&&<span style={{fontSize:11,color:T.primary,fontWeight:500}}>📚 {t.subject}</span>}
                {t.deadline&&<span style={{fontSize:11,color:isOD(t)?T.red:T.textMuted}}>📅 {fmtDate(t.deadline)}</span>}
              </div>
            </div>
            <button className="btn bd" onClick={()=>del(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────────────────────────
function PMocks({T,theme,mocks,setMocks}){
  const[form,setForm]=useState({date:todayStr(),score:"",maths:"",algo:"",network:"",os:"",notes:""});
  const add=()=>{if(!form.score)return;setMocks(p=>[...p,{...form,id:Date.now()}]);setForm({date:todayStr(),score:"",maths:"",algo:"",network:"",os:"",notes:""});};
  const del=id=>setMocks(p=>p.filter(m=>m.id!==id));
  const avg=mocks.length?(mocks.reduce((s,m)=>s+Number(m.score),0)/mocks.length).toFixed(1):0;
  const best=mocks.length?Math.max(...mocks.map(m=>Number(m.score))):0;
  const maxS=Math.max(100,...mocks.map(m=>Number(m.score)));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <PH icon="📊" title="Mock Test Tracker" sub="Track every attempt. Spot weak zones." T={T}/>
      <div className="r2 g3">
        <SC icon="📝" val={mocks.length} label="Tests Done" color={T.primary} T={T} theme={theme}/>
        <SC icon="📈" val={avg} label="Avg Score" color={T.yellow} T={T} theme={theme} sub="out of 100"/>
        <SC icon="🏆" val={best} label="Best Score" color={T.green} T={T} theme={theme} sub="out of 100"/>
      </div>
      {mocks.length>1&&(
        <div className="r3 card" style={{padding:22}}>
          <span className="lbl">Score Progression</span>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:90}}>
            {mocks.map((m,i)=>{
              const h=Math.round((Number(m.score)/maxS)*84);
              const isLast=i===mocks.length-1;
              const isPeak=Number(m.score)===best;
              return(
                <div key={m.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}} title={`Mock ${i+1}: ${m.score}`}>
                  {isLast&&<div style={{fontSize:10,color:T.primary,fontWeight:700,marginBottom:3,background:T.primaryDim,padding:"1px 5px",borderRadius:4}}>{m.score}</div>}
                  <div style={{width:"100%",maxWidth:36,height:Math.max(h,3),borderRadius:"5px 5px 0 0",background:isPeak?T.gradGreen:isLast?T.gradPrimary:`linear-gradient(180deg,${T.primary}88,${T.primary}33)`,boxShadow:isLast?`0 0 12px ${T.primaryGlow}`:"none",transition:"height .8s ease"}}/>
                  <div style={{fontSize:9,color:T.textMuted,marginTop:4}}>T{i+1}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="r4 card" style={{padding:22}}>
        <div style={{fontSize:12,fontWeight:700,color:T.primary,letterSpacing:1,textTransform:"uppercase",marginBottom:16}}>＋ Log Mock Test</div>
        <div className="g2" style={{marginBottom:14}}>
          <div><label className="lbl">Date</label><input className="fld" type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
          <div><label className="lbl">Overall Score (/ 100)</label><input className="fld" type="number" min="0" max="100" placeholder="e.g. 74" value={form.score} onChange={e=>setForm({...form,score:e.target.value})}/></div>
        </div>
        <div className="g2" style={{marginBottom:14}}>
          {[["maths","Mathematics"],["algo","Algorithms"],["network","Networks"],["os","OS / Systems"]].map(([k,l])=>(
            <div key={k}><label className="lbl">{l}</label><input className="fld" type="number" min="0" max="25" placeholder="marks" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
          ))}
        </div>
        <div style={{marginBottom:18}}><label className="lbl">Notes / Weak Areas</label>
          <textarea className="fld" rows={2} placeholder="e.g. Struggled with TOC, Networks was strong..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={{resize:"vertical"}}/>
        </div>
        <button className="btn bp" onClick={add}>Log Mock Test</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {mocks.map((m,i)=>{
          const sc=Number(m.score);
          const color=sc>=75?T.green:sc>=50?T.yellow:T.red;
          return(
            <div key={m.id} className={`card ch r${Math.min(i+5,8)}`} style={{padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>Mock #{mocks.length-i} <span style={{fontSize:12,color:T.textMuted,fontWeight:400}}>{fmtDate(m.date)}</span></div>
                {m.notes&&<div style={{fontSize:12,color:T.textSecond,marginBottom:6}}>{m.notes}</div>}
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[["maths","Maths"],["algo","Algo"],["network","Net"],["os","OS"]].filter(([k])=>m[k]).map(([k,l])=>(
                    <span key={k} className="pill" style={{background:T.primaryDim,color:T.textSecond,border:`1px solid ${T.border}`,fontSize:10}}>{l}: {m[k]}</span>
                  ))}
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:38,fontWeight:800,color,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{m.score}</div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>/ 100</div>
                <button className="btn bd" style={{marginTop:8}} onClick={()=>del(m.id)}>✕</button>
              </div>
            </div>
          );
        })}
        {mocks.length===0&&<div className="r5 card" style={{padding:24,textAlign:"center",color:T.textMuted}}>No mock tests logged yet.</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FOCUS TIMER
// ─────────────────────────────────────────────────────────────────
function PFocus({T,theme,pomoCount,setPomoCount}){
  const DURS=[{id:"25",label:"Pomodoro",min:25},{id:"50",label:"Deep Work",min:50},{id:"10",label:"Short",min:10}];
  const[dur,setDur]=useState(25);
  const[tl,setTl]=useState(25*60);
  const[running,setRunning]=useState(false);
  const[phase,setPhase]=useState("work");
  const[sessions,setSessions]=useState(0);
  const ref=useRef(null);
  useEffect(()=>{setTl(dur*60);setRunning(false);setPhase("work");},[dur]);
  useEffect(()=>{
    if(running){ref.current=setInterval(()=>{setTl(p=>{if(p<=1){clearInterval(ref.current);setRunning(false);if(phase==="work"){setPomoCount(c=>c+1);setSessions(s=>s+1);setPhase("break");return 5*60;}else{setPhase("work");return dur*60;}}return p-1;});},1000);}
    else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[running,phase]);
  const mm=String(Math.floor(tl/60)).padStart(2,"0"),ss=String(tl%60).padStart(2,"0");
  const pct=phase==="work"?1-tl/(dur*60):1-tl/300;
  const C=2*Math.PI*82;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18,alignItems:"center"}}>
      <PH icon="⏱️" title="Focus Timer" sub="Pomodoro · Deep Work · Lock In" T={T}/>
      <div className="r2 seg">
        {DURS.map(d=><button key={d.id} className={`sb${dur===d.min?" on":""}`} onClick={()=>setDur(d.min)}>{d.label} · {d.min}m</button>)}
      </div>
      <div className="r3" style={{position:"relative",width:220,height:220}}>
        {running&&<div style={{position:"absolute",inset:-10,borderRadius:"50%",background:`radial-gradient(circle,${T.primaryGlow} 0%,transparent 65%)`,animation:"pulse 2.5s ease-in-out infinite"}}/>}
        <svg width={220} height={220} style={{transform:"rotate(-90deg)"}}>
          <circle cx={110} cy={110} r={82} fill="none" stroke={theme==="dark"?"#1A2235":"#F1F5F9"} strokeWidth={10}/>
          <circle cx={110} cy={110} r={82} fill="none" stroke={phase==="work"?"url(#pfg)":"url(#pfgg)"} strokeWidth={10} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C*(1-pct)} style={{transition:"stroke-dashoffset 1s linear"}}/>
          <defs>
            <linearGradient id="pfg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={T.primary}/><stop offset="100%" stopColor={T.purple}/></linearGradient>
            <linearGradient id="pfgg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={T.green}/><stop offset="100%" stopColor="#16A34A"/></linearGradient>
          </defs>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:48,fontWeight:700,color:phase==="work"?T.primary:T.green,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{mm}:{ss}</div>
          <div style={{fontSize:11,color:T.textMuted,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginTop:6}}>{phase==="work"?"FOCUS":"BREAK"}</div>
          {running&&<div style={{width:8,height:8,borderRadius:"50%",background:T.green,marginTop:8,boxShadow:`0 0 8px ${T.green}`,animation:"pulse 1.5s ease-in-out infinite"}}/>}
        </div>
      </div>
      <div className="r4" style={{display:"flex",gap:12}}>
        <button className="btn bp" onClick={()=>setRunning(r=>!r)} style={{minWidth:140,padding:"13px 32px",fontSize:16}}>{running?"⏸  Pause":"▶  Start"}</button>
        <button className="btn bg" onClick={()=>{setRunning(false);setTl(dur*60);setPhase("work");}}>↺ Reset</button>
      </div>
      <div className="r5 g3" style={{width:"100%",maxWidth:480}}>
        <SC icon="🍅" val={sessions} label="Today" color={T.red} T={T} theme={theme}/>
        <SC icon="✦" val={pomoCount} label="Total" color={T.primary} T={T} theme={theme}/>
        <SC icon="⏱️" val={`${Math.round(sessions*dur/60*10)/10}h`} label="Focus Time" color={T.green} T={T} theme={theme}/>
      </div>
      <div className="r6 card" style={{maxWidth:460,padding:"20px 24px",textAlign:"center",borderColor:T.borderAccent}}>
        <div style={{fontSize:26,marginBottom:10}}>💬</div>
        <div style={{fontSize:14,color:T.textSecond,fontStyle:"italic",lineHeight:1.8}}>"Discipline is choosing between what you want now and what you want most."</div>
        <div style={{fontSize:11,color:T.primary,fontWeight:700,marginTop:10,letterSpacing:1}}>— YOUR FUTURE SELF</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MOTIVATION
// ─────────────────────────────────────────────────────────────────
function PMotivation({T,theme,entries,customQ,setCustomQ}){
  const[mood,setMood]=useState("lazy");
  const[shown,setShown]=useState(null);
  const[newQ,setNewQ]=useState("");
  const todayMood=entries.find(e=>e.date===todayStr())?.mood;
  const m=MOODS.find(x=>x.id===mood);
  const all=[...(MOTIVATION[mood]||[]),...customQ.filter(q=>q.mood===mood).map(q=>q.text)];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <PH icon="✦" title="Motivation Engine" sub="Fuel for your discipline." T={T}/>
      {todayMood&&(()=>{const mm=MOODS.find(x=>x.id===todayMood);return mm?(
        <div className="r2 card" style={{padding:20,background:theme==="dark"?`${mm.color}0d`:`${mm.color}08`,borderColor:`${mm.color}33`}}>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <div style={{fontSize:38}}>{mm.emoji}</div>
            <div>
              <div style={{fontSize:11,color:T.textMuted,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:4}}>Today's Mood</div>
              <div style={{fontSize:20,fontWeight:800,color:mm.color}}>{mm.label}</div>
              <div style={{fontSize:13,color:T.textSecond,marginTop:6,lineHeight:1.7,fontStyle:"italic"}}>"{MOTIVATION[todayMood][0]}"</div>
            </div>
          </div>
        </div>
      ):null;})()}
      <div className="r3">
        <span className="lbl">Choose Mood</span>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {MOODS.map(x=><button key={x.id} onClick={()=>setMood(x.id)} style={{padding:"9px 18px",borderRadius:12,cursor:"pointer",border:"1px solid",outline:"none",borderColor:mood===x.id?x.color:`${x.color}33`,background:mood===x.id?`${x.color}18`:"transparent",color:mood===x.id?x.color:T.textSecond,fontFamily:"'Poppins',sans-serif",fontSize:13,fontWeight:600,transition:"all .15s"}}>{x.emoji} {x.label}</button>)}
        </div>
      </div>
      <div className="r4 card" style={{padding:24,textAlign:"center",borderColor:T.borderAccent}}>
        <button className="btn bp" style={{marginBottom:18,padding:"13px 36px",fontSize:15}} onClick={()=>setShown(all[Math.floor(Math.random()*all.length)])}>✦ Get Motivation Hit</button>
        {shown&&<div style={{fontSize:16,color:T.textPrimary,lineHeight:1.8,fontStyle:"italic",padding:"0 16px",animation:"fadeUp .35s ease forwards"}}>"{shown}"</div>}
      </div>
      <div className="r5 card" style={{padding:22}}>
        <span className="lbl">{m?.emoji} Quotes for {m?.label}</span>
        {all.map((q,i)=>(
          <div key={i} style={{padding:"12px 0",borderBottom:`1px solid ${T.border}`,fontSize:13,color:T.textSecond,lineHeight:1.75}}>
            <span style={{color:T.primary,fontWeight:700,marginRight:10,fontFamily:"'JetBrains Mono',monospace"}}>{String(i+1).padStart(2,"0")}</span>"{q}"
          </div>
        ))}
      </div>
      <div className="r6 card" style={{padding:22}}>
        <div style={{fontSize:12,fontWeight:700,color:T.primary,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>＋ Add Your Own Quote</div>
        <textarea className="fld" rows={3} style={{marginBottom:12,resize:"vertical"}} placeholder="Write a quote that personally motivates you..." value={newQ} onChange={e=>setNewQ(e.target.value)}/>
        <button className="btn bp" onClick={()=>{if(!newQ.trim())return;setCustomQ(p=>[...p,{id:Date.now(),text:newQ,mood}]);setNewQ("");}}>Save Quote</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// FUTURE SELF
// ─────────────────────────────────────────────────────────────────
function PFuture({T,theme,futureMsgs,setFutureMsgs}){
  const[msg,setMsg]=useState("");
  const[revealed,setRevealed]=useState(null);
  const save=()=>{if(!msg.trim())return;setFutureMsgs(p=>[...p,{id:Date.now(),text:msg,date:todayStr()}]);setMsg("");};
  const open=()=>{if(!futureMsgs.length)return;setRevealed(futureMsgs[Math.floor(Math.random()*futureMsgs.length)]);};
  const del=id=>{setFutureMsgs(p=>p.filter(m=>m.id!==id));if(revealed?.id===id)setRevealed(null);};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <PH icon="💌" title="Future Self" sub="Messages across time." T={T}/>
      <div className="r2 card" style={{padding:"28px 24px",textAlign:"center",background:theme==="dark"?"linear-gradient(135deg,#0D0A2E,#14062E)":"linear-gradient(135deg,#F5F3FF,#EDE9FE)",borderColor:`${T.purple}44`}}>
        <div style={{fontSize:40,marginBottom:12}}>📬</div>
        <div style={{fontSize:16,color:T.textSecond,fontWeight:500,marginBottom:18}}>{futureMsgs.length} sealed message{futureMsgs.length!==1?"s":""} from Past Rohan waiting...</div>
        <button className="btn bp" onClick={open} style={{background:`linear-gradient(135deg,${T.purple},#9333EA)`,boxShadow:`0 4px 14px ${T.purple}44`,padding:"13px 34px",fontSize:15}}>📨 Open a Random Message</button>
        {revealed&&(
          <div style={{marginTop:22,padding:"20px 24px",background:theme==="dark"?"rgba(139,92,246,.08)":"rgba(124,58,237,.05)",border:`1px solid ${T.purple}33`,borderRadius:14,animation:"fadeUp .4s ease forwards",textAlign:"left"}}>
            <div style={{fontSize:10,color:T.purple,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>📅 Written {fmtDate(revealed.date)}</div>
            <div style={{fontSize:15,color:T.textPrimary,lineHeight:1.9,fontStyle:"italic"}}>"{revealed.text}"</div>
            <div style={{marginTop:12,fontSize:12,color:T.purple,fontWeight:700}}>— Past Rohan</div>
          </div>
        )}
      </div>
      <div className="r3 card" style={{padding:22}}>
        <div style={{fontSize:12,fontWeight:700,color:T.purple,letterSpacing:1,textTransform:"uppercase",marginBottom:14}}>✍️ Write to Future Rohan</div>
        <textarea className="fld" rows={5} style={{marginBottom:14,resize:"vertical"}} placeholder="Dear future Rohan, I want you to know that right now I am working hard... I believe you will..." value={msg} onChange={e=>setMsg(e.target.value)}/>
        <button className="btn bp" onClick={save} style={{background:`linear-gradient(135deg,${T.purple},#9333EA)`,boxShadow:`0 4px 14px ${T.purple}44`}}>Seal the Message 📩</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {futureMsgs.map((m,i)=>(
          <div key={m.id} className={`card ch r${Math.min(i+4,8)}`} style={{padding:"16px 18px",borderColor:`${T.purple}22`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:10,color:T.textMuted,letterSpacing:1,marginBottom:6}}>📅 {fmtDate(m.date)}</div>
                <div style={{fontSize:13,color:T.textSecond,lineHeight:1.7}}>{m.text.slice(0,140)}{m.text.length>140?"...":""}</div>
              </div>
              <button className="btn bd" onClick={()=>del(m.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// REWARDS
// ─────────────────────────────────────────────────────────────────
function PRewards({T,theme,badges,streak,totalHours,pomoCount}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <PH icon="🏆" title="Rewards & Badges" sub="Every milestone earns recognition." T={T}/>
      <div className="r2 card" style={{padding:22}}>
        <span className="lbl">Overall Progress</span>
        <div className="g4">
          <SC icon="🔥" val={streak} label="Day Streak" color={T.yellow} T={T} theme={theme}/>
          <SC icon="⏱️" val={`${totalHours.toFixed(0)}h`} label="Study Hours" color={T.primary} T={T} theme={theme}/>
          <SC icon="🍅" val={pomoCount} label="Pomodoros" color={T.red} T={T} theme={theme}/>
          <SC icon="🏅" val={badges.length} label="Badges" color={T.green} T={T} theme={theme}/>
        </div>
      </div>
      <div className="r3 g3">
        {BADGES.map((b,i)=>{
          const earned=badges.includes(b.id);
          return(
            <div key={b.id} className={`card ch r${Math.min(i+4,8)}`} style={{padding:"20px 18px",textAlign:"center",opacity:earned?1:.4,borderColor:earned?`${T.yellow}44`:T.border,background:earned?(theme==="dark"?`${T.yellow}0a`:`${T.yellow}06`):undefined,transition:"all .3s ease"}}>
              <div style={{fontSize:36,marginBottom:10,filter:earned?"none":"grayscale(1)"}}>{b.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color:earned?T.yellow:T.textMuted,marginBottom:4}}>{b.label}</div>
              <div style={{fontSize:11,color:T.textMuted,lineHeight:1.55,marginBottom:10}}>{b.desc}</div>
              {earned?<span className="pill" style={{background:`${T.yellow}18`,color:T.yellow,border:`1px solid ${T.yellow}33`,fontSize:10}}>✓ Unlocked</span>:<span className="pill" style={{background:T.primaryDim,color:T.textMuted,border:`1px solid ${T.border}`,fontSize:10}}>Locked</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DISTRACTION
// ─────────────────────────────────────────────────────────────────
function PDistraction({T,theme,distLog,addDist,todayDist}){
  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const iso=d.toISOString().slice(0,10);return{label:d.toLocaleDateString("en",{weekday:"short"}),count:distLog.find(x=>x.date===iso)?.count||0,iso};});
  const maxD=Math.max(1,...last7.map(d=>d.count));
  const total=distLog.reduce((s,d)=>s+d.count,0);
  const color=todayDist===0?T.green:todayDist<5?T.yellow:T.red;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <PH icon="⊘" title="Distraction Tracker" sub="Awareness is the first step to control." T={T}/>
      <div className="r2 card" style={{padding:"30px 24px",textAlign:"center",borderColor:`${color}44`,background:theme==="dark"?`${color}08`:`${color}05`}}>
        <div style={{fontSize:80,fontWeight:800,color,lineHeight:1,fontFamily:"'JetBrains Mono',monospace"}}>{todayDist}</div>
        <div style={{fontSize:14,color:T.textSecond,fontWeight:500,marginBottom:20,marginTop:6}}>{todayDist===0?"🛡️ Zero distractions! You're locked in.":todayDist<5?"Getting distracted a bit. Stay focused!":"Too many distractions. Refocus NOW."}</div>
        <button onClick={addDist} style={{padding:"16px 44px",borderRadius:14,cursor:"pointer",border:"none",outline:"none",background:`linear-gradient(135deg,${T.red},#F87171)`,color:"white",fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:18,boxShadow:`0 6px 20px ${T.red}44`,transition:"all .2s",letterSpacing:.5}}>⚡ I Got Distracted</button>
        <div style={{fontSize:11,color:T.textMuted,marginTop:12}}>Tap every time you break focus. Track. Reduce. Improve.</div>
      </div>
      <div className="r3 card" style={{padding:22}}>
        <span className="lbl">7-Day Graph</span>
        <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
          {last7.map(d=>{
            const h=d.count===0?4:Math.round((d.count/maxD)*74);
            return(
              <div key={d.iso} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center"}}>
                {d.count>0&&<div style={{fontSize:10,color:T.red,fontWeight:700,marginBottom:4}}>{d.count}</div>}
                <div style={{width:"100%",borderRadius:"5px 5px 0 0",height:h,minHeight:4,background:d.count===0?`linear-gradient(180deg,${T.green}55,${T.green}22)`:`linear-gradient(180deg,${T.red},${T.red}77)`,border:d.count===0?`1px solid ${T.green}44`:"none"}}/>
                <div style={{fontSize:10,color:T.textMuted,marginTop:4}}>{d.label}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="r4 g3">
        <SC icon="📅" val={todayDist} label="Today" color={color} T={T} theme={theme}/>
        <SC icon="📆" val={last7.reduce((s,d)=>s+d.count,0)} label="This Week" color={T.yellow} T={T} theme={theme}/>
        <SC icon="📊" val={total} label="All Time" color={T.red} T={T} theme={theme}/>
      </div>
      {todayDist===0&&<div className="r5 card" style={{padding:20,textAlign:"center",background:theme==="dark"?T.greenDim:T.greenDim,borderColor:`${T.green}44`}}>
        <div style={{fontSize:32,marginBottom:8}}>🛡️</div>
        <div style={{fontSize:16,fontWeight:700,color:T.green}}>Steel Mind Activated</div>
        <div style={{fontSize:13,color:T.textSecond,marginTop:4}}>Zero distractions today. Badge incoming!</div>
      </div>}
    </div>
  );
}

// PWA Mount
window.App = App;
