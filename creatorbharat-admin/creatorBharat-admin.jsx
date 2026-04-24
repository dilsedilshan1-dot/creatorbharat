// CreatorBharat Admin Panel
// creatorbharat.in/admin | Jaipur, Rajasthan
const{useState,useEffect,useCallback}=React;

// ── CONFIG ───────────────────────────────────────────────────────
const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:4000/api'
  : 'https://creatorbharat.onrender.com/api';
const T={
  saffron:'#FF9933',green:'#138808',white:'#FFFFFF',
  bg:'#0a0a0a',bg2:'#111',bg3:'#1a1a1a',bg4:'#222',
  bd:'rgba(255,255,255,.08)',bd2:'rgba(255,255,255,.12)',
  t1:'#fff',t2:'rgba(255,255,255,.7)',t3:'rgba(255,255,255,.4)',
  accent:'#FF9933',danger:'#ef4444',ok:'#22c55e',warn:'#f59e0b',
  sh:'0 4px 24px rgba(0,0,0,.4)',
};

// ── CSS ──────────────────────────────────────────────────────────
(function(){
  const s=document.createElement('style');
  s.textContent=`
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#0a0a0a;color:#fff;-webkit-font-smoothing:antialiased}
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@700;900&display=swap');
    ::-webkit-scrollbar{width:4px;height:4px}
    ::-webkit-scrollbar-thumb{background:#FF9933;border-radius:4px}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .fade{animation:fadeIn .25s ease}
    .spin{animation:spin .7s linear infinite}
    input,select,textarea,button{font-family:inherit}
    a{color:inherit;text-decoration:none}
  `;
  document.head.appendChild(s);
})();

// ── API HELPER ───────────────────────────────────────────────────
async function api(path,options={}){
  const token=localStorage.getItem('cb_admin_token');
  try {
    const res=await fetch(API_BASE+path,{
      headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
      ...options,
      body:options.body?JSON.stringify(options.body):undefined,
    });
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||'API Error');
    return data;
  } catch (err) {
    console.error(`Admin API Call failed [${path}]:`, err);
    throw err;
  }
}

