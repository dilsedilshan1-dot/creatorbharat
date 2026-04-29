// CreatorBharat V1 - Complete Working App
// creatorbharat.in | Jaipur, Rajasthan | 2026
const {useState,useEffect,useReducer,createContext,useContext,useRef}=React;

// CSS
try{const s=document.createElement('style');s.textContent=`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#fff;color:#1a1a1a;-webkit-font-smoothing:antialiased;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#DC2626;border-radius:4px}
img{max-width:100%;display:block}input,select,textarea,button{font-family:inherit}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes toastIn{from{opacity:0;transform:translateX(100px)}to{opacity:1;transform:none}}
@keyframes slideInRight{from{transform:translateX(100%)}to{transform:none}}
.au{animation:fadeUp .3s ease both}.ai{animation:fadeIn .2s ease both}.si{animation:scaleIn .25s ease both}.sr{animation:slideInRight .3s cubic-bezier(0.4,0,0.2,1) both}
.d1{animation-delay:.05s}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.1)}}
.d2{animation-delay:.1s}.d3{animation-delay:.15s}.d4{animation-delay:.2s}.d5{animation-delay:.25s}
.spin{animation:spin .8s linear infinite}
@keyframes float{0%,100%{transform:translateY(0) rotate(3deg);box-shadow:0 24px 64px rgba(0,0,0,0.16)}50%{transform:translateY(-20px) rotate(1deg);box-shadow:0 32px 80px rgba(255,148,49,0.15)}}
@keyframes glowPulse{0%,100%{opacity:0.8;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.btn-int{transition:transform .1s cubic-bezier(0.4,0,0.2,1)}.btn-int:active:not(:disabled){transform:scale(0.96)!important}
`;document.head.appendChild(s);}catch(e){}

// TOKENS
const T={
  // Brand Gradients
  gd: 'linear-gradient(135deg, #FF9431 0%, #FF6B00 100%)', // Indian Saffron
  ga: 'linear-gradient(135deg, #128807 0%, #0F6B06 100%)', // Indian Green
  
  // Neutral Palette (Dark Mode Base)
  n9: '#050505',
  n8: '#0A0A0A',
  n7: '#111111',
  n6: '#1A1A1A',
  
  // UI Colors
  bg: '#FFFFFF',
  bg2: '#F9FAFB',
  bg3: '#F3F4F6',
  
  // Borders & Accents
  bd: 'rgba(0,0,0,0.08)',
  bd2: 'rgba(0,0,0,0.12)',
  bd3: 'rgba(255,255,255,0.1)',
  
  // Status Colors
  ok: '#10B981',
  okl: 'rgba(16,185,129,.1)',
  wn: '#F59E0B',
  wnl: 'rgba(245,158,11,.1)',
  info: '#3B82F6',
  infol: 'rgba(59,130,246,.1)',
  
  // Typography
  t1: '#111827',
  t2: '#4B5563',
  t3: '#6B7280',
  t4: '#9CA3AF',
  
  // Shadows
  sh1: '0 1px 3px rgba(0,0,0,0.05)',
  sh2: '0 4px 20px rgba(0,0,0,0.08)',
  sh3: '0 12px 40px rgba(0,0,0,0.12)',
  sh4: '0 24px 64px rgba(0,0,0,0.16)',
  
  // Brand Tiers
  gold: '#D97706',
  platinum: '#7C3AED',
  silver: '#4B5563',
  rising: '#6B7280'
};


// HELPERS
const fmt={
  num(n){if(!n)return'0';n=Number(n);if(n>=1e7)return(n/1e7).toFixed(1)+'Cr';if(n>=1e5)return(n/1e5).toFixed(1)+'L';if(n>=1e3)return Math.round(n/1e3)+'K';return String(n)},
  inr(n){if(!n)return'₹0';n=Number(n);if(n>=1e5)return'₹'+(n/1e5).toFixed(1)+'L';if(n>=1e3)return'₹'+Math.round(n/1e3)+'K';return'₹'+n},
  date(d){if(!d)return'';try{return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}catch{return''}},
  handle(s){return(s||'').toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')},
  score(c){let s=0;if(c.photo||c.avatarUrl)s+=10;if(c.bio&&c.bio.length>50)s+=15;if(c.city)s+=5;if(c.state)s+=3;
    const ni=Array.isArray(c.niche)?c.niche:[c.niche].filter(Boolean);if(ni.length)s+=5;
    const pl=Array.isArray(c.platform)?c.platform:[c.platform].filter(Boolean);if(pl.length)s+=5;
    if(c.services&&c.services.length>=3)s+=7;if(c.instagram)s+=5;if(c.youtube)s+=5;if(c.rateMin)s+=5;if(c.languages&&c.languages.length)s+=5;
    const f=Number(c.followers||0);if(f>=1e6)s+=30;else if(f>=5e5)s+=24;else if(f>=1e5)s+=18;else if(f>=5e4)s+=12;else if(f>=1e4)s+=6;else if(f>0)s+=2;
    s+=Math.min(30,Math.round(Number(c.er||0)*3));return Math.min(100,s)},
  tier(sc){if(sc>=91)return{label:'Platinum',color:T.platinum,bc:'purple'};if(sc>=76)return{label:'Gold',color:T.gold,bc:'gold'};if(sc>=51)return{label:'Silver',color:T.silver,bc:'silver'};return{label:'Rising',color:T.rising,bc:'rising'}},
  article(c){
    const name=c.name||'Creator';const city=c.city||'India';const state=c.state||'India';
    const ni=Array.isArray(c.niche)?c.niche:[c.niche].filter(Boolean);const niche=ni[0]||'content';
    const pl=Array.isArray(c.platform)?c.platform:[c.platform].filter(Boolean);const platform=pl[0]||'Instagram';
    const followers=fmt.num(Number(c.followers||0));const er=(c.er||0)+'%';
    const svc=Array.isArray(c.services)&&c.services.length>=2?c.services.slice(0,2):['content creation','brand collaborations'];
    const joined=c.joinedDate?new Date(c.joinedDate).getFullYear():'2024';
    const views=fmt.num(Number(c.monthlyViews||Number(c.followers||0)*3));
    const likes=fmt.num(Math.round(Number(c.followers||0)*Number(c.er||3)/100));
    const langs=Array.isArray(c.languages)&&c.languages.length?c.languages.join(' & '):'Hindi & English';
    const handle=c.handle||fmt.handle(name);
    return{
      title:`Meet ${name} -- ${city}'s Leading ${niche} Creator`,
      p1:`${name} from ${city}, ${state} is a ${niche} creator on ${platform} with ${followers} followers and ${er} engagement rate. Known for ${svc[0]} and ${svc[1]}, ${name} has been creating content since ${joined}.`,
      p2:`With monthly reach of ${views} and ${likes} average likes per post, ${name} speaks ${langs} and connects with audiences across India's growing creator economy.`,
      p3:`Brands can collaborate with ${name} starting from ${c.rateMin?fmt.inr(Number(c.rateMin)):'negotiable'} per post. Response time: ${c.responseTime||'24-48 hours'}. Connect at creatorbharat.in/c/${handle}`
    }
  },
  completeness(c){
    const fields=[{k:'photo',l:'Add profile photo',p:10},{k:'bio',l:'Write your bio',p:15},{k:'city',l:'Add city',p:5},{k:'niche',l:'Select niche',p:5},{k:'platform',l:'Add platform',p:5},{k:'instagram',l:'Add Instagram',p:5},{k:'rateMin',l:'Set your rate',p:8},{k:'services',l:'Add 3+ services',p:7}];
    let done=0,total=60,missing=[];
    fields.forEach(f=>{const v=c[f.k];const has=Array.isArray(v)?(f.k==='services'?v.length>=3:v.length>0):!!v;if(has)done+=f.p;else missing.push(`${f.l} (+${f.p}%)`)});
    return{pct:Math.min(100,Math.round((done/total)*100)),missing:missing.slice(0,4)}
  }
};
const scrollToTop=()=>window.scrollTo({top:0,behavior:'smooth'});
const useVP=()=>{const[w,setW]=useState(window.innerWidth);useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h)},[]);return{mob:w<768,tab:w<1024,w}};
const W=(max=1200)=>({maxWidth:max,margin:'0 auto',padding:'0 20px'});

const API_BASE = 'https://creatorbharat.onrender.com/api';

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('cb_token');
  try {
    const res = await fetch(API_BASE + endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
      },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Error');
    return data;
  } catch (err) {
    console.error(`API Call failed [${endpoint}]:`, err);
    throw err;
  }
}

// LOCALSTORAGE
const LS={
  get(k,fb=null){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb}catch{return fb}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}},
  push(k,item){const a=LS.get(k,[]);a.push(item);LS.set(k,a);return a},
  update(k,id,patch){const a=LS.get(k,[]);const i=a.findIndex(x=>x.id===id);if(i>-1){a[i]={...a[i],...patch};LS.set(k,a)}return a},
  remove(k,id){const a=LS.get(k,[]).filter(x=>x.id!==id);LS.set(k,a);return a}
};
const SS={
  get(){try{const v=sessionStorage.getItem('cb_session');return v?JSON.parse(v):null}catch{return null}},
  set(v){try{sessionStorage.setItem('cb_session',JSON.stringify(v))}catch{}},
  clear(){try{sessionStorage.removeItem('cb_session')}catch{}}
};

// SEED DATA
const SC=[
  {id:'s1',handle:'rahul-sharma',name:'Rahul Sharma',email:'rahul@demo.in',password:'demo123',city:'Jaipur',state:'Rajasthan',niche:['Travel','Lifestyle'],platform:['Instagram'],followers:248000,er:4.8,monthlyViews:820000,avgLikes:11904,bio:"Travel storyteller capturing Bharat's hidden gems. From the ghats of Varanasi to the dunes of Jaisalmer.",instagram:'@rahulsharma_travels',youtube:'',rateMin:15000,rateMax:45000,services:['Sponsored Posts','Instagram Reels','Stories','Travel Reviews'],languages:['Hindi','English'],responseTime:'24 hours',verified:true,featured:true,trending:true,pro:true,score:88,joinedDate:'2024-01-15',photo:'https://randomuser.me/api/portraits/men/32.jpg',coverUrl:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',completedDeals:28,rating:4.9,reviews:[{id:'r1',brand:'MakeMyTrip',text:'Rahul delivered exceptional content. Engagement was 3x our benchmark.',rating:5,date:'2025-11-20'}],portfolio:['https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=400','https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400','https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400']},
  {id:'s2',handle:'priya-mehta',name:'Priya Mehta',email:'priya@demo.in',password:'demo123',city:'Mumbai',state:'Maharashtra',niche:['Fashion','Beauty'],platform:['Instagram','YouTube'],followers:512000,er:6.2,monthlyViews:1800000,avgLikes:31744,bio:"Fashion & beauty creator making style accessible for every Indian woman. GRWM, hauls, and honest reviews.",instagram:'@priyamehta_style',youtube:'Priya Mehta Beauty',rateMin:25000,rateMax:75000,services:['Sponsored Posts','YouTube Videos','Reels','Product Reviews','GRWM'],languages:['Hindi','English','Marathi'],responseTime:'12-24 hours',verified:true,featured:true,trending:false,pro:true,score:94,joinedDate:'2023-11-08',photo:'https://randomuser.me/api/portraits/women/44.jpg',coverUrl:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',completedDeals:47,rating:4.8,reviews:[{id:'r2',brand:'Nykaa',text:'Priya exceeded all KPIs. Outstanding.',rating:5,date:'2025-12-01'}],portfolio:['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400']},
  {id:'s3',handle:'arjun-kapoor',name:'Arjun Kapoor',email:'arjun@demo.in',password:'demo123',city:'Bengaluru',state:'Karnataka',niche:['Tech','Gaming'],platform:['YouTube','Instagram'],followers:890000,er:8.1,monthlyViews:4200000,avgLikes:72090,bio:"Tech reviews, gaming deep dives from India's Silicon Valley. Making tech understandable for every Indian.",instagram:'@arjuntech',youtube:'ArjunTech India',rateMin:40000,rateMax:120000,services:['YouTube Videos','Tech Reviews','Unboxing','Sponsored Posts','Gaming Streams'],languages:['Hindi','English','Kannada'],responseTime:'48 hours',verified:true,featured:true,trending:true,pro:true,score:97,joinedDate:'2023-08-22',photo:'https://randomuser.me/api/portraits/men/55.jpg',coverUrl:'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=900&q=80',completedDeals:63,rating:4.9,reviews:[{id:'r3',brand:'boAt',text:'Arjun is the gold standard for tech creator content in India.',rating:5,date:'2026-01-10'}],portfolio:['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400','https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=400','https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=400']},
  {id:'s4',handle:'sneha-iyer',name:'Sneha Iyer',email:'sneha@demo.in',password:'demo123',city:'Chennai',state:'Tamil Nadu',niche:['Food','Cooking'],platform:['Instagram','YouTube'],followers:320000,er:7.4,monthlyViews:1100000,avgLikes:23680,bio:"Amma's recipes, street food trails, and restaurant reviews from Chennai.",instagram:'@sneha_foodi',youtube:'Sneha Iyer Kitchen',rateMin:18000,rateMax:55000,services:['Recipe Videos','Restaurant Reviews','Food Photography','Reels','Stories'],languages:['Tamil','Hindi','English'],responseTime:'24-48 hours',verified:true,featured:false,trending:true,pro:false,score:82,joinedDate:'2024-03-01',photo:'https://randomuser.me/api/portraits/women/65.jpg',coverUrl:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',completedDeals:19,rating:4.7,reviews:[{id:'r4',brand:'Swiggy',text:'Sneha delivered authentic content that resonated with Chennai audiences.',rating:5,date:'2026-02-05'}],portfolio:['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400','https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400']}
];
const SCP=[
  {id:'cp1',title:'Summer Travel Campaign 2026',brand:'MakeMyTrip',brandEmail:'brand@mmt.com',niche:['Travel'],platform:['Instagram','YouTube'],description:'Looking for travel creators to showcase hidden destinations across India. Authentic storytelling preferred.',budgetMin:50000,budgetMax:200000,slots:5,filled:2,deadline:'2026-06-30',minFollowers:50000,minER:3,deliverables:['3 Instagram Reels','2 Stories','1 YouTube video'],urgent:false,bidding:false,status:'live',createdAt:'2026-03-01'},
  {id:'cp2',title:'Festive Beauty Lookbook -- Diwali 2026',brand:'Nykaa',brandEmail:'brand@nykaa.com',niche:['Fashion','Beauty'],platform:['Instagram'],description:'Seeking fashion & beauty creators for Diwali 2026 campaign. Create festive looks using Nykaa products.',budgetMin:25000,budgetMax:75000,slots:10,filled:4,deadline:'2026-10-15',minFollowers:20000,minER:4,deliverables:['2 GRWM Reels','5 Stories','1 Carousel post'],urgent:false,bidding:false,status:'live',createdAt:'2026-03-05'},
  {id:'cp3',title:'boAt Airdopes 500 Review Campaign',brand:'boAt',brandEmail:'brand@boat.com',niche:['Tech','Gaming'],platform:['YouTube','Instagram'],description:'Honest unboxing and review of boAt Airdopes 500. Must cover sound quality, battery life, and build.',budgetMin:15000,budgetMax:50000,slots:8,filled:6,deadline:'2026-04-30',minFollowers:30000,minER:3.5,deliverables:['1 YouTube review','2 Instagram Reels','3 Stories'],urgent:true,bidding:true,status:'live',createdAt:'2026-03-10'}
];
const SB=[
  {id:'b1',slug:'small-town-creators',title:'How Small-Town Creators Are Taking Over Indian Instagram',category:'Creator Stories',author:'CreatorBharat Team',date:'2026-03-15',readTime:'6 min',featured:true,views:12400,image:'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',excerpt:'From Jaipur to Patna, creators from Tier 2 and 3 cities are building massive audiences and landing premium brand deals.',body:"The narrative around Indian content creation has always centered on Mumbai and Delhi. But 2026 has rewritten that story entirely.\n\nCreators from Jaipur, Patna, Indore, Surat, and Coimbatore are outperforming metro creators on engagement metrics that matter most to brands. Data shows Tier 2 city creators average 6.8% engagement rate vs 4.2% for metro creators.\n\nBrands have noticed -- MakeMyTrip, Nykaa, and Mamaearth have all shifted 30-40% of their influencer budgets toward Tier 2/3 creators.\n\nIf you're a creator from a smaller city, your local identity is your superpower. Get listed on CreatorBharat today."},
  {id:'b2',slug:'first-brand-deal',title:'Your First Brand Deal: The Complete 2026 Guide',category:'Creator Tips',author:'Rahul Sharma',date:'2026-03-08',readTime:'9 min',featured:false,views:8700,image:'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',excerpt:'Step-by-step guide to landing your first brand collaboration.',body:"Landing your first brand deal feels impossible until it happens.\n\n**Step 1: Profile First**\nBrands discover creators. Your profile needs to answer in 8 seconds: What do you create? Who watches you?\n\n**Step 2: Rate Your Value**\nUse the CreatorBharat Rate Calculator. Base = followers x ER x platform multiplier.\n\n**Step 3: First Outreach**\nDM small D2C brands in your niche. One line about you, one data point, one idea for them.\n\n**Step 4: Close It**\nGet deliverables, timeline, usage rights, and payment in writing before starting."},
  {id:'b3',slug:'engagement-vs-followers',title:'Why Engagement Rate Beats Follower Count Every Time',category:'Brand Guides',author:'CreatorBharat Team',date:'2026-02-28',readTime:'4 min',featured:false,views:9100,image:'https://images.unsplash.com/photo-1611605698335-8441051e7b47?w=800&q=80',excerpt:'The metric that actually predicts campaign success.',body:"Creator A: 1M followers, 1.2% ER = 12,000 engaged people. Creator B: 150K followers, 8.5% ER = 12,750 engaged people.\n\nSame reach. Creator B costs 5-8x less.\n\n2026 Instagram benchmarks: <2% poor, 2-4% average, 4-7% good, >7% excellent."},
  {id:'b4',slug:'top-food-creators-2026',title:'Top 10 Food Creators in India You Must Follow in 2026',category:'Top Lists',author:'Editorial Team',date:'2026-02-20',readTime:'7 min',featured:false,views:14300,image:'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',excerpt:"India's food creator landscape is richer than ever.",body:"1. Sneha Iyer -- Chennai. ASMR-style cooking that crosses 2M views per episode.\n2. The Biryani Brotherhood -- Hyderabad. Deep dives into Hyderabadi biryani culture.\n3. Mumbai Street Trails -- Every vada pav and pav bhaji cart documented.\n4. Delhi Foodie -- From Paranthe Wali Gali to Dilli Haat.\n5. Rajasthan Kitchen -- Authentic Rajasthani recipes from Jaipur."},
  {id:'b5',slug:'creator-career-jaipur',title:'Building a Creator Career from Jaipur -- Interview',category:'Interviews',author:'CreatorBharat Team',date:'2026-02-10',readTime:'10 min',featured:false,views:7800,image:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80',excerpt:'Rahul Sharma built a 248K+ audience from the Pink City.',body:"'I just started posting photos from my travels around Rajasthan. Not for money, not for followers.'\n\n'18 months in, MakeMyTrip paid me Rs 80,000 for a Ladakh trip. My annual salary was Rs 3.6 lakhs. I quit within 3 months.'\n\nAdvice: 'Create for your geography first. Become the definitive voice for your place. Local authenticity is the foundation nobody can copy.'"}
];

function seedData(){if(LS.get('cb_seeded'))return;LS.set('cb_creators',SC);LS.set('cb_campaigns',SCP);LS.set('cb_brands',[]);LS.set('cb_applications',[]);LS.set('cb_newsletter',[]);LS.set('cb_contacts',[]);LS.set('cb_messages',[]);LS.set('cb_seeded',true)}

// AUTH
const Auth={
  async login(email,pass){
    try{
      const data=await apiCall('/auth/login',{method:'POST',body:{email,password:pass}});
      localStorage.setItem('cb_token',data.token);
      SS.set({id:data.user.id,role:data.user.role.toLowerCase(),email:data.user.email,name:data.user.name||data.user.companyName});
      return{ok:true,role:data.user.role.toLowerCase(),user:data.user};
    }catch(e){return{ok:false,error:e.message||'Login failed'}}
  },
  logout(){SS.clear();localStorage.removeItem('cb_token')},
  session(){return SS.get()},
  getCreator(email){return LS.get('cb_creators',[]).find(c=>c.email===email)||null},
  getBrand(email){return LS.get('cb_brands',[]).find(b=>b.email===email)||null}
};

// CONTEXT
const Ctx=createContext(null);
const useApp=()=>useContext(Ctx);
const IS={page:'home',sel:{creator:null,campaign:null,blog:null},user:null,role:null,saved:[],compared:[],applied:[],notifications:[{id:'n1',msg:'Welcome to CreatorBharat! Bharat ke Creators, Duniya ki Nazar Mein.',read:false,time:'Just now'}],toasts:[],ui:{authModal:false,authTab:'login',shareModal:false,shareTarget:null,notifPanel:false,mobileMenu:false},creatorProfile:null,brand:{shortlisted:[]},cf:{q:'',state:'',district:'',niche:'',platform:'',sort:'score',verified:false,minFollowers:'',minER:''},cpf:{q:'',niche:'',urgent:false}};

function reducer(s,a){
  switch(a.t){
    case'GO':return{...s,page:a.p,sel:{...s.sel,...(a.sel||{})},ui:{...s.ui,mobileMenu:false,notifPanel:false,shareModal:false}};
    case'LOGIN':{const sess=SS.get();let cp=null;if(sess&&sess.role==='creator')cp=Auth.getCreator(sess.email);return{...s,user:a.u,role:a.role,creatorProfile:cp,ui:{...s.ui,authModal:false}}}
    case'LOGOUT':Auth.logout();return{...IS,page:'home'};
    case'SET_CP':return{...s,creatorProfile:a.p};
    case'UPD_CP':{const arr=LS.update('cb_creators',a.id,a.patch);return{...s,creatorProfile:arr.find(c=>c.id===a.id)||s.creatorProfile}};
    case'SAVE':{const h=s.saved.includes(a.id);return{...s,saved:h?s.saved.filter(x=>x!==a.id):[...s.saved,a.id]}};
    case'COMPARE':{if(s.compared.includes(a.id))return{...s,compared:s.compared.filter(x=>x!==a.id)};if(s.compared.length>=3)return s;return{...s,compared:[...s.compared,a.id]}};
    case'APPLY':return{...s,applied:[...s.applied.filter(x=>x!==a.id),a.id]};
    case'SHORTLIST':{const sl=s.brand.shortlisted;return{...s,brand:{...s.brand,shortlisted:sl.includes(a.id)?sl.filter(x=>x!==a.id):[...sl,a.id]}}};
    case'UI':return{...s,ui:{...s.ui,...a.v}};
    case'CF':return{...s,cf:{...s.cf,...a.v}};
    case'CPF':return{...s,cpf:{...s.cpf,...a.v}};
    case'TOAST':return{...s,toasts:[...s.toasts,{id:Date.now()+Math.random(),...a.d}]};
    case'RM_TOAST':return{...s,toasts:s.toasts.filter(t=>t.id!==a.id)};
    case'NOTIF':return{...s,notifications:[{id:Date.now(),...a.n},...s.notifications]};
    case'READ_ALL':return{...s,notifications:s.notifications.map(n=>({...n,read:true}))};
    case'SYNC_DATA':return{...s,lastSync:Date.now()};
    default:return s;
  }
}

// PRIMITIVES
function Btn({children,onClick,variant='primary',sm,lg,full,disabled,loading,style:sx={},href}){
  const[h,sh]=useState(false);
  const base={display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,fontFamily:'inherit',fontWeight:700,cursor:disabled||loading?'not-allowed':'pointer',border:'none',borderRadius:12,transition:'all .2s cubic-bezier(0.4,0,0.2,1)',textDecoration:'none',fontSize:lg?16:sm?12:14,padding:lg?'16px 32px':sm?'8px 16px':'12px 24px',opacity:disabled?.55:1,width:full?'100%':'auto',...sx};
  const vs={
    primary:{background:T.gd,color:'#fff',boxShadow:h?'0 8px 24px rgba(255,148,49,0.25)':'none',transform:h?'translateY(-1px)':'none'},
    outline:{background:'transparent',color:T.t1,border:`1.5px solid ${T.bd2}`,boxShadow:h?T.sh2:'none'},
    ghost:{background:h?T.bg3:'transparent',color:T.t2},
    dark:{background:T.n8,color:'#fff',boxShadow:h?T.sh3:'none'},
    white:{background:'#fff',color:T.t1,boxShadow:T.sh2,transform:h?'translateY(-1px)':'none'},
    text:{background:'none',color:T.t1,padding:'0',fontWeight:700,fontSize:'inherit'},
    success:{background:T.ok,color:'#fff',boxShadow:h?'0 8px 24px rgba(16,185,129,0.25)':'none'}
  };
  const Tag=href?'a':'button';
  return <Tag className="btn-int" onClick={onClick} disabled={disabled||loading} href={href} style={{...base,...(vs[variant]||vs.primary)}} onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)}>{loading?<span className="spin" style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%'}}/>:children}</Tag>;
}

function Bdg({children,color='gray',sm}){
  const m={red:{bg:T.ga,col:T.gd},green:{bg:T.okl,col:T.ok},yellow:{bg:T.wnl,col:T.wn},blue:{bg:T.infol,col:T.info},purple:{bg:'rgba(124,58,237,.1)',col:'#7C3AED'},gray:{bg:T.bg3,col:T.t2},gold:{bg:'rgba(217,119,6,.1)',col:T.gold},platinum:{bg:'rgba(124,58,237,.1)',col:T.platinum},silver:{bg:'rgba(156,163,175,.15)',col:'#6B7280'},rising:{bg:'rgba(107,114,128,.1)',col:'#6B7280'},dark:{bg:T.n8,col:'#fff'}};
  const c=m[color]||m.gray;
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:sm?'2px 7px':'3px 10px',borderRadius:20,background:c.bg,color:c.col,fontSize:sm?10:11,fontWeight:700,whiteSpace:'nowrap'}}>{children}</span>;
}

function Fld({label,value,onChange,type='text',placeholder,options,rows,helper,required,error,sm,readOnly}){
  const[foc,setFoc]=useState(false);
  const s={width:'100%',padding:sm?'10px 14px':'14px 18px',border:`1.5px solid ${error?'#EF4444':foc?'#FF9431':T.bd}`,borderRadius:12,fontSize:sm?13:15,color:T.n8,background:readOnly?T.bg3:'#fff',transition:'all .2s cubic-bezier(0.4,0,0.2,1)',boxSizing:'border-box',fontFamily:'inherit',outline:'none',boxShadow:foc?`0 0 0 4px ${error?'rgba(239,68,68,0.15)':'rgba(255,148,49,0.15)'}`:'none'};
  return <div style={{marginBottom:18}}>
    {label&&<label style={{display:'flex',alignItems:'center',gap:4,fontSize:13,fontWeight:700,color:T.n8,marginBottom:8}}>{label}{required&&<span style={{color:'#EF4444'}}>*</span>}</label>}
    {options?
      <div style={{position:'relative'}}>
        <select value={value} onChange={onChange} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={{...s,paddingRight:40,appearance:'none',cursor:'pointer'}}>{options.map(o=><option key={typeof o==='object'?o.v:o} value={typeof o==='object'?o.v:o}>{typeof o==='object'?o.l:o}</option>)}</select>
        <div style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:T.t3,fontSize:10}}>▼</div>
      </div>
    :rows?
      <textarea value={value} onChange={onChange} rows={rows} placeholder={placeholder} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={{...s,resize:'vertical'}} readOnly={readOnly}/>
    :
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} style={s} readOnly={readOnly}/>
    }
    {error&&<div style={{display:'flex',alignItems:'center',gap:6,marginTop:6,color:'#EF4444',fontSize:12,fontWeight:600}}><span>⚠️</span> {error}</div>}
    {helper&&!error&&<div style={{fontSize:12,color:T.t3,marginTop:6}}>{helper}</div>}
  </div>;
}

function Skeleton({width='100%',height=20,borderRadius=12,style={}}){
  return <div style={{width,height,borderRadius,background:'linear-gradient(90deg, #f9f9f9 25%, #ececec 50%, #f9f9f9 75%)',backgroundSize:'200% 100%',animation:'shimmer 1.5s infinite',...style}}/>;
}

function SkeletonCard(){
  return <div style={{border:`1px solid ${T.bd}`,borderRadius:24,padding:24,background:'#fff',boxShadow:T.sh1}}>
    <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
      <Skeleton width={64} height={64} borderRadius="50%"/>
      <div style={{flex:1}}><Skeleton width="60%" height={16} style={{marginBottom:8}}/><Skeleton width="40%" height={12}/></div>
    </div>
    <Skeleton height={14} style={{marginBottom:8}}/><Skeleton height={14} width="80%" style={{marginBottom:24}}/>
    <div style={{display:'flex',gap:10}}><Skeleton height={32} width={80} borderRadius={20}/><Skeleton height={32} width={60} borderRadius={20}/></div>
  </div>;
}

function EmptyState({title,sub,icon='📭',ctaLabel,onCta}){
  return <div style={{padding:'64px 20px',textAlign:'center',background:T.bg,borderRadius:24,border:`1px dashed ${T.bd2}`}}>
    <div className="au" style={{fontSize:48,marginBottom:16}}>{icon}</div>
    <h3 style={{fontSize:20,fontWeight:800,color:T.n8,marginBottom:8}}>{title}</h3>
    <p style={{fontSize:14,color:T.t3,marginBottom:ctaLabel?24:0,maxWidth:320,margin:'0 auto'}}>{sub}</p>
    {ctaLabel&&<Btn onClick={onCta}>{ctaLabel}</Btn>}
  </div>;
}

function Tog({on,onChange,label}){
  return <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',userSelect:'none'}}><button onClick={onChange} style={{width:44,height:24,borderRadius:12,background:on?T.gd:T.bd2,border:'none',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}><span style={{position:'absolute',top:2,left:on?22:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/></button>{label&&<span style={{fontSize:13,color:T.t1,fontWeight:500}}>{label}</span>}</label>;
}

function Stars({rating,sm}){
  const sz=sm?12:16;
  return <span style={{display:'inline-flex',gap:2,alignItems:'center'}}>{[1,2,3,4,5].map(i=><svg key={i} width={sz} height={sz} viewBox="0 0 20 20" fill={i<=Math.round(rating)?'#F59E0B':'#E5E7EB'}><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78z"/></svg>)}{rating>0&&<span style={{fontSize:sm?11:13,color:T.t2,marginLeft:3,fontWeight:600}}>{Number(rating).toFixed(1)}</span>}</span>;
}

function Ring({score,size=80}){
  const r=32,circ=2*Math.PI*r,offset=circ-(score/100)*circ;
  const tier=fmt.tier(score);
  return <div style={{position:'relative',width:size,height:size,display:'inline-flex',alignItems:'center',justifyContent:'center'}}><svg width={size} height={size} viewBox="0 0 80 80" style={{transform:'rotate(-90deg)',position:'absolute'}}><circle cx="40" cy="40" r={r} fill="none" stroke={T.bg3} strokeWidth="6"/><circle cx="40" cy="40" r={r} fill="none" stroke={tier.color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{transition:'stroke-dashoffset .6s'}}/></svg><div style={{textAlign:'center'}}><div style={{fontFamily:"'Fraunces',serif",fontSize:size*0.28,fontWeight:900,color:tier.color,lineHeight:1}}>{score}</div><div style={{fontSize:size*0.11,color:T.t3,fontWeight:600,marginTop:1}}>{tier.label}</div></div></div>;
}

function Bar({value,max=100,color,label,showPct,height=8}){
  const pct=Math.min(100,Math.round((value/max)*100));
  return <div>{(label||showPct)&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>{label&&<span style={{fontSize:12,color:T.t2}}>{label}</span>}{showPct&&<span style={{fontSize:12,color:color||T.gd,fontWeight:700}}>{pct}%</span>}</div>}<div style={{height,background:T.bg3,borderRadius:height,overflow:'hidden'}}><div style={{height:'100%',width:pct+'%',background:color||T.gd,borderRadius:height,transition:'width .6s'}}/></div></div>;
}

function Modal({open,onClose,title,children,width=520}){
  if(!open)return null;
  return <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:8000,display:'flex',alignItems:'center',justifyContent:'center',padding:16,backdropFilter:'blur(10px)'}}><div className="si" onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:28,width:'100%',maxWidth:width,maxHeight:'90vh',overflowY:'auto',boxShadow:T.sh4,border:'1px solid rgba(255,255,255,0.2)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'24px 32px',borderBottom:`1px solid ${T.bd}`,position:'sticky',top:0,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(10px)',zIndex:1}}><h3 style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:T.n8}}>{title}</h3><button onClick={onClose} style={{background:T.bg2,border:'none',width:36,height:36,borderRadius:'50%',cursor:'pointer',fontSize:20,color:T.t2,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}} onMouseEnter={e=>e.target.style.background=T.bg3} onMouseLeave={e=>e.target.style.background=T.bg2}>×</button></div><div style={{padding:'32px'}}>{children}</div></div></div>;
}


function SH({eyebrow,title,sub,center,light,mb=56}){
  return <div style={{textAlign:center?'center':'left',marginBottom:mb,position:'relative'}}>
    {eyebrow&&<div style={{display:'flex',alignItems:'center',justifyContent:center?'center':'flex-start',gap:12,marginBottom:16}}>
      <div style={{width:32,height:3,background:T.gd,borderRadius:4}}/>
      <p style={{fontSize:12,fontWeight:900,letterSpacing:'.15em',textTransform:'uppercase',color:T.gd}}>{eyebrow}</p>
    </div>}
    <h2 style={{fontFamily:"'Fraunces',serif",fontSize:'clamp(32px,6vw,52px)',fontWeight:900,color:light?'#fff':T.t1,marginBottom:sub?20:0,lineHeight:1,letterSpacing:'-0.03em'}}>{title}</h2>
    {sub&&<p style={{fontSize:18,color:light?'rgba(255,255,255,0.6)':T.t2,maxWidth:center?640:'100%',margin:center?'0 auto':'0',lineHeight:1.6,fontWeight:500}}>{sub}</p>}
    {!center&&<div style={{width:60,height:4,background:T.ga,marginTop:24,borderRadius:2}}/>}
  </div>;
}


function Tabs({tabs,active,onChange,sm}){
  return <div style={{display:'flex',borderBottom:`2px solid ${T.bd}`,marginBottom:22}}>{tabs.map(([id,label,count])=><button key={id} onClick={()=>onChange(id)} style={{padding:sm?'8px 12px':'10px 18px',background:'none',border:'none',borderBottom:`2px solid ${active===id?T.gd:'transparent'}`,marginBottom:-2,color:active===id?T.gd:T.t2,fontWeight:active===id?700:500,fontSize:sm?12:14,cursor:'pointer',display:'flex',alignItems:'center',gap:5,fontFamily:'inherit',transition:'color .15s'}}>{label}{count!=null&&<Bdg sm color={active===id?'red':'gray'}>{count}</Bdg>}</button>)}</div>;
}

function Empty({icon,title,sub,ctaLabel,onCta}){
  return <div style={{textAlign:'center',padding:'64px 32px',background:T.bg,borderRadius:24,border:`1.5px dashed ${T.bd}`,display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{fontSize:48,marginBottom:20,filter:'grayscale(0.5)'}}>{icon||'📭'}</div><h4 style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:T.n8,marginBottom:12}}>{title}</h4>{sub&&<p style={{fontSize:15,color:T.t2,marginBottom:ctaLabel?24:0,lineHeight:1.6,maxWidth:320}}>{sub}</p>}{ctaLabel&&<Btn onClick={onCta} lg style={{borderRadius:12}}>{ctaLabel}</Btn>}</div>;
}


function Card({children,style:sx={},onClick,glass}){
  const[h,sh]=useState(false);
  const base={
    background:glass?'rgba(255,255,255,0.03)':'#fff',
    backdropFilter:glass?'blur(16px)':'none',
    border:glass?'1px solid rgba(255,255,255,0.1)':`1px solid ${T.bd}`,
    borderRadius:20,
    transition:'all .3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow:h?T.sh3:T.sh1,
    transform:h&&onClick?'translateY(-4px)':'none',
    cursor:onClick?'pointer':'default',
    overflow:'hidden',
    ...sx
  };
  return <div onClick={onClick} onMouseEnter={()=>sh(true)} onMouseLeave={()=>sh(false)} style={base}>{children}</div>;
}

function Chip({label,active,onClick}){
  return <button onClick={onClick} style={{padding:'6px 14px',borderRadius:20,border:`1.5px solid ${active?T.gd:T.bd}`,background:active?T.ga:'transparent',color:active?T.gd:T.t2,fontSize:13,fontWeight:active?700:500,cursor:'pointer',transition:'all .15s',fontFamily:'inherit',whiteSpace:'nowrap'}}>{label}</button>;
}



function Logo({sm,light,onClick}){
  const sz=sm?34:44;
  return <div onClick={onClick} className="logo-container" style={{display:'flex',alignItems:'center',gap:sm?10:14,cursor:onClick?'pointer':'default',userSelect:'none',position:'relative'}}>
    <div style={{position:'relative',width:sz,height:sz,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',overflow:'hidden',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',border:'1px solid rgba(0,0,0,0.05)'}}>
      {/* Premium Indian Flag Icon */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:'33.33%',background:'#FF9431'}}/>
      <div style={{position:'absolute',top:'33.33%',left:0,right:0,height:'33.34%',background:'#FFFFFF',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {/* Subtle Ashoka Chakra */}
        <div style={{width:'25%',height:'25%',borderRadius:'50%',border:'1px solid #000080',position:'relative'}}>
          {[...Array(12)].map((_,i)=><div key={i} style={{position:'absolute',top:'50%',left:'50%',width:'100%',height:1,background:'#000080',transform:`translate(-50%,-50%) rotate(${i*15}deg)` }}/>)}
        </div>
      </div>
      <div style={{position:'absolute',top:'66.67%',left:0,right:0,height:'33.33%',background:'#128807'}}/>
    </div>
    
    <span className="logo-text-animated" style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:sm?22:28,fontWeight:900,letterSpacing:'-0.04em',display:'flex',alignItems:'center'}}>
      CreatorBharat
    </span>

    <style>{`
      ::-webkit-scrollbar { width: 10px; }
      ::-webkit-scrollbar-track { background: #f8fafc; }
      ::-webkit-scrollbar-thumb { 
        background: linear-gradient(180deg, #FF9431 0%, #DC2626 100%); 
        border-radius: 10px; border: 2px solid #f8fafc; 
      }
      html.lenis { height: auto; }
      .lenis.lenis-smooth { scroll-behavior: auto !important; }
      .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
      .lenis.lenis-stopped { overflow: hidden; }
      .lenis.lenis-scrolling iframe { pointer-events: none; }
\n      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }\n
      .logo-text-animated {
        background: linear-gradient(90deg, #FF9431, #FFFFFF, #128807, #FF9431);
        background-size: 200% auto;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: flagSweep 3s linear infinite;
        /* Shadow for readability on white */
        filter: drop-shadow(0 1px 1px rgba(0,0,0,0.05));
      }
      @keyframes flagSweep {
        to { background-position: 200% center; }
      }
    `}</style>
  </div>;
}

function Divider({my=28}){return <div style={{height:1,background:T.bd,margin:`${my}px 0`}}/>;}



// TOASTS
function ToastBar(){const{st,dsp}=useApp();return <div style={{position:'fixed',bottom:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}}>{st.toasts.map(t=><div key={t.id} style={{background:t.type==='success'?'#14532d':t.type==='error'?'#7f1d1d':t.type==='warning'?'#78350f':'#1e3a5f',color:'#fff',borderRadius:10,padding:'11px 16px',display:'flex',alignItems:'center',gap:10,maxWidth:320,boxShadow:T.sh3,pointerEvents:'all',animation:'toastIn .3s ease'}}><span>{t.type==='success'?'✓':t.type==='error'?'✗':t.type==='warning'?'⚠':'ℹ'}</span><span style={{flex:1,fontSize:13,fontWeight:500,lineHeight:1.4}}>{t.msg}</span><button onClick={()=>dsp({t:'RM_TOAST',id:t.id})} style={{background:'none',border:'none',color:'rgba(255,255,255,.6)',cursor:'pointer',fontSize:16,pointerEvents:'all'}}>x</button></div>)}</div>;}

// SHARE MODAL
function ShareModal(){
  const{st,dsp}=useApp();const[copied,setCopied]=useState(false);
  const target=st.ui.shareTarget;const handle=target?.handle||'';
  const url=`creatorbharat.in/c/${handle}`;const fullUrl=`https://${url}`;
  const copy=()=>{try{navigator.clipboard.writeText(fullUrl)}catch{const ta=document.createElement('textarea');ta.value=fullUrl;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta)}setCopied(true);setTimeout(()=>setCopied(false),2000);dsp({t:'TOAST',d:{type:'success',msg:'Link copied!'}})};
  const enc=encodeURIComponent;
  return <Modal open title={`Share ${target?.name||'Profile'}`} onClose={()=>dsp({t:'UI',v:{shareModal:false,shareTarget:null}})}><p style={{fontSize:12,fontWeight:700,color:T.t2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>Profile Link</p><div style={{display:'flex',gap:8,alignItems:'center',background:T.bg2,borderRadius:10,padding:'10px 14px',border:`1px solid ${T.bd}`,marginBottom:20}}><span style={{flex:1,fontSize:13,color:T.n8,fontFamily:'monospace',wordBreak:'break-all'}}>{url}</span><Btn sm onClick={copy} variant={copied?'ghost':'primary'}>{copied?'Copied!':'Copy'}</Btn></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{[['WhatsApp',`https://wa.me/?text=${enc('Check out this creator on CreatorBharat! '+fullUrl)}`],['Twitter',`https://twitter.com/intent/tweet?text=${enc('Check out '+target?.name+' on CreatorBharat! '+fullUrl)}`],['LinkedIn',`https://www.linkedin.com/sharing/share-offsite/?url=${enc(fullUrl)}`],['Email',`mailto:?subject=Check out this creator&body=${enc(fullUrl)}`]].map(([l,h])=><a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'11px',borderRadius:10,border:`1.5px solid ${T.bd}`,textDecoration:'none',color:T.n8,fontSize:13,fontWeight:600,background:'#fff'}}>{l}</a>)}</div></Modal>;
}


// NOTIF PANEL
function NotifPanel(){
  const{st,dsp}=useApp();const unread=st.notifications.filter(n=>!n.read).length;
  return <div onClick={e=>e.stopPropagation()} style={{position:'fixed',top:58,right:16,width:300,background:'#fff',borderRadius:14,boxShadow:T.sh4,border:`1px solid ${T.bd}`,zIndex:7000,maxHeight:360,overflowY:'auto'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${T.bd}`,position:'sticky',top:0,background:'#fff'}}><span style={{fontWeight:700,fontSize:14,color:T.n8}}>Notifications</span><div style={{display:'flex',gap:8}}>{unread>0&&<Btn sm variant="text" onClick={()=>dsp({t:'READ_ALL'})}>Mark all read</Btn>}<button onClick={()=>dsp({t:'UI',v:{notifPanel:false}})} style={{background:'none',border:'none',cursor:'pointer',color:T.t3,fontSize:16}}>x</button></div></div>{st.notifications.length===0?<div style={{padding:28,textAlign:'center',color:T.t3,fontSize:13}}>No notifications</div>:st.notifications.slice(0,10).map(n=><div key={n.id} style={{padding:'11px 16px',borderBottom:`1px solid ${T.bg3}`,background:n.read?'#fff':T.ga}}><p style={{fontSize:13,color:T.n8,marginBottom:2,fontWeight:n.read?400:600,lineHeight:1.4}}>{n.msg}</p><p style={{fontSize:10,color:T.t3}}>{n.time}</p></div>)}</div>;
}

// COMPARE BAR
function CompareBar(){
  const{st,dsp}=useApp();
  if(st.compared.length===0)return null;
  const all=LS.get('cb_creators',[]);
  const clist=st.compared.map(id=>all.find(c=>c.id===id)).filter(Boolean);
  return <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#fff',borderTop:`2px solid ${T.gd}`,zIndex:6000,padding:'10px 20px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 -4px 20px rgba(0,0,0,.08)'}}><span style={{fontSize:13,fontWeight:700,color:T.n8,flexShrink:0}}>Compare ({clist.length}/3)</span><div style={{display:'flex',gap:8,flex:1,overflowX:'auto'}}>{clist.map(c=><div key={c.id} style={{display:'flex',alignItems:'center',gap:7,background:T.bg2,borderRadius:8,padding:'5px 10px',flexShrink:0}}><img src={c.photo||`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=DC2626&color=fff`} style={{width:26,height:26,borderRadius:'50%',objectFit:'cover'}} alt="" onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=DC2626&color=fff`}}/><span style={{fontSize:12,fontWeight:600,color:T.n8}}>{c.name}</span><button onClick={()=>dsp({t:'COMPARE',id:c.id})} style={{background:'none',border:'none',cursor:'pointer',color:T.t3,fontSize:14}}>x</button></div>)}</div><div style={{display:'flex',gap:8,flexShrink:0}}>{clist.length>=2&&<Btn sm onClick={()=>{dsp({t:'GO',p:'compare'});scrollToTop()}}>Compare</Btn>}<Btn sm variant="ghost" onClick={()=>clist.forEach(c=>dsp({t:'COMPARE',id:c.id}))}>Clear</Btn></div></div>;
}

// NAVBAR
// NAVBAR
// NAVBAR
function Navbar(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const[scroll,setScroll]=useState(false);
  useEffect(()=>{const h=()=>setScroll(window.scrollY>20);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h)},[]);
  const go=(p)=>{dsp({t:'GO',p});scrollToTop();dsp({t:'UI',v:{mobileMenu:false,notifPanel:false}})};
  const unread=st.notifications.filter(n=>!n.read).length;
  const isCreator=st.role==='creator',isBrand=st.role==='brand';
  const links=isCreator?[['dashboard','Dashboard'],['monetize','Monetize 💰'],['campaigns','Campaigns'],['leaderboard','Leaderboard'],['blog','Blog']]:isBrand?[['creators','Find Creators'],['campaigns','Campaigns'],['brand-dashboard','Dashboard'],['blog','Blog']]:[['creators','Creators'],['campaigns','Campaigns'],['monetize','Monetize 💰'],['pricing','Pricing'],['about','About']];

  // 2027 Premium Light Mode Nav
  const navBg = scroll ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)';
  const navBorder = 'transparent'; // Outer wrapper handles border now
  const navText = '#111';
  const navTextDim = 'rgba(0, 0, 0, 0.6)';

  return <>
    <style>{`
      @keyframes spinBorder {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `}</style>
    <div style={{position:'fixed',top:0,left:0,right:0,zIndex:5000,padding:mob?'12px 16px':(scroll?'16px 40px':'24px 40px'),transition:'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',pointerEvents:'none'}}>
      
      {/* Outer wrapper for animated border */}
      <div style={{maxWidth:1200,margin:'0 auto',position:'relative',borderRadius:mob?22:102,padding:2,overflow:'hidden',pointerEvents:'auto',boxShadow:scroll?'0 20px 40px -10px rgba(0,0,0,0.1)':'0 10px 30px -10px rgba(0,0,0,0.05)',transition:'all 0.4s ease'}}>
        
        {/* The spinning Indian flag gradient */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '200%',
          height: '500%',
          background: 'conic-gradient(from 0deg, #138808 0%, #FFFFFF 20%, #FF9933 40%, #FF9933 60%, #FFFFFF 80%, #138808 100%)',
          animation: 'spinBorder 5s linear infinite',
          zIndex: 0
        }} />

        {/* The actual navbar */}
        <nav style={{position:'relative',zIndex:1,background:navBg,backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',borderRadius:mob?20:100,padding:mob?'0 16px':'0 24px',height:mob?60:72,display:'flex',alignItems:'center',gap:24}}>

          <Logo onClick={()=>go('home')} sm={mob} light={false} />
          
          {!mob&&<div style={{display:'flex',alignItems:'center',gap:4,flex:1,marginLeft:40}}>
            {links.map(([p,l])=><button key={p} onClick={()=>go(p)} style={{padding:'8px 16px',background:st.page===p?'rgba(255,148,49,0.08)':'transparent',border:'none',color:st.page===p?T.gd:navTextDim,fontWeight:st.page===p?700:600,fontSize:14,cursor:'pointer',borderRadius:100,fontFamily:"'Inter',sans-serif",transition:'all .2s',letterSpacing:'0.2px'}} onMouseEnter={e=>e.target.style.color=T.gd} onMouseLeave={e=>e.target.style.color=st.page===p?T.gd:navTextDim}>{l}</button>)}
          </div>}
          
          <div style={{display:'flex',alignItems:'center',gap:16,marginLeft:'auto'}}>
            {st.compared.length>0&&!mob&&<Btn sm variant="outline" onClick={()=>go('compare')} style={{borderColor:'rgba(0,0,0,0.1)',color:navText}}>Compare ({st.compared.length})</Btn>}
            {st.user?<>
              <button onClick={()=>dsp({t:'UI',v:{notifPanel:!st.ui.notifPanel,mobileMenu:false}})} style={{position:'relative',background:'#fff',border:`1px solid rgba(0,0,0,0.05)`,cursor:'pointer',width:40,height:40,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={navText} strokeWidth="2.2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
                {unread>0&&<span style={{position:'absolute',top:-2,right:-2,minWidth:18,height:18,padding:'0 4px',background:'#EF4444',borderRadius:10,fontSize:10,fontWeight:900,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',border:`2px solid #fff`}}>{unread>9?'9+':unread}</span>}
              </button>
              {!mob&&<div style={{position:'relative'}}>
                <button onClick={()=>dsp({t:'UI',v:{mobileMenu:!st.ui.mobileMenu,notifPanel:false}})} style={{display:'flex',alignItems:'center',gap:10,background:'#fff',border:`1px solid rgba(0,0,0,0.05)`,borderRadius:100,padding:'4px 16px 4px 4px',cursor:'pointer',fontFamily:"'Inter',sans-serif",transition:'all .2s',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>
                  <img src={(st.creatorProfile?.photo||st.creatorProfile?.avatarUrl)||`https://ui-avatars.com/api/?name=${encodeURIComponent(st.user.name||'U')}&background=FF9431&color=fff`} style={{width:32,height:32,borderRadius:'50%',objectFit:'cover'}} alt=""/>
                  <span style={{fontSize:14,fontWeight:700,color:navText,maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{st.user.name||st.user.companyName}</span>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke={navTextDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                {st.ui.mobileMenu&&<div className="si" style={{position:'absolute',right:0,top:'calc(100% + 16px)',background:'#fff',border:`1px solid ${T.bd}`,borderRadius:24,minWidth:240,boxShadow:T.sh4,zIndex:100,overflow:'hidden',padding:10}}>
                  {[isCreator&&['Dashboard','dashboard'],isCreator&&['Applications','applications'],isBrand&&['Brand Dashboard','brand-dashboard'],isBrand&&['Post Campaign','campaign-builder'],['Settings','settings'],['Saved Items','saved']].filter(Boolean).map(([l,p])=><button key={p} onClick={()=>{go(p);dsp({t:'UI',v:{mobileMenu:false}})}} style={{display:'block',width:'100%',padding:'14px 18px',background:st.page===p?T.ga:'none',border:'none',textAlign:'left',fontSize:14,color:st.page===p?T.gd:T.t1,cursor:'pointer',fontFamily:"'Inter',sans-serif",borderRadius:12,fontWeight:st.page===p?800:600,marginBottom:4}}>{l}</button>)}
                  <div style={{height:1,background:T.bd,margin:'10px 0'}}/>
                  <button onClick={()=>{dsp({t:'LOGOUT'});dsp({t:'UI',v:{mobileMenu:false}})}} style={{display:'block',width:'100%',padding:'14px 18px',background:'none',border:'none',textAlign:'left',fontSize:14,color:T.gd,cursor:'pointer',fontFamily:"'Inter',sans-serif",fontWeight:800,borderRadius:12}}>Logout</button>
                </div>}
              </div>}
            </>:<>
              {!mob&&<button onClick={()=>dsp({t:'UI',v:{authModal:true,authTab:'login'}})} style={{background:'transparent',border:'none',color:navText,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:"'Inter',sans-serif",padding:'8px 16px'}}>Login</button>}
              {!mob&&<Btn lg onClick={()=>{go('apply')}} style={{fontWeight:800,borderRadius:100,padding:'10px 24px',fontSize:14,background:'#111',color:'#fff',border:'none',boxShadow:'0 4px 14px rgba(0,0,0,0.1)'}}>Create Portfolio</Btn>}
            </>}
            {mob&&<button onClick={()=>dsp({t:'UI',v:{mobileMenu:!st.ui.mobileMenu}})} style={{background:'#fff',border:`1px solid rgba(0,0,0,0.05)`,cursor:'pointer',width:40,height:40,borderRadius:'50%',display:'flex',flexDirection:'column',gap:4,alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}}>{[0,1,2].map(i=><span key={i} style={{display:'block',width:18,height:2,background:navText,borderRadius:1}}/>)}</button>}
          </div>
        </nav>
      </div>
    </div>
    
    {mob&&st.ui.mobileMenu&&<div className="ai" style={{position:'fixed',inset:0,zIndex:999999,background:'rgba(0,0,0,0.4)',backdropFilter:'blur(10px)'}} onClick={()=>dsp({t:'UI',v:{mobileMenu:false}})}>
      <div className="sr" onClick={e=>e.stopPropagation()} style={{position:'absolute',top:16,right:16,bottom:16,width:'85%',maxWidth:360,background:'#fff',borderRadius:32,boxShadow:'0 30px 60px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05)',padding:'32px 24px',display:'flex',flexDirection:'column',overflowY:'auto',animation:'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'}}>
        
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:40}}>
          <Logo onClick={()=>go('home')} />
          <button onClick={()=>dsp({t:'UI',v:{mobileMenu:false}})} style={{width:44,height:44,borderRadius:100,background:'#F3F4F6',border:'1px solid rgba(0,0,0,0.05)',fontSize:20,display:'flex',alignItems:'center',justifyContent:'center',color:'#111',cursor:'pointer',transition:'background 0.2s'}}>✕</button>
        </div>

        {st.user && <div style={{display:'flex',alignItems:'center',gap:14,padding:'16px',background:'#F9FAFB',borderRadius:20,marginBottom:32,border:'1px solid rgba(0,0,0,0.05)'}}>
          <img src={(st.creatorProfile?.photo||st.creatorProfile?.avatarUrl)||(`https://ui-avatars.com/api/?name=${encodeURIComponent(st.user.name||'U')}&background=FF9431&color=fff`)} style={{width:52,height:52,borderRadius:'50%',objectFit:'cover',border:'2px solid #fff',boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}} alt=""/>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:'#111',fontFamily:"'Inter',sans-serif"}}>{st.user.name||st.user.companyName}</div>
            <div style={{fontSize:13,fontWeight:600,color:'rgba(0,0,0,0.5)',fontFamily:"'Inter',sans-serif"}}>{st.role === 'creator' ? 'Creator Account' : 'Brand Account'}</div>
          </div>
        </div>}

        <div style={{display:'flex',flexDirection:'column',gap:8,flex:1}}>
          {links.map(([p,l])=><button key={p} onClick={()=>{go(p);dsp({t:'UI',v:{mobileMenu:false}})}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'16px 20px',background:st.page===p?'#F9FAFB':'transparent',border:st.page===p?'1px solid rgba(0,0,0,0.05)':'1px solid transparent',textAlign:'left',fontSize:18,color:st.page===p?'#111':'rgba(0,0,0,0.6)',cursor:'pointer',fontFamily:"'Inter',sans-serif",fontWeight:st.page===p?800:600,borderRadius:20,transition:'all 0.2s'}}>
            {l}
            {st.page===p && <div style={{width:8,height:8,borderRadius:'50%',background:'linear-gradient(135deg, #FF9431, #DC2626)'}}/>}
          </button>)}
          
          {st.user && <div style={{height:1,background:'rgba(0,0,0,0.05)',margin:'16px 0'}}/>}

          {st.user && [
            isCreator&&['Dashboard','dashboard'],
            isCreator&&['Applications','applications'],
            isBrand&&['Brand Dashboard','brand-dashboard'],
            isBrand&&['Post Campaign','campaign-builder'],
            ['Settings','settings'],
            ['Saved Items','saved']
          ].filter(Boolean).map(([l,p])=><button key={p} onClick={()=>{go(p);dsp({t:'UI',v:{mobileMenu:false}})}} style={{display:'block',width:'100%',padding:'14px 20px',background:st.page===p?'#F9FAFB':'transparent',border:'none',textAlign:'left',fontSize:16,color:st.page===p?'#111':'rgba(0,0,0,0.7)',cursor:'pointer',fontFamily:"'Inter',sans-serif",fontWeight:st.page===p?800:600,borderRadius:16}}>{l}</button>)}
        </div>

        <div style={{marginTop:40,display:'flex',flexDirection:'column',gap:12}}>
          {!st.user?<><Btn full lg onClick={()=>{dsp({t:'UI',v:{authModal:true,authTab:'login',mobileMenu:false}})}} style={{background:'#111',color:'#fff',padding:'20px',borderRadius:20,fontSize:16,fontFamily:"'Inter',sans-serif",boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>Sign In</Btn><Btn full lg variant="outline" onClick={()=>{go('apply');dsp({t:'UI',v:{mobileMenu:false}})}} style={{borderColor:'rgba(0,0,0,0.1)',color:'#111',background:'#fff',padding:'20px',borderRadius:20,fontSize:16,fontFamily:"'Inter',sans-serif",boxShadow:'0 4px 10px rgba(0,0,0,0.02)'}}>Create Free Portfolio</Btn></>:(<button onClick={()=>{dsp({t:'LOGOUT'});dsp({t:'UI',v:{mobileMenu:false}})}} style={{display:'block',width:'100%',padding:'18px',background:'rgba(239,68,68,0.08)',border:'none',textAlign:'center',fontSize:16,color:'#EF4444',cursor:'pointer',fontFamily:"'Inter',sans-serif",fontWeight:800,borderRadius:20}}>Logout Account</button>)}
        </div>
      </div>
    </div>}
    {st.ui.notifPanel&&<NotifPanel/>}
  </>;
}


// FOOTER
function Footer(){
  const{dsp}=useApp();const{mob}=useVP();
  const go=(p)=>{dsp({t:'GO',p});scrollToTop()};
  const[email,setEmail]=useState('');const[ok,setOk]=useState(false);
  const sub=()=>{if(!email.includes('@'))return;const ex=LS.get('cb_newsletter',[]);if(!ex.find(e=>e.email===email))LS.push('cb_newsletter',{email,date:new Date().toISOString()});setOk(true);setEmail('')};
  return <footer style={{background:'#050505',color:'rgba(255,255,255,.6)',paddingTop:mob?48:80,position:'relative',overflow:'hidden'}}>
    <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#FF9431 33%,#fff 33%,#fff 66%,#128807 66%)',opacity:.3}}/>
    <div style={W()}>
      <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'2fr 1fr 1fr 1fr',gap:mob?40:60,paddingBottom:48}}>
        <div style={{maxWidth:320}}>
          <Logo light onClick={()=>go('home')}/>
          <p style={{fontSize:15,lineHeight:1.7,marginTop:24,color:'rgba(255,255,255,.5)'}}>India's premier creator discovery ecosystem. Empowering local talent from Jaipur to the world.</p>
          <div style={{display:'flex',gap:16,marginTop:24}}>
            {['📱','🐦','📸','🎥'].map((icon,i)=><div key={i} style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,cursor:'pointer',border:'1px solid rgba(255,255,255,.1)'}}>{icon}</div>)}
          </div>
        </div>
        {[{t:'Platform',l:[['creators','Find Creators'],['campaigns','Campaigns'],['leaderboard','Leaderboard'],['rate-calc','Calculator']]},{t:'Company',l:[['about','Our Story'],['blog','Latest News'],['contact','Contact Us']]},{t:'Resources',l:[['pricing','Pricing Plans'],['apply','Join as Creator'],['brand-register','For Brands']]}].map(col=><div key={col.t}><h4 style={{fontSize:13,fontWeight:800,color:'#fff',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:24}}>{col.t}</h4>{col.l.map(([p,l])=><button key={p} onClick={()=>go(p)} style={{display:'block',background:'none',border:'none',color:'rgba(255,255,255,.5)',fontSize:15,cursor:'pointer',marginBottom:14,padding:0,textAlign:'left',fontFamily:'inherit',transition:'color .2s'}} onMouseEnter={e=>e.target.style.color=T.gd} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.5)'}>{l}</button>)}</div>)}
      </div>
      
      <div style={{borderTop:'1px solid rgba(255,255,255,.08)',padding:'40px 0',display:'flex',flexDirection:mob?'column':'row',justifyContent:'space-between',alignItems:mob?'flex-start':'center',gap:24}}>
        <div style={{maxWidth:400}}>
          <h4 style={{color:'#fff',fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:800,marginBottom:8}}>Join the Creator Newsletter</h4>
          <p style={{fontSize:14,color:'rgba(255,255,255,.4)'}}>Weekly insights on brand deals and creator economy trends in India.</p>
        </div>
        <div style={{display:'flex',gap:10,width:mob?'100%':'auto'}}>
          {ok?<div style={{padding:'12px 24px',background:'rgba(16,185,129,.1)',color:T.ok,borderRadius:12,fontWeight:700,fontSize:14,border:'1px solid rgba(16,185,129,.2)'}}>✓ Subscribed Successfully!</div>:<>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{padding:'14px 18px',borderRadius:12,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.05)',color:'#fff',fontSize:14,fontFamily:'inherit',outline:'none',width:mob?'100%':240}} />
            <Btn onClick={sub} lg style={{background:'linear-gradient(135deg,#FF9431,#FF6B00)',border:'none',color:'#fff',fontWeight:800}}>Join</Btn>
          </>}
        </div>
      </div>
      
      <div style={{borderTop:'1px solid rgba(255,255,255,.08)',padding:'24px 0',display:'flex',flexDirection:mob?'column':'row',justifyContent:'space-between',alignItems:'center',gap:16}}>
        <p style={{fontSize:13,color:'rgba(255,255,255,.3)',fontWeight:500}}>© 2026 CreatorBharat Technologies. Proudly Made in 🇮🇳 Jaipur</p>
        <div style={{display:'flex',gap:24}}>
          {['Privacy Policy','Terms','Security'].map(l=><span key={l} style={{fontSize:13,color:'rgba(255,255,255,.3)',cursor:'pointer',fontWeight:500}}>{l}</span>)}
        </div>
      </div>
    </div>
  </footer>;
}



// ── AI CHATBOT ────────────────────────────────────────────────────
function AIChatbot(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const[open,setOpen]=useState(false);
  const[msgs,setMsgs]=useState([
    {role:'assistant',content:'Namaste! 🇮🇳 Main CreatorBharat ka AI assistant hoon. Creator portfolio, brand deals, ya platform ke baare mein kuch bhi pucho!'}
  ]);
  const[input,setInput]=useState('');
  const[loading,setLoading]=useState(false);
  const[pulse,setPulse]=useState(true);
  const bottomRef=useRef(null);

  useEffect(function(){
    if(bottomRef.current)bottomRef.current.scrollIntoView({behavior:'smooth'});
  },[msgs]);

  useEffect(function(){
    var t=setTimeout(function(){setPulse(false);},4000);
    return function(){clearTimeout(t);};
  },[]);

  var SYSTEM=`You are CreatorBharat AI -- a friendly, helpful assistant for India's creator discovery platform at creatorbharat.in, based in Jaipur, Rajasthan.

You help:
- CREATORS: how to apply (free listing, just fill form), improve profile score, get brand deals, set rates, understand engagement rate
- BRANDS: how to find creators, post campaigns, filter by state/city/niche, contact creators
- GENERAL: explain platform features, pricing (₹49 one-time for Pro features), how it works

Key facts:
- Free to list as a creator
- ₹49 one-time Pro upgrade for priority listing
- 2400+ creators across 50+ Indian cities
- Specializes in Tier 2 & Tier 3 city creators
- Brands can post campaigns and creators apply
- State → District filtering available
- Creator Score (0-100) based on profile, followers, engagement

Tone: Friendly, helpful, mix of Hindi/English (Hinglish) naturally. Keep answers concise (2-4 lines). Use emojis occasionally.
Never make up specific creator names or brand deals. If unsure, say so.`;

  var send=function(){
    if(!input.trim()||loading)return;
    var userMsg={role:'user',content:input.trim()};
    var newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);

    fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:300,
        system:SYSTEM,
        messages:newMsgs.map(function(m){return{role:m.role,content:m.content};})
      })
    })
    .then(function(r){return r.json();})
    .then(function(data){
      var reply=data.content&&data.content[0]?data.content[0].text:'Sorry, kuch problem ho gayi. Dobara try karo!';
      setMsgs(function(prev){return [...prev,{role:'assistant',content:reply}];});
      setLoading(false);
    })
    .catch(function(){
      setMsgs(function(prev){return [...prev,{role:'assistant',content:'Network error aa gayi. Thodi der baad try karo! 🙏'}];});
      setLoading(false);
    });
  };

  var QUICK=[
    'Creator kaise bane?',
    'Mera rate kya hona chahiye?',
    'Brand deal kaise milega?',
    'Platform free hai?',
  ];

  return React.createElement(React.Fragment,null,
    // Floating button
    React.createElement('div',{style:{position:'fixed',bottom:mob?20:28,right:mob?16:28,zIndex:8500}},
      !open&&React.createElement('button',{
        onClick:function(){setOpen(true);setPulse(false);},
        style:{
          width:56,height:56,borderRadius:'50%',
          background:'linear-gradient(135deg,#FF9933,#138808)',
          border:'none',cursor:'pointer',
          boxShadow:'0 4px 20px rgba(255,153,51,.5)',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:24,position:'relative',
          transition:'transform .2s'
        },
        onMouseEnter:function(e){e.currentTarget.style.transform='scale(1.1)';},
        onMouseLeave:function(e){e.currentTarget.style.transform='scale(1)';}
      },
        React.createElement('span',null,'🤖'),
        pulse&&React.createElement('span',{style:{
          position:'absolute',top:-2,right:-2,width:14,height:14,
          borderRadius:'50%',background:'#DC2626',
          border:'2px solid #fff',fontSize:7,color:'#fff',
          display:'flex',alignItems:'center',justifyContent:'center',
          fontWeight:900,animation:'pulse 1.5s infinite'
        }},'AI')
      )
    ),

    // Chat window
    open&&React.createElement('div',{style:{
      position:'fixed',
      bottom:mob?0:90,
      right:mob?0:28,
      width:mob?'100%':360,
      height:mob?'100vh':520,
      background:'#fff',
      borderRadius:mob?0:20,
      boxShadow:'0 20px 60px rgba(0,0,0,.2)',
      zIndex:8500,
      display:'flex',flexDirection:'column',
      overflow:'hidden',
      border:mob?'none':'1px solid #E8E6E3',
      animation:'scaleIn .2s ease'
    }},
      // Header
      React.createElement('div',{style:{
        padding:'14px 16px',
        background:'linear-gradient(135deg,#0d0d0d,#1a0800)',
        display:'flex',alignItems:'center',gap:10,
        flexShrink:0,position:'relative'
      }},
        React.createElement('div',{style:{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)'}}),
        React.createElement('div',{style:{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}},'🤖'),
        React.createElement('div',{style:{flex:1}},
          React.createElement('p',{style:{fontSize:13,fontWeight:700,color:'#fff',marginBottom:1}},'CreatorBharat AI'),
          React.createElement('div',{style:{display:'flex',alignItems:'center',gap:4}},
            React.createElement('span',{style:{width:6,height:6,borderRadius:'50%',background:'#138808',display:'inline-block'}}),
            React.createElement('span',{style:{fontSize:10,color:'rgba(255,255,255,.6)'}},'Online • Powered by Claude')
          )
        ),
        React.createElement('button',{
          onClick:function(){setOpen(false);},
          style:{background:'rgba(255,255,255,.1)',border:'none',width:28,height:28,borderRadius:'50%',cursor:'pointer',color:'#fff',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}
        },'×')
      ),

      // Messages
      React.createElement('div',{style:{flex:1,overflowY:'auto',padding:'14px',display:'flex',flexDirection:'column',gap:10,background:'#FAFAF9'}},
        msgs.map(function(m,mi){
          var isAI=m.role==='assistant';
          return React.createElement('div',{key:mi,style:{display:'flex',gap:8,alignItems:'flex-end',flexDirection:isAI?'row':'row-reverse'}},
            isAI&&React.createElement('div',{style:{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}},'🤖'),
            React.createElement('div',{style:{
              maxWidth:'78%',
              padding:'10px 13px',
              borderRadius:isAI?'4px 14px 14px 14px':'14px 4px 14px 14px',
              background:isAI?'#fff':'linear-gradient(135deg,#FF9933,#FF6B00)',
              color:isAI?'#1a1a1a':'#fff',
              fontSize:13,
              lineHeight:1.6,
              boxShadow:'0 1px 4px rgba(0,0,0,.08)',
              border:isAI?'1px solid #E8E6E3':'none',
              whiteSpace:'pre-wrap'
            }},m.content)
          );
        }),
        loading&&React.createElement('div',{style:{display:'flex',gap:8,alignItems:'flex-end'}},
          React.createElement('div',{style:{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}},'🤖'),
          React.createElement('div',{style:{padding:'10px 14px',borderRadius:'4px 14px 14px 14px',background:'#fff',border:'1px solid #E8E6E3',boxShadow:'0 1px 4px rgba(0,0,0,.08)',display:'flex',gap:5,alignItems:'center'}},
            [0,1,2].map(function(di){
              return React.createElement('span',{key:di,style:{width:6,height:6,borderRadius:'50%',background:'#FF9933',animation:'bounce .8s infinite',animationDelay:(di*0.15)+'s',display:'inline-block'}});
            })
          )
        ),
        React.createElement('div',{ref:bottomRef})
      ),

      // Quick replies (show only at start)
      msgs.length<=1&&React.createElement('div',{style:{padding:'0 12px 10px',display:'flex',gap:6,flexWrap:'wrap',background:'#FAFAF9',flexShrink:0}},
        QUICK.map(function(q){
          return React.createElement('button',{key:q,onClick:function(){setInput(q);},style:{
            padding:'5px 11px',borderRadius:18,
            border:'1px solid rgba(255,153,51,.4)',
            background:'rgba(255,153,51,.08)',
            color:'#FF9933',fontSize:11,fontWeight:600,
            cursor:'pointer',fontFamily:'inherit',
            transition:'all .15s'
          }},q);
        })
      ),

      // Input
      React.createElement('div',{style:{padding:'10px 12px',borderTop:'1px solid #E8E6E3',background:'#fff',flexShrink:0,display:'flex',gap:8,alignItems:'flex-end'}},
        React.createElement('textarea',{
          value:input,
          onChange:function(e){setInput(e.target.value);},
          onKeyDown:function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}},
          placeholder:'Kuch bhi pucho...',
          rows:1,
          style:{
            flex:1,padding:'9px 12px',borderRadius:10,
            border:'1.5px solid #E8E6E3',
            fontSize:13,fontFamily:'inherit',outline:'none',
            resize:'none',lineHeight:1.5,
            transition:'border-color .15s',
            maxHeight:80
          },
          onFocus:function(e){e.target.style.borderColor='#FF9933';},
          onBlur:function(e){e.target.style.borderColor='#E8E6E3';}
        }),
        React.createElement('button',{
          onClick:send,
          disabled:!input.trim()||loading,
          style:{
            width:38,height:38,borderRadius:10,
            background:input.trim()&&!loading?'linear-gradient(135deg,#FF9933,#FF6B00)':'#E8E6E3',
            border:'none',cursor:input.trim()&&!loading?'pointer':'not-allowed',
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:16,flexShrink:0,
            transition:'all .2s'
          }
        },loading?React.createElement('span',{className:'spin',style:{width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block'}}):'➤')
      )
    )
  );
}

function AuthModal(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const[mode,setMode]=useState('login'); // login, reg
  const[F,setF]=useState({email:'',pass:'',name:'',role:'creator'});
  const[load,setLoad]=useState(false);
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  const close=()=>dsp({t:'MODAL',v:null});

  const submit=e=>{
    e.preventDefault();setLoad(true);
    setTimeout(()=>{
      setLoad(false);
      if(mode==='login'){
        if(F.email==='demo@creatorbharat.in'&&F.pass==='123456'){
          const user={email:F.email,name:'Demo User',role:F.role};
          LS.save('cb_user',user);dsp({t:'SET_USER',u:user});toast('Logged in successfully!','success');close();
        }else toast('Invalid credentials (Try demo@creatorbharat.in / 123456)','error');
      }else{
        const user={email:F.email,name:F.name,role:F.role};
        LS.save('cb_user',user);dsp({t:'SET_USER',u:user});toast('Account created!','success');close();
      }
    },1000);
  };

  return <Modal open={st.modal==='auth'||st.ui.authModal} title="" onClose={close} width={440}>
    <div style={{padding:'8px 0'}}>
      <div style={{textAlign:'center',marginBottom:32}}>
        <div style={{width:56,height:56,background:T.gd,borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 20px',boxShadow:T.sh2}}>🇮🇳</div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,color:T.t1,marginBottom:8}}>{mode==='login'?'Welcome Back':'Join CreatorBharat'}</h2>
        <p style={{fontSize:15,color:T.t3,fontWeight:500}}>{mode==='login'?'Enter your details to access your account':'Start your professional journey today'}</p>
      </div>

      <div style={{display:'flex',background:T.bg2,padding:6,borderRadius:14,marginBottom:28,border:`1px solid ${T.bd}`}}>
        {[['login','Login'],['reg','Register']].map(([m,l])=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:mode===m?'#fff':'none',color:mode===m?T.n8:T.t3,fontSize:14,fontWeight:mode===m?800:600,cursor:'pointer',transition:'all .2s',boxShadow:mode===m?T.sh1:'none'}}>{l}</button>)}
      </div>

      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:20}}>
        {mode==='reg'&&<Fld label="Full Name" value={F.name} onChange={e=>setF({...F,name:e.target.value})} placeholder="e.g. Rahul Sharma" required/>}
        <Fld label="Email Address" type="email" value={F.email} onChange={e=>setF({...F,email:e.target.value})} placeholder="name@email.com" required/>
        <Fld label="Password" type="password" value={F.pass} onChange={e=>setF({...F,pass:e.target.value})} placeholder="••••••••" required/>
        
        {mode==='reg'&&<div>
          <label style={{fontSize:12,fontWeight:900,color:T.t4,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:12,display:'block'}}>I am a...</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[['creator','Creator'],['brand','Brand/Agency']].map(([r,l])=><div key={r} onClick={()=>setF({...F,role:r})} style={{padding:'14px',borderRadius:12,border:`2px solid ${F.role===r?T.gd:T.bd}`,background:F.role===r?T.ga:'#fff',textAlign:'center',cursor:'pointer',fontSize:14,fontWeight:800,color:F.role===r?T.gd:T.t2,transition:'all .2s'}}>{l}</div>)}
          </div>
        </div>}

        <Btn full lg type="submit" loading={load} style={{height:56,borderRadius:16,fontSize:16,marginTop:8}}>{mode==='login'?'Sign In':'Create Account'}</Btn>
      </form>

      <div style={{marginTop:32,textAlign:'center',paddingTop:24,borderTop:`1px solid ${T.bd}`}}>
        <p style={{fontSize:14,color:T.t3,fontWeight:500}}>
          {mode==='login'?"Don't have an account? ":"Already have an account? "}
          <span onClick={()=>setMode(mode==='login'?'reg':'login')} style={{color:T.gd,fontWeight:800,cursor:'pointer',textDecoration:'underline'}}>
            {mode==='login'?'Register now':'Login here'}
          </span>
        </p>
      </div>
    </div>
  </Modal>;
}

function PL({children,noFooter}){
  const{st}=useApp();
  return <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',background:T.bg,color:T.t1}}>
    <Navbar/>
    <main style={{flex:1,position:'relative',zIndex:1}}>{children}</main>
    {!noFooter&&<Footer/>}
    <ToastBar/>
    <CompareBar/>
    <AIChatbot/>
    {st.ui.shareModal&&<ShareModal/>}
    {st.ui.authModal&&<AuthModal/>}
    {st.ui.demoModal&&<DemoModal/>}
  </div>;
}

// CREATOR CARD
function CreatorCard({creator:c,onView}){
  const{st,dsp}=useApp();
  const saved=st.saved.includes(c.id);const compared=st.compared.includes(c.id);
  const score=c.score||fmt.score(c);const tier=fmt.tier(score);
  const niches=Array.isArray(c.niche)?c.niche:[c.niche].filter(Boolean);
  const platforms=Array.isArray(c.platform)?c.platform:[c.platform].filter(Boolean);
  const img=c.photo||c.avatarUrl||`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=FF9431&color=fff&size=200`;
  
  return <Card onClick={e=>{e.stopPropagation();onView&&onView(c)}} style={{display:'flex',flexDirection:'column',border:`1.5px solid ${compared?T.gd:T.bd}`,background:'#fff'}}>
    <div style={{position:'relative',height:120,background:`linear-gradient(135deg,${T.n8},${T.n7})`,flexShrink:0,overflow:'hidden'}}>
      {c.coverUrl?<img src={c.coverUrl} style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.7}} alt="" onError={e=>e.target.style.display='none'}/>:<div style={{width:'100%',height:'100%',background:T.gd,opacity:0.1}}/>}
      <button onClick={e=>{e.stopPropagation();dsp({t:'SAVE',id:c.id})}} style={{position:'absolute',top:12,right:12,background:'rgba(255,255,255,0.9)',backdropFilter:'blur(12px)',border:'none',borderRadius:12,width:40,height:40,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:saved?T.gd:T.t3,fontSize:20,boxShadow:T.sh2,transition:'all .2s'}} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>{saved?'❤️':'♡'}</button>
      {c.verified&&<div style={{position:'absolute',top:12,left:12,background:'rgba(59,130,246,0.95)',color:'#fff',fontSize:10,fontWeight:900,padding:'5px 12px',borderRadius:20,backdropFilter:'blur(8px)',display:'flex',alignItems:'center',gap:6,letterSpacing:'.05em'}}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M20 6L9 17l-5-5"/></svg> VERIFIED</div>}
    </div>
    
    <div style={{padding:'0 24px 24px',marginTop:-48,position:'relative',zIndex:2}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:16}}>
        <div style={{position:'relative'}}>
          <img src={img} style={{width:96,height:96,borderRadius:28,objectFit:'cover',border:'4px solid #fff',boxShadow:T.sh3,background:T.bg2}} alt={c.name} onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=FF9431&color=fff&size=200`}}/>
          <div style={{position:'absolute',bottom:0,right:0,width:28,height:28,borderRadius:'50%',background:tier.color,border:'3px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'#fff',boxShadow:T.sh2}}>{score}</div>
        </div>
        <div style={{paddingBottom:8}}><Bdg color={tier.bc}>{tier.label}</Bdg></div>
      </div>
      
      <h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:T.t1,marginBottom:4,lineHeight:1.2}}>{c.name}</h3>
      <p style={{fontSize:14,color:T.t3,marginBottom:20,display:'flex',alignItems:'center',gap:6,fontWeight:500}}>📍 {c.city}{c.state?`, ${c.state}`:''}</p>
      
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:24,padding:'16px',background:T.bg2,borderRadius:20,border:`1px solid ${T.bd}`}}>
        {[[fmt.num(c.followers),'Followers'],[(c.engagementRate||c.er||0)+'%','Eng.'],[fmt.inr(c.rateMin),'Min Rate']].map(([v,l],i)=><div key={l} style={{textAlign:'center',borderRight:i<2?`1px solid ${T.bd}`:'none'}}>
          <div style={{fontSize:16,fontWeight:900,color:T.t1,fontFamily:"'Fraunces',serif"}}>{v}</div>
          <div style={{fontSize:10,color:T.t4,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',marginTop:2}}>{l}</div>
        </div>)}
      </div>

      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
        {niches.slice(0,2).map(n=><span key={n} style={{fontSize:11,fontWeight:800,color:T.gd,background:'rgba(255,148,49,0.08)',padding:'5px 12px',borderRadius:12}}>{n}</span>)}
        {platforms.slice(0,1).map(p=><span key={p} style={{fontSize:11,fontWeight:800,color:T.t3,background:T.bg3,padding:'5px 12px',borderRadius:12}}>{p}</span>)}
      </div>

      <div style={{display:'flex',gap:10}}>
        <Btn full variant="primary" style={{borderRadius:14,height:48}}>View Profile</Btn>
        <button onClick={e=>{e.stopPropagation();dsp({t:'COMPARE',id:c.id})}} style={{width:48,height:48,borderRadius:14,border:`1.5px solid ${compared?T.gd:T.bd}`,background:compared?'rgba(255,148,49,0.05)':'transparent',color:compared?T.gd:T.t3,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .3s ease',flexShrink:0}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.gd} onMouseLeave={e=>e.currentTarget.style.borderColor=compared?T.gd:T.bd}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
        </button>
      </div>
    </div>
  </Card>;
}

// CAMPAIGN CARD
function CampCard({campaign:c,onApply}){
  const{st,dsp}=useApp();
  const applied=st.applied.includes(c.id);
  const niches=Array.isArray(c.niche)?c.niche:[c.niche].filter(Boolean);
  const platforms=Array.isArray(c.platform)?c.platform:[c.platform].filter(Boolean);
  const daysLeft=c.deadline?Math.max(0,Math.ceil((new Date(c.deadline)-new Date())/(1000*60*60*24))):null;
  const fillPct=c.slots>0?Math.round((c.filled/c.slots)*100):0;
  
  return <Card style={{padding:'32px',display:'flex',flexDirection:'column',gap:24,border:`1.5px solid ${applied?T.ok:T.bd}`,position:'relative'}}>
    {c.urgent&&<div style={{position:'absolute',top:16,right:16,background:'rgba(255,148,49,0.1)',color:T.gd,fontSize:10,fontWeight:900,padding:'6px 14px',borderRadius:20,border:`1px solid rgba(255,148,49,0.2)`,letterSpacing:'.05em',animation:'pulse 2s infinite'}}>URGENT</div>}
    
    <div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>
        {niches.slice(0,2).map(n=><Bdg key={n} sm color="gray">{n}</Bdg>)}
        {c.bidding&&<Bdg sm color="purple">Bidding</Bdg>}
      </div>
      <h3 style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:T.t1,lineHeight:1.2,marginBottom:10}}>{c.title}</h3>
      <p style={{fontSize:15,color:T.gd,fontWeight:800,display:'flex',alignItems:'center',gap:8}}>
        <div style={{width:28,height:28,borderRadius:8,background:'rgba(255,148,49,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🏢</div>
        {typeof c.brand === 'object' && c.brand !== null ? c.brand.companyName : c.brand}
      </p>
    </div>

    <div style={{background:T.bg2,padding:'20px',borderRadius:20,display:'flex',justifyContent:'space-between',alignItems:'center',border:`1px solid ${T.bd}`}}>
      <div>
        <div style={{fontSize:11,color:T.t4,fontWeight:800,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>Budget</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:T.ok}}>{fmt.inr(c.budgetMin)} - {fmt.inr(c.budgetMax)}</div>
      </div>
      <div style={{textAlign:'right'}}>
        <div style={{fontSize:11,color:T.t4,fontWeight:800,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>Deadline</div>
        <div style={{fontSize:15,fontWeight:800,color:daysLeft<=7?T.gd:T.t1}}>{daysLeft} days left</div>
      </div>
    </div>

    <p style={{fontSize:15,color:T.t2,lineHeight:1.6,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{c.description}</p>
    
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
        <span style={{fontSize:13,color:T.t3,fontWeight:700}}>Applications: {c.filled}/{c.slots}</span>
        <span style={{fontSize:13,fontWeight:900,color:fillPct>=80?T.gd:T.ok}}>{fillPct}% Full</span>
      </div>
      <Bar value={fillPct} color={fillPct>=80?T.gd:T.ok} height={8}/>
    </div>

    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8,paddingTop:24,borderTop:`1px solid ${T.bd}`}}>
      <div style={{display:'flex',gap:-10}}>
        {platforms.map(p=><span key={p} title={p} style={{width:32,height:32,borderRadius:'50%',background:'#fff',border:`2px solid ${T.bd}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,marginLeft:-10,zIndex:1,boxShadow:T.sh1}}>
          {p==='Instagram'?'📸':p==='YouTube'?'🎥':p==='Twitter'?'🐦':'📱'}
        </span>)}
      </div>
      {applied?<Bdg color="green">Application Sent</Bdg>:<Btn onClick={()=>{if(!st.user){dsp({t:'UI',v:{authModal:true,authTab:'login'}});return}if(st.role!=='creator'){dsp({t:'TOAST',d:{type:'info',msg:'Only creators can apply'}});return}onApply&&onApply(c)}} style={{borderRadius:14,padding:'10px 24px'}}>Apply Now</Btn>}
    </div>
  </Card>;
}