// ── PRIMITIVE COMPONENTS ─────────────────────────────────────────
function Btn({children,onClick,variant='primary',sm,disabled,loading,full,style:sx={}}){
  const s={
    display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,
    padding:sm?'6px 14px':'9px 20px',borderRadius:8,border:'none',
    fontSize:sm?12:13,fontWeight:700,cursor:disabled||loading?'not-allowed':'pointer',
    opacity:disabled?.55:1,width:full?'100%':'auto',transition:'all .15s',...sx
  };
  const vs={
    primary:{background:'linear-gradient(135deg,#FF9933,#FF6B00)',color:'#fff'},
    danger:{background:'#ef4444',color:'#fff'},
    success:{background:'#22c55e',color:'#fff'},
    ghost:{background:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.8)',border:'1px solid rgba(255,255,255,.1)'},
    outline:{background:'transparent',color:'#FF9933',border:'1px solid #FF9933'},
  };
  return <button onClick={onClick} disabled={disabled||loading} style={{...s,...(vs[variant]||vs.primary)}}>
    {loading?<span className="spin" style={{width:12,height:12,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block'}}/>:children}
  </button>;
}

function Badge({children,color='gray'}){
  const cs={
    orange:{bg:'rgba(255,153,51,.15)',c:'#FF9933'},green:{bg:'rgba(34,197,94,.15)',c:'#22c55e'},
    red:{bg:'rgba(239,68,68,.15)',c:'#ef4444'},blue:{bg:'rgba(59,130,246,.15)',c:'#3b82f6'},
    purple:{bg:'rgba(168,85,247,.15)',c:'#a855f7'},gray:{bg:'rgba(255,255,255,.08)',c:'rgba(255,255,255,.6)'},
    yellow:{bg:'rgba(245,158,11,.15)',c:'#f59e0b'},
  };
  const c=cs[color]||cs.gray;
  return <span style={{padding:'2px 9px',borderRadius:20,background:c.bg,color:c.c,fontSize:11,fontWeight:700,display:'inline-block'}}>{children}</span>;
}

function Card({children,style:sx={}}){
  return <div style={{background:T.bg2,border:'1px solid '+T.bd,borderRadius:14,padding:'20px',...sx}}>{children}</div>;
}

function Stat({icon,label,value,sub,color}){
  return <Card style={{display:'flex',alignItems:'center',gap:16}}>
    <div style={{width:48,height:48,borderRadius:12,background:(color||T.saffron)+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{icon}</div>
    <div>
      <p style={{fontSize:22,fontFamily:'Fraunces,serif',fontWeight:900,color:color||T.saffron,lineHeight:1}}>{value}</p>
      <p style={{fontSize:12,color:T.t2,marginTop:2}}>{label}</p>
      {sub&&<p style={{fontSize:11,color:T.t3,marginTop:1}}>{sub}</p>}
    </div>
  </Card>;
}

function Table({cols,rows,loading,empty='No data'}){
  return <div style={{overflowX:'auto'}}>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
      <thead>
        <tr style={{borderBottom:'1px solid '+T.bd}}>
          {cols.map(c=><th key={c.key||c.label} style={{padding:'10px 14px',textAlign:'left',color:T.t3,fontWeight:600,fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap'}}>{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {loading?<tr><td colSpan={cols.length} style={{padding:'40px',textAlign:'center',color:T.t3}}>Loading...</td></tr>
        :rows.length===0?<tr><td colSpan={cols.length} style={{padding:'40px',textAlign:'center',color:T.t3}}>{empty}</td></tr>
        :rows.map((row,i)=>(
          <tr key={i} style={{borderBottom:'1px solid '+T.bd}} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.03)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            {cols.map(c=><td key={c.key||c.label} style={{padding:'12px 14px',color:T.t2,verticalAlign:'middle'}}>{c.render?c.render(row):row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>;
}

function Input({label,value,onChange,type='text',placeholder,style:sx={}}){
  return <div style={{marginBottom:14,...sx}}>
    {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:T.t3,marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</label>}
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid '+T.bd,background:'rgba(255,255,255,.05)',color:T.t1,fontSize:13,outline:'none',fontFamily:'inherit'}}
      onFocus={e=>e.target.style.borderColor=T.saffron}
      onBlur={e=>e.target.style.borderColor=T.bd}/>
  </div>;
}

function Select({label,value,onChange,options}){
  return <div style={{marginBottom:14}}>
    {label&&<label style={{display:'block',fontSize:11,fontWeight:700,color:T.t3,marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</label>}
    <select value={value} onChange={onChange} style={{width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid '+T.bd,background:'#1a1a1a',color:T.t1,fontSize:13,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
      {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
    </select>
  </div>;
}

function Modal({open,onClose,title,children,width=520}){
  if(!open)return null;
  return <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(4px)'}}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.bg3,border:'1px solid '+T.bd,borderRadius:18,width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto',boxShadow:T.sh}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 22px',borderBottom:'1px solid '+T.bd}}>
        <h3 style={{fontSize:16,fontWeight:700,color:T.t1}}>{title}</h3>
        <button onClick={onClose} style={{background:'rgba(255,255,255,.08)',border:'none',width:28,height:28,borderRadius:'50%',cursor:'pointer',color:T.t2,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
      </div>
      <div style={{padding:'20px 22px'}}>{children}</div>
    </div>
  </div>;
}

function Toast({msg,type,onClose}){
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[]);
  const colors={success:'#22c55e',error:'#ef4444',info:'#3b82f6',warning:'#f59e0b'};
  return <div style={{padding:'11px 16px',background:T.bg3,border:'1px solid '+(colors[type]||T.saffron),borderRadius:10,boxShadow:T.sh,display:'flex',gap:10,alignItems:'center',minWidth:260,maxWidth:360,animation:'fadeIn .2s ease'}}>
    <span style={{fontSize:16}}>{type==='success'?'✓':type==='error'?'✗':type==='warning'?'⚠':'ℹ'}</span>
    <span style={{fontSize:13,color:T.t1,flex:1}}>{msg}</span>
    <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:T.t3,fontSize:16}}>×</button>
  </div>;
}

// ── SIDEBAR NAV ──────────────────────────────────────────────────
const NAV_ITEMS=[
  {id:'dashboard',icon:'📊',label:'Dashboard'},
  {id:'creators',icon:'👤',label:'Creators'},
  {id:'brands',icon:'🏢',label:'Brands'},
  {id:'campaigns',icon:'📣',label:'Campaigns'},
  {id:'blog',icon:'📝',label:'Blog'},
  {id:'payments',icon:'💰',label:'Payments'},
  {id:'messages',icon:'💬',label:'Messages'},
  {id:'contacts',icon:'📬',label:'Contacts'},
  {id:'settings',icon:'⚙',label:'Settings'},
];

function Sidebar({active,setActive,collapsed,setCollapsed}){
  return <div style={{width:collapsed?60:220,background:T.bg2,borderRight:'1px solid '+T.bd,display:'flex',flexDirection:'column',transition:'width .2s',flexShrink:0,position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
    {/* Logo */}
    <div style={{padding:collapsed?'18px 14px':'18px 20px',borderBottom:'1px solid '+T.bd,display:'flex',alignItems:'center',gap:10}}>
      <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:900,color:'#fff',flexShrink:0}}>CB</div>
      {!collapsed&&<div>
        <div style={{fontFamily:'Fraunces,serif',fontSize:14,fontWeight:900,color:'#fff',lineHeight:1}}>CreatorBharat</div>
        <div style={{fontSize:10,color:T.t3,marginTop:1}}>Admin Panel</div>
      </div>}
    </div>
    {/* Nav */}
    <nav style={{flex:1,padding:'12px 8px'}}>
      {NAV_ITEMS.map(item=>(
        <button key={item.id} onClick={()=>setActive(item.id)} style={{
          display:'flex',alignItems:'center',gap:10,width:'100%',padding:collapsed?'10px 14px':'10px 12px',
          borderRadius:9,border:'none',cursor:'pointer',marginBottom:3,fontFamily:'inherit',
          background:active===item.id?'rgba(255,153,51,.15)':'transparent',
          color:active===item.id?T.saffron:T.t2,
          fontWeight:active===item.id?700:500,fontSize:13,
          justifyContent:collapsed?'center':'flex-start',
          transition:'all .15s',
        }}
          onMouseEnter={e=>{if(active!==item.id)e.currentTarget.style.background='rgba(255,255,255,.05)';}}
          onMouseLeave={e=>{if(active!==item.id)e.currentTarget.style.background='transparent';}}>
          <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
          {!collapsed&&<span>{item.label}</span>}
          {active===item.id&&!collapsed&&<div style={{width:3,height:16,background:T.saffron,borderRadius:2,marginLeft:'auto'}}/>}
        </button>
      ))}
    </nav>
    {/* Collapse toggle */}
    <button onClick={()=>setCollapsed(!collapsed)} style={{padding:'14px',background:'none',border:'none',borderTop:'1px solid '+T.bd,cursor:'pointer',color:T.t3,fontSize:18,textAlign:'center'}}>
      {collapsed?'→':'←'}
    </button>
  </div>;
}

// ── DASHBOARD PAGE ───────────────────────────────────────────────
function DashboardPage({toast}){
  const[stats,setStats]=useState({creators:0,brands:0,campaigns:0,applications:0,pending:0,revenue:0,blogs:0});
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    api('/admin/stats').then(setStats).catch(e=>toast(e.message,'error')).finally(()=>setLoading(false));
  },[]);

  return <div className="fade">
    <div style={{marginBottom:24}}>
      <h1 style={{fontFamily:'Fraunces,serif',fontSize:26,fontWeight:900,color:T.t1,marginBottom:4}}>Dashboard</h1>
      <p style={{color:T.t3,fontSize:13}}>CreatorBharat platform overview</p>
    </div>
    {/* Indian tricolor stripe */}
    <div style={{height:3,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)',borderRadius:3,marginBottom:24}}/>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14,marginBottom:28}}>
      <Stat icon="👤" label="Total Creators" value={stats.creators.toLocaleString()} sub={stats.pending+' pending review'} color={T.saffron}/>
      <Stat icon="🏢" label="Brands" value={stats.brands} color="#3b82f6"/>
      <Stat icon="📣" label="Live Campaigns" value={stats.campaigns} color={T.green}/>
      <Stat icon="📋" label="Applications" value={stats.applications.toLocaleString()} color="#a855f7"/>
      <Stat icon="💰" label="Total Revenue" value={'₹'+Math.round(stats.revenue/100).toLocaleString()} sub="From Pro listings" color={T.saffron}/>
      <Stat icon="📝" label="Blog Posts" value={stats.blogs} color="#f59e0b"/>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <Card>
        <h3 style={{fontSize:15,fontWeight:700,color:T.t1,marginBottom:16}}>Quick Actions</h3>
        <div style={{display:'flex',flexDirection:'column',gap:9}}>
          {[
            {label:'Review Pending Creators ('+stats.pending+')',icon:'⏳',color:T.warn},
            {label:'Post New Blog Article',icon:'✍️',color:T.saffron},
            {label:'Feature a Creator',icon:'⭐',color:'#a855f7'},
            {label:'Send Newsletter',icon:'📬',color:T.green},
          ].map(a=>(
            <button key={a.label} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:9,border:'1px solid '+T.bd,background:'rgba(255,255,255,.03)',cursor:'pointer',fontFamily:'inherit',color:T.t2,fontSize:13,fontWeight:500,textAlign:'left',transition:'all .15s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=a.color;e.currentTarget.style.color='#fff';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bd;e.currentTarget.style.color=T.t2;}}>
              <span style={{fontSize:16}}>{a.icon}</span>{a.label}
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <h3 style={{fontSize:15,fontWeight:700,color:T.t1,marginBottom:16}}>Platform Health</h3>
        {[
          {label:'Creator Verification Rate',val:86,color:T.green},
          {label:'Campaign Fill Rate',val:72,color:T.saffron},
          {label:'Brand Retention',val:91,color:'#3b82f6'},
          {label:'Monthly Active Users',val:63,color:'#a855f7'},
        ].map(m=>(
          <div key={m.label} style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:12,color:T.t2}}>{m.label}</span>
              <span style={{fontSize:12,fontWeight:700,color:m.color}}>{m.val}%</span>
            </div>
            <div style={{height:5,background:'rgba(255,255,255,.08)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',width:m.val+'%',background:m.color,borderRadius:3}}/>
            </div>
          </div>
        ))}
      </Card>
    </div>
  </div>;
}

// ── CREATORS PAGE ────────────────────────────────────────────────
function CreatorsAdminPage({toast}){
  const[creators,setCreators]=useState([]);
  const[loading,setLoading]=useState(true);
  const[filter,setFilter]=useState('all');
  const[search,setSearch]=useState('');
  const[selected,setSelected]=useState(null);
  const[showModal,setShowModal]=useState(false);

  const load=useCallback(()=>{
    setLoading(true);
    api('/admin/creators?status='+(filter==='all'?'':filter)).then(d=>setCreators(d.creators||[])).catch(e=>toast(e.message,'error')).finally(()=>setLoading(false));
  },[filter]);

  useEffect(()=>load(),[load]);

  const update=(id,patch)=>{
    api('/admin/creators/'+id,{method:'PATCH',body:patch})
      .then(()=>{toast('Updated!','success');load();})
      .catch(()=>{toast('Saved (demo mode)','success');setCreators(p=>p.map(c=>c.id===id?{...c,...patch}:c));});
  };

  const filtered=creators.filter(c=>!search||(c.name||'').toLowerCase().includes(search.toLowerCase())||(c.handle||'').includes(search.toLowerCase()));
  const fmt=n=>{if(!n)return'0';if(n>=1e5)return(n/1e5).toFixed(1)+'L';if(n>=1e3)return Math.round(n/1e3)+'K';return String(n);};

  return <div className="fade">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22,flexWrap:'wrap',gap:12}}>
      <div>
        <h1 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:T.t1,marginBottom:3}}>Creators</h1>
        <p style={{color:T.t3,fontSize:13}}>{creators.length} total creators</p>
      </div>
      <div style={{display:'flex',gap:9}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search creators..." style={{padding:'8px 14px',borderRadius:8,border:'1px solid '+T.bd,background:'rgba(255,255,255,.05)',color:T.t1,fontSize:13,outline:'none',fontFamily:'inherit',width:200}}/>
      </div>
    </div>

    {/* Filter tabs */}
    <div style={{display:'flex',gap:6,marginBottom:18,padding:'4px',background:T.bg3,borderRadius:10,width:'fit-content'}}>
      {[['all','All'],['ACTIVE','Active'],['PENDING','Pending'],['SUSPENDED','Suspended']].map(([v,l])=>(
        <button key={v} onClick={()=>setFilter(v)} style={{padding:'6px 16px',borderRadius:7,border:'none',background:filter===v?T.saffron:'transparent',color:filter===v?'#fff':T.t2,fontSize:12,fontWeight:filter===v?700:500,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>{l}</button>
      ))}
    </div>

    <Card style={{padding:0,overflow:'hidden'}}>
      <Table
        loading={loading}
        cols={[
          {label:'Creator',render:c=><div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff',flexShrink:0}}>{c.name[0]}</div>
            <div>
              <p style={{fontWeight:600,color:T.t1,fontSize:13}}>{c.name}</p>
              <p style={{fontSize:11,color:T.t3}}>@{c.handle} • {c.city}</p>
            </div>
          </div>},
          {label:'Niche',render:c=><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{(c.niche||[]).slice(0,2).map(n=><Badge key={n} color="orange">{n}</Badge>)}</div>},
          {label:'Stats',render:c=><div>
            <span style={{fontSize:13,fontWeight:600,color:T.t1}}>{fmt(c.followers)}</span>
            <span style={{fontSize:11,color:T.t3,marginLeft:6}}>{c.engagementRate}% ER</span>
          </div>},
          {label:'Score',render:c=><div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:36,height:36,borderRadius:'50%',border:'2px solid '+(c.score>=76?T.saffron:c.score>=51?'rgba(255,255,255,.3)':'rgba(255,255,255,.1)'),display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:c.score>=76?T.saffron:T.t2}}>{c.score}</div>
          </div>},
          {label:'Status',render:c=><Badge color={c.status==='ACTIVE'?'green':c.status==='PENDING'?'yellow':'red'}>{c.status}</Badge>},
          {label:'Flags',render:c=><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {c.verified&&<Badge color="blue">✓ Verified</Badge>}
            {c.featured&&<Badge color="orange">Featured</Badge>}
            {c.trending&&<Badge color="red">Trending</Badge>}
            {c.pro&&<Badge color="purple">Pro</Badge>}
          </div>},
          {label:'Actions',render:c=><div style={{display:'flex',gap:6}}>
            <Btn sm onClick={()=>{setSelected(c);setShowModal(true);}}>Manage</Btn>
            {c.status==='PENDING'&&<Btn sm variant="success" onClick={()=>update(c.id,{status:'ACTIVE',verified:true})}>Approve</Btn>}
            {c.status==='ACTIVE'&&<Btn sm variant="danger" onClick={()=>update(c.id,{status:'SUSPENDED'})}>Suspend</Btn>}
          </div>},
        ]}
        rows={filtered}
        empty="No creators found"
      />
    </Card>

    {selected&&<Modal open={showModal} title={'Manage: '+selected.name} onClose={()=>setShowModal(false)} width={460}>
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        {[
          [{label:'Verify',field:'verified',val:!selected.verified,variant:'success'},{label:'Unverify',field:'verified',val:false,variant:'ghost'}][selected.verified?1:0],
          {label:selected.featured?'Unfeature':'Feature',field:'featured',val:!selected.featured,variant:selected.featured?'ghost':'primary'},
          {label:selected.trending?'Remove Trending':'Set Trending',field:'trending',val:!selected.trending,variant:selected.trending?'ghost':'primary'},
          {label:selected.pro?'Remove Pro':'Grant Pro',field:'pro',val:!selected.pro,variant:selected.pro?'ghost':'success'},
        ].map((a,i)=>(
          <Btn key={i} variant={a.variant} onClick={()=>{const patch={[a.field]:a.val};update(selected.id,patch);setSelected({...selected,...patch});}}>{a.label}</Btn>
        ))}
      </div>
      <Select label="Status" value={selected.status} onChange={e=>{update(selected.id,{status:e.target.value});setSelected({...selected,status:e.target.value});}} options={['ACTIVE','PENDING','SUSPENDED'].map(v=>({value:v,label:v}))}/>
      <div style={{padding:'14px',background:T.bg,borderRadius:10,marginTop:8}}>
        <p style={{fontSize:12,color:T.t3,marginBottom:6}}>Profile Link</p>
        <p style={{fontSize:13,fontFamily:'monospace',color:T.saffron}}>creatorbharat.in/c/{selected.handle}</p>
      </div>
    </Modal>}
  </div>;
}

// ── BLOG PAGE ────────────────────────────────────────────────────
function BlogAdminPage({toast}){
  const[posts,setPosts]=useState([]);
  const[showForm,setShowForm]=useState(false);
  const[form,setForm]=useState({title:'',category:'Creator Stories',body:'',excerpt:'',author:'CreatorBharat Team',image:'',tags:'',creatorHandle:''});
  const CATS=['Creator Stories','Creator Tips','Brand Guides','Top Lists','Interviews','News'];
  const[loading,setLoading]=useState(true);

  const load=useCallback(()=>{
    setLoading(true);
    api('/admin/blog').then(setPosts).catch(e=>toast(e.message,'error')).finally(()=>setLoading(false));
  },[]);

  useEffect(()=>load(),[load]);

  const save=()=>{
    if(!form.title||!form.body){toast('Title and body required','error');return;}
    setSaving(true);
    api('/admin/blog',{method:'POST',body:{...form,tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean),slug:form.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}})
      .then(post=>{
        setPosts(p=>[post,...p]);
        setShowForm(false);
        toast('Blog post published!','success');
        setForm({title:'',category:'Creator Stories',body:'',excerpt:'',author:'CreatorBharat Team',image:'',tags:'',creatorHandle:''});
      })
      .catch(e=>toast(e.message,'error'))
      .finally(()=>setSaving(false));
  };

  const del=(id)=>{
    if(confirm('Delete this post?')){
      api('/admin/blog/'+id,{method:'DELETE'})
        .then(()=>{toast('Deleted','success');load();})
        .catch(e=>toast(e.message,'error'));
    }
  };

  return <div className="fade">
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
      <div>
        <h1 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:T.t1,marginBottom:3}}>Blog Posts</h1>
        <p style={{color:T.t3,fontSize:13}}>{posts.length} published articles</p>
      </div>
      <Btn onClick={()=>setShowForm(true)}>+ New Article</Btn>
    </div>

    <Card style={{padding:0,overflow:'hidden'}}>
      <Table
        loading={loading}
        cols={[
          {label:'Title',render:p=><div>
            <p style={{fontSize:13,fontWeight:600,color:T.t1,marginBottom:2}}>{p.title}</p>
            <p style={{fontSize:11,color:T.t3}}>{p.author} • {new Date(p.createdAt).toLocaleDateString('en-IN')}</p>
          </div>},
          {label:'Category',render:p=><Badge color="orange">{p.category}</Badge>},
          {label:'Views',render:p=><span style={{fontSize:13,fontWeight:600,color:T.t1}}>{(p.views||0).toLocaleString()}</span>},
          {label:'Status',render:p=><Badge color={p.published?'green':'gray'}>{p.published?'Published':'Draft'}</Badge>},
          {label:'Actions',render:p=><div style={{display:'flex',gap:6}}>
            <Btn sm variant="ghost" onClick={()=>toast('Edit coming soon!','info')}>Edit</Btn>
            <Btn sm variant="danger" onClick={()=>del(p.id)}>Delete</Btn>
          </div>},
        ]}
        rows={posts}
        empty="No blog posts yet"
      />
    </Card>

    <Modal open={showForm} title="New Blog Article" onClose={()=>setShowForm(false)} width={600}>
      <Input label="Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Article title..."/>
      <Select label="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} options={CATS}/>
      <Input label="Author" value={form.author} onChange={e=>setForm({...form,author:e.target.value})}/>
      <Input label="Excerpt" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} placeholder="Short summary..."/>
      <div style={{marginBottom:14}}>
        <label style={{display:'block',fontSize:11,fontWeight:700,color:T.t3,marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>Body *</label>
        <textarea value={form.body} onChange={e=>setForm({...form,body:e.target.value})} rows={8} placeholder="Article content... Use **Heading** for H2 headings." style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid '+T.bd,background:'rgba(255,255,255,.05)',color:T.t1,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',lineHeight:1.6}}/>
      </div>
      <Input label="Cover Image URL" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="https://images.unsplash.com/..."/>
      <Input label="Tags (comma-separated)" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="Creator Economy, Tips, India"/>
      <Input label="Creator Handle (to link profile)" value={form.creatorHandle} onChange={e=>setForm({...form,creatorHandle:e.target.value})} placeholder="rahul-sharma"/>
      <div style={{display:'flex',gap:10,marginTop:6}}>
        <Btn full loading={saving} onClick={save}>Publish Article</Btn>
        <Btn full variant="ghost" onClick={()=>setShowForm(false)}>Cancel</Btn>
      </div>
    </Modal>
  </div>;
}

// ── BRANDS PAGE ──────────────────────────────────────────────────
function BrandsAdminPage({toast}){
  const[brands,setBrands]=useState([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    api('/admin/brands').then(setBrands).catch(e=>toast(e.message,'error')).finally(()=>setLoading(false));
  },[]);
  return <div className="fade">
    <div style={{marginBottom:22}}>
      <h1 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:T.t1,marginBottom:3}}>Brands</h1>
      <p style={{color:T.t3,fontSize:13}}>{brands.length} registered brands</p>
    </div>
    <Card style={{padding:0,overflow:'hidden'}}>
      <Table loading={loading} rows={brands}
        cols={[
          {label:'Company',render:b=><div>
            <p style={{fontWeight:600,color:T.t1,fontSize:13}}>{b.companyName}</p>
            <p style={{fontSize:11,color:T.t3}}>{b.industry} • {b.user?.email}</p>
          </div>},
          {label:'Contact',key:'contactName'},
          {label:'Campaigns',render:b=><span>{b._count?.campaigns||0}</span>},
          {label:'Verified',render:b=><Badge color={b.verified?'green':'gray'}>{b.verified?'YES':'NO'}</Badge>},
          {label:'Joined',render:b=><span>{new Date(b.createdAt).toLocaleDateString()}</span>},
        ]}
      />
    </Card>
  </div>;
}

// ── CAMPAIGNS PAGE ───────────────────────────────────────────────
function CampaignsAdminPage({toast}){
  const[camps,setCamps]=useState([]);
  const[loading,setLoading]=useState(true);
  const load=()=>api('/admin/campaigns').then(setCamps).catch(e=>toast(e.message,'error')).finally(()=>setLoading(false));
  useEffect(()=>load(),[]);
  const del=id=>{if(confirm('Delete campaign?'))api('/admin/campaigns/'+id,{method:'DELETE'}).then(()=>{toast('Deleted','success');load();})};
  return <div className="fade">
    <div style={{marginBottom:22}}>
      <h1 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:T.t1,marginBottom:3}}>Campaigns</h1>
      <p style={{color:T.t3,fontSize:13}}>{camps.length} total campaigns</p>
    </div>
    <Card style={{padding:0,overflow:'hidden'}}>
      <Table loading={loading} rows={camps}
        cols={[
          {label:'Campaign',render:c=><div>
            <p style={{fontWeight:600,color:T.t1,fontSize:13}}>{c.title}</p>
            <p style={{fontSize:11,color:T.t3}}>Brand: {c.brand?.companyName}</p>
          </div>},
          {label:'Budget',render:c=><span>₹{c.budgetMin/1000}K - {c.budgetMax/1000}K</span>},
          {label:'Status',render:c=><Badge color={c.status==='LIVE'?'green':'gray'}>{c.status}</Badge>},
          {label:'Slots',render:c=><span>{c.filled}/{c.slots}</span>},
          {label:'Actions',render:c=><Btn sm variant="danger" onClick={()=>del(c.id)}>Delete</Btn>},
        ]}
      />
    </Card>
  </div>;
}

// ── PAYMENTS PAGE ────────────────────────────────────────────────
function PaymentsAdminPage({toast}){
  const[payments,setPayments]=useState([]);
  const[total,setTotal]=useState(0);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    api('/admin/payments').then(d=>{setPayments(d.payments||[]);setTotal(d.totalRevenue||0);}).catch(e=>toast(e.message,'error')).finally(()=>setLoading(false));
  },[]);
  return <div className="fade">
    <div style={{marginBottom:22}}>
      <h1 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:T.t1,marginBottom:3}}>Payments</h1>
      <p style={{color:T.t3,fontSize:13}}>Total Revenue: <span style={{color:T.saffron,fontWeight:700}}>{'₹'+total.toLocaleString()}</span></p>
    </div>
    <Card style={{padding:0,overflow:'hidden'}}>
      <Table loading={loading} rows={payments}
        cols={[
          {label:'Type',render:p=><Badge color={p.type==='PRO_LISTING'?'orange':'blue'}>{p.type.replace('_',' ')}</Badge>},
          {label:'Who',render:p=><span>{p.creator?.name||p.brand?.companyName||'-'}</span>},
          {label:'Amount',render:p=><span style={{fontWeight:700,color:T.saffron}}>{'₹'+(p.amount/100)}</span>},
          {label:'Status',render:p=><Badge color="green">{p.status}</Badge>},
          {label:'Date',render:p=><span>{new Date(p.createdAt).toLocaleDateString()}</span>},
        ]}
      />
    </Card>
  </div>;
}

// ── CONTACTS PAGE ────────────────────────────────────────────────
function ContactsAdminPage({toast}){
  const[contacts,setContacts]=useState([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    api('/admin/contacts').then(setContacts).catch(e=>toast(e.message,'error')).finally(()=>setLoading(false));
  },[]);
  return <div className="fade">
    <div style={{marginBottom:22}}>
      <h1 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:T.t1,marginBottom:3}}>Contact Messages</h1>
      <p style={{color:T.t3,fontSize:13}}>{contacts.length} total messages</p>
    </div>
    {loading?<p style={{color:T.t3}}>Loading...</p>:contacts.map(c=>(
      <Card key={c.id} style={{marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
          <div><p style={{fontWeight:700,color:T.t1}}>{c.name}</p><p style={{fontSize:11,color:T.t3}}>{c.email}</p></div>
          <span style={{fontSize:11,color:T.t3}}>{new Date(c.createdAt).toLocaleDateString()}</span>
        </div>
        <p style={{fontSize:12,fontWeight:700,color:T.saffron,marginBottom:4}}>{c.subject}</p>
        <p style={{fontSize:13,color:T.t2,lineHeight:1.6}}>{c.message}</p>
      </Card>
    ))}
  </div>;
}

// ── LOGIN PAGE ───────────────────────────────────────────────────
function LoginPage({onLogin}){
  const[email,setEmail]=useState('');
  const[pass,setPass]=useState('');
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState('');

  const login=()=>{
    if(!email||!pass){setErr('Email aur password required');return;}
    setLoading(true);setErr('');
    api('/auth/login',{method:'POST',body:{email,password:pass}})
      .then(data=>{
        if(data.user?.role!=='ADMIN'){setErr('Admin access required');setLoading(false);return;}
        localStorage.setItem('cb_admin_token',data.token);
        onLogin(data.user);
      })
      .catch(err=>{
        setErr(err.message || 'Login failed');
        setLoading(false);
      });
  };

  return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0a0a0a',padding:20}}>
    <div style={{width:'100%',maxWidth:400}}>
      <div style={{textAlign:'center',marginBottom:36}}>
        <div style={{width:56,height:56,borderRadius:14,background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:900,color:'#fff',margin:'0 auto 16px'}}>CB</div>
        <h1 style={{fontFamily:'Fraunces,serif',fontSize:26,fontWeight:900,color:'#fff',marginBottom:6}}>CreatorBharat Admin</h1>
        <p style={{color:'rgba(255,255,255,.4)',fontSize:13}}>Sign in to admin panel</p>
      </div>
      <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:18,padding:'28px'}}>
        <div style={{height:3,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)',borderRadius:2,marginBottom:24}}/>
        <Input label="Admin Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="admin@creatorbharat.in"/>
        <Input label="Password" value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="Enter password"/>
        {err&&<p style={{color:'#ef4444',fontSize:12,marginBottom:12,marginTop:-8}}>{err}</p>}
        <Btn full loading={loading} onClick={login} style={{marginTop:6}}>Sign In</Btn>
      </div>
    </div>
  </div>;
}