// ── HOME PAGE
const INDIA_STATES={Rajasthan:['Jaipur','Jodhpur','Udaipur','Kota','Ajmer','Bikaner','Alwar','Bhilwara','Sikar','Pali','Nagaur','Barmer','Churu','Tonk','Jhunjhunu','Hanumangarh','Banswara','Bharatpur','Sawai Madhopur','Dausa'],Maharashtra:['Mumbai','Pune','Nagpur','Nashik','Thane','Aurangabad','Solapur','Kolhapur','Amravati','Nanded','Sangli','Jalgaon','Akola','Latur','Dhule','Ahmednagar','Chandrapur','Parbhani','Ratnagiri','Satara'],Karnataka:['Bengaluru','Mysuru','Hubballi','Mangaluru','Belagavi','Kalaburagi','Ballari','Tumakuru','Shivamogga','Vijayapura','Raichur','Dharwad','Bidar','Hassan','Davangere','Udupi','Mandya','Chitradurga','Yadgir','Chikkamagaluru'],'Tamil Nadu':['Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirunelveli','Erode','Tiruppur','Vellore','Thoothukudi','Dindigul','Thanjavur','Kancheepuram','Cuddalore','Nagercoil','Dharmapuri','Karur','Namakkal','Ramanathapuram','Sivagangai'],'Uttar Pradesh':['Lucknow','Kanpur','Agra','Varanasi','Prayagraj','Meerut','Bareilly','Aligarh','Moradabad','Saharanpur','Gorakhpur','Noida','Ghaziabad','Mathura','Firozabad','Muzaffarnagar','Shahjahanpur','Rampur','Jhansi','Hapur'],Gujarat:['Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Junagadh','Gandhinagar','Anand','Navsari','Morbi','Nadiad','Surendranagar','Bharuch','Amreli','Mehsana','Bhuj','Porbandar','Palanpur','Godhra'],'West Bengal':['Kolkata','Howrah','Durgapur','Asansol','Siliguri','Bardhaman','Malda','Baharampur','Habra','Kharagpur','Shantipur','Darjeeling','Jalpaiguri','Cooch Behar','Medinipur','Purulia','Bankura','Birbhum','Nadia','Hooghly'],Telangana:['Hyderabad','Warangal','Nizamabad','Karimnagar','Khammam','Mahbubnagar','Ramagundam','Secunderabad','Nalgonda','Adilabad','Suryapet','Miryalaguda','Bodhan','Siddipet','Sangareddy','Mancherial','Jagtial','Bhadrachalam'],Kerala:['Kochi','Thiruvananthapuram','Kozhikode','Thrissur','Kollam','Palakkad','Alappuzha','Malappuram','Kannur','Kasaragod','Kottayam','Pathanamthitta','Wayanad','Ernakulam','Nedumangad','Varkala','Ponnani','Manjeri','Tirur'],'Madhya Pradesh':['Bhopal','Indore','Jabalpur','Gwalior','Ujjain','Sagar','Ratlam','Satna','Dewas','Murwara','Chhindwara','Rewa','Singrauli','Burhanpur','Khandwa','Bhind','Morena','Guna','Shivpuri','Vidisha'],Bihar:['Patna','Gaya','Bhagalpur','Muzaffarpur','Darbhanga','Purnia','Arrah','Begusarai','Katihar','Munger','Chhapra','Hajipur','Saharsa','Sasaram','Sitamarhi','Madhubani','Motihari','Bettiah','Siwan'],'Andhra Pradesh':['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Tirupati','Rajahmundry','Kakinada','Kadapa','Anantapur','Vizianagaram','Eluru','Ongole','Nandyal','Chittoor'],Delhi:['New Delhi','Central Delhi','East Delhi','North Delhi','North East Delhi','North West Delhi','Shahdara','South Delhi','South East Delhi','South West Delhi','West Delhi'],Punjab:['Ludhiana','Amritsar','Jalandhar','Patiala','Bathinda','Mohali','Hoshiarpur','Gurdaspur','Ferozepur','Fatehgarh Sahib','Mansa','Muktsar','Faridkot','Kapurthala','Sangrur','Moga','Rupnagar','Pathankot'],Haryana:['Chandigarh','Gurugram','Faridabad','Ambala','Hisar','Rohtak','Karnal','Panipat','Yamunanagar','Sonipat','Rewari','Bhiwani','Sirsa','Jhajjar','Kaithal','Kurukshetra','Palwal','Panchkula'],Uttarakhand:['Dehradun','Haridwar','Roorkee','Haldwani','Rishikesh','Rudrapur','Kashipur','Nainital','Mussoorie','Kotdwar','Ramnagar','Pithoragarh','Almora'],Assam:['Guwahati','Dibrugarh','Silchar','Jorhat','Nagaon','Tinsukia','Tezpur','Bongaigaon','Dhubri','North Lakhimpur','Karimganj','Goalpara','Sivasagar','Golaghat']};
const ALL_STATES=Object.keys(INDIA_STATES).sort();


// ── HELPERS ──────────────────────────────────────────────────────
function NewsletterForm(){
  const[em,setEm]=useState('');const[ok,setOk]=useState(false);const{dsp}=useApp();
  const sub=()=>{if(!em.includes('@'))return;const ex=LS.get('cb_newsletter',[]);if(!ex.find(e=>e.email===em))LS.push('cb_newsletter',{email:em,date:new Date().toISOString()});setOk(true);setEm('');dsp({t:'TOAST',d:{type:'success',msg:'Subscribed!'}})};
  if(ok)return <div style={{padding:'12px 24px',background:'rgba(19,136,8,.1)',color:T.ok,borderRadius:12,fontWeight:800,fontSize:14,border:'1px solid rgba(19,136,8,.2)'}}>✓ Subscribed Successfully!</div>;
  return <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',maxWidth:500,margin:'0 auto'}}>
    <input value={em} onChange={e=>setEm(e.target.value)} placeholder="Apna email dalo..." onKeyDown={e=>e.key==='Enter'&&sub()} style={{flex:2,minWidth:200,padding:'14px 20px',borderRadius:14,border:'1px solid rgba(255,255,255,.2)',background:'rgba(255,255,255,.05)',color:'#fff',fontSize:15,fontFamily:'inherit',outline:'none',transition:'all .2s'}} onFocus={e=>e.target.style.borderColor=T.gd} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.2)'}/>
    <Btn onClick={sub} lg style={{background:'linear-gradient(135deg,#FF9431,#FF6B00)',border:'none',color:'#fff',fontWeight:800,borderRadius:14,padding:'0 32px'}}>Join Now</Btn>
  </div>;
}


// ── HOME PAGE ─────────────────────────────────────────────────────


// DEMO CREATOR PORTFOLIO MODAL
function DemoModal() {
  const { dsp } = useApp();
  const onClose = () => dsp({t:'UI', v:{demoModal: false}});

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'auto';
  }, []);

  return (
    <div style={{position:'fixed',inset:0,zIndex:999999,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(20px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      {/* Close button outside */}
      <button onClick={onClose} style={{position:'absolute',top:20,right:30,background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',width:48,height:48,borderRadius:'50%',fontSize:24,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000000,transition:'all 0.2s'}} onMouseEnter={e=>e.target.style.background='rgba(255,255,255,0.2)'} onMouseLeave={e=>e.target.style.background='rgba(255,255,255,0.1)'}>×</button>
      
      <div style={{display:'flex',gap:40,alignItems:'center',maxWidth:1000,width:'100%'}}>
        
        {/* Left Side: Explanation for User */}
        <div style={{flex:1,color:'#fff',display:window.innerWidth>800?'block':'none'}}>
           <div style={{background:'rgba(16,185,129,0.1)',color:'#10B981',padding:'8px 16px',borderRadius:100,display:'inline-block',fontWeight:800,marginBottom:24,border:'1px solid rgba(16,185,129,0.2)'}}>
             What You Get
           </div>
           <h2 style={{fontSize:48,fontWeight:900,lineHeight:1.1,marginBottom:24,fontFamily:"'Inter',sans-serif"}}>Your Ultimate <br/>Link-in-Bio & Media Kit.</h2>
           <p style={{fontSize:18,color:'rgba(255,255,255,0.6)',lineHeight:1.6,marginBottom:32,fontFamily:"'Inter',sans-serif"}}>
             CreatorBharat gives you a premium, verified portfolio to showcase your stats, services, and past work. Share this single link with brands to get booked instantly via our secure Escrow system.
           </p>
           <ul style={{listStyle:'none',padding:0,display:'flex',flexDirection:'column',gap:16}}>
             {[
               '✓ Auto-updated Instagram & YouTube stats',
               '✓ List your pricing and collab packages',
               '✓ Receive payments safely via Escrow',
               '✓ Stand out to top Tier-1 brands'
             ].map((text, i) => (
               <li key={i} style={{fontSize:16,fontWeight:600,display:'flex',alignItems:'center',gap:12}}>
                 <span style={{color:'#10B981',fontSize:20}}>•</span> {text}
               </li>
             ))}
           </ul>
        </div>

        {/* Mobile Frame Container */}
        <div style={{width:'100%',maxWidth:400,height:'90vh',maxHeight:840,background:'#fff',borderRadius:40,border:'8px solid #111',boxShadow:'0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.2)',position:'relative',display:'flex',flexDirection:'column',overflow:'hidden',animation:'fadeUp 0.3s ease-out',flexShrink:0,margin:'0 auto'}}>
          
          {/* Fake Notch */}
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:120,height:28,background:'#111',borderBottomLeftRadius:16,borderBottomRightRadius:16,zIndex:10}}/>

          {/* Scrollable Inside */}
          <div style={{flex:1,overflowY:'auto',background:'#F9FAFB',paddingBottom:120}} className="no-scrollbar">
            {/* Live Link Banner */}
            <div style={{background:'#f3f4f6',padding:'12px 20px',textAlign:'center',fontSize:11,color:'#666',fontWeight:700,borderBottom:'1px solid #e5e7eb'}}>
               creatorbharat.in/rahulsharma
            </div>

            {/* Cover */}
            <div style={{height:160,background:'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80) center/cover'}}/>
            
            {/* Avatar & Verification */}
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:-50,position:'relative',zIndex:2}}>
               <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80" style={{width:100,height:100,borderRadius:'50%',border:'4px solid #fff',boxShadow:'0 10px 20px rgba(0,0,0,0.1)',objectFit:'cover'}} alt="Rahul"/>
               <div style={{marginTop:-12,background:'#fff',color:'#10B981',fontSize:11,fontWeight:800,padding:'4px 12px',borderRadius:20,border:'1px solid rgba(16,185,129,0.2)',display:'flex',alignItems:'center',gap:4,boxShadow:'0 4px 10px rgba(16,185,129,0.15)'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#10B981"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Verified Profile
               </div>
            </div>

            <div style={{padding:'20px 24px',textAlign:'center'}}>
              <h2 style={{fontSize:24,fontWeight:900,color:'#111',fontFamily:"'Inter',sans-serif",marginBottom:4}}>Rahul Sharma</h2>
              <p style={{fontSize:14,color:'rgba(0,0,0,0.5)',fontFamily:"'Inter',sans-serif",marginBottom:16,fontWeight:600}}>📍 Jaipur • Travel & Culture</p>
              
              {/* Social Links Row */}
              <div style={{display:'flex',justifyContent:'center',gap:12,marginBottom:24}}>
                 <div style={{width:44,height:44,borderRadius:'50%',background:'#fff',boxShadow:'0 4px 12px rgba(0,0,0,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📸</div>
                 <div style={{width:44,height:44,borderRadius:'50%',background:'#fff',boxShadow:'0 4px 12px rgba(0,0,0,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🎥</div>
                 <div style={{width:44,height:44,borderRadius:'50%',background:'#fff',boxShadow:'0 4px 12px rgba(0,0,0,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🐦</div>
              </div>

              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
                 <div style={{background:'#fff',border:'1px solid rgba(0,0,0,0.05)',borderRadius:16,padding:'16px',boxShadow:'0 2px 10px rgba(0,0,0,0.02)'}}>
                    <div style={{fontSize:22,fontWeight:900,color:'#111',fontFamily:"'Inter',sans-serif"}}>248K</div>
                    <div style={{fontSize:11,fontWeight:700,color:'rgba(0,0,0,0.4)',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:4}}>Followers</div>
                 </div>
                 <div style={{background:'#fff',border:'1px solid rgba(0,0,0,0.05)',borderRadius:16,padding:'16px',boxShadow:'0 2px 10px rgba(0,0,0,0.02)'}}>
                    <div style={{fontSize:22,fontWeight:900,color:'#FF9431',fontFamily:"'Inter',sans-serif"}}>6.8%</div>
                    <div style={{fontSize:11,fontWeight:700,color:'rgba(0,0,0,0.4)',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:4}}>Avg. Eng.</div>
                 </div>
              </div>
              
              {/* Bio */}
              <p style={{fontSize:14,color:'#4B5563',lineHeight:1.6,marginBottom:32,textAlign:'left'}}>
                Hi! I explore the unseen beauty of Rajasthan and share it with my amazing community. Let's create something awesome together! 🏜️
              </p>

              {/* Links / Services */}
              <h3 style={{fontSize:15,fontWeight:800,textAlign:'left',marginBottom:16,color:'#111',textTransform:'uppercase',letterSpacing:'1px'}}>Book Me For</h3>
              <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
                 <div style={{background:'#fff',padding:'16px',borderRadius:16,border:'1px solid rgba(0,0,0,0.05)',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 4px 12px rgba(0,0,0,0.02)'}}>
                   <span style={{fontWeight:700,fontSize:14,color:'#111'}}>📸 Insta Reel Collab</span>
                   <span style={{fontWeight:800,fontSize:14,color:'#10B981'}}>₹15k</span>
                 </div>
                 <div style={{background:'#fff',padding:'16px',borderRadius:16,border:'1px solid rgba(0,0,0,0.05)',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 4px 12px rgba(0,0,0,0.02)'}}>
                   <span style={{fontWeight:700,fontSize:14,color:'#111'}}>🎥 YouTube Integration</span>
                   <span style={{fontWeight:800,fontSize:14,color:'#10B981'}}>₹25k</span>
                 </div>
              </div>

              {/* Past Campaigns */}
              <h3 style={{fontSize:15,fontWeight:800,textAlign:'left',marginBottom:16,color:'#111',textTransform:'uppercase',letterSpacing:'1px'}}>Trusted By</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:32}}>
                 {['MakeMyTrip','Zomato','Oyo','Royal Enfield'].map(b=><div key={b} style={{background:'#fff',padding:'12px',borderRadius:12,border:'1px solid rgba(0,0,0,0.05)',fontWeight:800,fontSize:13,color:'#6B7280',textAlign:'center'}}>{b}</div>)}
              </div>
              
            </div>
          </div>

          {/* Sticky Action Footer inside Mobile */}
          <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'24px 20px',background:'linear-gradient(to top, #fff 70%, rgba(255,255,255,0))',display:'flex',flexDirection:'column',gap:12}}>
             <button onClick={()=>alert('Demo: Request sent via Escrow')} style={{background:'linear-gradient(90deg, #FF9431, #DC2626)',color:'#fff',border:'none',padding:'18px',borderRadius:100,fontSize:16,fontWeight:800,cursor:'pointer',boxShadow:'0 10px 24px rgba(255,148,49,0.3)',fontFamily:"'Inter',sans-serif",width:'100%'}}>🤝 Send Collab Request</button>
          </div>

        </div>

      </div>
    </div>
  );
}


function Typewriter({words, interval=2000}){
  const [idx, setIdx] = React.useState(0);
  const [sub, setSub] = React.useState('');
  const [del, setDel] = React.useState(false);
  
  React.useEffect(() => {
    const word = words[idx % words.length];
    const speed = del ? 50 : 100;
    
    const timeout = setTimeout(() => {
      if(!del && sub === word) {
        setTimeout(() => setDel(true), interval);
      } else if(del && sub === '') {
        setDel(false);
        setIdx(i => i + 1);
      } else {
        setSub(del ? word.substring(0, sub.length - 1) : word.substring(0, sub.length + 1));
      }
    }, speed);
    
    return () => clearTimeout(timeout);
  }, [sub, del, idx, words, interval]);

  return <span style={{position:'relative',display:'inline-block'}}>
    <span style={{position:'relative',zIndex:2,background:'linear-gradient(90deg, #FF9431, #DC2626)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{sub}</span>
    <span style={{width:2,height:'80%',background:'#FF9431',position:'absolute',right:-4,top:'10%',animation:'blink 0.8s infinite'}}/>
    <svg style={{position:'absolute',bottom:-10,left:0,width:'100%',height:16,zIndex:1}} viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 15 Q 50 0 100 15" fill="none" stroke="rgba(255,148,49,0.3)" strokeWidth="6" strokeLinecap="round"/></svg>
  </span>;
}


function HomePage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p,sel)=>{dsp({t:'GO',p,sel});scrollToTop();};
  const[creators,setCreators]=useState([]);
  const[campaigns,setCampaigns]=useState([]);
  const[totalC,setTotalC]=useState(2400);
  const[totalCp,setTotalCp]=useState(340);
  const[loading,setLoading]=useState(true);
  
  useEffect(()=>{
    setLoading(true);
    apiCall('/creators?limit=10').then(d=>{
      const list = d.creators || (Array.isArray(d) ? d : []);
      setCreators(list);
      setTotalC(list.length + 2400);
      setLoading(false);
    }).catch(e=>{console.error(e);setLoading(false);});
    apiCall('/campaigns?limit=10').then(d=>{
      const list = d.campaigns || (Array.isArray(d) ? d : []);
      setCampaigns(list.slice(0, 4));
      setTotalCp(list.length + 340);
    }).catch(console.error);
  },[]);
  const featured=creators.filter(c=>c.featured).slice(0,6);

  return <PL>
        <section style={{background:'#FAFAFA',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:mob?140:180,paddingBottom:mob?80:120,position:'relative',overflow:'hidden',textAlign:'center'}}>
      
      {/* Light Mode Ambient Background Elements */}
      <div style={{position:'absolute',top:'-20%',left:'50%',transform:'translateX(-50%)',width:'100vw',height:'70vh',background:'radial-gradient(ellipse at top, rgba(255, 148, 49, 0.12), transparent 70%)',filter:'blur(60px)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'absolute',top:'20%',left:'20%',width:'40vw',height:'40vw',background:'radial-gradient(circle, rgba(16, 185, 129, 0.08), transparent 60%)',filter:'blur(80px)',pointerEvents:'none',zIndex:0,animation:'float 10s ease-in-out infinite alternate'}}/>
      <div style={{position:'absolute',top:'10%',right:'15%',width:'35vw',height:'35vw',background:'radial-gradient(circle, rgba(59, 130, 246, 0.05), transparent 60%)',filter:'blur(80px)',pointerEvents:'none',zIndex:0,animation:'float 12s ease-in-out infinite alternate-reverse'}}/>
      
      {/* Light Grid Pattern */}
      <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)',backgroundSize:'40px 40px',pointerEvents:'none',maskImage:'linear-gradient(to bottom, black 40%, transparent 100%)',WebkitMaskImage:'linear-gradient(to bottom, black 40%, transparent 100%)'}}/>
      
      <div style={{...W(),position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',width:'100%'}}>
        
        {/* Verification Pill */}
        <div className="au" style={{display:'inline-flex',alignItems:'center',gap:10,padding:'8px 16px',borderRadius:100,background:'#fff',border:'1px solid rgba(0,0,0,0.08)',marginBottom:32,boxShadow:'0 10px 30px -10px rgba(0,0,0,0.1)'}}>
          <div style={{background:'#10B981',color:'#fff',width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900}}>✓</div>
          <span style={{fontSize:14,fontWeight:700,color:'#111',fontFamily:"'Inter',sans-serif"}}>Trusted by 50,000+ Creators</span>
        </div>
        
        {/* Clear Identity Headline */}
        <h1 className="au d1" style={{fontFamily:"'Inter',sans-serif",fontSize:mob?'clamp(44px,12vw,56px)':'clamp(64px,8vw,88px)',fontWeight:900,color:'#111',lineHeight:1.1,marginBottom:24,letterSpacing:'-0.04em',maxWidth:1000}}>
          Your Digital <Typewriter words={['Identity', 'Portfolio', 'Brand', 'Growth']} /> <br/>
          Built in Minutes.
        </h1>
        
        {/* Tier 2 / Tier 3 Focused Subtitle */}
        <p className="au d2" style={{fontSize:mob?17:22,color:'rgba(0,0,0,0.6)',lineHeight:1.6,marginBottom:48,fontWeight:500,maxWidth:720,fontFamily:"'Inter',sans-serif"}}>
          Launch your verified creator portfolio, showcase your social reach, and attract top brand deals directly. The all-in-one link for Indian creators.
        </p>
        
        {/* Modern Solid Buttons */}
        <div className="au d3" style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:mob?80:100,justifyContent:'center',width:'100%'}}>
          <Btn lg onClick={()=>go('apply')} style={{padding:'20px 40px',fontSize:17,background:'#111',color:'#fff',borderRadius:100,fontWeight:800,border:'none',boxShadow:'0 10px 30px rgba(0,0,0,0.2)',flex:mob?1:'none',justifyContent:'center',fontFamily:"'Inter',sans-serif"}}>Claim Your Link</Btn>
          <Btn lg variant="ghost" style={{padding:'20px 40px',fontSize:17,background:'#fff',color:'#111',borderRadius:100,fontWeight:700,border:'1px solid rgba(0,0,0,0.1)',boxShadow:'0 4px 14px rgba(0,0,0,0.05)',flex:mob?1:'none',justifyContent:'center',fontFamily:"'Inter',sans-serif"}} onClick={()=>dsp({t:'UI',v:{demoModal:true}})}>View Demo</Btn>
        </div>
        
        {/* Portfolio Showcase Mockup (White / Bright App style) */}
        <div className="au d4" style={{width:'100%',maxWidth:1000,position:'relative',display:'flex',justifyContent:'center',perspective:1500,minHeight:600}}>
          
          <div style={{position:'relative',transform:'rotateY(-10deg) rotateX(5deg)',transformStyle:'preserve-3d'}}>
             
             {/* Main Phone Frame (White) */}
             <div style={{width:320,height:660,background:'#fff',borderRadius:48,border:'12px solid #F3F4F6',boxShadow:'0 40px 100px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(0,0,0,0.05)',position:'relative',display:'flex',flexDirection:'column',overflow:'hidden',zIndex:5,animation:'float 6s ease-in-out infinite'}}>
                
                {/* Notch */}
                <div style={{position:'absolute',top:8,left:'50%',transform:'translateX(-50%)',width:100,height:26,background:'#F3F4F6',borderRadius:20,zIndex:10}}/>

                {/* Portfolio Content Layer */}
                <div style={{flex:1,background:'#FAFAFA',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative'}}>
                   {/* Cover */}
                   <div style={{height:150,background:'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80) center/cover'}}/>
                   
                   {/* Profile Avatar */}
                   <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:-50,position:'relative',zIndex:2}}>
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" style={{width:100,height:100,borderRadius:'50%',border:'4px solid #fff',boxShadow:'0 10px 20px rgba(0,0,0,0.1)',objectFit:'cover'}} alt="Creator"/>
                      <div style={{marginTop:-14,background:'#fff',color:'#10B981',fontSize:11,fontWeight:800,padding:'4px 12px',borderRadius:20,border:'1px solid rgba(16,185,129,0.2)',display:'flex',alignItems:'center',gap:4,boxShadow:'0 4px 10px rgba(16,185,129,0.15)'}}>
                         ✓ Verified Creator
                      </div>
                   </div>

                   <div style={{padding:'20px 24px',textAlign:'center',flex:1,display:'flex',flexDirection:'column'}}>
                     <h3 style={{fontSize:24,fontWeight:900,color:'#111',fontFamily:"'Inter',sans-serif",marginBottom:4}}>Rahul Sharma</h3>
                     <p style={{fontSize:14,color:'rgba(0,0,0,0.6)',fontFamily:"'Inter',sans-serif",marginBottom:24,fontWeight:500}}>📍 Jaipur • Travel & Culture</p>
                     
                     {/* Stats Blocks */}
                     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
                        <div style={{background:'#fff',border:'1px solid rgba(0,0,0,0.05)',borderRadius:16,padding:'16px',boxShadow:'0 2px 10px rgba(0,0,0,0.02)'}}>
                           <div style={{fontSize:20,fontWeight:900,color:'#111',fontFamily:"'Inter',sans-serif"}}>248K</div>
                           <div style={{fontSize:11,fontWeight:600,color:'rgba(0,0,0,0.5)',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:4}}>Followers</div>
                        </div>
                        <div style={{background:'#fff',border:'1px solid rgba(0,0,0,0.05)',borderRadius:16,padding:'16px',boxShadow:'0 2px 10px rgba(0,0,0,0.02)'}}>
                           <div style={{fontSize:20,fontWeight:900,color:'#FF9431',fontFamily:"'Inter',sans-serif"}}>6.8%</div>
                           <div style={{fontSize:11,fontWeight:600,color:'rgba(0,0,0,0.5)',textTransform:'uppercase',letterSpacing:'0.5px',marginTop:4}}>Engagement</div>
                        </div>
                     </div>

                     {/* Clean Modern Buttons */}
                     <div style={{display:'flex',flexDirection:'column',gap:12,marginTop:'auto'}}>
                        <div style={{background:'#fff',border:'1px solid rgba(0,0,0,0.08)',padding:'16px',borderRadius:16,fontSize:14,fontWeight:700,color:'#111',boxShadow:'0 4px 12px rgba(0,0,0,0.03)'}}>📸 View Instagram</div>
                        <div style={{background:'linear-gradient(90deg, #FF9431, #DC2626)',padding:'16px',borderRadius:16,fontSize:15,fontWeight:800,color:'#fff',boxShadow:'0 8px 20px rgba(255,148,49,0.3)'}}>🤝 Book for ₹15,000</div>
                     </div>
                   </div>
                </div>
             </div>

             {/* Floating Identity & Growth Elements */}
             {!mob && <>
                {/* Brand Deal Alert */}
                <div className="au d5" style={{position:'absolute',top:120,right:-120,background:'#fff',border:'1px solid rgba(0,0,0,0.05)',borderRadius:20,padding:'16px 20px',boxShadow:'0 20px 40px rgba(0,0,0,0.1)',display:'flex',alignItems:'center',gap:16,zIndex:10,animation:'float 5s ease-in-out infinite 0.5s',transform:'translateZ(80px)'}}>
                  <div style={{width:48,height:48,borderRadius:'50%',background:'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>✈️</div>
                  <div>
                     <p style={{fontSize:14,fontWeight:800,color:'#111',marginBottom:2,fontFamily:"'Inter',sans-serif"}}>MakeMyTrip</p>
                     <p style={{fontSize:12,fontWeight:500,color:'rgba(0,0,0,0.5)',fontFamily:"'Inter',sans-serif"}}>New campaign request</p>
                  </div>
                </div>

                {/* Identity Tag */}
                <div className="au d5" style={{position:'absolute',bottom:140,left:-100,background:'#fff',border:'1px solid rgba(0,0,0,0.05)',borderRadius:20,padding:'16px 20px',boxShadow:'0 20px 40px rgba(0,0,0,0.1)',display:'flex',alignItems:'center',gap:16,zIndex:10,animation:'float 6s ease-in-out infinite 1s',transform:'translateZ(60px)'}}>
                  <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(16,185,129,0.1)',color:'#10B981',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:900}}>✓</div>
                  <div>
                     <p style={{fontSize:14,fontWeight:800,color:'#111',marginBottom:2,fontFamily:"'Inter',sans-serif"}}>Profile Verified</p>
                     <p style={{fontSize:12,fontWeight:500,color:'rgba(0,0,0,0.5)',fontFamily:"'Inter',sans-serif"}}>creatorbharat.in/rahul</p>
                  </div>
                </div>
             </>}

          </div>

        </div>
      </div>
    </section>



    {(loading||featured.length>0)&&(
      <section style={{padding:mob?'64px 20px':'100px 20px',background:'#fff',position:'relative'}}>
        <div style={W()}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:48}}>
            <SH eyebrow="Discover" title="Featured Creators" sub="This week's top picks from Jaipur & beyond." mb={0}/>
            <Btn variant="outline" sm onClick={()=>go('creators')} style={{borderRadius:12}}>View All Creators</Btn>
          </div>
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:24}}>
            {loading ? [1,2,3].map(i=><SkeletonCard key={i}/>) : featured.slice(0,mob?3:6).map(function(c,i){
              return React.createElement('div',{key:c.id,className:'au d'+(i+1)},
                React.createElement(CreatorCard,{creator:c,onView:function(cr){dsp({t:'GO',p:'creator-profile',sel:{creator:cr}});scrollToTop();}})
              );
            })}
          </div>
        </div>
      </section>
    )}

    <section style={{padding:mob?'80px 20px':'120px 20px',background:T.bg2,position:'relative'}}>
      <div style={W()}>
        <SH eyebrow="Our Process" title="Start Your Journey" center sub="From Jaipur to the World. Three simple steps to monetize your influence." mb={80}/>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:mob?40:64,position:'relative'}}>
          {/* Connecting Line */}
          {!mob&&<div style={{position:'absolute',top:50,left:'10%',right:'10%',height:2,background:`linear-gradient(90deg, transparent, ${T.bd2}, transparent)`,zIndex:0}}/>}
          
          {[
            {icon:'🎨',t:'1. Build Your Brand',d:'Create a professional portfolio that showcases your best work and analytics. No coding required.',c:T.gd},
            {icon:'📡',t:'2. Stay Visible',d:'Our high-trust discovery engine ensures the right brands find you for the right campaigns.',c:'#3B82F6'},
            {icon:'💎',t:'3. Secure Deals',d:'Direct communication with brands. Negotiate fairly, collaborate smoothly, and get paid on time.',c:T.ok}
          ].map((step,i)=><div key={i} className="au" style={{textAlign:'center',position:'relative',zIndex:1}}>
            <div style={{width:100,height:100,borderRadius:32,background:'#fff',boxShadow:T.sh3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,margin:'0 auto 32px',border:`1px solid ${T.bd}`,transition:'all .4s cubic-bezier(0.4, 0, 0.2, 1)'}} onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-12px) rotate(5deg)';e.currentTarget.style.boxShadow=T.sh4}} onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=T.sh3}}>{step.icon}</div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:900,color:T.t1,marginBottom:16}}>{step.t}</h3>
            <p style={{fontSize:16,color:T.t2,lineHeight:1.7,maxWidth:300,margin:'0 auto'}}>{step.d}</p>
          </div>)}
        </div>
      </div>
    </section>


    {(loading||campaigns.length>0)&&(
      <section style={{padding:mob?'56px 20px':'80px 20px',background:'#fff'}}>
        <div style={W()}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:36}}>
            <SH eyebrow="Open Now" title="Brand Campaigns" mb={0}/>
            <Btn variant="outline" sm onClick={()=>go('campaigns')}>All Campaigns</Btn>
          </div>
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:20}}>
            {loading ? [1,2,3].map(i=><SkeletonCard key={i}/>) : campaigns.slice(0,3).map(function(c){
              return React.createElement('div',{key:c.id},
                React.createElement(CampCard,{campaign:c,onApply:function(){dsp({t:'UI',v:{authModal:true,authTab:'register'}});}})
              );
            })}
          </div>
        </div>
      </section>
    )}

    <section style={{padding:mob?'80px 20px':'120px 20px',background:'#0A0A0A',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg, transparent, rgba(255,148,49,0.2), transparent)'}}/>
      <div style={W()}>
        <SH eyebrow="Testimonials" title="Trusted by Creators" light center mb={64} sub="Success stories from the Bharat creator community."/>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:32}}>
          {[
            {text:'Being a creator from Jaipur, finding local brands was hard. CreatorBharat changed that. I landed 3 major deals in my first month!',name:'Ravi Kumar',role:'Food Creator, Jaipur',avatar:'RK'},
            {text:'The portfolio builder is a game-changer. Brands take me more seriously now. My engagement rate is clearly visible and trusted.',name:'Amit Singh',role:'Tech Reviewer, Mumbai',avatar:'AS'},
            {text:'Finally a platform that understands Tier 2 city creators. Swiggy found me through the Indore filter. Highly recommended!',name:'Neha Gupta',role:'Lifestyle Creator, Indore',avatar:'NG'},
          ].map(function(t,i){
            return React.createElement('div',{key:i,className:'au d'+(i+1),style:{background:'rgba(255,255,255,0.03)',borderRadius:28,padding:32,border:'1px solid rgba(255,255,255,0.08)',display:'flex',flexDirection:'column',gap:24,transition:'all .3s ease'}},
              React.createElement('div',{style:{fontSize:40,color:T.gd,opacity:0.3,lineHeight:1}},'"'),
              React.createElement('p',{style:{fontSize:16,color:'rgba(255,255,255,0.7)',lineHeight:1.7,flex:1,fontWeight:500}},t.text),
              React.createElement('div',{style:{display:'flex',alignItems:'center',gap:16,paddingTop:24,borderTop:'1px solid rgba(255,255,255,0.08)'}},
                React.createElement('div',{style:{width:48,height:48,borderRadius:14,background:T.gd,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'#fff',fontSize:16}},t.avatar),
                React.createElement('div',null,
                  React.createElement('p',{style:{fontWeight:800,color:'#fff',fontSize:15}},t.name),
                  React.createElement('p',{style:{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2,fontWeight:600}},t.role)
                )
              )
            );
          })}
        </div>
      </div>
    </section>

    <section style={{padding:mob?'80px 20px':'120px 20px',background:T.gd,position:'relative',overflow:'hidden'}}>
      {/* Decorative Saffron Elements */}
      <div style={{position:'absolute',top:'-20%',right:'-10%',width:'50%',height:'140%',background:'rgba(255,255,255,0.1)',transform:'rotate(15deg)',filter:'blur(60px)'}}/>
      <div style={{...W(800),position:'relative',zIndex:1,textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:24,filter:'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'}}>🇮🇳</div>
        <h2 className="au" style={{fontFamily:"'Fraunces',serif",fontSize:mob?'clamp(32px,8vw,48px)':'clamp(40px,5vw,64px)',fontWeight:900,color:'#fff',marginBottom:20,lineHeight:1,letterSpacing:'-0.03em'}}>Teri Pehchaan Ka Waqt Aa Gaya</h2>
        <p className="au d1" style={{fontSize:18,color:'rgba(255,255,255,0.9)',marginBottom:48,maxWidth:600,margin:'0 auto 48px',fontWeight:500}}>Join the 2,400+ creators who are building the future of Bharat's creator economy. Your first brand deal is just a click away.</p>
        <div className="au d2" style={{display:'flex',gap:20,justifyContent:'center',flexWrap:'wrap'}}>
          <Btn lg variant="white" style={{padding:'20px 48px',fontSize:18,borderRadius:16,fontWeight:900,color:T.gd}} onClick={()=>go('apply')}>Get Started Now</Btn>
          <Btn lg variant="ghost" style={{color:'#fff',borderColor:'rgba(255,255,255,0.4)',padding:'20px 48px',fontSize:18,borderRadius:16,background:'rgba(255,255,255,0.1)',backdropFilter:'blur(10px)'}} onClick={()=>go('creators')}>Explore Creators</Btn>
        </div>
      </div>
    </section>
  </PL>;
}

// ── CREATORS PAGE ─────────────────────────────────────────────────
function CreatorsPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const{cf:f}=st;
  const go=(p,sel)=>{dsp({t:'GO',p,sel});scrollToTop();};
  const[showFilters,setShowFilters]=useState(false);
  const[viewMode,setViewMode]=useState('grid');
  const[all,setAll]=useState([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{setLoading(true);apiCall('/creators?limit=100').then(d=>{setAll(d.creators||[]);setLoading(false);}).catch(e=>{console.error(e);setLoading(false);})},[]);
  const niches=[...new Set(all.flatMap(c=>Array.isArray(c.niche)?c.niche:[c.niche]).filter(Boolean))].sort();
  const districts=f.state&&INDIA_STATES[f.state]?INDIA_STATES[f.state]:[];

  const filtered=all.filter(c=>{
    const q=(f.q||'').toLowerCase();
    const name=(c.name||'').toLowerCase();
    const handle=(c.handle||'').toLowerCase();
    if(q&&!name.includes(q)&&!handle.includes(q))return false;
    if(f.state&&c.state!==f.state)return false;
    if(f.city&&c.city!==f.city)return false;
    if(f.niche){
      const cn=Array.isArray(c.niche)?c.niche:[c.niche];
      if(!cn.includes(f.niche))return false;
    }
    if(f.platform){
      const cp=Array.isArray(c.platform)?c.platform:[c.platform];
      if(!cp.includes(f.platform))return false;
    }
    if(f.minFollowers&&c.followers<Number(f.minFollowers))return false;
    if(f.verified&&!c.verified)return false;
    if(f.minFollowers&&Number(c.followers||0)<Number(f.minFollowers))return false;
    if(f.minER&&Number(c.er||0)<Number(f.minER))return false;
    return true;
  }).sort(function(a,b){
    if(f.sort==='followers')return Number(b.followers||0)-Number(a.followers||0);
    if(f.sort==='er')return Number(b.er||0)-Number(a.er||0);
    return(b.score||fmt.score(b))-(a.score||fmt.score(a));
  });

  var hasFilters=f.q||f.state||f.district||f.niche||f.platform||f.verified||f.minER||f.minFollowers;
  var clearAll=function(){dsp({t:'CF',v:{q:'',state:'',district:'',niche:'',platform:'',verified:false,minER:'',minFollowers:'',sort:'score'}});};

  return <PL>
    <div style={{background:T.n9,padding:mob?'48px 20px 32px':'72px 20px 48px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:'linear-gradient(90deg,#FF9431 33%,#fff 33%,#fff 66%,#128807 66%)'}}/>
      <div style={{position:'absolute',top:0,right:0,width:400,height:400,background:'radial-gradient(circle, rgba(255,148,49,0.05) 0%, transparent 70%)',filter:'blur(40px)'}}/>
      
      <div style={W()}>
        <div style={{display:'flex',flexDirection:mob?'column':'row',justifyContent:'space-between',alignItems:mob?'flex-start':'center',gap:24}}>
          <SH eyebrow="Ecosystem" title="Bharat Ke Top Creators" sub="Search from 2,400+ handpicked local creators." light mb={0}/>
          <div style={{position:'relative',width:mob?'100%':400}}>
            <input value={f.q} onChange={e=>dsp({t:'CF',v:{q:e.target.value}})} placeholder="Name, city, or niche..." style={{width:'100%',padding:'16px 20px 16px 48px',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)',color:'#fff',fontSize:15,fontFamily:'inherit',outline:'none',transition:'all .3s',boxShadow:T.sh2}} onFocus={e=>e.target.style.borderColor=T.gd}/>
            <span style={{position:'absolute',left:18,top:'50%',transform:'translateY(-50%)',fontSize:18,opacity:0.6}}>🔍</span>
          </div>
        </div>
      </div>
    </div>


    <div style={{display:'flex',minHeight:500}}>
      {/* Sidebar */}
      <div style={{width:mob&&!showFilters?0:240,flexShrink:0,background:'#fff',borderRight:'1px solid '+T.bd,overflowY:'auto',transition:'width .2s',position:mob?'fixed':'sticky',top:mob?0:112,left:0,bottom:mob?0:'auto',zIndex:mob?7000:10,maxHeight:mob?'100vh':'calc(100vh - 112px)'}}>
        {(!mob||showFilters)&&<div style={{padding:16,minWidth:220}}>
          {mob&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,paddingBottom:12,borderBottom:'1px solid '+T.bd}}>
            <span style={{fontWeight:700,fontSize:14,color:T.n8}}>Filters</span>
            <button onClick={function(){setShowFilters(false);}} style={{background:T.bg3,border:'none',width:26,height:26,borderRadius:'50%',cursor:'pointer',fontSize:15,color:T.t2}}>x</button>
          </div>}

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <span style={{fontWeight:700,fontSize:13,color:T.n8}}>Filters</span>
            {hasFilters&&<button onClick={clearAll} style={{background:'none',border:'none',color:'#FF9933',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Clear All</button>}
          </div>

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:10,fontWeight:800,color:T.t3,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>State</label>
            <select value={f.state} onChange={function(e){dsp({t:'CF',v:{state:e.target.value,district:''}});}} style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1.5px solid '+(f.state?'#FF9933':T.bd),fontSize:13,color:T.n8,background:'#fff',fontFamily:'inherit',cursor:'pointer',outline:'none'}}>
              <option value="">All States</option>
              {ALL_STATES.map(function(s){return React.createElement('option',{key:s,value:s},s);})}
            </select>
          </div>

          {f.state&&districts.length>0&&<div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:10,fontWeight:800,color:'#FF9933',marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>{f.state} Districts</label>
            <div style={{maxHeight:200,overflowY:'auto',border:'1px solid '+T.bd,borderRadius:8,padding:6}}>
              <button onClick={function(){dsp({t:'CF',v:{district:''}});}} style={{display:'block',width:'100%',textAlign:'left',padding:'6px 8px',borderRadius:6,background:!f.district?'#FF9933':'transparent',color:!f.district?'#fff':T.t2,border:'none',cursor:'pointer',fontSize:12,fontWeight:!f.district?700:400,fontFamily:'inherit',marginBottom:2}}>All Districts</button>
              {districts.map(function(d){
                return React.createElement('button',{key:d,onClick:function(){dsp({t:'CF',v:{district:d}});},style:{display:'block',width:'100%',textAlign:'left',padding:'6px 8px',borderRadius:6,background:f.district===d?'#FF9933':'transparent',color:f.district===d?'#fff':T.t2,border:'none',cursor:'pointer',fontSize:12,fontWeight:f.district===d?700:400,fontFamily:'inherit',marginBottom:2}},d);
              })}
            </div>
          </div>}

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:10,fontWeight:800,color:T.t3,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>Niche</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {['Travel','Fashion','Food','Tech','Beauty','Gaming','Fitness','Lifestyle'].map(function(n){
                return React.createElement('button',{key:n,onClick:function(){dsp({t:'CF',v:{niche:f.niche===n?'':n}});},style:{padding:'4px 10px',borderRadius:14,border:'1.5px solid '+(f.niche===n?'#FF9933':T.bd),background:f.niche===n?'rgba(255,153,51,.1)':'transparent',color:f.niche===n?'#FF9933':T.t2,fontSize:11,fontWeight:f.niche===n?700:400,cursor:'pointer',fontFamily:'inherit'}},n);
              })}
            </div>
          </div>

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:10,fontWeight:800,color:T.t3,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>Platform</label>
            <select value={f.platform} onChange={function(e){dsp({t:'CF',v:{platform:e.target.value}});}} style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1.5px solid '+(f.platform?'#FF9933':T.bd),fontSize:13,color:T.n8,background:'#fff',fontFamily:'inherit',cursor:'pointer',outline:'none'}}>
              <option value="">All Platforms</option>
              {['Instagram','YouTube','Twitter','LinkedIn'].map(function(p){return React.createElement('option',{key:p},p);})}
            </select>
          </div>

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:10,fontWeight:800,color:T.t3,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>Min Followers</label>
            <select value={f.minFollowers||''} onChange={function(e){dsp({t:'CF',v:{minFollowers:e.target.value}});}} style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1.5px solid '+(f.minFollowers?'#FF9933':T.bd),fontSize:13,color:T.n8,background:'#fff',fontFamily:'inherit',cursor:'pointer',outline:'none'}}>
              <option value="">Any</option>
              <option value="10000">10K+</option>
              <option value="50000">50K+</option>
              <option value="100000">1L+</option>
              <option value="500000">5L+</option>
            </select>
          </div>

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:10,fontWeight:800,color:T.t3,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>Min Engagement</label>
            <select value={f.minER||''} onChange={function(e){dsp({t:'CF',v:{minER:e.target.value}});}} style={{width:'100%',padding:'8px 10px',borderRadius:8,border:'1.5px solid '+(f.minER?'#FF9933':T.bd),fontSize:13,color:T.n8,background:'#fff',fontFamily:'inherit',cursor:'pointer',outline:'none'}}>
              <option value="">Any</option>
              <option value="2">2%+</option>
              <option value="4">4%+</option>
              <option value="6">6%+</option>
              <option value="8">8%+</option>
            </select>
          </div>

          <div style={{marginBottom:16}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'10px',background:T.bg2,borderRadius:8}}>
              <input type="checkbox" checked={!!f.verified} onChange={function(e){dsp({t:'CF',v:{verified:e.target.checked}});}} style={{width:14,height:14,accentColor:'#138808'}}/>
              <span style={{fontSize:13,color:T.n8,fontWeight:600}}>Verified Only</span>
            </label>
          </div>

          <div style={{marginBottom:8}}>
            <label style={{display:'block',fontSize:10,fontWeight:800,color:T.t3,marginBottom:6,textTransform:'uppercase',letterSpacing:'.06em'}}>Sort By</label>
            {[['score','CS Score'],['followers','Followers'],['er','Engagement']].map(function(item){
              return React.createElement('button',{key:item[0],onClick:function(){dsp({t:'CF',v:{sort:item[0]}});},style:{display:'block',width:'100%',textAlign:'left',padding:'7px 10px',borderRadius:8,border:'1.5px solid '+(f.sort===item[0]?'#FF9933':T.bd),background:f.sort===item[0]?'rgba(255,153,51,.08)':'transparent',color:f.sort===item[0]?'#FF9933':T.t2,fontSize:12,fontWeight:f.sort===item[0]?700:400,cursor:'pointer',fontFamily:'inherit',marginBottom:4}},item[1]);
            })}
          </div>
        </div>}
      </div>

      {/* Main */}
      <div style={{flex:1,minWidth:0,padding:mob?'16px':'24px',background:T.bg2}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            {mob&&<button onClick={function(){setShowFilters(true);}} style={{padding:'7px 12px',borderRadius:8,border:'1.5px solid '+(hasFilters?'#FF9933':T.bd),background:hasFilters?'rgba(255,153,51,.08)':'#fff',color:hasFilters?'#FF9933':T.t2,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Filters {hasFilters?'(On)':''}</button>}
            {f.state&&<div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 10px',background:'rgba(255,153,51,.1)',borderRadius:8,border:'1px solid rgba(255,153,51,.3)'}}>
              <span style={{fontSize:12,color:'#FF9933',fontWeight:600}}>{'📍 '+f.state}</span>
              <button onClick={function(){dsp({t:'CF',v:{state:'',district:''}});}} style={{background:'none',border:'none',color:'#FF9933',cursor:'pointer',fontSize:13,lineHeight:1}}>x</button>
            </div>}
            {f.district&&<div style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 10px',background:'rgba(255,153,51,.1)',borderRadius:8,border:'1px solid rgba(255,153,51,.3)'}}>
              <span style={{fontSize:12,color:'#FF9933',fontWeight:600}}>{'🏘 '+f.district}</span>
              <button onClick={function(){dsp({t:'CF',v:{district:''}});}} style={{background:'none',border:'none',color:'#FF9933',cursor:'pointer',fontSize:13,lineHeight:1}}>x</button>
            </div>}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:13,color:T.t3}}>{filtered.length} creators</span>
            {st.compared.length>0&&<Btn sm onClick={function(){go('compare');}}>Compare ({st.compared.length})</Btn>}
          </div>
        </div>

        {f.state&&<div style={{padding:'12px 16px',background:'linear-gradient(135deg,rgba(255,153,51,.1),rgba(19,136,8,.07))',borderRadius:12,border:'1px solid rgba(255,153,51,.25)',marginBottom:16}}>
          <p style={{fontSize:13,fontWeight:700,color:T.n8}}>{'📍 '+f.state+' ke Creators'}</p>
          <p style={{fontSize:12,color:T.t3,marginTop:2}}>{(f.district?f.district+' mein ':'Poore '+f.state+' mein ')+filtered.length+' creators'}</p>
        </div>}

        {loading ? (
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(auto-fill,minmax(270px,1fr))',gap:18}}>
            {[1,2,3,4,5,6].map(i=><SkeletonCard key={i}/>)}
          </div>
        ) : filtered.length===0?(
          <EmptyState icon="🔍" title="Koi creator nahi mila" sub="Aapke current filters ke hisaab se koi creator nahi mila. Filters adjust karein." ctaLabel="Clear Filters" onCta={clearAll}/>
        ):(
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(auto-fill,minmax(270px,1fr))',gap:18}}>
            {filtered.map(function(c,i){
              return React.createElement('div',{key:c.id,className:'au d'+(Math.min(i%6+1,6))},
                React.createElement(CreatorCard,{creator:c,onView:function(cr){dsp({t:'GO',p:'creator-profile',sel:{creator:cr}});scrollToTop();}})
              );
            })}
          </div>
        )}
      </div>
    </div>
    {mob&&showFilters&&<div onClick={function(){setShowFilters(false);}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:6999}}/>}
  </PL>;
}

// ── CREATOR PROFILE PAGE ──────────────────────────────────────────
function CreatorProfilePage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const[tab,setTab]=useState('about');
  const toast=function(msg,type){dsp({t:'TOAST',d:{type:type||'info',msg:msg}});};
  const go=function(p,sel){dsp({t:'GO',p:p,sel:sel});scrollToTop();};
  const c=st.sel.creator||st.creatorProfile;
  if(!c)return <PL><div style={{...W(),padding:'80px 20px',textAlign:'center'}}><Empty icon="👤" title="Creator not found" ctaLabel="Browse Creators" onCta={function(){go('creators');}}/></div></PL>;

  const isOwn=st.creatorProfile&&st.creatorProfile.id===c.id;
  const saved=st.saved.includes(c.id);
  const score=c.score||fmt.score(c);
  const tier=fmt.tier(score);
  const niches=Array.isArray(c.niche)?c.niche:[c.niche].filter(Boolean);
  const platforms=Array.isArray(c.platform)?c.platform:[c.platform].filter(Boolean);
  const img=c.photo||c.avatarUrl||('https://ui-avatars.com/api/?name='+encodeURIComponent(c.name)+'&background=FF9933&color=fff&size=200');
  const portfolio=c.portfolio||[];
  const article=fmt.article(c);

  const[reviews,setReviews]=useState(function(){
    return [...(c.reviews||[]),...LS.get('cb_reviews_'+c.id,[])];
  });
  const avgRating=reviews.length?reviews.reduce(function(s,r){return s+Number(r.rating||0);},0)/reviews.length:0;
  const[showForm,setShowForm]=useState(false);
  const[rvText,setRvText]=useState('');
  const[rvName,setRvName]=useState((st.user&&(st.user.name||st.user.companyName))||'');
  const[rvRating,setRvRating]=useState(5);
  const[rvHover,setRvHover]=useState(0);
  const[rvLoading,setRvLoading]=useState(false);
  const[showCollab,setShowCollab]=useState(false);
  const[collabMsg,setCollabMsg]=useState('');

  var completeness=fmt.completeness(c);
  var podcast=c.podcast||[];
  var[playingPod,setPlayingPod]=useState(null);

  var submitReview=function(){
    if(!rvText.trim()){toast('Review likhiye','error');return;}
    if(!rvName.trim()){toast('Naam daaliye','error');return;}
    setRvLoading(true);
    setTimeout(function(){
      var r={id:'r'+Date.now(),brand:rvName,text:rvText,rating:rvRating,date:new Date().toISOString(),verified:!!st.user,role:st.role||'guest'};
      LS.set('cb_reviews_'+c.id,[...LS.get('cb_reviews_'+c.id,[]),r]);
      setReviews(function(prev){return [...prev,r];});
      setRvText('');setRvRating(5);setShowForm(false);setRvLoading(false);
      toast('Review published!','success');
    },500);
  };

  var sendCollab=function(){
    if(!st.user){dsp({t:'UI',v:{authModal:true,authTab:'login'}});return;}
    LS.push('cb_messages',{id:Date.now(),brandEmail:st.user.email||'',creatorEmail:c.email,brandName:st.user.companyName||st.user.name||'',creatorName:c.name,text:collabMsg||('Hi '+c.name+', collaboration ke liye interested hoon!'),date:new Date().toISOString()});
    setShowCollab(false);setCollabMsg('');
    toast('Message sent to '+c.name,'success');
  };

  var packages=[
    {name:'Starter',emoji:'📦',price:fmt.inr(c.rateMin||10000),items:['1 Post','2 Stories','Basic caption'],color:'#138808',pop:false},
    {name:'Pro',emoji:'⭐',price:fmt.inr(Math.round((Number(c.rateMin||10000)+Number(c.rateMax||30000))/2)),items:['2 Reels','5 Stories','Custom caption','2 revisions'],color:'#FF9933',pop:true},
    {name:'Premium',emoji:'👑',price:fmt.inr(c.rateMax||50000),items:['3 Reels','10 Stories','YouTube mention','Usage rights','Campaign report'],color:'#7C3AED',pop:false},
  ];

  return <PL>
    <div style={{height:mob?190:300,background:'linear-gradient(135deg,#0a0a0a,#1a0800)',position:'relative',overflow:'hidden'}}>
      {c.coverUrl&&<img src={c.coverUrl} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.7}} alt="" onError={function(e){e.target.style.display='none';}}/>}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.15),rgba(0,0,0,.7))'}}/>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)'}}/>
      <div style={{position:'absolute',top:14,left:16,right:16,display:'flex',justifyContent:'space-between'}}>
        <button onClick={function(){go('creators');}} style={{padding:'7px 14px',background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',borderRadius:8,color:'rgba(255,255,255,.85)',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Back</button>
        <div style={{display:'flex',gap:8}}>
          <button onClick={function(){dsp({t:'SAVE',id:c.id});}} style={{padding:'7px 14px',background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',border:'1px solid '+(saved?'#FF9933':'rgba(255,255,255,.15)'),borderRadius:8,color:saved?'#FF9933':'rgba(255,255,255,.8)',fontSize:12,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>{saved?'Saved':'Save'}</button>
          <button onClick={function(){dsp({t:'UI',v:{shareModal:true,shareTarget:{name:c.name,handle:c.handle}}});}} style={{padding:'7px 14px',background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',borderRadius:8,color:'rgba(255,255,255,.8)',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Share</button>
        </div>
      </div>
    </div>

    <div style={W()}>
      <div style={{background:'#fff',borderRadius:20,border:'1px solid '+T.bd,padding:mob?'20px':'28px',marginTop:mob?-40:-50,position:'relative',zIndex:2,boxShadow:'0 8px 40px rgba(0,0,0,.1)',marginBottom:20}}>
        <div style={{display:'flex',flexDirection:mob?'column':'row',gap:18,alignItems:mob?'flex-start':'flex-end'}}>
          <div style={{position:'relative',flexShrink:0,marginTop:mob?-44:-54}}>
            <img src={img} style={{width:mob?80:100,height:mob?80:100,borderRadius:'50%',objectFit:'cover',border:'4px solid #fff',boxShadow:'0 4px 20px rgba(0,0,0,.15)'}} alt={c.name} onError={function(e){e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(c.name)+'&background=FF9933&color=fff&size=200';}}/>
            {c.verified&&<div style={{position:'absolute',bottom:2,right:2,width:22,height:22,borderRadius:'50%',background:'#2563EB',border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#fff'}}>✓</div>}
          </div>
          <div style={{flex:1}}>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:6}}>
              {c.verified&&<Bdg sm color="blue">Verified</Bdg>}
              <Bdg sm color={tier.bc}>{tier.label}</Bdg>
              {c.trending&&<Bdg sm color="red">Trending</Bdg>}
              {c.pro&&<Bdg sm color="purple">Pro</Bdg>}
            </div>
            <h1 style={{fontFamily:"'Fraunces',serif",fontSize:mob?22:30,fontWeight:900,color:T.n8,lineHeight:1.1,marginBottom:4}}>{c.name}</h1>
            <p style={{fontSize:13,color:T.t3,marginBottom:4}}>{'@'+(c.handle||fmt.handle(c.name))}</p>
            <p style={{fontSize:13,color:T.t2}}>{'📍 '+c.city+(c.state?', '+c.state:'')+' • '+niches.join(', ')}</p>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',flexShrink:0}}>
            {isOwn?(
              <Btn style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff'}} onClick={function(){go('settings');}}>Edit Profile</Btn>
            ):(
              <Btn style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff'}} onClick={function(){setShowCollab(true);}}>Collaborate</Btn>
            )}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:mob?'repeat(3,1fr)':'repeat(6,1fr)',gap:10,marginTop:20,paddingTop:18,borderTop:'1px solid '+T.bd}}>
          {[
            [fmt.num(c.followers),'Followers','👥'],
            [Number(c.er||0).toFixed(1)+'%','ER','📈'],
            [fmt.num(Number(c.monthlyViews||0)||Number(c.followers||0)*3),'Views','👁'],
            [fmt.inr(c.rateMin)+'+','Rate','💰'],
            [c.completedDeals||0,'Deals','🤝'],
            [avgRating>0?avgRating.toFixed(1):'New','Rating','⭐'],
          ].map(function(item){
            return React.createElement('div',{key:item[1],style:{textAlign:'center',padding:'10px 6px',background:T.bg2,borderRadius:10}},
              React.createElement('div',{style:{fontSize:16,marginBottom:3}},item[2]),
              React.createElement('div',{style:{fontFamily:"'Fraunces',serif",fontSize:mob?13:18,fontWeight:900,color:T.n8,lineHeight:1}},item[0]),
              React.createElement('div',{style:{fontSize:10,color:T.t3,marginTop:3}},item[1])
            );
          })}
        </div>

        {isOwn&&<div style={{marginTop:14,padding:'12px 16px',background:'linear-gradient(135deg,rgba(255,153,51,.08),rgba(19,136,8,.06))',borderRadius:10,border:'1px solid rgba(255,153,51,.2)',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <div style={{flex:1}}>
            <p style={{fontSize:10,fontWeight:800,color:'#FF9933',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:2}}>Profile Link</p>
            <p style={{fontSize:12,fontFamily:'monospace',color:T.n8}}>{'creatorbharat.in/c/'+c.handle}</p>
          </div>
          <Btn sm style={{background:'#FF9933',border:'none',color:'#fff'}} onClick={function(){
            try{navigator.clipboard.writeText('https://creatorbharat.in/c/'+c.handle);}catch(e){var ta=document.createElement('textarea');ta.value='https://creatorbharat.in/c/'+c.handle;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);}
            toast('Link copied!','success');
          }}>Copy</Btn>
        </div>}

        {isOwn&&completeness.pct<100&&<div style={{marginTop:12,padding:'12px',background:T.bg2,borderRadius:10,border:'1px solid '+T.bd}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontSize:12,fontWeight:700,color:T.n8}}>Profile Completeness</span>
            <span style={{fontSize:12,fontWeight:700,color:completeness.pct>=80?'#138808':'#FF9933'}}>{completeness.pct+'%'}</span>
          </div>
          <Bar value={completeness.pct} color={completeness.pct>=80?'#138808':'#FF9933'} height={5}/>
        </div>}
      </div>

      {/* Tabs */}
      <div style={{background:'#fff',borderRadius:16,border:'1px solid '+T.bd,overflow:'hidden',marginBottom:24}}>
        <div style={{display:'flex',overflowX:'auto',borderBottom:'1px solid '+T.bd,background:T.bg2}}>
          {[['about','About'],['podcast','Podcast ('+podcast.length+')'],['packages','Packages'],['portfolio','Portfolio ('+portfolio.length+')'],['article','Article'],['reviews','Reviews ('+reviews.length+')']].map(function(item){
            var id=item[0],lbl=item[1];
            return React.createElement('button',{key:id,onClick:function(){setTab(id);},style:{padding:'13px 18px',background:tab===id?'#fff':'transparent',border:'none',borderBottom:'3px solid '+(tab===id?'#FF9933':'transparent'),color:tab===id?'#FF9933':T.t2,fontWeight:tab===id?700:500,fontSize:mob?11:13,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',flexShrink:0,transition:'all .15s',marginBottom:-1}},lbl);
          })}
        </div>

        <div style={{padding:mob?'18px':'26px'}}>
          {tab==='about'&&<div style={{display:'grid',gridTemplateColumns:mob?'1fr':'2fr 1fr',gap:24}}>
            <div>
              {c.bio&&<div style={{marginBottom:20}}>
                <h3 style={{fontSize:14,fontWeight:700,color:T.n8,marginBottom:8}}>About</h3>
                <p style={{fontSize:14,color:T.t2,lineHeight:1.8,background:T.bg2,padding:'14px 16px',borderRadius:10,borderLeft:'3px solid #FF9933'}}>{c.bio}</p>
              </div>}
              <h3 style={{fontSize:14,fontWeight:700,color:T.n8,marginBottom:8}}>Platforms</h3>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
                {platforms.map(function(p){return React.createElement(Bdg,{key:p,color:'blue'},p);})}
                {c.instagram&&<a href={'https://instagram.com/'+c.instagram.replace('@','')} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,padding:'4px 12px',borderRadius:8,background:'linear-gradient(135deg,#f09433,#dc2743)',color:'#fff',fontSize:12,fontWeight:700,textDecoration:'none'}}>{'📸 '+c.instagram}</a>}
              </div>
              {c.services&&c.services.length>0&&<div style={{marginBottom:18}}>
                <h3 style={{fontSize:14,fontWeight:700,color:T.n8,marginBottom:8}}>Services</h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:7}}>{c.services.map(function(s){return React.createElement('div',{key:s,style:{padding:'5px 12px',borderRadius:18,background:'rgba(255,153,51,.1)',border:'1px solid rgba(255,153,51,.25)',fontSize:12,color:'#FF9933',fontWeight:600}},s);})}</div>
              </div>}
              {c.languages&&c.languages.length>0&&<div>
                <h3 style={{fontSize:14,fontWeight:700,color:T.n8,marginBottom:8}}>Languages</h3>
                <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>{c.languages.map(function(l){return React.createElement('div',{key:l,style:{padding:'5px 11px',background:T.bg2,borderRadius:8,fontSize:12,color:T.n8,fontWeight:600}},'🗣 '+l);})}</div>
              </div>}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div style={{textAlign:'center',padding:'20px',background:T.bg2,borderRadius:14,border:'1px solid '+T.bd}}>
                <p style={{fontSize:10,fontWeight:700,color:T.t3,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12}}>Creator Score</p>
                <Ring score={score} size={90}/>
              </div>
              {c.rateMin&&<div style={{padding:'16px',background:'linear-gradient(135deg,rgba(255,153,51,.1),rgba(255,107,0,.06))',borderRadius:12,border:'1px solid rgba(255,153,51,.25)'}}>
                <p style={{fontSize:10,fontWeight:800,color:'#FF9933',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6}}>Rates</p>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:T.n8}}>{fmt.inr(c.rateMin)}</div>
                <div style={{fontSize:12,color:T.t3}}>{'to '+fmt.inr(c.rateMax)}</div>
              </div>}
              {!isOwn&&<Btn full style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff'}} onClick={function(){setShowCollab(true);}}>Collaborate</Btn>}
              {!isOwn&&<Btn full variant="outline" onClick={function(){setTab('reviews');}}>Write Review</Btn>}
            </div>
          </div>}

          {tab==='podcast'&&<div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:800,color:T.n8,marginBottom:8}}>Creator Podcast</h3>
            <p style={{fontSize:14,color:T.t2,marginBottom:20,lineHeight:1.6}}>{'Short podcast conversations with '+c.name+' -- creator journey, brand tips, aur more.'}</p>
            {podcast.length===0?(
              <div style={{textAlign:'center',padding:'40px',background:T.bg2,borderRadius:14,border:'1px dashed '+T.bd}}>
                <div style={{fontSize:40,marginBottom:10}}>🎙</div>
                <h4 style={{fontFamily:"'Fraunces',serif",fontSize:16,color:T.n8,marginBottom:6}}>Podcast Coming Soon</h4>
                <p style={{fontSize:13,color:T.t2,lineHeight:1.6}}>{c.name+' ke saath podcast episode jaldi aayega!'}</p>
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {podcast.map(function(ep,ei){
                  var playing=playingPod===ep.id;
                  return React.createElement('div',{key:ep.id,style:{background:'#fff',borderRadius:14,border:'1px solid '+T.bd,overflow:'hidden',display:'flex',flexDirection:mob?'column':'row',boxShadow:playing?T.sh3:T.sh1}},
                    React.createElement('div',{style:{position:'relative',width:mob?'100%':180,height:mob?150:110,flexShrink:0,background:T.bg3,cursor:'pointer'},onClick:function(){setPlayingPod(playing?null:ep.id);}},
                      React.createElement('img',{src:ep.thumbnail,style:{width:'100%',height:'100%',objectFit:'cover'},alt:'',onError:function(e){e.target.style.display='none';}}),
                      React.createElement('div',{style:{position:'absolute',inset:0,background:'rgba(0,0,0,.35)',display:'flex',alignItems:'center',justifyContent:'center'}},
                        React.createElement('div',{style:{width:40,height:40,borderRadius:'50%',background:playing?'rgba(220,38,38,.9)':'rgba(255,153,51,.9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#fff'}},playing?'⏸':'▶')
                      ),
                      React.createElement('div',{style:{position:'absolute',bottom:7,right:7,background:'rgba(0,0,0,.7)',borderRadius:5,padding:'2px 7px',fontSize:10,color:'#fff',fontWeight:700}},ep.duration)
                    ),
                    React.createElement('div',{style:{padding:16,flex:1}},
                      React.createElement('div',{style:{display:'flex',gap:6,marginBottom:7}},
                        React.createElement(Bdg,{sm:true},('Episode '+(ei+1))),
                        React.createElement(Bdg,{sm:true,color:'red'},'Podcast')
                      ),
                      React.createElement('h4',{style:{fontFamily:"'Fraunces',serif",fontSize:15,fontWeight:700,color:T.n8,lineHeight:1.3,marginBottom:7,cursor:'pointer'},onClick:function(){setPlayingPod(playing?null:ep.id);}},ep.title),
                      React.createElement('div',{style:{display:'flex',gap:10,marginBottom:10}},
                        React.createElement('span',{style:{fontSize:11,color:T.t3}},('👁 '+fmt.num(ep.views))),
                        React.createElement('span',{style:{fontSize:11,color:T.t3}},('📅 '+fmt.date(ep.date)))
                      ),
                      playing&&React.createElement('div',{style:{background:T.bg2,borderRadius:8,padding:'10px',border:'1px solid '+T.bd,marginBottom:8}},
                        React.createElement('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:6}},
                          React.createElement('button',{onClick:function(){setPlayingPod(null);},style:{width:32,height:32,borderRadius:'50%',background:'#FF9933',border:'none',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}},'⏸'),
                          React.createElement('div',{style:{flex:1,height:4,background:T.bd,borderRadius:2,overflow:'hidden'}},
                            React.createElement('div',{style:{height:'100%',width:'35%',background:'linear-gradient(90deg,#FF9933,#FF6B00)',borderRadius:2}})
                          ),
                          React.createElement('span',{style:{fontSize:11,color:T.t3,fontFamily:'monospace'}},('0:47 / '+ep.duration))
                        ),
                        React.createElement('p',{style:{fontSize:10,color:T.t3,textAlign:'center'}},('🎙 Playing -- '+c.name))
                      ),
                      React.createElement(Btn,{sm:true,style:{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff'},onClick:function(){setPlayingPod(playing?null:ep.id);}},playing?'Pause':'Play Episode')
                    )
                  );
                })}
              </div>
            )}
          </div>}

          {tab==='packages'&&<div>
            <p style={{fontSize:14,color:T.t2,marginBottom:20,lineHeight:1.6}}>{'Choose collaboration package with '+c.name+'.'}</p>
            <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:18}}>
              {packages.map(function(pkg){
                return React.createElement('div',{key:pkg.name,style:{borderRadius:16,border:'2px solid '+(pkg.pop?pkg.color:T.bd),padding:'22px',position:'relative',background:pkg.pop?(pkg.color+'06'):'#fff'}},
                  pkg.pop&&React.createElement('div',{style:{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:pkg.color,color:'#fff',fontSize:10,fontWeight:800,padding:'3px 12px',borderRadius:20,whiteSpace:'nowrap'}},'POPULAR'),
                  React.createElement('div',{style:{fontSize:26,marginBottom:10}},pkg.emoji),
                  React.createElement('h3',{style:{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:800,color:T.n8,marginBottom:4}},pkg.name),
                  React.createElement('div',{style:{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:900,color:pkg.color,marginBottom:14}},pkg.price),
                  React.createElement('div',{style:{borderTop:'1px solid '+T.bd,paddingTop:12,marginBottom:16}},
                    pkg.items.map(function(d){
                      return React.createElement('div',{key:d,style:{display:'flex',gap:7,marginBottom:7,alignItems:'flex-start'}},
                        React.createElement('span',{style:{color:'#138808',fontWeight:700,flexShrink:0}},'✓'),
                        React.createElement('span',{style:{fontSize:12,color:T.t2}},d)
                      );
                    })
                  ),
                  React.createElement(Btn,{full:true,style:{background:pkg.pop?('linear-gradient(135deg,'+pkg.color+','+pkg.color+'cc)'):'transparent',border:'2px solid '+pkg.color,color:pkg.pop?'#fff':pkg.color,fontWeight:700},onClick:function(){
                    if(!st.user){dsp({t:'UI',v:{authModal:true,authTab:'login'}});return;}
                    toast(pkg.name+' inquiry sent!','success');
                  }},(pkg.pop?'Get '+pkg.name:'Choose '+pkg.name))
                );
              })}
            </div>
          </div>}

          {tab==='portfolio'&&(portfolio.length===0?(
            <Empty icon="🖼" title="No portfolio yet" sub={isOwn?'Settings se portfolio add karo.':'Creator ne portfolio add nahi kiya.'}/>
          ):(
            <div style={{display:'grid',gridTemplateColumns:mob?'repeat(2,1fr)':'repeat(3,1fr)',gap:12}}>
              {portfolio.map(function(url,pi){
                return React.createElement('div',{key:pi,style:{borderRadius:12,overflow:'hidden',aspectRatio:'1',background:T.bg3,cursor:'zoom-in'}},
                  React.createElement('img',{src:url,style:{width:'100%',height:'100%',objectFit:'cover'},alt:'',onError:function(e){e.target.style.display='none';}})
                );
              })}
            </div>
          ))}

          {tab==='article'&&<div style={{maxWidth:680}}>
            <div style={{background:T.bg2,borderRadius:14,padding:'24px',border:'1px solid '+T.bd,marginBottom:18}}>
              <h2 style={{fontFamily:"'Fraunces',serif",fontSize:mob?19:24,color:T.n8,marginBottom:16,lineHeight:1.25,fontWeight:800}}>{article.title}</h2>
              <hr style={{border:'none',borderTop:'2px solid rgba(255,153,51,.2)',marginBottom:16}}/>
              {[article.p1,article.p2,article.p3].map(function(p,pi){
                return React.createElement('p',{key:pi,style:{fontSize:14,color:T.t1,lineHeight:1.85,marginTop:pi>0?14:0}},p);
              })}
            </div>
            <div style={{display:'flex',gap:10}}>
              <Btn onClick={function(){dsp({t:'UI',v:{shareModal:true,shareTarget:{name:c.name,handle:c.handle}}});}}>Share Profile</Btn>
            </div>
          </div>}

          {tab==='reviews'&&<div>
            <div style={{display:'flex',gap:16,padding:'16px',background:T.bg2,borderRadius:12,marginBottom:18,flexWrap:'wrap',alignItems:'center'}}>
              <div style={{textAlign:'center',minWidth:80}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:44,fontWeight:900,color:'#FF9933',lineHeight:1}}>{avgRating>0?avgRating.toFixed(1):'--'}</div>
                <Stars rating={avgRating}/>
                <p style={{fontSize:11,color:T.t3,marginTop:3}}>{reviews.length+' reviews'}</p>
              </div>
              {reviews.length>0&&<div style={{flex:1,minWidth:150}}>
                {[5,4,3,2,1].map(function(star){
                  var cnt=reviews.filter(function(r){return Math.round(Number(r.rating))===star;}).length;
                  var pct=reviews.length?Math.round(cnt/reviews.length*100):0;
                  return React.createElement('div',{key:star,style:{display:'flex',alignItems:'center',gap:7,marginBottom:4}},
                    React.createElement('span',{style:{fontSize:11,color:T.t3,width:10}},star),
                    React.createElement('span',{style:{color:'#F59E0B',fontSize:11}},'★'),
                    React.createElement('div',{style:{flex:1,height:5,background:T.bd,borderRadius:2,overflow:'hidden'}},
                      React.createElement('div',{style:{height:'100%',width:pct+'%',background:'#F59E0B',borderRadius:2}})
                    ),
                    React.createElement('span',{style:{fontSize:10,color:T.t3,width:18}},cnt)
                  );
                })}
              </div>}
              <Btn style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff',marginLeft:'auto'}} onClick={function(){setShowForm(!showForm);}}>
                {showForm?'Cancel':'Write Review'}
              </Btn>
            </div>

            {showForm&&<div style={{background:T.bg2,borderRadius:14,padding:'20px',marginBottom:18,border:'1px solid '+T.bd}}>
              <h4 style={{fontFamily:"'Fraunces',serif",fontSize:16,color:T.n8,marginBottom:16,fontWeight:700}}>{'Review '+c.name.split(' ')[0]+' ke liye'}</h4>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,fontWeight:700,color:T.t2,display:'block',marginBottom:7,textTransform:'uppercase',letterSpacing:'.04em'}}>Rating</label>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  {[1,2,3,4,5].map(function(star){
                    return React.createElement('button',{key:star,onClick:function(){setRvRating(star);},onMouseEnter:function(){setRvHover(star);},onMouseLeave:function(){setRvHover(0);},style:{fontSize:30,background:'none',border:'none',cursor:'pointer',color:(rvHover||rvRating)>=star?'#F59E0B':'#E5E7EB',lineHeight:1,padding:'1px'}},'★');
                  })}
                  <span style={{fontSize:13,color:T.t2,marginLeft:6,fontWeight:600}}>{['','Poor','Fair','Good','Very Good','Excellent'][rvHover||rvRating]}</span>
                </div>
              </div>
              <Fld label="Your Name *" value={rvName} onChange={function(e){setRvName(e.target.value);}} placeholder="Name or company" required/>
              <Fld label="Review *" value={rvText} onChange={function(e){setRvText(e.target.value);}} rows={3} placeholder={'Share your experience with '+c.name.split(' ')[0]+'...'} required/>
              <div style={{display:'flex',gap:9}}>
                <Btn loading={rvLoading} style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff'}} onClick={submitReview}>Submit</Btn>
                <Btn variant="ghost" onClick={function(){setShowForm(false);setRvText('');setRvRating(5);}}>Cancel</Btn>
              </div>
            </div>}

            {reviews.length===0?(
              <Empty icon="⭐" title="No reviews yet" sub="Pehla review likhne wale bano!" ctaLabel="Write Review" onCta={function(){setShowForm(true);}}/>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {[...reviews].reverse().map(function(r,ri){
                  return React.createElement('div',{key:r.id||ri,style:{padding:'16px',background:'#fff',borderRadius:12,border:'1px solid '+T.bd}},
                    React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:9,gap:8,flexWrap:'wrap'}},
                      React.createElement('div',{style:{display:'flex',gap:9,alignItems:'center'}},
                        React.createElement('div',{style:{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#fff',fontWeight:700,flexShrink:0}},(r.brand||'?')[0].toUpperCase()),
                        React.createElement('div',null,
                          React.createElement('div',{style:{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'}},
                            React.createElement('p',{style:{fontWeight:700,color:T.n8,fontSize:13}},(typeof r.brand==='object'&&r.brand?r.brand.companyName:r.brand)||'Anonymous'),
                            r.verified&&React.createElement('span',{style:{fontSize:9,background:'rgba(19,136,8,.1)',color:'#138808',padding:'1px 6px',borderRadius:9,fontWeight:700}},'Verified')
                          ),
                          React.createElement(Stars,{rating:Number(r.rating||0),sm:true})
                        )
                      ),
                      React.createElement('span',{style:{fontSize:10,color:T.t3}},fmt.date(r.date))
                    ),
                    React.createElement('p',{style:{fontSize:13,color:T.t2,lineHeight:1.7,fontStyle:'italic'}},'"'+r.text+'"')
                  );
                })}
              </div>
            )}
          </div>}
        </div>
      </div>
    </div>

    {showCollab&&<Modal open title={'Collaborate with '+c.name} onClose={function(){setShowCollab(false);}}>
      <Fld label="Your Message" value={collabMsg} onChange={function(e){setCollabMsg(e.target.value);}} rows={3} placeholder={'Hi '+c.name+', collaboration ke liye contact kar raha hoon...'}/>
      <div style={{display:'flex',gap:9}}>
        <Btn full style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff'}} onClick={sendCollab}>Send Message</Btn>
        <Btn full variant="ghost" onClick={function(){setShowCollab(false);}}>Cancel</Btn>
      </div>
    </Modal>}
    <div style={{height:48}}/>
  </PL>;
}