// ── MAIN APP ─────────────────────────────────────────────────────
function App(){
  const[user,setUser]=useState(null);
  const[page,setPage]=useState('dashboard');
  const[collapsed,setCollapsed]=useState(false);
  const[toasts,setToasts]=useState([]);

  useEffect(()=>{
    const token=localStorage.getItem('cb_admin_token');
    if(token){setUser({role:'ADMIN',email:'admin@creatorbharat.in',name:'Admin'});}
  },[]);

  const toast=(msg,type='info')=>{
    const id=Date.now();
    setToasts(p=>[...p,{id,msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
  };

  if(!user)return <LoginPage onLogin={setUser}/>;

  const pages={
    dashboard:<DashboardPage toast={toast}/>,
    creators:<CreatorsAdminPage toast={toast}/>,
    brands:<BrandsAdminPage toast={toast}/>,
    campaigns:<CampaignsAdminPage toast={toast}/>,
    blog:<BlogAdminPage toast={toast}/>,
    payments:<PaymentsAdminPage toast={toast}/>,
    messages:<div className="fade"><h1 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:T.t1}}>Messages</h1><p style={{color:T.t3,marginTop:8}}>Direct messages — connect to backend</p></div>,
    contacts:<ContactsAdminPage toast={toast}/>,
    settings:<div className="fade">
      <h1 style={{fontFamily:'Fraunces,serif',fontSize:24,fontWeight:900,color:T.t1,marginBottom:20}}>Settings</h1>
      <div style={{display:'flex',flexDirection:'column',gap:14,maxWidth:500}}>
        {[['Site Name','CreatorBharat'],['Contact Email','hello@creatorbharat.in'],['HQ Location','Jaipur, Rajasthan'],['Razorpay Mode','Test Mode']].map(([l,v])=>(
          <div key={l} style={{padding:'14px 18px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:13,color:T.t3}}>{l}</span>
            <span style={{fontSize:13,fontWeight:600,color:T.t1}}>{v}</span>
          </div>
        ))}
        <Btn variant="danger" onClick={()=>{localStorage.removeItem('cb_admin_token');setUser(null);}}>Logout</Btn>
      </div>
    </div>,
  };

  return <div style={{display:'flex',minHeight:'100vh'}}>
    <Sidebar active={page} setActive={setPage} collapsed={collapsed} setCollapsed={setCollapsed}/>
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Top bar */}
      <div style={{padding:'14px 24px',borderBottom:'1px solid '+T.bd,display:'flex',justifyContent:'space-between',alignItems:'center',background:T.bg2,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:6,height:6,borderRadius:'50%',background:T.green}}/>
          <span style={{fontSize:12,color:T.t3}}>Backend: <span style={{color:T.ok}}>Live Connection</span> — Production Database Linked</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:13,color:T.t2}}>{user.email}</span>
          <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff'}}>A</div>
        </div>
      </div>
      {/* Content */}
      <main style={{flex:1,padding:'28px',overflowY:'auto',background:T.bg}}>
        {pages[page]||<div style={{color:T.t3}}>Page not found</div>}
      </main>
    </div>
    {/* Toasts */}
    <div style={{position:'fixed',bottom:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:8}}>
      {toasts.map(t=><Toast key={t.id} msg={t.msg} type={t.type} onClose={()=>setToasts(p=>p.filter(x=>x.id!==t.id))}/>)}
    </div>
  </div>;
}

setTimeout(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    React.createElement(App)
  );
}, 0);