// ── BLOG PAGE ─────────────────────────────────────────────────────
function BlogPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const[cat,setCat]=useState('');
  const go=function(p,sel){dsp({t:'GO',p:p,sel:sel});scrollToTop();};
  const allBlogs=LS.get('cb_blogs',SB);
  const cats=[...new Set(allBlogs.map(function(b){return b.category;}))];
  const filtered=cat?allBlogs.filter(function(b){return b.category===cat;}):allBlogs;
  const featured=allBlogs.find(function(b){return b.featured;});
  return <PL>
    <div style={{background:'linear-gradient(135deg,#0d0d0d,#1a0800)',padding:mob?'48px 20px':'72px 20px',position:'relative'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)'}}/>
      <div style={W()}><SH eyebrow="Creator Knowledge" title="Tips, Stories & Guides" sub="Real insights for India's creator community." light center mb={0}/></div>
    </div>
    <div style={{background:'#fff',borderBottom:'1px solid '+T.bd,padding:'12px 20px',position:'sticky',top:56,zIndex:100}}>
      <div style={W()}>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <Chip label="All" active={!cat} onClick={function(){setCat('');}}/>
          {cats.map(function(c){return React.createElement(Chip,{key:c,label:c,active:cat===c,onClick:function(){setCat(cat===c?'':c);}});})}
        </div>
      </div>
    </div>
    {featured&&!cat&&<div style={{padding:mob?'24px 20px':'36px 20px',background:T.bg2}}>
      <div style={W()}>
        <Card onClick={function(){go('blog-article',{blog:featured});}} style={{overflow:'hidden',display:'grid',gridTemplateColumns:mob?'1fr':'1.2fr 1fr'}}>
          <div style={{height:mob?200:320,overflow:'hidden',background:'#f5f5f5',position:'relative'}}>
            <img src={featured.image} style={{width:'100%',height:'100%',objectFit:'cover'}} alt={featured.title} onError={function(e){e.target.style.display='none';}}/>
            <div style={{position:'absolute',top:12,left:12}}><Bdg color="dark">Featured</Bdg></div>
          </div>
          <div style={{padding:mob?'20px':'32px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <Bdg sm color="red">{featured.category}</Bdg>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:mob?19:24,color:T.n8,margin:'12px 0 10px',lineHeight:1.25,fontWeight:800}}>{featured.title}</h2>
            <p style={{fontSize:13,color:T.t2,lineHeight:1.7,marginBottom:18}}>{featured.excerpt}</p>
            <div style={{display:'flex',gap:12,marginBottom:18}}>
              <span style={{fontSize:11,color:T.t3}}>{'by '+(featured.author || 'CreatorBharat Team')}</span>
              <span style={{fontSize:11,color:T.t3}}>{'⏱ '+(featured.readTime || '5 min')}</span>
              <span style={{fontSize:11,color:T.t3}}>{'👁 '+fmt.num(featured.views || 0)}</span>
            </div>
            <Btn style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff',alignSelf:'flex-start'}} onClick={function(){go('blog-article',{blog:featured});}}>Read Article</Btn>
          </div>
        </Card>
      </div>
    </div>}
    <div style={{padding:mob?'24px 20px':'36px 20px',background:'#fff'}}>
      <div style={W()}>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:20}}>
          {filtered.filter(function(b){return !b.featured||cat;}).map(function(b,bi){
            return React.createElement(Card,{key:b.id,onClick:function(){go('blog-article',{blog:b});},style:{overflow:'hidden',height:'100%',display:'flex',flexDirection:'column'}},
              React.createElement('div',{style:{height:170,overflow:'hidden',background:'#f5f5f5',position:'relative',flexShrink:0}},
                React.createElement('img',{src:b.image,style:{width:'100%',height:'100%',objectFit:'cover'},alt:b.title,onError:function(e){e.target.style.display='none';}}),
                React.createElement('div',{style:{position:'absolute',top:9,left:9}},React.createElement(Bdg,{sm:true,color:'dark'},b.category))
              ),
              React.createElement('div',{style:{padding:16,flex:1}},
                React.createElement('div',{style:{display:'flex',gap:9,marginBottom:8}},
                  React.createElement('span',{style:{fontSize:10,color:T.t3}},b.readTime || '5 min'),
                  React.createElement('span',{style:{fontSize:10,color:T.t3}},('👁 '+fmt.num(b.views || 0)))
                ),
                React.createElement('h3',{style:{fontFamily:"'Fraunces',serif",fontSize:15,color:T.n8,lineHeight:1.35,marginBottom:7,fontWeight:700}},b.title),
                React.createElement('p',{style:{fontSize:12,color:T.t2,lineHeight:1.6}},b.excerpt)
              )
            );
          })}
        </div>
      </div>
    </div>
  </PL>;
}

// ── BLOG ARTICLE PAGE ─────────────────────────────────────────────
function BlogArticlePage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=function(p,sel){dsp({t:'GO',p:p,sel:sel});scrollToTop();};
  const b=st.sel.blog;
  const[liked,setLiked]=useState(false);
  const[readPct,setReadPct]=useState(0);
  const[fontSize,setFontSize]=useState(16);
  const[darkMode,setDarkMode]=useState(false);
  const[comments,setComments]=useState(function(){return LS.get('cb_comments_'+(b?b.id:''),[]);});
  const[cText,setCText]=useState('');
  const[cName,setCName]=useState((st.user&&(st.user.name||st.user.companyName))||'');
  const[replyTo,setReplyTo]=useState(null);
  const[replyText,setReplyText]=useState('');
  const[cLoading,setCLoading]=useState(false);
  const[cSort,setCSort]=useState('newest');
  const[likedC,setLikedC]=useState({});

  useEffect(function(){
    var h=function(){
      var el=document.documentElement;
      var st2=el.scrollTop||document.body.scrollTop;
      var sh=el.scrollHeight-el.clientHeight;
      if(sh>0)setReadPct(Math.round((st2/sh)*100));
    };
    window.addEventListener('scroll',h,{passive:true});
    return function(){window.removeEventListener('scroll',h);};
  },[]);

  useEffect(function(){
    if(b && b.slug){
      apiCall('/blog/'+b.slug).then(function(data){
        if(data.comments) setComments(data.comments);
      }).catch(console.error);
    }
  },[b?.slug]);

  if(!b)return <PL><div style={{...W(),padding:'80px 20px'}}><Empty icon="📄" title="Article not found" ctaLabel="Back to Blog" onCta={function(){go('blog');}}/></div></PL>;

  const allBlogs=LS.get('cb_blogs',SB);
  var linkedCreator=b.creatorHandle?LS.get('cb_creators',[]).find(function(cr){return cr.handle===b.creatorHandle;}):null;
  var related=allBlogs.filter(function(x){return x.id!==b.id&&x.category===b.category;}).slice(0,3);
  var shareUrl='creatorbharat.in/blog/'+b.slug;
  var totalC=comments.length+comments.reduce(function(s,c){return s+(c.replies?c.replies.length:0);},0);

  var sortedC=[...comments].sort(function(a,c2){
    if(cSort==='oldest')return new Date(a.date)-new Date(c2.date);
    if(cSort==='popular')return(c2.likes||0)-(a.likes||0);
    return new Date(c2.date)-new Date(a.date);
  });

  var postComment=function(isReply){
    var text=isReply?replyText:cText;
    if(!text.trim()){dsp({t:'TOAST',d:{type:'error',msg:'Comment likhiye'}});return;}
    if(!cName.trim()){dsp({t:'TOAST',d:{type:'error',msg:'Naam daaliye'}});return;}
    setCLoading(true);
    
    apiCall('/blog/'+b.id+'/comment', {
      method: 'POST',
      body: {
        name: cName,
        text: text,
        parentId: isReply ? replyTo : null,
        email: st.user?.email || null
      }
    }).then(function(nc){
      if(isReply && replyTo){
        var updated=comments.map(function(c){return c.id===replyTo?{...c,replies:[...(c.replies||[]),nc]}:c;});
        setComments(updated);setReplyText('');setReplyTo(null);
      }else{
        setComments([...comments, {...nc, replies: []}]);setCText('');
      }
      setCLoading(false);
      dsp({t:'TOAST',d:{type:'success',msg:'Comment published!'}});
    }).catch(function(err){
      setCLoading(false);
      dsp({t:'TOAST',d:{type:'error',msg:err.message}});
    });
  };

  var bg=darkMode?'#111':'#fff';
  var bgAlt=darkMode?'#1a1a1a':'#FAFAF9';
  var bd=darkMode?'rgba(255,255,255,.1)':'#E8E6E3';
  var tc=darkMode?'#F0F0F0':'#1a1a1a';
  var ts=darkMode?'rgba(255,255,255,.65)':'#444';
  var tm=darkMode?'rgba(255,255,255,.35)':'#888';

  return <PL>
    <div style={{position:'fixed',top:0,left:0,zIndex:9999,height:3,width:readPct+'%',background:'linear-gradient(90deg,#FF9933,#138808)',transition:'width .1s',pointerEvents:'none'}}/>

    <div style={{background:'#0a0a0a',position:'relative',overflow:'hidden'}}>
      <div style={{height:mob?200:380,position:'relative'}}>
        <img src={b.image} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.55}} alt={b.title} onError={function(e){e.target.style.display='none';}}/>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.85))'}}/>
        <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)'}}/>
        <div style={{position:'absolute',top:14,left:16,right:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:8}}>
            <button onClick={function(){go('blog');}} style={{padding:'6px 12px',background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',borderRadius:8,color:'rgba(255,255,255,.85)',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Back</button>
            <Bdg sm color="dark">{b.category}</Bdg>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={function(){setDarkMode(!darkMode);}} style={{padding:'6px 12px',background:'rgba(0,0,0,.5)',backdropFilter:'blur(8px)',border:'1px solid rgba(255,255,255,.15)',borderRadius:8,color:'rgba(255,255,255,.8)',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{darkMode?'Light':'Dark'}</button>
          </div>
        </div>
        <div style={{position:'absolute',bottom:0,left:0,right:0,padding:mob?'16px 20px':'28px 40px'}}>
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:mob?'clamp(20px,6vw,28px)':'clamp(26px,3.5vw,44px)',fontWeight:900,color:'#fff',lineHeight:1.1,maxWidth:800}}>{b.title}</h1>
        </div>
      </div>
    </div>

    <div style={{background:bg,borderBottom:'1px solid '+bd,padding:'10px 20px',position:'sticky',top:56,zIndex:100,transition:'background .3s'}}>
      <div style={W()}>
        <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',justifyContent:'space-between'}}>
          <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#fff',fontWeight:700}}>{b.author?b.author[0]:'C'}</div>
              <div>
                <p style={{fontSize:13,fontWeight:700,color:tc}}>{b.author || 'CreatorBharat Team'}</p>
                <p style={{fontSize:10,color:tm}}>{fmt.date(b.createdAt || b.date)}</p>
              </div>
            </div>
            <span style={{fontSize:11,color:tm}}>{'⏱ '+(b.readTime || '5 min')}</span>
            <span style={{fontSize:11,color:tm}}>{'👁 '+fmt.num(b.views || 0)}</span>
            <span style={{fontSize:11,color:tm}}>{'💬 '+totalC}</span>
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <div style={{display:'flex',gap:2,background:bgAlt,borderRadius:7,padding:'2px',border:'1px solid '+bd}}>
              <button onClick={function(){setFontSize(function(s){return Math.max(13,s-1);});}} style={{width:24,height:24,borderRadius:5,background:'none',border:'none',cursor:'pointer',fontSize:12,color:ts,fontFamily:'inherit'}}>A-</button>
              <span style={{fontSize:10,color:tm,width:16,textAlign:'center',lineHeight:'24px'}}>{fontSize}</span>
              <button onClick={function(){setFontSize(function(s){return Math.min(22,s+1);});}} style={{width:24,height:24,borderRadius:5,background:'none',border:'none',cursor:'pointer',fontSize:12,color:ts,fontFamily:'inherit'}}>A+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style={{background:bg,paddingTop:mob?20:36,transition:'background .3s'}}>
      <div style={W()}>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 260px',gap:36,alignItems:'start'}}>
          <article>
            <p style={{fontSize:mob?16:18,color:ts,lineHeight:1.8,fontWeight:500,borderLeft:'4px solid #FF9933',paddingLeft:16,marginBottom:30,fontStyle:'italic'}}>{b.excerpt}</p>
            <div style={{fontSize:fontSize,color:ts,lineHeight:1.9}}>
              {(b.body||'').split('\n\n').map(function(para,pi){
                var isH=para.length>4&&para[0]==='*'&&para[1]==='*'&&para[para.length-1]==='*'&&para[para.length-2]==='*';
                if(isH)return React.createElement('h2',{key:pi,style:{fontFamily:"'Fraunces',serif",fontSize:mob?19:24,fontWeight:800,color:tc,margin:'34px 0 13px',lineHeight:1.2}},para.split('**').join(''));
                return React.createElement('p',{key:pi,style:{marginBottom:18,fontSize:fontSize,color:ts,lineHeight:1.9}},para);
              })}
            </div>

            {b.tags&&b.tags.length>0&&<div style={{marginTop:32,paddingTop:18,borderTop:'1px solid '+bd}}>
              <p style={{fontSize:10,fontWeight:700,color:tm,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Tags</p>
              <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
                {b.tags.map(function(tag){
                  return React.createElement('span',{key:tag,style:{padding:'4px 12px',background:darkMode?'rgba(255,255,255,.07)':'#F5F4F2',borderRadius:18,fontSize:11,color:ts,fontWeight:500,cursor:'pointer'}},('#'+tag));
                })}
              </div>
            </div>}

            <div style={{marginTop:24,padding:'14px',background:bgAlt,borderRadius:12,border:'1px solid '+bd,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
              <button onClick={function(){setLiked(!liked);}} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:9,border:'1.5px solid '+(liked?'#FF9933':bd),background:liked?'rgba(255,153,51,.1)':'transparent',color:liked?'#FF9933':ts,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>{(liked?'❤ ':' 🤍 ')+((b.likes||0)+(liked?1:0))}</button>
              <span style={{fontSize:12,color:tm}}>{'💬 '+totalC}</span>
              <div style={{marginLeft:'auto',display:'flex',gap:7}}>
                <a href={'https://wa.me/?text='+encodeURIComponent(b.title+' https://'+shareUrl)} target="_blank" rel="noopener noreferrer" style={{padding:'6px 11px',background:'#25D366',color:'#fff',borderRadius:7,fontSize:11,fontWeight:700,textDecoration:'none'}}>WhatsApp</a>
                <a href={'https://twitter.com/intent/tweet?text='+encodeURIComponent(b.title)+'&url='+encodeURIComponent('https://'+shareUrl)} target="_blank" rel="noopener noreferrer" style={{padding:'6px 11px',background:'#000',color:'#fff',borderRadius:7,fontSize:11,fontWeight:700,textDecoration:'none'}}>Twitter</a>
              </div>
            </div>

            {linkedCreator&&<div style={{marginTop:24,padding:'18px',background:darkMode?'rgba(255,153,51,.08)':'rgba(255,153,51,.05)',borderRadius:14,border:'1px solid rgba(255,153,51,.25)'}}>
              <p style={{fontSize:10,fontWeight:800,color:'#FF9933',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Featured Creator</p>
              <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
                <img src={linkedCreator.photo||linkedCreator.avatarUrl||('https://ui-avatars.com/api/?name='+encodeURIComponent(linkedCreator.name)+'&background=FF9933&color=fff')} style={{width:52,height:52,borderRadius:'50%',objectFit:'cover',border:'3px solid rgba(255,153,51,.4)',flexShrink:0}} alt="" onError={function(e){e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(linkedCreator.name)+'&background=FF9933&color=fff';}}/>
                <div style={{flex:1}}>
                  <p style={{fontWeight:800,fontSize:14,color:tc,marginBottom:2}}>{linkedCreator.name}</p>
                  <p style={{fontSize:11,color:tm,marginBottom:4}}>{'📍 '+linkedCreator.city+' · '+fmt.num(linkedCreator.followers)+' followers'}</p>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>{(Array.isArray(linkedCreator.niche)?linkedCreator.niche:[linkedCreator.niche]).filter(Boolean).slice(0,3).map(function(n){return React.createElement(Bdg,{key:n,sm:true},n);})}</div>
                </div>
                <Btn sm style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff',flexShrink:0}} onClick={function(){dsp({t:'GO',p:'creator-profile',sel:{creator:linkedCreator}});scrollToTop();}}>View Profile</Btn>
              </div>
            </div>}

            <div style={{marginTop:32,padding:'24px',background:'linear-gradient(135deg,#0a0a0a,#1a0800)',borderRadius:16,textAlign:'center',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)'}}/>
              <div style={{fontSize:32,marginBottom:8}}>🚀</div>
              <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,color:'#fff',fontWeight:800,marginBottom:6}}>Creator ho? Get Listed!</h3>
              <p style={{fontSize:13,color:'rgba(255,255,255,.6)',marginBottom:16,lineHeight:1.7}}>Professional portfolio, 340+ brands. Free.</p>
              <Btn style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff'}} onClick={function(){go('apply');}}>Get Listed Free</Btn>
            </div>

            <div style={{marginTop:40}} id="comments">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,paddingBottom:12,borderBottom:'2px solid '+bd,flexWrap:'wrap',gap:9}}>
                <h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:800,color:tc}}>{'Comments ('+totalC+')'}</h3>
                <div style={{display:'flex',gap:6}}>
                  {[['newest','Newest'],['oldest','Oldest'],['popular','Popular']].map(function(item){
                    return React.createElement('button',{key:item[0],onClick:function(){setCSort(item[0]);},style:{padding:'4px 10px',borderRadius:18,border:'1.5px solid '+(cSort===item[0]?'#FF9933':bd),background:cSort===item[0]?'rgba(255,153,51,.1)':'transparent',color:cSort===item[0]?'#FF9933':ts,fontSize:11,fontWeight:cSort===item[0]?700:400,cursor:'pointer',fontFamily:'inherit'}},item[1]);
                  })}
                </div>
              </div>

              <div style={{background:bgAlt,borderRadius:12,padding:'18px',border:'1px solid '+bd,marginBottom:20}}>
                <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#fff',fontWeight:700,flexShrink:0}}>{cName?cName[0].toUpperCase():'?'}</div>
                  <div style={{flex:1}}>
                    {!st.user&&<input value={cName} onChange={function(e){setCName(e.target.value);}} placeholder="Aapka naam *" style={{width:'100%',padding:'7px 10px',borderRadius:7,border:'1px solid '+bd,background:bg,color:tc,fontSize:13,fontFamily:'inherit',outline:'none',marginBottom:8,boxSizing:'border-box'}}/>}
                    <textarea value={cText} onChange={function(e){setCText(e.target.value);}} placeholder="Apna thought share karo..." rows={3} style={{width:'100%',padding:'10px',borderRadius:9,border:'1px solid '+bd,background:bg,color:tc,fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',boxSizing:'border-box'}}/>
                    <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}>
                      <Btn sm loading={cLoading} style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff'}} onClick={function(){postComment(false);}}>Post Comment</Btn>
                    </div>
                  </div>
                </div>
              </div>

              {sortedC.length===0?(
                <div style={{textAlign:'center',padding:'32px',color:tm,fontSize:13}}>Pehla comment likhne wale bano!</div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {sortedC.map(function(comment,ci){
                    var colors=['#FF9933','#138808','#2563EB','#7C3AED'];
                    var gradients=['linear-gradient(135deg,#FF9933,#FF6B00)','linear-gradient(135deg,#138808,#0F6B06)','linear-gradient(135deg,#2563EB,#1d4ed8)','linear-gradient(135deg,#7C3AED,#6d28d9)'];
                    return React.createElement('div',{key:comment.id,style:{background:bg,borderRadius:12,border:'1px solid '+bd,padding:'14px'}},
                      React.createElement('div',{style:{display:'flex',gap:9,alignItems:'flex-start',marginBottom:9}},
                        React.createElement('div',{style:{width:34,height:34,borderRadius:'50%',background:gradients[ci%4],display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:'#fff',fontWeight:700,flexShrink:0}},(comment.name||'?')[0].toUpperCase()),
                        React.createElement('div',{style:{flex:1}},
                          React.createElement('div',{style:{display:'flex',gap:5,alignItems:'center',flexWrap:'wrap',marginBottom:2}},
                            React.createElement('span',{style:{fontWeight:700,fontSize:13,color:tc}},comment.name),
                            comment.verified&&React.createElement('span',{style:{fontSize:9,background:'rgba(19,136,8,.1)',color:'#138808',padding:'1px 5px',borderRadius:8,fontWeight:700}},'Verified')
                          ),
                          React.createElement('span',{style:{fontSize:10,color:tm}},fmt.date(comment.createdAt || comment.date))
                        )
                      ),
                      React.createElement('p',{style:{fontSize:13,color:ts,lineHeight:1.75,marginBottom:9}},comment.text),
                      React.createElement('div',{style:{display:'flex',gap:10}},
                        React.createElement('button',{onClick:function(){setLikedC(function(p){var n={};Object.keys(p).forEach(function(k){n[k]=p[k];});n[comment.id]=!p[comment.id];return n;});},style:{display:'flex',alignItems:'center',gap:4,background:'none',border:'none',cursor:'pointer',fontSize:11,color:likedC[comment.id]?'#FF9933':tm,fontFamily:'inherit',fontWeight:likedC[comment.id]?700:400}},(likedC[comment.id]?'❤ ':' 🤍 ')+((comment.likes||0)+(likedC[comment.id]?1:0))),
                        React.createElement('button',{onClick:function(){setReplyTo(replyTo===comment.id?null:comment.id);},style:{background:'none',border:'none',cursor:'pointer',fontSize:11,color:replyTo===comment.id?'#FF9933':tm,fontFamily:'inherit'}},('Reply'+(comment.replies&&comment.replies.length>0?' ('+comment.replies.length+')':'')))
                      ),
                      comment.replies&&comment.replies.length>0&&React.createElement('div',{style:{marginTop:10,paddingLeft:14,borderLeft:'2px solid '+bd,display:'flex',flexDirection:'column',gap:7}},
                        comment.replies.map(function(r,ri){
                          return React.createElement('div',{key:r.id||ri,style:{background:bgAlt,borderRadius:9,padding:'9px 12px'}},
                            React.createElement('div',{style:{display:'flex',gap:7,alignItems:'center',marginBottom:4}},
                              React.createElement('div',{style:{width:24,height:24,borderRadius:'50%',background:'rgba(255,153,51,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#FF9933',fontWeight:700}},(r.name||'?')[0].toUpperCase()),
                              React.createElement('span',{style:{fontWeight:600,fontSize:12,color:tc}},r.name),
                              r.verified&&React.createElement('span',{style:{fontSize:9,background:'rgba(19,136,8,.1)',color:'#138808',padding:'1px 5px',borderRadius:8,fontWeight:700}},'✓'),
                              React.createElement('span',{style:{fontSize:10,color:tm,marginLeft:'auto'}},fmt.date(r.createdAt || r.date))
                            ),
                            React.createElement('p',{style:{fontSize:12,color:ts,lineHeight:1.6}},r.text)
                          );
                        })
                      ),
                      replyTo===comment.id&&React.createElement('div',{style:{marginTop:10,paddingLeft:14,borderLeft:'2px solid #FF9933'}},
                        React.createElement('textarea',{value:replyText,onChange:function(e){setReplyText(e.target.value);},placeholder:('Reply to '+comment.name+'...'),rows:2,style:{width:'100%',padding:'8px 10px',borderRadius:7,border:'1px solid '+bd,background:bg,color:tc,fontSize:12,fontFamily:'inherit',outline:'none',resize:'none',boxSizing:'border-box',marginBottom:6}}),
                        React.createElement('div',{style:{display:'flex',gap:6}},
                          React.createElement(Btn,{sm:true,style:{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff'},loading:cLoading,onClick:function(){postComment(true);}},'Reply'),
                          React.createElement(Btn,{sm:true,variant:'ghost',onClick:function(){setReplyTo(null);setReplyText('');}},'Cancel')
                        )
                      )
                    );
                  })}
                </div>
              )}
            </div>
          </article>

          {!mob&&<aside>
            <div style={{position:'sticky',top:120,display:'flex',flexDirection:'column',gap:12}}>
              <div style={{background:bgAlt,borderRadius:12,padding:'14px',border:'1px solid '+bd}}>
                <p style={{fontSize:10,fontWeight:700,color:tm,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Reading Progress</p>
                <div style={{height:5,background:bd,borderRadius:2,overflow:'hidden',marginBottom:6}}><div style={{height:'100%',width:readPct+'%',background:'linear-gradient(90deg,#FF9933,#138808)',borderRadius:2,transition:'width .2s'}}/></div>
                <p style={{fontSize:10,color:tm,textAlign:'center'}}>{readPct+'% · '+b.readTime}</p>
              </div>
              <div style={{background:bgAlt,borderRadius:12,padding:'14px',border:'1px solid '+bd,textAlign:'center'}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#FF9933,#138808)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#fff',fontWeight:700,margin:'0 auto 8px'}}>{b.author?b.author[0]:'C'}</div>
                <p style={{fontWeight:700,fontSize:13,color:tc,marginBottom:2}}>{b.author}</p>
                <p style={{fontSize:10,color:tm,marginBottom:8}}>CreatorBharat Team</p>
                <Btn full sm variant="ghost" onClick={function(){go('blog');}}>More Articles</Btn>
              </div>
              <div style={{background:'linear-gradient(135deg,#0a0a0a,#1a0800)',borderRadius:12,padding:'14px',textAlign:'center',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)'}}/>
                <div style={{fontSize:20,marginBottom:6}}>📬</div>
                <p style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:700,color:'#fff',marginBottom:4}}>Newsletter</p>
                <NewsletterForm/>
              </div>
            </div>
          </aside>}
        </div>
      </div>
    </div>

    {related.length>0&&<div style={{padding:mob?'28px 20px':'44px 20px',background:bgAlt,borderTop:'1px solid '+bd}}>
      <div style={W()}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <h3 style={{fontFamily:"'Fraunces',serif",fontSize:mob?18:22,fontWeight:800,color:tc}}>Related Articles</h3>
          <div style={{flex:1,height:1,background:bd}}/>
          <button onClick={function(){go('blog');}} style={{background:'none',border:'none',color:'#FF9933',fontWeight:700,cursor:'pointer',fontSize:12,fontFamily:'inherit'}}>View All</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:18}}>
          {related.map(function(r){
            return React.createElement(Card,{key:r.id,onClick:function(){go('blog-article',{blog:r});scrollToTop();},style:{overflow:'hidden'}},
              React.createElement('div',{style:{height:140,background:bgAlt,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32}},'📰'),
              React.createElement('div',{style:{padding:16}},
                React.createElement('p',{style:{fontSize:13,fontWeight:700,color:tc,marginBottom:4}},r.title),
                React.createElement('p',{style:{fontSize:11,color:sc}},r.date)
              )
            );
          })}
        </div>
      </div>
    </div>}
  </PL>;
}

function CampaignsPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const{cpf:f}=st;
  const[modal,setModal]=useState(null);const[done,setDone]=useState(false);
  const[aF,setAF]=useState({pitch:'',portfolio:'',rate:''});
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  const[allCamps,setAllCamps]=useState([]);
  const[loading,setLoading]=useState(true);
  
  useEffect(()=>{
    setLoading(true);
    apiCall('/campaigns?limit=100')
      .then(d=>{
        const camps = d.campaigns || (Array.isArray(d) ? d : []);
        setAllCamps(camps);
        setLoading(false);
      })
      .catch(e=>{console.error(e);setLoading(false);});
  },[]);

  const filtered = allCamps.filter(c => {
    try {
      const bName = typeof c.brand === 'object' && c.brand ? (c.brand.companyName || '') : (c.brand || '');
      const title = (c.title || '').toLowerCase();
      const status = (c.status || '').toLowerCase();
      const q = (f.q || '').toLowerCase();

      if (q && !title.includes(q) && !bName.toLowerCase().includes(q)) return false;
      if (f.niche) {
        const cn = Array.isArray(c.niche) ? c.niche : [c.niche];
        if (!cn.includes(f.niche)) return false;
      }
      if (f.urgent && !c.urgent) return false;
      return status === 'live' || status === 'active' || !status;
    } catch(e) {
      return false;
    }
  });

  const niches = [...new Set(allCamps.flatMap(c => Array.isArray(c.niche) ? c.niche : [c.niche]).filter(Boolean))];
  const submitApply=()=>{
    if(!aF.pitch){toast('Write your pitch first','error');return}
    LS.push('cb_applications',{id:'app-'+Date.now(),campaignId:modal.id,campaignTitle:modal.title,brand:modal.brand,applicantEmail:st.user?.email,applicantName:st.user?.name,pitch:aF.pitch,portfolio:aF.portfolio,rate:aF.rate,status:'applied',date:new Date().toISOString()});
    dsp({t:'APPLY',id:modal.id});setDone(true);
    toast(`Applied to "${modal.title}"! Good luck.`,'success');
  };
  return <PL>
    <div style={{background:T.n8,padding:mob?'48px 20px':'80px 20px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 30% 70%, rgba(16,185,129,0.08) 0%, transparent 50%)'}}/>
      <div style={W()}>
        <SH eyebrow="Opportunities" title="Brand Campaigns" sub="Collaborate with top Indian brands and agencies." light mb={40}/>
        <div style={{display:'flex',gap:16,flexWrap:'wrap',maxWidth:800}}>
          <div style={{flex:1,minWidth:280,position:'relative'}}>
            <input value={f.q} onChange={e=>dsp({t:'CPF',v:{q:e.target.value}})} placeholder="Search campaigns by brand or title..." style={{width:'100%',padding:'16px 20px 16px 48px',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)',color:'#fff',fontSize:15,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}}/>
            <span style={{position:'absolute',left:18,top:'50%',transform:'translateY(-50%)',fontSize:18,opacity:0.6}}>🔎</span>
          </div>
          <select value={f.niche} onChange={e=>dsp({t:'CPF',v:{niche:e.target.value}})} style={{padding:'0 24px',borderRadius:16,border:'1px solid rgba(255,255,255,0.1)',fontSize:14,color:'#fff',background:'rgba(255,255,255,0.05)',fontFamily:'inherit',outline:'none'}}>
            <option value="" style={{background:T.n8}}>All Categories</option>
            {niches.map(n=><option key={n} value={n} style={{background:T.n8}}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>

    <div style={{padding:mob?'32px 20px':'48px 20px',background:T.bg2,minHeight:'80vh'}}>
      <div style={W()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <div style={{display:'flex',alignItems:'center',gap:20}}>
            <p style={{fontSize:15,color:T.t2,fontWeight:700}}>{filtered.length} Opportunities Available</p>
            <Tog on={!!f.urgent} onChange={()=>dsp({t:'CPF',v:{urgent:!f.urgent}})} label="Urgent Only"/>
          </div>
          {(f.q||f.niche||f.urgent)&&<Btn sm variant="ghost" onClick={()=>dsp({t:'CPF',v:{q:'',niche:'',urgent:false}})}>Clear Filters</Btn>}
        </div>

        {loading ? (
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(auto-fill,minmax(340px,1fr))',gap:24}}>
            {[1,2,3,4,5,6].map(i=><SkeletonCard key={i}/>)}
          </div>
        ) : filtered.length===0?<EmptyState icon="📋" title="No campaigns found" sub="Check back later or try different filters." ctaLabel="Reset Filters" onCta={()=>dsp({t:'CPF',v:{q:'',niche:'',urgent:false}})}/>:
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(auto-fill,minmax(340px,1fr))',gap:24}}>
          {filtered.map(c=><CampCard key={c.id} campaign={c} onApply={camp=>{setModal(camp);setDone(false);setAF({pitch:'',portfolio:'',rate:''})}}/>)}
        </div>}
      </div>
    </div>

    <Modal open={!!modal} title={modal?.title||''} onClose={()=>{setModal(null);setDone(false)}} width={600}>
      {done?<div style={{textAlign:'center',padding:'40px 0'}}>
        <div style={{fontSize:64,marginBottom:24,filter:'drop-shadow(0 0 20px rgba(16,185,129,0.3))'}}>✅</div>
        <h3 style={{fontFamily:"'Fraunces',serif",fontSize:26,color:T.t1,marginBottom:12,fontWeight:900}}>Application Sent!</h3>
        <p style={{fontSize:16,color:T.t2,marginBottom:32,lineHeight:1.6}}>Your interest has been shared with the brand. They will reach out via the platform if shortlisted.</p>
        <Btn lg onClick={()=>{setModal(null);setDone(false)}} style={{borderRadius:16,padding:'16px 40px'}}>Browse More Deals</Btn>
      </div>:<div>
        <div style={{background:T.bg2,borderRadius:20,padding:'24px',marginBottom:28,border:`1px solid ${T.bd}`}}>
          <p style={{fontSize:12,fontWeight:900,color:T.gd,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Campaign Detail</p>
          <p style={{fontSize:18,fontWeight:800,color:T.t1}}>{typeof modal?.brand === 'object' && modal.brand ? modal.brand.companyName : modal?.brand}</p>
          <p style={{fontSize:15,color:T.t3,marginTop:6,display:'flex',alignItems:'center',gap:6}}>💰 Budget: <span style={{color:T.ok,fontWeight:900}}>{fmt.inr(modal?.budgetMin)} - {fmt.inr(modal?.budgetMax)}</span></p>
          {modal?.deliverables&&<div style={{marginTop:16,display:'flex',gap:8,flexWrap:'wrap'}}>{modal.deliverables.map(d=><Bdg key={d} sm color="gray">{d}</Bdg>)}</div>}
        </div>
        <Fld label="Why are you a good fit? *" value={aF.pitch} onChange={e=>setAF(p=>({...p,pitch:e.target.value}))} rows={5} placeholder="Share your content style, previous success, and why you love this brand." required/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <Fld label="Expected Rate (₹)" type="number" value={aF.rate} onChange={e=>setAF(p=>({...p,rate:e.target.value}))} placeholder="15000"/>
          <Fld label="Portfolio Link" value={aF.portfolio} onChange={e=>setAF(p=>({...p,portfolio:e.target.value}))} placeholder="URL to past work"/>
        </div>
        <Btn full lg onClick={submitApply} style={{height:56,borderRadius:16,marginTop:12,fontSize:17}}>Submit Application 🚀</Btn>
      </div>}
    </Modal>
  </PL>;
}

// PRICING PAGE
function PricingPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p)=>{dsp({t:'GO',p});scrollToTop()};
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  const[faq,setFaq]=useState(null);
  
  const plans=[
    {id:'free',name:'Starter',price:'Free',period:'forever',highlight:false,desc:'Perfect for new creators starting their journey.',features:['Basic creator profile','City-based discovery','Apply to 1 campaign/month','Basic analytics'],cta:'Get Started Free',onClick:()=>go('apply')},
    {id:'pro',name:'Creator Pro',price:'₹49',period:'one-time',highlight:true,desc:'Unlock your full potential with priority access.',features:['Professional portfolio builder','Priority search placement','Unlimited campaign applications','Auto-generated SEO article','Verified blue badge','Advanced audience analytics','Direct brand messaging'],cta:'Get Creator Pro',onClick:()=>{
      if(!st.user||st.role!=='creator'){go('apply');return}
      if(typeof Razorpay==='undefined'){toast('Razorpay not loaded. Pro activated! (test mode)','info');LS.update('cb_creators',st.creatorProfile?.id,{pro:true});dsp({t:'SET_CP',p:{...st.creatorProfile,pro:true}});return}
      const rzp=new Razorpay({key:'rzp_test_placeholder',amount:4900,currency:'INR',name:'CreatorBharat',description:'Creator Pro -- Lifetime',handler:()=>{LS.update('cb_creators',st.creatorProfile?.id,{pro:true});dsp({t:'SET_CP',p:{...st.creatorProfile,pro:true}});toast('Creator Pro activated!','success')},theme:{color:T.gd}});rzp.open()}},
    {id:'proplus',name:'Agency Hub',price:'₹299',period:'per month',highlight:false,desc:'For serious creators and talent agencies.',features:['Everything in Pro','Homepage featured placement','WhatsApp deal alerts','Revenue tracking dashboard','Custom profile URL','Dedicated account support'],cta:'Go Agency Hub',onClick:()=>{
      if(!st.user||st.role!=='creator'){go('apply');return}
      toast('Agency Hub coming soon!','info')}},
  ];

  const faqs=[['Is it really a one-time payment?','Yes. The ₹49 for Creator Pro is a one-time fee for lifetime access. No subscriptions or hidden renewals.'],['How do brands find me?','Brands use our discovery engine to filter by city, niche, and platform. Pro profiles appear at the top of these results.'],['What is the CS Score?','It is our proprietary algorithm that ranks creators based on profile completeness, engagement, and consistency.'],['Can I upgrade later?','Absolutely. You can start with a free profile and upgrade to Pro whenever you are ready to scale.']];

  return <PL>
    <div style={{background:T.n8,padding:mob?'60px 20px':'100px 20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 50% 50%, rgba(255,148,49,0.15) 0%, transparent 70%)'}}/>
      <div style={W(800)}><SH eyebrow="Investment" title="Build Your Career" sub="Simple, transparent pricing to help you monetize your influence." light center mb={0}/></div>
    </div>

    <div style={{padding:mob?'40px 20px':'80px 20px',background:'#fff'}}>
      <div style={W()}>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:32,alignItems:'stretch'}}>
          {plans.map(plan=><div key={plan.id} style={{borderRadius:32,border:`2px solid ${plan.highlight?T.gd:T.bd}`,padding:32,background:plan.highlight?T.ga:'#fff',position:'relative',display:'flex',flexDirection:'column',transition:'transform .3s ease'}} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-8px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
            {plan.highlight&&<div style={{position:'absolute',top:-16,left:'50%',transform:'translateX(-50%)',background:T.gd,color:'#fff',fontSize:12,fontWeight:900,padding:'6px 20px',borderRadius:20,letterSpacing:'.05em',boxShadow:T.sh2}}>MOST POPULAR</div>}
            <h3 style={{fontSize:18,fontWeight:900,color:T.t1,marginBottom:8}}>{plan.name}</h3>
            <p style={{fontSize:14,color:T.t3,marginBottom:24,lineHeight:1.5}}>{plan.desc}</p>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:44,fontWeight:900,color:plan.highlight?T.gd:T.t1,marginBottom:32}}>{plan.price}<span style={{fontSize:16,fontWeight:600,color:T.t4,fontFamily:'inherit'}}> / {plan.period}</span></div>
            <div style={{flex:1}}>
              {plan.features.map(f=><div key={f} style={{display:'flex',gap:12,marginBottom:16,fontSize:15,color:T.t2,fontWeight:500}}><span style={{color:T.ok,fontWeight:900}}>✓</span>{f}</div>)}
            </div>
            <Btn full lg variant={plan.highlight?'primary':'outline'} style={{marginTop:32,borderRadius:16,height:56,fontSize:16}} onClick={plan.onClick}>{plan.cta}</Btn>
          </div>)}
        </div>
      </div>
    </div>

    <div style={{padding:mob?'60px 20px':'100px 20px',background:T.bg2}}>
      <div style={W(760)}>
        <SH eyebrow="FAQ" title="Your Questions Answered" center mb={48}/>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {faqs.map(([q,a],i)=><Card key={i} style={{padding:0,overflow:'hidden'}}>
            <button onClick={()=>setFaq(faq===i?null:i)} style={{width:'100%',padding:'24px',background:'none',border:'none',textAlign:'left',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,fontFamily:'inherit'}}>
              <span style={{fontSize:16,fontWeight:800,color:T.t1}}>{q}</span>
              <span style={{color:T.gd,fontSize:24,transition:'transform .3s',transform:faq===i?'rotate(45deg)':'none'}}>+</span>
            </button>
            {faq===i&&<div style={{padding:'0 24px 24px'}}><p style={{fontSize:15,color:T.t2,lineHeight:1.7,fontWeight:500}}>{a}</p></div>}
          </Card>)}
        </div>
      </div>
    </div>
  </PL>;
}


// LEADERBOARD
function LeaderboardPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const[niche,setNiche]=useState('');const[period,setPeriod]=useState('all');
  const go=(p,sel)=>{dsp({t:'GO',p,sel});scrollToTop()};
  const[allC,setAllC]=useState([]);
  useEffect(()=>{apiCall('/creators?limit=100').then(d=>setAllC(d.creators||[])).catch(console.error)},[]);
  const niches=[...new Set(allC.flatMap(c=>Array.isArray(c.niche)?c.niche:[c.niche]).filter(Boolean))].sort();
  const filtered=(niche?allC.filter(c=>{const cn=Array.isArray(c.niche)?c.niche:[c.niche];return cn.includes(niche)}):allC).sort((a,b)=>(b.score||fmt.score(b))-(a.score||fmt.score(a)));
  const top3=filtered.slice(0,3);const rest=filtered.slice(3);
  const medalColors=['#FFD700','#C0C0C0','#CD7F32'];
  const medals=['🥇','🥈','🥉'];

  return <PL>
    <div style={{background:T.n8,padding:mob?'60px 20px':'100px 20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 50% 120%, rgba(255,148,49,0.1) 0%, transparent 60%)'}}/>
      <div style={W()}>
        <SH eyebrow="Elite" title="Creator Leaderboard" sub="Celebrating the most influential voices across Bharat." light center mb={40}/>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:24}}>
          {['all','weekly','monthly'].map(p=><button key={p} onClick={()=>setPeriod(p)} style={{padding:'10px 24px',borderRadius:30,border:`1.5px solid ${period===p?T.gd:'rgba(255,255,255,0.1)'}`,background:period===p?T.gd:'rgba(255,255,255,0.05)',color:'#fff',fontSize:14,fontWeight:800,cursor:'pointer',fontFamily:'inherit',textTransform:'capitalize',transition:'all .3s'}}>{p==='all'?'All Time':p}</button>)}
        </div>
        <select value={niche} onChange={e=>setNiche(e.target.value)} style={{padding:'12px 24px',borderRadius:12,border:'1px solid rgba(255,255,255,0.1)',fontSize:14,background:'rgba(255,255,255,0.05)',color:'#fff',fontFamily:'inherit',outline:'none'}}>
          <option value="" style={{background:T.n8}}>All Niches</option>
          {niches.map(n=><option key={n} value={n} style={{background:T.n8}}>{n}</option>)}
        </select>
      </div>
    </div>

    <div style={{padding:mob?'40px 20px':'80px 20px',background:T.bg2}}>
      <div style={W()}>
        {top3.length>0&&<div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:24,marginBottom:64,alignItems:'end'}}>
          {[1,0,2].map(idx=>{
            const c=top3[idx]; if(!c)return null;
            const score=c.score||fmt.score(c);
            const img=c.photo||c.avatarUrl||`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=FF9431&color=fff`;
            return <div key={c.id} onClick={()=>go('creator-profile',{creator:c})} style={{textAlign:'center',padding:'40px 24px',borderRadius:32,background:'#fff',boxShadow:T.sh3,border:`2px solid ${medalColors[idx]}40`,cursor:'pointer',position:'relative',order:mob?idx:undefined}} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-10px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              <div style={{fontSize:48,position:'absolute',top:-24,left:'50%',transform:'translateX(-50%)',filter:'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'}}>{medals[idx]}</div>
              <img src={img} style={{width:idx===0?120:100,height:idx===0?120:100,borderRadius:idx===0?40:32,objectFit:'cover',border:`4px solid ${medalColors[idx]}`,margin:'0 auto 20px',boxShadow:T.sh2}} alt={c.name}/>
              <h3 style={{fontFamily:"'Fraunces',serif",fontSize:idx===0?24:20,color:T.t1,marginBottom:4,fontWeight:900}}>{c.name}</h3>
              <p style={{fontSize:14,color:T.t3,marginBottom:20,fontWeight:600}}>{c.city}</p>
              <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'8px 16px',background:T.bg2,borderRadius:12,border:`1px solid ${T.bd}`}}>
                <span style={{fontSize:20,fontWeight:900,color:T.gd}}>{score}</span>
                <span style={{fontSize:10,fontWeight:800,color:T.t4,textTransform:'uppercase',letterSpacing:'.05em'}}>CS Score</span>
              </div>
            </div>;
          })}
        </div>}

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {rest.map((c,i)=>{
            const score=c.score||fmt.score(c);
            const img=c.photo||c.avatarUrl||`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=FF9431&color=fff`;
            return <Card key={c.id} onClick={()=>go('creator-profile',{creator:c})} style={{padding:'20px 32px',display:'flex',alignItems:'center',gap:24,border:`1px solid ${T.bd}`,transition:'all .2s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gd;e.currentTarget.style.background=T.ga}}>
              <span style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:T.t4,minWidth:40}}>#{i+4}</span>
              <img src={img} style={{width:56,height:56,borderRadius:16,objectFit:'cover',flexShrink:0}} alt={c.name}/>
              <div style={{flex:1}}>
                <p style={{fontWeight:800,color:T.t1,fontSize:16}}>{c.name}</p>
                <p style={{fontSize:13,color:T.t3,marginTop:2}}>{c.city} &bull; {(Array.isArray(c.niche)?c.niche:[c.niche]).filter(Boolean).slice(0,2).join(', ')}</p>
              </div>
              <div style={{textAlign:'right',marginRight:24}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:T.gd}}>{score}</div>
                <div style={{fontSize:10,color:T.t4,fontWeight:800,textTransform:'uppercase'}}>Points</div>
              </div>
              {c.verified&&<div style={{width:24,height:24,borderRadius:'50%',background:'#3B82F6',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12}}>✓</div>}
            </Card>;
          })}
        {filtered.length===0&&<Empty icon="🏆" title="No creators yet" sub="Be the first on the leaderboard!" ctaLabel="Get Listed" onCta={()=>go('apply')}/>}
      </div>
      </div>
    </div>
  </PL>;
}

// RATE CALCULATOR
function RateCalcPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p)=>{dsp({t:'GO',p});scrollToTop()};
  const[F,setF]=useState({platform:'Instagram',followers:'',niche:'Lifestyle',er:''});
  const[result,setResult]=useState(null);
  const upF=(k,v)=>setF(p=>({...p,[k]:v}));
  
  const calc=()=>{
    const f=Number(F.followers)||0,er=Number(F.er)||0;
    if(!f||!er){dsp({t:'TOAST',d:{type:'error',msg:'Enter followers and engagement rate'}});return}
    const pmult={Instagram:1.0,YouTube:1.8,LinkedIn:1.4,Twitter:0.6}[F.platform]||1;
    const nmult={Finance:1.6,Tech:1.5,Fashion:1.2,Travel:1.1,Gaming:1.3,Beauty:1.2}[F.niche]||1.0;
    const ebonus=er>=8?1.4:er>=5?1.2:1.0;
    const base=f*0.01;
    const post=Math.round(base*pmult*nmult*ebonus/100)*100;
    setResult({post,reel:Math.round(post*1.5/100)*100,story:Math.round(post*0.4/100)*100,video:Math.round(post*2.5/100)*100,base:Math.round(base),pmult,nmult,ebonus});
  };

  return <PL>
    <div style={{background:T.n8,padding:mob?'60px 20px':'100px 20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.1) 0%, transparent 60%)'}}/>
      <div style={W(800)}><SH eyebrow="Analytics Tool" title="Rate Calculator" sub="Know your worth. Calculate fair market rates based on real-world data." light center mb={0}/></div>
    </div>

    <div style={{padding:mob?'40px 20px':'80px 20px',background:T.bg2}}>
      <div style={{...W(900),display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1.2fr',gap:32,alignItems:'start'}}>
        <Card style={{padding:32}}>
          <h3 style={{fontSize:18,fontWeight:900,color:T.t1,marginBottom:24,display:'flex',alignItems:'center',gap:10}}>📊 Your Stats</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
            <Fld label="Platform" value={F.platform} onChange={e=>upF('platform',e.target.value)} options={['Instagram','YouTube','LinkedIn','Twitter']}/>
            <Fld label="Niche" value={F.niche} onChange={e=>upF('niche',e.target.value)} options={['Lifestyle','Fashion','Tech','Gaming','Travel','Food','Finance','Beauty','Fitness','Education']}/>
            <Fld label="Followers" type="number" value={F.followers} onChange={e=>upF('followers',e.target.value)} placeholder="e.g. 50000" required/>
            <Fld label="Eng. Rate %" type="number" value={F.er} onChange={e=>upF('er',e.target.value)} placeholder="e.g. 4.5" required/>
          </div>
          <Btn full lg onClick={calc} style={{height:56,borderRadius:16,fontSize:16}}>Estimate My Rate 🚀</Btn>
          <p style={{fontSize:12,color:T.t3,marginTop:20,textAlign:'center',lineHeight:1.5}}>* Rates are estimates based on average market data for Indian creators in 2026.</p>
        </Card>

        <div>
          {result ? <div className="si">
            <h3 style={{fontSize:18,fontWeight:900,color:T.t1,marginBottom:24}}>Estimated Earnings</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:32}}>
              {[
                {l:'Static Post',v:result.post,i:'📸'},
                {l:'Reel / Short',v:result.reel,i:'🎬'},
                {l:'Story (Set)',v:result.story,i:'📱'},
                {l:'Long Video',v:result.video,i:'📺'}
              ].map(item=><Card key={item.l} style={{padding:24,textAlign:'center',border:`1px solid ${T.bd}`}}>
                <div style={{fontSize:24,marginBottom:8}}>{item.i}</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,color:T.gd}}>{fmt.inr(item.v)}</div>
                <div style={{fontSize:12,color:T.t4,fontWeight:800,textTransform:'uppercase',letterSpacing:'.05em',marginTop:4}}>{item.l}</div>
              </Card>)}
            </div>
            
            <div style={{background:T.ga,borderRadius:20,padding:24,border:`1px solid ${T.gab}`,marginBottom:32}}>
              <h4 style={{fontSize:14,fontWeight:900,color:T.gd,marginBottom:12,textTransform:'uppercase'}}>Why this rate?</h4>
              <p style={{fontSize:14,color:T.t2,lineHeight:1.6}}>Your high engagement rate ({F.er}%) gives you a <strong>{(result.ebonus-1)*100}% bonus</strong> over average creators. {F.platform} in the {F.niche} niche is currently in high demand.</p>
            </div>

            <Card style={{padding:32,background:T.n8,color:'#fff',textAlign:'center'}}>
              <h3 style={{fontSize:20,fontWeight:900,marginBottom:12}}>Ready to get these deals?</h3>
              <p style={{fontSize:14,color:'rgba(255,255,255,0.7)',marginBottom:24}}>Brands are searching for creators like you. Get listed and start earning.</p>
              <Btn lg variant="primary" onClick={()=>go('apply')} style={{borderRadius:14}}>Create Professional Portfolio</Btn>
            </Card>
          </div> : <div style={{height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40,background:'rgba(0,0,0,0.02)',borderRadius:32,border:`2px dashed ${T.bd}`,textAlign:'center'}}>
            <div style={{fontSize:64,marginBottom:24,opacity:0.2}}>🧮</div>
            <h3 style={{fontSize:20,color:T.t3,fontWeight:700}}>Enter your stats to see the magic.</h3>
          </div>}
        </div>
      </div>
    </div>
  </PL>;
}

// CREATOR SCORE PAGE
function CreatorScorePage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p)=>{dsp({t:'GO',p});scrollToTop()};
  const c=st.creatorProfile;
  const score=c?fmt.score(c):0;
  const tier=fmt.tier(score);
  const comp=c?fmt.completeness(c):{pct:0,missing:[]};

  return <PL>
    <div style={{background:T.n8,padding:mob?'60px 20px':'100px 20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.1) 0%, transparent 60%)'}}/>
      <div style={W(800)}><SH eyebrow="Algorithms" title="Creator Score (CS)" sub="The industry standard for measuring creator influence in Bharat." light center mb={0}/></div>
    </div>

    <div style={{padding:mob?'40px 20px':'80px 20px',background:T.bg2}}>
      <div style={W(900)}>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1.5fr',gap:32,alignItems:'start'}}>
          <div style={{position:'sticky',top:100}}>
            <Card style={{padding:40,textAlign:'center',background:'#fff',boxShadow:T.sh3}}>
              <p style={{fontSize:12,color:T.t4,fontWeight:900,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:24}}>Algorithm Output</p>
              <Ring score={score||85} size={140}/>
              <h3 style={{fontFamily:"'Fraunces',serif",fontSize:24,color:T.t1,marginTop:20,fontWeight:900}}>{c?c.name:'Demo Creator'}</h3>
              <p style={{fontSize:15,color:T.t3,marginBottom:24,fontWeight:600}}>{tier.label} Tier</p>
              
              {c && comp.missing.length > 0 && <div style={{background:T.ga,borderRadius:20,padding:20,textAlign:'left',border:`1px solid ${T.gab}`}}>
                <p style={{fontSize:13,fontWeight:900,color:T.gd,marginBottom:12}}>BOOST YOUR SCORE</p>
                {comp.missing.map(m=><p key={m} style={{fontSize:13,color:T.t2,marginBottom:6,display:'flex',gap:8}}><span>•</span>{m}</p>)}
              </div>}
              
              {!c && <Btn full lg onClick={()=>go('apply')} style={{marginTop:24,borderRadius:14}}>Calculate My Real Score</Btn>}
            </Card>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:24}}>
            <Card style={{padding:32}}>
              <h3 style={{fontSize:18,fontWeight:900,color:T.t1,marginBottom:20}}>How it works</h3>
              <p style={{fontSize:15,color:T.t2,lineHeight:1.7,marginBottom:24}}>The CS Score is a dynamic metric that evaluates your professional standing as a creator. It is not just about followers; it is about how much brands can trust your results.</p>
              <div style={{display:'flex',flexDirection:'column',gap:20}}>
                {[
                  {t:'Profile Authority',d:'Completeness of your portfolio, bio, and verified social links.',v:'40%'},
                  {t:'Growth & Reach',d:'Follower milestones across all platforms.',v:'30%'},
                  {t:'Engagement Velocity',d:'Interaction rates and audience sentiment analysis.',v:'30%'}
                ].map(item=><div key={item.t} style={{padding:'20px',background:T.bg2,borderRadius:16,border:`1px solid ${T.bd}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <span style={{fontWeight:800,color:T.t1}}>{item.t}</span>
                    <span style={{fontSize:13,fontWeight:900,color:T.gd}}>{item.v}</span>
                  </div>
                  <p style={{fontSize:13,color:T.t3,lineHeight:1.5}}>{item.d}</p>
                </div>)}
              </div>
            </Card>

            <Card style={{padding:32}}>
              <h3 style={{fontSize:18,fontWeight:900,color:T.t1,marginBottom:20}}>Score Tiers</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {[
                  {t:'Rising',r:'0-50',c:'#94A3B8',d:'Building foundational presence.'},
                  {t:'Silver',r:'51-75',c:'#64748B',d:'Established consistent content.'},
                  {t:'Gold',r:'76-90',c:'#D97706',d:'Strong engagement and brand trust.'},
                  {t:'Platinum',r:'91-100',c:'#1E293B',d:'Elite status with high ROI.'}
                ].map(item=><div key={item.t} style={{padding:20,borderRadius:20,border:`2px solid ${item.c}20`,background:`${item.c}05`}}>
                  <p style={{fontWeight:900,color:item.c,fontSize:18,fontFamily:"'Fraunces',serif"}}>{item.t}</p>
                  <p style={{fontSize:13,fontWeight:800,color:T.t1,margin:'4px 0'}}>{item.r} Points</p>
                  <p style={{fontSize:12,color:T.t3,lineHeight:1.4}}>{item.d}</p>
                </div>)}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </PL>;
}

// ABOUT PAGE
function AboutPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p)=>{dsp({t:'GO',p});scrollToTop()};
  
  return <PL>
    <div style={{background:T.n8,padding:mob?'100px 20px':'160px 20px',textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(circle at 50% 50%, rgba(255,148,49,0.2) 0%, transparent 70%)'}}/>
      <div style={{position:'absolute',width:'100%',height:'100%',top:0,left:0,opacity:0.05,pointerEvents:'none',backgroundImage:'url("https://www.transparenttextures.com/patterns/cubes.png")'}}/>
      
      <div style={{...W(900),position:'relative',zIndex:1}}>
        <p className="au" style={{fontSize:14,fontWeight:900,letterSpacing:'.2em',textTransform:'uppercase',color:T.gd,marginBottom:24}}>Our Vision</p>
        <h1 className="au d1" style={{fontFamily:"'Fraunces',serif",fontSize:mob?'clamp(40px,10vw,64px)':'clamp(56px,6vw,84px)',fontWeight:900,color:'#fff',lineHeight:1,marginBottom:32,letterSpacing:'-0.03em'}}>Chhote Creators Ki<br/><span style={{background:`linear-gradient(90deg, ${T.gd}, #FFB267)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Badi Awaaz</span></h1>
        <p className="au d2" style={{fontSize:mob?18:22,color:'rgba(255,255,255,0.7)',lineHeight:1.6,maxWidth:800,margin:'0 auto',fontWeight:500}}>Empowering Bharat's authentic voices. From Tier 2 towns to national recognition, we are building the definitive infrastructure for the next generation of influence.</p>
      </div>
    </div>

    <div style={{padding:mob?'80px 20px':'120px 20px',background:'#fff'}}>
      <div style={W()}>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1.2fr',gap:64,alignItems:'center',marginBottom:100}}>
          <div>
            <SH eyebrow="The Problem" title="Bridging the Gap" mb={32}/>
            <p style={{fontSize:17,color:T.t2,lineHeight:1.8,marginBottom:24,fontWeight:500}}>India's creator economy is massive, but it is deeply unequal. While metro creators get all the attention, <strong>70% of Bharat's talent</strong> resides in smaller cities, creating content in regional languages for hyper-local audiences.</p>
            <p style={{fontSize:17,color:T.t2,lineHeight:1.8,fontWeight:500}}>Brands want to reach these audiences but don't know how to find trusted, professional creators in cities like Jaipur, Indore, or Kanpur. We are here to fix that.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
            {[
              {v:'2026',l:'Founded in Jaipur',i:'🏯'},
              {v:'2,400+',l:'Creators Verified',i:'💎'},
              {v:'340+',l:'Brand Partners',i:'🤝'},
              {v:'50+',l:'Cities Mapped',i:'📍'}
            ].map(item=><div key={item.l} style={{textAlign:'center',padding:'40px 24px',background:T.bg2,borderRadius:32,border:`1px solid ${T.bd}`,transition:'all .3s'}} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-8px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              <div style={{fontSize:32,marginBottom:12}}>{item.i}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:36,fontWeight:900,color:T.gd}}>{item.v}</div>
              <div style={{fontSize:14,color:T.t3,fontWeight:800,textTransform:'uppercase',letterSpacing:'.05em',marginTop:8}}>{item.l}</div>
            </div>)}
          </div>
        </div>

        <div style={{textAlign:'center',background:T.n8,borderRadius:48,padding:mob?'48px 24px':'100px 48px',color:'#fff',position:'relative',overflow:'hidden'}}>
           <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(135deg, rgba(255,148,49,0.1), transparent)'}}/>
           <SH eyebrow="Values" title="What Drives Us" center light mb={64}/>
           <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(3,1fr)',gap:40,position:'relative',zIndex:1}}>
             {[
               {t:'Authenticity First',d:'We prioritize real influence over vanity metrics. Every creator on our platform is verified for quality.'},
               {t:'Hyper-Local Reach',d:'We believe the future of marketing is local. We make it easy for brands to enter every corner of India.'},
               {t:'Creator Prosperity',d:'Our tools (Portfolio, SEO Articles, Rate Calc) are designed to help creators professionalize and earn more.'}
             ].map(v=><div key={v.t}>
               <h4 style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:900,marginBottom:16,color:T.gd}}>{v.t}</h4>
               <p style={{fontSize:16,color:'rgba(255,255,255,0.7)',lineHeight:1.7}}>{v.d}</p>
             </div>)}
           </div>
        </div>
      </div>
    </div>

    <div style={{padding:mob?'60px 20px':'80px 20px',background:T.bg2}}>
      <div style={W()}>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(4,1fr)',gap:20,marginBottom:64}}>
          {[{icon:'🌍',t:'Local First',d:'We celebrate regional creators, regional languages, and regional audiences.'},
            {icon:'🤝',t:'Creator-First',d:'Every decision we make starts with "how does this help the creator?"'},
            {icon:'📊',t:'Data-Driven',d:'We believe in transparency -- clear metrics, honest scores, real analytics.'},
            {icon:'💡',t:'Access for All',d:'₹49 removes the barrier to professional representation. Forever.'}
          ].map(v=><div key={v.t} style={{textAlign:'center',padding:'24px 16px',borderRadius:14,background:'#fff',border:`1px solid ${T.bd}`}}><div style={{fontSize:32,marginBottom:12}}>{v.icon}</div><h4 style={{fontFamily:"'Fraunces',serif",fontSize:17,color:T.n8,marginBottom:8}}>{v.t}</h4><p style={{fontSize:13,color:T.t2,lineHeight:1.6}}>{v.d}</p></div>)}
        </div>
        <div style={{background:T.n8,borderRadius:24,padding:mob?'32px':'48px',display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:32,alignItems:'center'}}>
          <div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:mob?24:32,color:'#fff',marginBottom:12}}>Based in Jaipur,<br/>Building for Bharat</h3><p style={{fontSize:14,color:'rgba(255,255,255,.65)',lineHeight:1.7,marginBottom:20}}>CreatorBharat Technologies Pvt. Ltd. is headquartered in Jaipur, Rajasthan. We're a team of creators, marketers, and technologists who believe India's creator economy belongs to all of India -- not just the metros.</p><p style={{fontSize:13,color:'rgba(255,255,255,.45)'}}>📍 Jaipur, Rajasthan 302001<br/>✉ hello@creatorbharat.in<br/>📱 @creatorbharat</p></div>
          <div><Btn full variant="white" style={{marginBottom:12}} onClick={()=>go('apply')}>Join as Creator</Btn><Btn full variant="ghost" style={{color:'rgba(255,255,255,.8)',border:'1.5px solid rgba(255,255,255,.2)'}} onClick={()=>go('contact')}>Contact Us</Btn></div>
        </div>
      </div>
    </div>
  </PL>;
}

// CONTACT PAGE
function ContactPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  const[F,setF]=useState({name:'',email:'',type:'Creator',subject:'',message:''});
  const[sent,setSent]=useState(false);const[loading,setLoading]=useState(false);
  const upF=(k,v)=>setF(p=>({...p,[k]:v}));
  const submit=()=>{
    if(!F.name||!F.email||!F.message){toast('Fill all required fields','error');return}
    setLoading(true);
    setTimeout(()=>{
      LS.push('cb_contacts',{...F,id:'c-'+Date.now(),date:new Date().toISOString()});
      setSent(true);setLoading(false);
      toast('Message sent! We will reply within 24 hours.','success');
    },600);
  };
  return <PL>
    <div style={{background:T.n8,padding:mob?'40px 20px':'56px 20px'}}>
      <div style={W()}><SH eyebrow="Get In Touch" title="Contact Us" sub="Questions, partnerships, or just want to say hi -- we'd love to hear from you." light mb={0}/></div>
    </div>
    <div style={{padding:mob?'40px 20px':'64px 20px'}}>
      <div style={W()}>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1.5fr 1fr',gap:40}}>
          {sent?<div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{fontSize:52,marginBottom:16}}>✅</div>
            <h3 style={{fontFamily:"'Fraunces',serif",fontSize:24,color:T.n8,marginBottom:8}}>Message Sent!</h3>
            <p style={{fontSize:14,color:T.t2}}>We typically reply within 24 hours. Check hello@creatorbharat.in.</p>
          </div>:<div>
            <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:14,marginBottom:0}}>
              <Fld label="Your Name *" value={F.name} onChange={e=>upF('name',e.target.value)} placeholder="Ravi Kumar" required/>
              <Fld label="Email *" type="email" value={F.email} onChange={e=>upF('email',e.target.value)} placeholder="ravi@email.com" required/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:14}}>
              <Fld label="I am a..." value={F.type} onChange={e=>upF('type',e.target.value)} options={['Creator','Brand','Investor','Press','Other']}/>
              <Fld label="Subject" value={F.subject} onChange={e=>upF('subject',e.target.value)} placeholder="Subject"/>
            </div>
            <Fld label="Message *" value={F.message} onChange={e=>upF('message',e.target.value)} rows={5} placeholder="Your message..." required/>
            <Btn full lg loading={loading} onClick={submit}>Send Message</Btn>
          </div>}
          <div>
            {[{icon:'✉',t:'Email',d:'hello@creatorbharat.in'},{icon:'📱',t:'Instagram',d:'@creatorbharat'},{icon:'🐦',t:'Twitter',d:'@creatorbharat'},{icon:'📍',t:'Location',d:'Jaipur, Rajasthan 302001'}].map(item=><div key={item.t} style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:24}}><div style={{width:40,height:40,borderRadius:10,background:T.ga,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{item.icon}</div><div><p style={{fontWeight:700,color:T.n8,fontSize:14}}>{item.t}</p><p style={{fontSize:13,color:T.t2,marginTop:2}}>{item.d}</p></div></div>)}
          </div>
        </div>
      </div>
    </div>
  </PL>;
}


// APPLY PAGE (4-step creator registration)
function ApplyPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p)=>{dsp({t:'GO',p});scrollToTop()};
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  const[step,setStep]=useState(1);
  const[F,setF]=useState({name:'',handle:'',email:'',password:'',confirm:'',phone:'',city:'',state:'',niche:[],platform:[],followers:'',er:'',monthlyViews:'',bio:'',instagram:'',youtube:'',rateMin:'',rateMax:'',services:[],languages:[],photo:null});
  const upF=(k,v)=>setF(p=>({...p,[k]:v}));
  const toggleArr=(k,v)=>setF(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));
  const NICHES=['Travel','Lifestyle','Fashion','Beauty','Tech','Gaming','Food','Cooking','Fitness','Education','Finance','Entertainment','Comedy','Music','Art','Photography'];
  const PLATFORMS=['Instagram','YouTube','Twitter','LinkedIn'];
  const SERVICES=['Sponsored Posts','Instagram Reels','YouTube Videos','Stories','Unboxing','Product Reviews','GRWM','Travel Vlogs','Tech Reviews','Recipe Videos','Food Photography'];
  const LANGUAGES=['Hindi','English','Tamil','Telugu','Marathi','Bengali','Kannada','Malayalam','Punjabi'];
  const CITIES=['Jaipur','Mumbai','Delhi','Bengaluru','Chennai','Hyderabad','Kolkata','Pune','Kochi','Chandigarh','Ahmedabad','Surat','Lucknow','Patna','Bhopal','Indore','Vadodara','Nagpur','Coimbatore','Mysuru','Other'];

  const next=()=>{
    if(step===1){
      if(!F.name||!F.email||!F.password||!F.city){toast('Fill all required fields','error');return}
      if(F.password!==F.confirm){toast('Passwords do not match','error');return}
      if(F.password.length<6){toast('Password must be 6+ characters','error');return}
      if(!F.handle){upF('handle',fmt.handle(F.name))}
      const existing=LS.get('cb_creators',[]).find(c=>c.email===F.email);
      if(existing){toast('Email already registered. Please login.','error');return}
      const handleTaken=LS.get('cb_creators',[]).find(c=>c.handle===(F.handle||fmt.handle(F.name)));
      if(handleTaken){toast('Handle already taken. Try another.','error');return}
    }
    if(step===2){if(!F.niche.length||!F.platform.length||!F.followers){toast('Fill niche, platform and followers','error');return}}
    if(step===3){if(!F.rateMin){toast('Set your minimum rate','error');return}}
    setStep(s=>s+1);scrollToTop();
  };

  const submit=async ()=>{
    const handle=F.handle||fmt.handle(F.name);
    try {
      const data=await apiCall('/auth/register/creator',{method:'POST',body:{...F,handle}});
      localStorage.setItem('cb_token',data.token);
      const newCreator=data.user;
      SS.set({id:newCreator.id,role:'creator',email:newCreator.email,name:newCreator.name});
      dsp({t:'LOGIN',u:newCreator,role:'creator'});
      dsp({t:'SET_CP',p:newCreator});
      dsp({t:'NOTIF',n:{msg:`Profile live! Share it: creatorbharat.in/c/${handle}`,time:'Just now',read:false}});
      toast(`Welcome to CreatorBharat! Your profile is live.`,'success');
      dsp({t:'GO',p:'dashboard'});scrollToTop();
    } catch(err) {
      toast(err.message,'error');
    }
  };

  const steps=[['Basic Info','Name, email, city'],['Creator Details','Niche, platform, stats'],['Rates & Services','What you offer'],['Preview','Review & launch']];
  const article=step===4?fmt.article({...F,handle:F.handle||fmt.handle(F.name)}):null;

  return <PL noFooter>
    <div style={{minHeight:'100vh',display:'grid',gridTemplateColumns:mob?'1fr':'400px 1fr'}}>
      {/* Left panel */}
      {!mob&&<div style={{background:T.n9,padding:'48px 40px',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:48}}>
          <div style={{width:32,height:32,borderRadius:8,background:T.gd,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff'}}>CB</div>
          <span style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:900,color:'#fff'}}>Creator<span style={{color:T.gd}}>Bharat</span></span>
        </div>
        <div style={{flex:1}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:28,color:'#fff',marginBottom:12,lineHeight:1.2}}>Apni Creator Identity Banao</h2>
          <p style={{fontSize:14,color:'rgba(255,255,255,.55)',lineHeight:1.7,marginBottom:40}}>Professional portfolio + Auto SEO article + Shareable link -- Free</p>
          {steps.map(([t,d],i)=><div key={i} style={{display:'flex',gap:14,marginBottom:24,alignItems:'flex-start'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:i<step-1?T.ok:i===step-1?T.gd:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'#fff',flexShrink:0}}>{i<step-1?'✓':i+1}</div>
            <div><p style={{fontSize:13,fontWeight:700,color:i===step-1?'#fff':'rgba(255,255,255,.5)'}}>{t}</p><p style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:2}}>{d}</p></div>
          </div>)}
        </div>
        <p style={{fontSize:12,color:'rgba(255,255,255,.3)'}}>Your link: creatorbharat.in/c/{F.handle||fmt.handle(F.name||'yourname')}</p>
      </div>}
      {/* Right panel */}
      <div style={{padding:mob?'32px 20px':'48px 56px',overflowY:'auto'}}>
        <div style={{maxWidth:480}}>
          {mob&&<div style={{display:'flex',gap:8,marginBottom:32}}>{steps.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<step?T.gd:T.bg3}}/>)}</div>}
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:22,color:T.n8,marginBottom:6}}>{steps[step-1][0]}</h2>
          <p style={{fontSize:14,color:T.t3,marginBottom:28}}>Step {step} of 4 -- {steps[step-1][1]}</p>

          {step===1&&<div>
            <Fld label="Full Name *" value={F.name} onChange={e=>{upF('name',e.target.value);if(!F.handle)upF('handle',fmt.handle(e.target.value))}} placeholder="Rahul Sharma" required/>
            <Fld label="Creator Handle *" value={F.handle} onChange={e=>upF('handle',fmt.handle(e.target.value))} placeholder="rahul-sharma" helper={`Your link: creatorbharat.in/c/${F.handle||'your-handle'}`} required/>
            <Fld label="Email *" type="email" value={F.email} onChange={e=>upF('email',e.target.value)} placeholder="you@email.com" required/>
            <Fld label="Phone (WhatsApp)" value={F.phone} onChange={e=>upF('phone',e.target.value)} placeholder="+91 98765 43210"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <Fld label="City *" value={F.city} onChange={e=>upF('city',e.target.value)} options={['',... CITIES]} required/>
              <Fld label="State" value={F.state} onChange={e=>upF('state',e.target.value)} placeholder="Rajasthan"/>
            </div>
            <Fld label="Password *" type="password" value={F.password} onChange={e=>upF('password',e.target.value)} placeholder="Min 6 characters" required/>
            <Fld label="Confirm Password *" type="password" value={F.confirm} onChange={e=>upF('confirm',e.target.value)} placeholder="Repeat password" required/>
          </div>}

          {step===2&&<div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:T.t2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em'}}>Niche *</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{NICHES.map(n=><Chip key={n} label={n} active={F.niche.includes(n)} onClick={()=>toggleArr('niche',n)}/>)}</div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:T.t2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em'}}>Platform *</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{PLATFORMS.map(p=><Chip key={p} label={p} active={F.platform.includes(p)} onClick={()=>toggleArr('platform',p)}/>)}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <Fld label="Followers *" type="number" value={F.followers} onChange={e=>upF('followers',e.target.value)} placeholder="e.g. 50000" required/>
              <Fld label="Engagement Rate %" type="number" value={F.er} onChange={e=>upF('er',e.target.value)} placeholder="e.g. 4.5"/>
            </div>
            <Fld label="Monthly Views" type="number" value={F.monthlyViews} onChange={e=>upF('monthlyViews',e.target.value)} placeholder="e.g. 500000"/>
            <Fld label="Bio *" value={F.bio} onChange={e=>upF('bio',e.target.value)} rows={4} placeholder="Tell brands about yourself, your content style, and your audience..." required/>
            <Fld label="Instagram Handle" value={F.instagram} onChange={e=>upF('instagram',e.target.value)} placeholder="@yourhandle"/>
            <Fld label="YouTube Channel" value={F.youtube} onChange={e=>upF('youtube',e.target.value)} placeholder="Channel name or URL"/>
          </div>}

          {step===3&&<div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <Fld label="Min Rate ₹ *" type="number" value={F.rateMin} onChange={e=>upF('rateMin',e.target.value)} placeholder="e.g. 10000" required/>
              <Fld label="Max Rate ₹" type="number" value={F.rateMax} onChange={e=>upF('rateMax',e.target.value)} placeholder="e.g. 40000"/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:T.t2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em'}}>Services</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{SERVICES.map(s=><Chip key={s} label={s} active={F.services.includes(s)} onClick={()=>toggleArr('services',s)}/>)}</div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:T.t2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em'}}>Languages</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{LANGUAGES.map(l=><Chip key={l} label={l} active={F.languages.includes(l)} onClick={()=>toggleArr('languages',l)}/>)}</div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:12,fontWeight:700,color:T.t2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em'}}>Profile Photo</label>
              <input type="file" accept="image/*" onChange={e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>upF('photo',ev.target.result);reader.readAsDataURL(file)}} style={{fontSize:13,color:T.t2}}/>
              {F.photo&&<img src={F.photo} style={{width:60,height:60,borderRadius:'50%',objectFit:'cover',marginTop:10,border:`2px solid ${T.bd}`}} alt="Preview"/>}
            </div>
          </div>}

          {step===4&&article&&<div>
            <div style={{background:T.ga,border:`1px solid ${T.gab}`,borderRadius:12,padding:'14px 18px',marginBottom:20}}>
              <p style={{fontSize:11,fontWeight:700,color:T.gd,marginBottom:4}}>YOUR PROFILE LINK WILL BE:</p>
              <p style={{fontSize:14,fontFamily:'monospace',color:T.n8,fontWeight:600}}>creatorbharat.in/c/{F.handle||fmt.handle(F.name)}</p>
            </div>
            <div style={{background:T.bg2,borderRadius:14,padding:'20px',marginBottom:20,border:`1px solid ${T.bd}`}}>
              <Bdg sm color="blue">Auto-Generated Article Preview</Bdg>
              <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,color:T.n8,margin:'12px 0 12px',lineHeight:1.3}}>{article.title}</h3>
              {[article.p1,article.p2,article.p3].map((p,i)=><p key={i} style={{fontSize:13,color:T.t2,lineHeight:1.7,marginBottom:10}}>{p}</p>)}
            </div>
            <div style={{background:T.bg2,borderRadius:14,padding:'16px',marginBottom:20,border:`1px solid ${T.bd}`}}>
              <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:8}}>
                {F.photo?<img src={F.photo} style={{width:48,height:48,borderRadius:'50%',objectFit:'cover'}} alt=""/>:<div style={{width:48,height:48,borderRadius:'50%',background:T.gd,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700}}>{F.name.charAt(0)}</div>}
                <div><p style={{fontWeight:700,color:T.n8}}>{F.name}</p><p style={{fontSize:12,color:T.t3}}>{F.city} &bull; {F.niche.join(', ')}</p></div>
              </div>
              <div style={{display:'flex',gap:16}}>{[[fmt.num(Number(F.followers)),'Followers'],[F.er+'%','ER'],[fmt.inr(Number(F.rateMin)),'Min Rate']].map(([v,l])=><div key={l}><div style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:900,color:T.n8}}>{v}</div><div style={{fontSize:10,color:T.t3}}>{l}</div></div>)}</div>
            </div>
          </div>}

          <div style={{display:'flex',gap:12,marginTop:8}}>
            {step>1&&<Btn variant="ghost" onClick={()=>{setStep(s=>s-1);top()}}>Back</Btn>}
            {step<4?<Btn full lg onClick={next}>Continue →</Btn>:<Btn full lg onClick={submit}>Launch My Profile 🚀</Btn>}
          </div>
          {step===1&&<p style={{textAlign:'center',fontSize:13,color:T.t3,marginTop:16}}>Already registered? <button onClick={()=>dsp({t:'UI',v:{authModal:true,authTab:'login'}})} style={{background:'none',border:'none',color:T.gd,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>Login</button></p>}
        </div>
      </div>
    </div>
  </PL>;
}

// DASHBOARD (Creator)
function DashboardPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p,sel)=>{dsp({t:'GO',p,sel});scrollToTop()};
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  const c=st.creatorProfile;
  if(!st.user||st.role!=='creator'){return <PL><div style={{...W(),padding:'80px 20px'}}><Empty icon="🔒" title="Creator login required" ctaLabel="Login" onCta={()=>dsp({t:'UI',v:{authModal:true,authTab:'login'}})}/></div></PL>}
  const myApps=LS.get('cb_applications',[]).filter(a=>a.applicantEmail===st.user?.email);
  const score=c?fmt.score(c):0;const comp=c?fmt.completeness(c):{pct:0,missing:[]};
  const statusColor={applied:T.info,'under-review':T.wn,shortlisted:T.platinum,selected:T.ok,rejected:T.gd};
  return <PL>
    <div style={{background:T.n8,padding:mob?'32px 20px':'48px 20px'}}>
      <div style={W()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div>
            <p style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em'}}>Creator Dashboard</p>
            <h1 style={{fontFamily:"'Fraunces',serif",fontSize:mob?22:28,color:'#fff'}}>Welcome, {c?.name||st.user.name}</h1>
          </div>
          <Btn variant="ghost" style={{color:'rgba(255,255,255,.8)',borderColor:'rgba(255,255,255,.2)'}} onClick={()=>{if(c)go('creator-profile',{creator:c})}}>View Public Profile</Btn>
        </div>
      </div>
    </div>
    <div style={{padding:mob?'24px 20px':'36px 20px'}}>
      <div style={W()}>
        {/* Shareable link */}
        {c?.handle&&<div style={{background:'linear-gradient(135deg,'+T.gd+',#B91C1C)',borderRadius:16,padding:'20px 24px',marginBottom:24,display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:200}}>
            <p style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.7)',marginBottom:4,letterSpacing:'.05em'}}>YOUR CREATOR LINK</p>
            <p style={{fontSize:16,fontFamily:'monospace',color:'#fff',fontWeight:700}}>creatorbharat.in/c/{c.handle}</p>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Btn sm variant="white" onClick={()=>{const url=`https://creatorbharat.in/c/${c.handle}`;try{navigator.clipboard.writeText(url)}catch{const ta=document.createElement('textarea');ta.value=url;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta)}toast('Link copied!','success')}}>Copy Link</Btn>
            <Btn sm style={{color:'rgba(255,255,255,.9)',border:'1.5px solid rgba(255,255,255,.3)',background:'transparent'}} onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(`My CreatorBharat profile: https://creatorbharat.in/c/${c.handle}`)}`)}>Share</Btn>
          </div>
        </div>}
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:mob?'repeat(2,1fr)':'repeat(4,1fr)',gap:14,marginBottom:24}}>
          {[[myApps.length,'Applications Sent',T.info],[myApps.filter(a=>a.status==='shortlisted').length,'Shortlisted',T.platinum],[score,'Creator Score',T.gd],[comp.pct+'%','Profile Complete',T.ok]].map(([v,l,col])=><div key={l} style={{textAlign:'center',padding:'18px',background:'#fff',borderRadius:14,border:`1px solid ${T.bd}`,boxShadow:T.sh1}}><div style={{fontFamily:"'Fraunces',serif",fontSize:mob?22:28,fontWeight:900,color:col}}>{v}</div><div style={{fontSize:12,color:T.t3,marginTop:4}}>{l}</div></div>)}
        </div>
        {/* Profile completeness */}
        {comp.pct<100&&<Card style={{padding:'20px',marginBottom:24}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
            <h3 style={{fontWeight:700,color:T.n8,fontSize:15}}>Profile Completeness</h3>
            <Btn sm variant="ghost" onClick={()=>go('settings')}>Improve</Btn>
          </div>
          <Bar value={comp.pct} showPct height={10}/>
          {comp.missing.length>0&&<div style={{marginTop:14}}>{comp.missing.map(m=><p key={m} style={{fontSize:12,color:T.wn,marginTop:6}}>• {m}</p>)}</div>}
        </Card>}
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:20}}>
          {/* Quick actions */}
          <Card style={{padding:'20px'}}>
            <h3 style={{fontWeight:700,color:T.n8,fontSize:15,marginBottom:16}}>Quick Actions</h3>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[['Browse Campaigns','campaigns'],['Edit Profile','settings'],['View Leaderboard','leaderboard'],['Rate Calculator','rate-calc']].map(([l,p])=><Btn key={p} variant="ghost" onClick={()=>go(p)}>{l}</Btn>)}
            </div>
          </Card>
          {/* My applications */}
          <Card style={{padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <h3 style={{fontWeight:700,color:T.n8,fontSize:15}}>My Applications</h3>
              <Btn sm variant="text" onClick={()=>go('applications')}>View All</Btn>
            </div>
            {myApps.length===0?<p style={{fontSize:13,color:T.t3}}>No applications yet. Browse campaigns to apply!</p>:
            myApps.slice(0,3).map(a=><div key={a.id} style={{padding:'10px 0',borderBottom:`1px solid ${T.bg3}`}}>
              <p style={{fontSize:13,fontWeight:600,color:T.n8}}>{a.campaignTitle}</p>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                <p style={{fontSize:11,color:T.t3}}>{a.brand}</p>
                <Bdg sm color={a.status==='selected'?'green':a.status==='shortlisted'?'purple':a.status==='rejected'?'red':'blue'}>{a.status||'applied'}</Bdg>
              </div>
            </div>)}
          </Card>
        </div>
      </div>
    </div>
  </PL>;
}


// SETTINGS PAGE
function SettingsPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  const[tab,setTab]=useState('profile');
  const c=st.creatorProfile;
  const[F,setF]=useState({name:c?.name||'',bio:c?.bio||'',city:c?.city||'',state:c?.state||'',instagram:c?.instagram||'',youtube:c?.youtube||'',rateMin:c?.rateMin||'',rateMax:c?.rateMax||''});
  const upF=(k,v)=>setF(p=>({...p,[k]:v}));
  if(!st.user)return <PL><div style={{...W(),padding:'80px 20px'}}><Empty icon="🔒" title="Login required" ctaLabel="Login" onCta={()=>dsp({t:'UI',v:{authModal:true}})}/></div></PL>;
  const saveProfile=()=>{
    if(st.role==='creator'&&c){
      dsp({t:'UPD_CP',id:c.id,patch:F});
      toast('Profile saved!','success');
    }
  };
  return <PL>
    <div style={{background:T.n8,padding:mob?'32px 20px':'48px 20px'}}>
      <div style={W(800)}><SH eyebrow="Account" title="Settings" light mb={0}/></div>
    </div>
    <div style={{padding:mob?'24px 20px':'40px 20px'}}>
      <div style={W(800)}>
        <Tabs tabs={[['profile','Profile'],['account','Account'],['privacy','Privacy'],['notifications','Notifications']]} active={tab} onChange={setTab}/>
        {tab==='profile'&&<Card style={{padding:'28px'}}>
          <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,color:T.n8,marginBottom:20}}>Edit Profile</h3>
          <Fld label="Full Name" value={F.name} onChange={e=>upF('name',e.target.value)}/>
          <Fld label="Bio" value={F.bio} onChange={e=>upF('bio',e.target.value)} rows={4} placeholder="Tell brands about yourself..."/>
          <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:14}}>
            <Fld label="City" value={F.city} onChange={e=>upF('city',e.target.value)}/>
            <Fld label="State" value={F.state} onChange={e=>upF('state',e.target.value)}/>
            <Fld label="Instagram" value={F.instagram} onChange={e=>upF('instagram',e.target.value)} placeholder="@handle"/>
            <Fld label="YouTube" value={F.youtube} onChange={e=>upF('youtube',e.target.value)} placeholder="Channel name"/>
            <Fld label="Min Rate ₹" type="number" value={F.rateMin} onChange={e=>upF('rateMin',e.target.value)}/>
            <Fld label="Max Rate ₹" type="number" value={F.rateMax} onChange={e=>upF('rateMax',e.target.value)}/>
          </div>
          <Btn onClick={saveProfile}>Save Changes</Btn>
        </Card>}
        {tab==='account'&&<Card style={{padding:'28px'}}>
          <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,color:T.n8,marginBottom:20}}>Account Settings</h3>
          <p style={{fontSize:14,color:T.t2,marginBottom:6}}>Email: {st.user.email}</p>
          <p style={{fontSize:14,color:T.t2,marginBottom:24}}>Role: {st.role?.charAt(0).toUpperCase()+st.role?.slice(1)}</p>
          <Divider/>
          <div style={{marginTop:20}}>
            <h4 style={{fontSize:15,fontWeight:700,color:T.gd,marginBottom:12}}>Danger Zone</h4>
            <Btn variant="ghost" onClick={()=>{if(window.confirm('Are you sure you want to logout?')){dsp({t:'LOGOUT'});}}}>Logout from this device</Btn>
          </div>
        </Card>}
        {tab==='privacy'&&<Card style={{padding:'28px'}}>
          <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,color:T.n8,marginBottom:20}}>Privacy Settings</h3>
          {[['Public Profile','Your profile is visible to all brands'],['Show Rate','Display your rate range on profile'],['Allow Direct Messages','Brands can message you directly'],['Show in Search','Appear in creator search results']].map(([t,d])=>{
            const[on,setOn]=useState(true);
            return <div key={t} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:`1px solid ${T.bg3}`}}><div><p style={{fontSize:14,fontWeight:600,color:T.n8}}>{t}</p><p style={{fontSize:12,color:T.t3,marginTop:2}}>{d}</p></div><Tog on={on} onChange={()=>{setOn(v=>!v);toast('Setting saved','success')}}/></div>;
          })}
        </Card>}
        {tab==='notifications'&&<Card style={{padding:'28px'}}>
          <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,color:T.n8,marginBottom:20}}>Notification Preferences</h3>
          {[['Email Notifications','Get emails for applications and messages'],['New Campaign Alerts','Notified when campaigns match your niche'],['WhatsApp Updates','Get updates on WhatsApp'],['Weekly Digest','Weekly summary of your profile performance']].map(([t,d])=>{
            const[on,setOn]=useState(t!=='WhatsApp Updates');
            return <div key={t} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:`1px solid ${T.bg3}`}}><div><p style={{fontSize:14,fontWeight:600,color:T.n8}}>{t}</p><p style={{fontSize:12,color:T.t3,marginTop:2}}>{d}</p></div><Tog on={on} onChange={()=>{setOn(v=>!v);toast('Setting saved','success')}}/></div>;
          })}
        </Card>}
      </div>
    </div>
  </PL>;
}

// SAVED PAGE
function SavedPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p,sel)=>{dsp({t:'GO',p,sel});scrollToTop()};
  const[tab,setTab]=useState('creators');
  const[allC,setAllC]=useState([]);
  const[allCp,setAllCp]=useState([]);
  useEffect(()=>{
    apiCall('/creators?limit=100').then(d=>setAllC(d.creators||[])).catch(console.error);
    apiCall('/campaigns?limit=100').then(d=>setAllCp(d.campaigns||[])).catch(console.error);
  },[]);
  const savedCreators=allC.filter(c=>st.saved.includes(c.id));
  const savedCamps=allCp.filter(c=>st.saved.includes(c.id));
  return <PL>
    <div style={{background:T.n8,padding:mob?'32px 20px':'48px 20px'}}>
      <div style={W()}><SH eyebrow="Saved" title="Your Saved Items" light mb={0}/></div>
    </div>
    <div style={{padding:mob?'24px 20px':'36px 20px'}}>
      <div style={W()}>
        <Tabs tabs={[['creators',`Creators (${savedCreators.length})`],['campaigns',`Campaigns (${savedCamps.length})`]]} active={tab} onChange={setTab}/>
        {tab==='creators'&&(savedCreators.length===0?<Empty icon="♡" title="No saved creators" sub="Heart-save creators while browsing to see them here." ctaLabel="Browse Creators" onCta={()=>go('creators')}/>:
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
          {savedCreators.map(c=><CreatorCard key={c.id} creator={c} onView={cr=>{go('creator-profile',{creator:cr})}}/>)}
        </div>)}
        {tab==='campaigns'&&(savedCamps.length===0?<Empty icon="📋" title="No saved campaigns" sub="Save campaigns to apply later." ctaLabel="Browse Campaigns" onCta={()=>go('campaigns')}/>:
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(auto-fill,minmax(300px,1fr))',gap:20}}>
          {savedCamps.map(c=><CampCard key={c.id} campaign={c} onApply={()=>{}}/>)}
        </div>)}
      </div>
    </div>
  </PL>;
}

// APPLICATIONS PAGE
function ApplicationsPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p)=>{dsp({t:'GO',p});scrollToTop()};
  const[filter,setFilter]=useState('');
  const myApps=LS.get('cb_applications',[]).filter(a=>a.applicantEmail===st.user?.email);
  const filtered=filter?myApps.filter(a=>(a.status||'applied')===filter):myApps;
  const STATUS_COLORS={applied:'blue','under-review':'yellow',shortlisted:'purple',selected:'green',rejected:'red'};
  if(!st.user||st.role!=='creator')return <PL><div style={{...W(),padding:'80px 20px'}}><Empty icon="🔒" title="Login required" ctaLabel="Login" onCta={()=>dsp({t:'UI',v:{authModal:true}})}/></div></PL>;
  return <PL>
    <div style={{background:T.n8,padding:mob?'32px 20px':'48px 20px'}}>
      <div style={W()}><SH eyebrow="My Applications" title={`${myApps.length} Applications`} light mb={0}/></div>
    </div>
    <div style={{padding:'16px 20px',background:T.bg2,borderBottom:`1px solid ${T.bd}`}}>
      <div style={W()}><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <Chip label="All" active={!filter} onClick={()=>setFilter('')}/>
        {['applied','shortlisted','selected','rejected'].map(s=><Chip key={s} label={s.charAt(0).toUpperCase()+s.slice(1)} active={filter===s} onClick={()=>setFilter(filter===s?'':s)}/>)}
      </div></div>
    </div>
    <div style={{padding:mob?'24px 20px':'36px 20px'}}>
      <div style={W()}>
        {filtered.length===0?<Empty icon="📋" title="No applications" sub="Apply to campaigns to see them here." ctaLabel="Browse Campaigns" onCta={()=>go('campaigns')}/>:
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {filtered.map(a=><Card key={a.id} style={{padding:'18px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10}}>
              <div style={{flex:1}}>
                <h4 style={{fontWeight:700,color:T.n8,fontSize:14,marginBottom:4}}>{a.campaignTitle}</h4>
                <p style={{fontSize:13,color:T.gd,fontWeight:600,marginBottom:6}}>{typeof a.brand === 'object' && a.brand ? a.brand.companyName : a.brand}</p>
                <p style={{fontSize:12,color:T.t3}}>{fmt.date(a.date)}</p>
              </div>
              <Bdg color={STATUS_COLORS[a.status||'applied']}>{(a.status||'applied').replace('-',' ')}</Bdg>
            </div>
            {a.pitch&&<p style={{fontSize:13,color:T.t2,marginTop:10,lineHeight:1.6,fontStyle:'italic',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>"{a.pitch}"</p>}
          </Card>)}
        </div>}
      </div>
    </div>
  </PL>;
}

// BRAND REGISTER
function BrandRegisterPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  const go=(p)=>{dsp({t:'GO',p});scrollToTop()};
  const[F,setF]=useState({companyName:'',industry:'',website:'',size:'',contactName:'',email:'',password:'',phone:'',budget:'',about:'',gstin:''});
  const[loading,setLoading]=useState(false);
  const upF=(k,v)=>setF(p=>({...p,[k]:v}));
  const submit=()=>{
    if(!F.companyName||!F.email||!F.password||!F.contactName){toast('Fill all required fields','error');return}
    if(F.password.length<6){toast('Password must be 6+ characters','error');return}
    const existing=LS.get('cb_brands',[]).find(b=>b.email===F.email);
    if(existing){toast('Email already registered','error');return}
    setLoading(true);
    setTimeout(()=>{
      const brand={...F,id:'br-'+Date.now(),joinedDate:new Date().toISOString(),verified:false,campaigns:0};
      LS.push('cb_brands',brand);
      SS.set({id:brand.id,role:'brand',email:brand.email,name:brand.companyName});
      dsp({t:'LOGIN',u:brand,role:'brand'});
      toast(`Welcome, ${F.companyName}! Start finding creators.`,'success');
      go('brand-dashboard');setLoading(false);
    },600);
  };
  return <PL noFooter>
    <div style={{minHeight:'100vh',display:'grid',gridTemplateColumns:mob?'1fr':'400px 1fr'}}>
      {!mob&&<div style={{background:T.n9,padding:'48px 40px',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:48}}><div style={{width:32,height:32,borderRadius:8,background:T.gd,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'#fff'}}>CB</div><span style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:900,color:'#fff'}}>Creator<span style={{color:T.gd}}>Bharat</span></span></div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:26,color:'#fff',marginBottom:12}}>Find Your Perfect Creator Partner</h2>
        <p style={{fontSize:14,color:'rgba(255,255,255,.55)',lineHeight:1.7,marginBottom:40}}>Access 2,400+ verified creators across 50+ Indian cities. Filter by niche, city, followers, and engagement rate.</p>
        {[['2,400+','Verified Creators'],['50+','Cities'],['₹49','Campaign Listing Fee'],['24h','Avg Response Time']].map(([v,l])=><div key={l} style={{display:'flex',gap:14,marginBottom:20,alignItems:'center'}}><div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:T.gd,minWidth:60}}>{v}</div><p style={{fontSize:13,color:'rgba(255,255,255,.55)'}}>{l}</p></div>)}
      </div>}
      <div style={{padding:mob?'32px 20px':'48px 56px',overflowY:'auto'}}>
        <div style={{maxWidth:500}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:22,color:T.n8,marginBottom:6}}>Register Your Brand</h2>
          <p style={{fontSize:14,color:T.t3,marginBottom:28}}>Free to register. ₹49 per campaign listing.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Fld label="Company Name *" value={F.companyName} onChange={e=>upF('companyName',e.target.value)} placeholder="Nykaa" required/>
            <Fld label="Industry *" value={F.industry} onChange={e=>upF('industry',e.target.value)} options={['','Beauty','Fashion','Tech','Food & Beverage','Travel','Finance','Healthcare','E-commerce','FMCG','Other']} required/>
            <Fld label="Work Email *" type="email" value={F.email} onChange={e=>upF('email',e.target.value)} placeholder="you@company.com" required/>
            <Fld label="Contact Person *" value={F.contactName} onChange={e=>upF('contactName',e.target.value)} placeholder="Priya Kapoor" required/>
            <Fld label="Password *" type="password" value={F.password} onChange={e=>upF('password',e.target.value)} placeholder="Min 6 characters" required/>
            <Fld label="Phone" value={F.phone} onChange={e=>upF('phone',e.target.value)} placeholder="+91 99999 99999"/>
            <Fld label="Website" value={F.website} onChange={e=>upF('website',e.target.value)} placeholder="nykaa.com"/>
            <Fld label="Company Size" value={F.size} onChange={e=>upF('size',e.target.value)} options={['','1-10','11-50','51-200','200+','Enterprise']}/>
            <Fld label="Monthly Budget" value={F.budget} onChange={e=>upF('budget',e.target.value)} options={['','Rs 20K-1L','Rs 1L-5L','Rs 5L-20L','Rs 20L+']}/>
            <Fld label="GSTIN (optional)" value={F.gstin} onChange={e=>upF('gstin',e.target.value)} placeholder="22AAAAA0000A1Z5"/>
          </div>
          <Fld label="About Your Brand" value={F.about} onChange={e=>upF('about',e.target.value)} rows={3} placeholder="Brief about your brand and what you're looking for in creators..."/>
          <Btn full lg loading={loading} onClick={submit}>Create Brand Account</Btn>
          <p style={{textAlign:'center',fontSize:13,color:T.t3,marginTop:14}}>Already registered? <button onClick={()=>dsp({t:'UI',v:{authModal:true,authTab:'login'}})} style={{background:'none',border:'none',color:T.gd,cursor:'pointer',fontWeight:600,fontFamily:'inherit'}}>Login</button></p>
        </div>
      </div>
    </div>
  </PL>;
}

// BRAND DASHBOARD
function BrandDashboardPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p,sel)=>{dsp({t:'GO',p,sel});scrollToTop()};
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  if(!st.user||st.role!=='brand')return <PL><div style={{...W(),padding:'80px 20px'}}><Empty icon="🔒" title="Brand login required" ctaLabel="Register as Brand" onCta={()=>go('brand-register')}/></div></PL>;
  const myBrand=Auth.getBrand(st.user.email);
  const myCamps=LS.get('cb_campaigns',[]).filter(c=>c.brandEmail===st.user.email);
  const myApps=LS.get('cb_applications',[]).filter(a=>myCamps.some(c=>c.id===a.campaignId));
  const allC=LS.get('cb_creators',[]);
  const shortlisted=allC.filter(c=>st.brand.shortlisted.includes(c.id));
  return <PL>
    <div style={{background:T.n8,padding:mob?'32px 20px':'48px 20px'}}>
      <div style={W()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
          <div><p style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.06em'}}>Brand Dashboard</p><h1 style={{fontFamily:"'Fraunces',serif",fontSize:mob?22:28,color:'#fff'}}>{myBrand?.companyName||st.user.name}</h1></div>
          <Btn onClick={()=>go('campaign-builder')}>+ Post Campaign</Btn>
        </div>
      </div>
    </div>
    <div style={{padding:mob?'24px 20px':'36px 20px'}}>
      <div style={W()}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:mob?'repeat(2,1fr)':'repeat(3,1fr)',gap:14,marginBottom:28}}>
          {[[myCamps.length,'Campaigns Posted',T.gd],[myApps.length,'Applications Received',T.info],[shortlisted.length,'Shortlisted Creators',T.platinum]].map(([v,l,col])=><div key={l} style={{textAlign:'center',padding:'20px',background:'#fff',borderRadius:14,border:`1px solid ${T.bd}`,boxShadow:T.sh1}}><div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,color:col}}>{v}</div><div style={{fontSize:12,color:T.t3,marginTop:4}}>{l}</div></div>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'1fr 1fr',gap:20}}>
          {/* My Campaigns */}
          <Card style={{padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{fontWeight:700,color:T.n8,fontSize:15}}>My Campaigns</h3>
              <Btn sm onClick={()=>go('campaign-builder')}>+ New</Btn>
            </div>
            {myCamps.length===0?<p style={{fontSize:13,color:T.t3}}>No campaigns yet. Post your first!</p>:
            myCamps.slice(0,4).map(c=><div key={c.id} style={{padding:'10px 0',borderBottom:`1px solid ${T.bg3}`}}>
              <p style={{fontSize:13,fontWeight:600,color:T.n8}}>{c.title}</p>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                <span style={{fontSize:11,color:T.t3}}>{c.filled||0}/{c.slots} filled</span>
                <Bdg sm color={c.status?.toLowerCase()==='live'?'green':'yellow'}>{c.status}</Bdg>
              </div>
            </div>)}
          </Card>
          {/* Shortlisted */}
          <Card style={{padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{fontWeight:700,color:T.n8,fontSize:15}}>Shortlisted Creators</h3>
              <Btn sm variant="ghost" onClick={()=>go('creators')}>Find More</Btn>
            </div>
            {shortlisted.length===0?<p style={{fontSize:13,color:T.t3}}>Browse creators and shortlist your favorites.</p>:
            shortlisted.slice(0,4).map(c=><div key={c.id} onClick={()=>go('creator-profile',{creator:c})} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid ${T.bg3}`,cursor:'pointer'}}>
              <img src={c.photo||c.avatarUrl||`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=DC2626&color=fff`} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover'}} alt="" onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=DC2626&color=fff`}}/>
              <div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,color:T.n8}}>{c.name}</p><p style={{fontSize:11,color:T.t3}}>{c.city} &bull; {fmt.num(c.followers)} followers</p></div>
              <button onClick={e=>{e.stopPropagation();dsp({t:'SHORTLIST',id:c.id})}} style={{background:'none',border:'none',cursor:'pointer',color:T.gd,fontSize:12,fontFamily:'inherit'}}>Remove</button>
            </div>)}
          </Card>
        </div>
      </div>
    </div>
  </PL>;
}

// CAMPAIGN BUILDER (4-step)
function CampaignBuilderPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p)=>{dsp({t:'GO',p});scrollToTop()};
  const toast=(msg,type)=>dsp({t:'TOAST',d:{type,msg}});
  const[step,setStep]=useState(1);const[paying,setPaying]=useState(false);const[done,setDone]=useState(false);
  const[F,setF]=useState({title:'',niche:[],goal:'',platform:[],description:'',minFollowers:'',minER:'',budgetMin:'',budgetMax:'',slots:5,deadline:'',bidding:false,deliverables:[],usageRights:'',exclusivity:false,requirements:''});
  const upF=(k,v)=>setF(p=>({...p,[k]:v}));
  const toggleArr=(k,v)=>setF(p=>({...p,[k]:p[k].includes(v)?p[k].filter(x=>x!==v):[...p[k],v]}));
  const NICHES=['Travel','Lifestyle','Fashion','Beauty','Tech','Gaming','Food','Cooking','Fitness','Education','Finance','Entertainment'];
  const PLATFORMS=['Instagram','YouTube','Twitter','LinkedIn'];
  const DELIVERABLES=['Instagram Reels','Stories','Static Posts','YouTube Video','YouTube Shorts','LinkedIn Posts','Twitter Thread','Blog Post','Unboxing Video','Product Review'];
  if(!st.user||st.role!=='brand')return <PL><div style={{...W(),padding:'80px 20px'}}><Empty icon="🔒" title="Brand login required" ctaLabel="Register as Brand" onCta={()=>go('brand-register')}/></div></PL>;

  const next=()=>{
    if(step===1&&(!F.title||!F.niche.length||!F.platform.length)){toast('Fill title, niche and platform','error');return}
    if(step===2&&(!F.budgetMin||!F.budgetMax||!F.deadline)){toast('Fill budget and deadline','error');return}
    if(step===3&&!F.deliverables.length){toast('Add at least one deliverable','error');return}
    setStep(s=>s+1);scrollToTop();
  };

  const pay=()=>{
    setPaying(true);
    if(typeof Razorpay!=='undefined'){
      const rzp=new Razorpay({key:'rzp_test_placeholder',amount:4900,currency:'INR',name:'CreatorBharat',description:'Campaign Listing -- ₹49',handler:()=>{saveCampaign()},prefill:{email:st.user.email},theme:{color:T.gd},modal:{ondismiss:()=>setPaying(false)}});
      rzp.open();
    }else{
      // Test mode fallback
      setTimeout(()=>saveCampaign(),800);
    }
  };

  const saveCampaign=()=>{
    const camp={...F,id:'cp-'+Date.now(),brandEmail:st.user.email,brand:Auth.getBrand(st.user.email)?.companyName||st.user.name,filled:0,status:'live',createdAt:new Date().toISOString()};
    LS.push('cb_campaigns',camp);
    setPaying(false);setDone(true);
    toast('Campaign live! Creators can now apply.','success');
    dsp({t:'NOTIF',n:{msg:`Campaign "${F.title}" is now live!`,time:'Just now',read:false}});
  };

  const steps=[['Campaign Basics','Title, niche, goal'],['Budget & Timeline','Fees and schedule'],['Deliverables','What creators must do'],['Review & Pay','₹49 listing fee']];
  return <PL>
    {done?<div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{textAlign:'center',maxWidth:480}}>
        <div style={{fontSize:60,marginBottom:20}}>🎉</div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:28,color:T.n8,marginBottom:12}}>Campaign is Live!</h2>
        <p style={{fontSize:15,color:T.t2,lineHeight:1.6,marginBottom:32}}>"{F.title}" is now visible to {2400+LS.get('cb_creators',[]).length}+ creators. Expect applications within 24-48 hours.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center'}}>
          <Btn onClick={()=>go('brand-dashboard')}>Go to Dashboard</Btn>
          <Btn variant="outline" onClick={()=>{setStep(1);setDone(false);setF({title:'',niche:[],goal:'',platform:[],description:'',minFollowers:'',minER:'',budgetMin:'',budgetMax:'',slots:5,deadline:'',bidding:false,deliverables:[],usageRights:'',exclusivity:false,requirements:''})}}>Post Another</Btn>
        </div>
      </div>
    </div>:<div style={{padding:mob?'24px 20px':'40px 20px'}}>
      <div style={W(640)}>
        <div style={{display:'flex',gap:8,marginBottom:32}}>{steps.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<step?T.gd:T.bg3}}/>)}</div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:22,color:T.n8,marginBottom:6}}>{steps[step-1][0]}</h2>
        <p style={{fontSize:14,color:T.t3,marginBottom:28}}>Step {step} of 4</p>
        {step===1&&<div>
          <Fld label="Campaign Title *" value={F.title} onChange={e=>upF('title',e.target.value)} placeholder="e.g. Diwali Fashion Lookbook" required/>
          <Fld label="Campaign Goal" value={F.goal} onChange={e=>upF('goal',e.target.value)} options={['','Brand Awareness','Product Launch','Sales Drive','Content Generation','App Downloads']}/>
          <div style={{marginBottom:14}}><label style={{display:'block',fontSize:12,fontWeight:700,color:T.t2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em'}}>Niche *</label><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{NICHES.map(n=><Chip key={n} label={n} active={F.niche.includes(n)} onClick={()=>toggleArr('niche',n)}/>)}</div></div>
          <div style={{marginBottom:14}}><label style={{display:'block',fontSize:12,fontWeight:700,color:T.t2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em'}}>Platform *</label><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{PLATFORMS.map(p=><Chip key={p} label={p} active={F.platform.includes(p)} onClick={()=>toggleArr('platform',p)}/>)}</div></div>
          <Fld label="Campaign Description" value={F.description} onChange={e=>upF('description',e.target.value)} rows={4} placeholder="What is this campaign about? What should creators know?"/>
        </div>}
        {step===2&&<div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Fld label="Min Budget ₹ *" type="number" value={F.budgetMin} onChange={e=>upF('budgetMin',e.target.value)} placeholder="20000" required/>
            <Fld label="Max Budget ₹ *" type="number" value={F.budgetMax} onChange={e=>upF('budgetMax',e.target.value)} placeholder="60000" required/>
            <Fld label="Creator Slots" type="number" value={F.slots} onChange={e=>upF('slots',Number(e.target.value))} placeholder="5"/>
            <Fld label="Application Deadline *" type="date" value={F.deadline} onChange={e=>upF('deadline',e.target.value)} required/>
            <Fld label="Min Followers" type="number" value={F.minFollowers} onChange={e=>upF('minFollowers',e.target.value)} placeholder="10000"/>
            <Fld label="Min Engagement Rate %" type="number" value={F.minER} onChange={e=>upF('minER',e.target.value)} placeholder="3.5"/>
          </div>
          <Tog on={F.bidding} onChange={()=>upF('bidding',!F.bidding)} label="Enable Creator Bidding (creators can propose their own rate)"/>
        </div>}
        {step===3&&<div>
          <div style={{marginBottom:14}}><label style={{display:'block',fontSize:12,fontWeight:700,color:T.t2,marginBottom:8,textTransform:'uppercase',letterSpacing:'.04em'}}>Deliverables *</label><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{DELIVERABLES.map(d=><Chip key={d} label={d} active={F.deliverables.includes(d)} onClick={()=>toggleArr('deliverables',d)}/>)}</div></div>
          <Fld label="Usage Rights" value={F.usageRights} onChange={e=>upF('usageRights',e.target.value)} options={['','30 days','90 days','6 months','1 year','Perpetual']}/>
          <Tog on={F.exclusivity} onChange={()=>upF('exclusivity',!F.exclusivity)} label="Require exclusivity (creator cannot work with competitors)"/>
          <Fld label="Special Requirements" value={F.requirements} onChange={e=>upF('requirements',e.target.value)} rows={3} placeholder="Any specific requirements, brand guidelines, or do's and don'ts..."/>
        </div>}
        {step===4&&<div>
          <Card style={{padding:'22px',marginBottom:20}}>
            <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,color:T.n8,marginBottom:16}}>Campaign Summary</h3>
            {[[F.title,'Title'],[F.niche.join(', '),'Niche'],[F.platform.join(', '),'Platform'],[`₹${fmt.inr(Number(F.budgetMin))} -- ${fmt.inr(Number(F.budgetMax))}`,'Budget'],[String(F.slots)+' creators','Slots'],[F.deadline,'Deadline'],[F.deliverables.join(', '),'Deliverables']].map(([v,l])=>v&&<div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${T.bg3}`}}><span style={{fontSize:13,color:T.t3}}>{l}</span><span style={{fontSize:13,color:T.n8,fontWeight:600,textAlign:'right',maxWidth:200}}>{v}</span></div>)}
          </Card>
          <div style={{background:T.ga,border:`1px solid ${T.gab}`,borderRadius:14,padding:'20px',marginBottom:20,textAlign:'center'}}>
            <p style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,color:T.gd}}>₹49</p>
            <p style={{fontSize:14,color:T.n8,fontWeight:600}}>One-time campaign listing fee</p>
            <p style={{fontSize:12,color:T.t3,marginTop:4}}>Your campaign goes live instantly after payment</p>
          </div>
          <Btn full lg loading={paying} onClick={pay}>{paying?'Processing...':'Pay ₹49 & Launch Campaign'}</Btn>
          <p style={{textAlign:'center',fontSize:11,color:T.t3,marginTop:10}}>Secured by Razorpay. All major cards, UPI, netbanking accepted.</p>
        </div>}
        <div style={{display:'flex',gap:12,marginTop:20}}>
          {step>1&&<Btn variant="ghost" onClick={()=>{setStep(s=>s-1);top()}}>Back</Btn>}
          {step<4&&<Btn full lg onClick={next}>Continue →</Btn>}
        </div>
      </div>
    </div>}
  </PL>;
}

// COMPARE PAGE
function ComparePage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=(p,sel)=>{dsp({t:'GO',p,sel});scrollToTop()};
  const allC=LS.get('cb_creators',[]);
  const creators=st.compared.map(id=>allC.find(c=>c.id===id)).filter(Boolean);
  if(creators.length<2)return <PL><div style={{...W(),padding:'80px 20px'}}><Empty icon="⚖" title="Select at least 2 creators to compare" sub="Browse creators and click Compare to add them." ctaLabel="Browse Creators" onCta={()=>go('creators')}/></div></PL>;
  const fields=[['Followers',c=>fmt.num(c.followers),''],['Engagement Rate',c=>c.er+'%','higher'],['Min Rate',c=>fmt.inr(c.rateMin),'lower'],['Creator Score',c=>c.score||fmt.score(c),'higher'],['Completed Deals',c=>c.completedDeals||0,'higher'],['Rating',c=>c.rating||0,'higher'],['City',c=>c.city,''],['Niche',c=>(Array.isArray(c.niche)?c.niche:[c.niche]).join(', '),''],['Platform',c=>(Array.isArray(c.platform)?c.platform:[c.platform]).join(', '),''],['Verified',c=>c.verified?'Yes':'No',''],['Response Time',c=>c.responseTime||'--','']];
  return <PL>
    <div style={{background:T.n8,padding:mob?'32px 20px':'48px 20px'}}>
      <div style={W()}><SH eyebrow="Compare" title="Side by Side" sub="Find the right creator for your campaign." light mb={0}/></div>
    </div>
    <div style={{padding:mob?'24px 20px':'40px 20px',overflowX:'auto'}}>
      <div style={W()}>
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:500}}>
          <thead>
            <tr>
              <th style={{width:160,padding:'12px 16px',textAlign:'left',fontSize:12,color:T.t3,fontWeight:600,borderBottom:`2px solid ${T.bd}`}}></th>
              {creators.map(c=>{const img=c.photo||c.avatarUrl||`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=DC2626&color=fff`;return <th key={c.id} style={{padding:'12px 16px',textAlign:'center',borderBottom:`2px solid ${T.bd}`}}>
                <img src={img} style={{width:52,height:52,borderRadius:'50%',objectFit:'cover',marginBottom:8}} alt={c.name} onError={e=>{e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=DC2626&color=fff`}}/>
                <p style={{fontSize:14,fontWeight:700,color:T.n8}}>{c.name}</p>
                <p style={{fontSize:11,color:T.t3,marginTop:2}}>{c.city}</p>
              </th>;})}
            </tr>
          </thead>
          <tbody>
            {fields.map(([label,getValue,better])=>{
              const vals=creators.map(c=>getValue(c));
              const nums=vals.map(v=>parseFloat(String(v).replace(/[₹,KLCr]/g,'')));
              const bestIdx=better==='higher'?nums.indexOf(Math.max(...nums)):better==='lower'?nums.indexOf(Math.min(...nums)):-1;
              return <tr key={label} style={{borderBottom:`1px solid ${T.bg3}`}}>
                <td style={{padding:'12px 16px',fontSize:13,color:T.t2,fontWeight:600}}>{label}</td>
                {creators.map((c,i)=><td key={c.id} style={{padding:'12px 16px',textAlign:'center',fontSize:13,color:T.n8,background:i===bestIdx&&better?T.okl:'transparent',fontWeight:i===bestIdx&&better?700:400,borderRadius:6}}>{vals[i]}</td>)}
              </tr>;
            })}
            <tr>
              <td style={{padding:'16px'}}/>
              {creators.map(c=><td key={c.id} style={{padding:'12px 16px',textAlign:'center'}}><Btn sm onClick={()=>go('creator-profile',{creator:c})}>View Profile</Btn></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </PL>;
}


// ── APP ROOT ──────────────────────────────────────────────────────
// ── MONETIZATION HUB PAGE ─────────────────────────────────────────
function MonetizationPage(){
  const{st,dsp}=useApp();const{mob}=useVP();
  const go=function(p){dsp({t:'GO',p:p});scrollToTop();};
  const[activeTab,setActiveTab]=useState('overview');
  const isCreator=st.role==='creator';
  const toast=function(msg,type){dsp({t:'TOAST',d:{type:type||'info',msg:msg}});};

  var streams=[
    {icon:'🛍',title:'Digital Products Store',desc:'Presets, ebooks, templates, courses sell karo directly profile se. 90% revenue tumhara.',earning:'₹500-50,000/product',status:'coming',color:'#FF9933'},
    {icon:'🔗',title:'Affiliate Link Manager',desc:'Amazon, Flipkart, brand affiliate links manage karo. Click tracking aur commission display.',earning:'5-15% per sale',status:'coming',color:'#138808'},
    {icon:'☕',title:'Tip Jar — Fan Support',desc:'"Buy me a chai" — UPI se seedha support. Instant payout tumhare account mein.',earning:'₹10-10,000/tip',status:'coming',color:'#FF6B00'},
    {icon:'🎫',title:'Fan Subscription',desc:'Monthly subscribers ke liye exclusive content. Tiered membership: ₹49/₹149/₹499.',earning:'₹49-499/month/fan',status:'coming',color:'#7C3AED'},
    {icon:'🤝',title:'Brand Deal Marketplace',desc:'Apne packages list karo. Brands directly book karo bina negotiation ke. Secure escrow.',earning:'₹5,000-2,00,000/deal',status:'live',color:'#2563EB'},
    {icon:'📣',title:'Creator Referral Program',desc:'Naye creators refer karo. Har successful listing pe ₹50 tumhe milega.',earning:'₹50 per referral',status:'live',color:'#138808'},
  ];

  var comingSoonFeatures=[
    {icon:'🎨',title:'Preset Packs',desc:'Lightroom/Filmora presets sell karo apne audience ko'},
    {icon:'📚',title:'E-books & Guides',desc:'"My Brand Deal Playbook", "Instagram Growth Secrets"'},
    {icon:'🎥',title:'Online Courses',desc:'Video courses on content creation, editing, niche skills'},
    {icon:'📋',title:'Templates Pack',desc:'Media kits, pitch decks, Instagram templates'},
    {icon:'📅',title:'1:1 Consultation',desc:'30/60 min video calls — charge per session'},
    {icon:'🔴',title:'Live Superchat',desc:'Live stream pe fans se direct donation lo'},
  ];

  return <PL>
    <div style={{background:'linear-gradient(135deg,#0a0a0a 0%,#1a0800 60%,#001a00 100%)',padding:mob?'48px 20px 32px':'72px 20px 40px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:4,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)'}}/>
      <div style={{position:'absolute',bottom:-60,right:-60,width:300,height:300,borderRadius:'50%',background:'rgba(255,153,51,.05)',pointerEvents:'none'}}/>
      <div style={W()}>
        <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:16,padding:'6px 14px',borderRadius:20,background:'rgba(255,153,51,.1)',border:'1px solid rgba(255,153,51,.3)'}}>
          <span style={{fontSize:14}}>💰</span>
          <span style={{fontSize:11,fontWeight:800,color:'#FF9933',textTransform:'uppercase',letterSpacing:'.08em'}}>Monetization Hub</span>
        </div>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:mob?'clamp(28px,8vw,44px)':'clamp(36px,4vw,56px)',fontWeight:900,color:'#fff',lineHeight:1.08,marginBottom:16}}>
          Creator Economy<br/><span style={{color:'#FF9933'}}>Ka Full Power Lo</span>
        </h1>
        <p style={{fontSize:mob?14:17,color:'rgba(255,255,255,.65)',lineHeight:1.75,maxWidth:560,marginBottom:32}}>
          Brand deals se aage jao. Digital products, affiliates, fan support, subscriptions — multiple income streams ek jagah manage karo.
        </p>
        {!isCreator&&<div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <Btn lg style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff',fontWeight:800}} onClick={function(){go('apply');}}>Creator Profile Banao</Btn>
          <Btn lg style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.8)'}} onClick={function(){dsp({t:'UI',v:{authModal:true,authTab:'login'}});}}>Login Karo</Btn>
        </div>}
        {isCreator&&<Btn lg style={{background:'linear-gradient(135deg,#FF9933,#FF6B00)',border:'none',color:'#fff',fontWeight:800}} onClick={function(){go('dashboard');}}>Dashboard Pe Jao</Btn>}
      </div>
    </div>

    {/* Stats bar */}
    <div style={{background:'#fff',borderBottom:'1px solid #E8E6E3',padding:'16px 20px'}}>
      <div style={W()}>
        <div style={{display:'flex',gap:mob?20:48,flexWrap:'wrap',justifyContent:'center'}}>
          {[['₹8Cr+','Paid to creators so far'],['2,400+','Creators earning'],['6','Income streams'],['90%','Creator revenue share']].map(function(item){
            return React.createElement('div',{key:item[1],style:{textAlign:'center'}},
              React.createElement('div',{style:{fontFamily:"'Fraunces',serif",fontSize:mob?20:26,fontWeight:900,color:'#FF9933',lineHeight:1}},item[0]),
              React.createElement('div',{style:{fontSize:11,color:'#888',marginTop:3}},item[1])
            );
          })}
        </div>
      </div>
    </div>

    {/* Income Streams */}
    <div style={{padding:mob?'40px 20px':'64px 20px',background:'#FAFAF9'}}>
      <div style={W()}>
        <div style={{textAlign:'center',marginBottom:44}}>
          <p style={{fontSize:11,fontWeight:800,color:'#FF9933',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>Income Streams</p>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:mob?24:36,fontWeight:900,color:'#1a1a1a',marginBottom:12}}>6 Tarike Se Kamao</h2>
          <p style={{fontSize:15,color:'#555',maxWidth:500,margin:'0 auto'}}>Sirf brand deals pe depend mat karo. Multiple income streams banao.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:mob?'1fr':'repeat(2,1fr)',gap:18}}>
          {streams.map(function(s){
            return React.createElement('div',{key:s.title,style:{background:'#fff',borderRadius:16,border:'1px solid #E8E6E3',padding:'22px',display:'flex',gap:16,alignItems:'flex-start',position:'relative',overflow:'hidden'}},
              React.createElement('div',{style:{position:'absolute',top:0,left:0,width:'100%',height:3,background:s.color}}),
              React.createElement('div',{style:{width:48,height:48,borderRadius:12,background:s.color+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}},s.icon),
              React.createElement('div',{style:{flex:1}},
                React.createElement('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:6}},
                  React.createElement('h3',{style:{fontSize:15,fontWeight:700,color:'#1a1a1a'}},s.title),
                  s.status==='live'
                    ?React.createElement('span',{style:{fontSize:9,background:'rgba(19,136,8,.1)',color:'#138808',padding:'2px 7px',borderRadius:10,fontWeight:800}},'LIVE')
                    :React.createElement('span',{style:{fontSize:9,background:'rgba(255,153,51,.1)',color:'#FF9933',padding:'2px 7px',borderRadius:10,fontWeight:800}},'COMING SOON')
                ),
                React.createElement('p',{style:{fontSize:13,color:'#666',lineHeight:1.6,marginBottom:10}},s.desc),
                React.createElement('div',{style:{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:20,background:s.color+'12',border:'1px solid '+s.color+'30'}},
                  React.createElement('span',{style:{fontSize:11,fontWeight:700,color:s.color}},'Earning: '+s.earning)
                )
              )
            );
          })}
        </div>
      </div>
    </div>

    {/* Coming Soon Products */}
    <div style={{padding:mob?'40px 20px':'64px 20px',background:'#fff'}}>
      <div style={W()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:36,flexWrap:'wrap',gap:12}}>
          <div>
            <p style={{fontSize:11,fontWeight:800,color:'#FF9933',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Digital Products Store</p>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:mob?22:32,fontWeight:900,color:'#1a1a1a'}}>Kya Sell Kar Sakte Ho?</h2>
          </div>
          <div style={{padding:'8px 16px',background:'rgba(255,153,51,.1)',border:'1px solid rgba(255,153,51,.3)',borderRadius:20}}>
            <span style={{fontSize:12,fontWeight:700,color:'#FF9933'}}>Coming Month 3</span>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:mob?'repeat(2,1fr)':'repeat(3,1fr)',gap:16}}>
          {comingSoonFeatures.map(function(f){
            return React.createElement('div',{key:f.title,style:{padding:'20px',borderRadius:14,border:'1px dashed #E8E6E3',background:'#FAFAF9',textAlign:'center'}},
              React.createElement('div',{style:{fontSize:32,marginBottom:10}},f.icon),
              React.createElement('h4',{style:{fontFamily:"'Fraunces',serif",fontSize:14,fontWeight:700,color:'#1a1a1a',marginBottom:6}},f.title),
              React.createElement('p',{style:{fontSize:12,color:'#888',lineHeight:1.5}},f.desc)
            );
          })}
        </div>
        <div style={{marginTop:28,padding:'20px',background:'linear-gradient(135deg,rgba(255,153,51,.08),rgba(19,136,8,.06))',borderRadius:14,border:'1px solid rgba(255,153,51,.2)',textAlign:'center'}}>
          <p style={{fontSize:14,color:'#1a1a1a',fontWeight:600,marginBottom:8}}>Pehle notify hona chahte ho?</p>
          <p style={{fontSize:13,color:'#666',marginBottom:16}}>Digital Products Store launch hone pe sabse pehle tumhe batayenge.</p>
          <NewsletterForm/>
        </div>
      </div>
    </div>

    {/* Referral section */}
    <div style={{padding:mob?'40px 20px':'64px 20px',background:'linear-gradient(135deg,#138808,#0F6B06)',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)'}}/>
      <div style={{...W(700),textAlign:'center',position:'relative',zIndex:1}}>
        <div style={{fontSize:48,marginBottom:16}}>🤝</div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:mob?24:36,fontWeight:900,color:'#fff',marginBottom:12}}>Creator Referral Program</h2>
        <p style={{fontSize:mob?14:16,color:'rgba(255,255,255,.85)',marginBottom:8,lineHeight:1.7}}>Apne creator dost ko CreatorBharat pe laao. Har successful listing pe tumhe milega</p>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:mob?36:52,fontWeight:900,color:'#fff',marginBottom:8}}>₹50</div>
        <p style={{fontSize:14,color:'rgba(255,255,255,.7)',marginBottom:32}}>Sirf refer karo — aur kuch nahi. Monthly payout tumhare account mein.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <Btn lg style={{background:'#fff',color:'#138808',fontWeight:800,border:'none'}} onClick={function(){
            if(!st.user){dsp({t:'UI',v:{authModal:true,authTab:'login'}});return;}
            try{navigator.clipboard.writeText('https://creatorbharat.in/r/'+((st.creatorProfile&&st.creatorProfile.handle)||'creator'));}catch(e){}
            toast('Referral link copied! Share karo aur kamao.','success');
          }}>Referral Link Copy Karo</Btn>
          <Btn lg style={{background:'rgba(255,255,255,.15)',color:'#fff',border:'1.5px solid rgba(255,255,255,.4)'}} onClick={function(){
            var text='CreatorBharat pe join karo — India ka best creator platform! Free listing, brand deals, aur bahut kuch. Yahan se sign up karo: https://creatorbharat.in/apply';
            window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');
          }}>WhatsApp Pe Share Karo</Btn>
        </div>
      </div>
    </div>

    {/* FAQ */}
    <div style={{padding:mob?'40px 20px':'64px 20px',background:'#fff'}}>
      <div style={{...W(700)}}>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:mob?22:30,fontWeight:900,color:'#1a1a1a',marginBottom:32,textAlign:'center'}}>Aksar Puche Jane Wale Sawal</h2>
        {[
          ['CreatorBharat kitna commission leta hai?','Digital product sales pe 10%, brand deals pe 8%, fan subscriptions pe 10%. Tip jar pe sirf Razorpay processing fee (2% + ₹2). Baaki sab tumhara.'],
          ['Payment kab milega?','Razorpay ke through instantly. Brand deal escrow 7 days mein release hota hai content delivery ke baad.'],
          ['Minimum followers chahiye kya?','Nahi! Koi bhi creator list ho sakta hai. Score aur ER ke basis pe ranking hoti hai, followers se nahi.'],
          ['Digital Products kab launch hoga?','3rd month mein. Newsletter subscribe karo — pehle notify karenge.'],
          ['Kya foreign brands ke saath bhi deal ho sakti hai?','Haan! USD mein payment Razorpay ke through possible hai.'],
        ].map(function(item,i){
          return React.createElement('div',{key:i,style:{marginBottom:14,borderRadius:12,border:'1px solid #E8E6E3',overflow:'hidden'}},
            React.createElement('div',{style:{padding:'16px 18px',background:'#FAFAF9'}},
              React.createElement('p',{style:{fontSize:14,fontWeight:700,color:'#1a1a1a',marginBottom:8}},item[0]),
              React.createElement('p',{style:{fontSize:13,color:'#666',lineHeight:1.65}},item[1])
            )
          );
        })}
      </div>
    </div>
  </PL>;
}

function App(){
  console.log("App Component Rendering...");
  const[st,dsp]=useReducer(reducer,IS);
  const toast=(msg,type='info')=>dsp({t:'TOAST',d:{type,msg}});
  const go=(p,sel={})=>{dsp({t:'GO',p,sel:Object.keys(sel).length?sel:undefined});window.scrollTo({top:0,behavior:'smooth'});};

  
  useEffect(() => {
    // Inject Lenis for 3D smooth scroll
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js';
    script.onload = () => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1.1,
        smoothWheel: true,
      });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
      window.lenis = lenis;
    };
    document.head.appendChild(script);
  }, []);

  useEffect(()=>{
    seedData();
    // Fetch live API data and override local storage cache
    const syncLiveAPI = async () => {
      try {
        const creatorsData = await apiCall('/creators?limit=100');
        if(creatorsData && creatorsData.creators) {
          const mapped = creatorsData.creators.map(c => ({...c, er: c.engagementRate || c.er || 0}));
          LS.set('cb_creators', mapped);
        }
        const campaignsData = await apiCall('/campaigns?limit=100');
        if(campaignsData && campaignsData.campaigns) {
          console.log(`Synced ${campaignsData.campaigns.length} campaigns from API`);
          LS.set('cb_campaigns', campaignsData.campaigns);
        }
        const blogsData = await apiCall('/blog');
        if(blogsData) {
          LS.set('cb_blogs', blogsData);
        }
        dsp({t:'SYNC_DATA'});
      } catch(err) {
        console.error("Live API sync failed, falling back to local mock data:", err);
      }
    };
    syncLiveAPI();

    const sess=SS.get();
    if(sess){
      const user=sess.role==='creator'?Auth.getCreator(sess.email):Auth.getBrand(sess.email);
      if(user)dsp({t:'LOGIN',u:user,role:sess.role});
    }
    // Toast auto-remove
    if(st.toasts.length>0){
      const t=st.toasts[0];
      const timer=setTimeout(()=>dsp({t:'RM_TOAST',id:t.id}),4000);
      return()=>clearTimeout(timer);
    }
  },[st.toasts.length]);

  const ctx={st,dsp,toast,go};

  const pages={
    'home':<HomePage/>,
    'creators':<CreatorsPage/>,
    'creator-profile':<CreatorProfilePage/>,
    'campaigns':<CampaignsPage/>,
    'blog':<BlogPage/>,
    'blog-article':<BlogArticlePage/>,'monetize':<MonetizationPage/>,
    'pricing':<PricingPage/>,
    'leaderboard':<LeaderboardPage/>,
    'rate-calc':<RateCalcPage/>,
    'creator-score':<CreatorScorePage/>,
    'about':<AboutPage/>,
    'contact':<ContactPage/>,
    'apply':<ApplyPage/>,
    'dashboard':<DashboardPage/>,
    'settings':<SettingsPage/>,
    'saved':<SavedPage/>,
    'applications':<ApplicationsPage/>,
    'brand-register':<BrandRegisterPage/>,
    'brand-dashboard':<BrandDashboardPage/>,
    'campaign-builder':<CampaignBuilderPage/>,
    'compare':<ComparePage/>,
  };

  return(
    <Ctx.Provider value={ctx}>
      {pages[st.page]||<HomePage/>}
    </Ctx.Provider>
  );
}

console.log("BABEL COMPILED SUCCESSFULLY! PREPARING TO MOUNT...");
setTimeout(() => {
  console.log("SET TIMEOUT FIRED! MOUNTING APP NOW...");
  const root = document.getElementById('root');
  console.log("ROOT ELEMENT:", root);
  try {
    ReactDOM.createRoot(root).render(
      React.createElement(App)
    );
    console.log("MOUNT SUCCESSFUL!");
  } catch (err) {
    console.error("REACT RENDER ERROR:", err);
  }
}, 0);
