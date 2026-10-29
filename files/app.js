const K='studyspace-v2';let S,me=null,tab='tasks',editId=null,fired={};
const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
function load(){try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
 if(!S){
  S={users:[],
  tasks:[
  
  ],subs:[]};save()}}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
const fmt=t=>new Date(t).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const stu=()=>S.users.filter(u=>u.role==='student');
function rankOf(u){const a=stu().filter(s=>s.done>0).sort((x,y)=>y.done-x.done||y.xp-x.xp);const i=a.findIndex(s=>s.id===u.id);
 if(i<0)return'Warrior';return['Mythical Immortal','Mythical Honor','Mythic','Legend'][Math.floor(i/3)]||'Elite'}
const mySub=(t,u)=>S.subs.find(s=>s.t===t&&s.u===u);
function myTasks(){return S.tasks.filter(t=>t.by==='inst'||t.by===me.id).sort((a,b)=>a.due-b.due)}
/* sound + alerts */
function beep(){try{const c=new(window.AudioContext||window.webkitAudioContext)();[0,.25,.5].forEach(o=>{const g=c.createGain(),x=c.createOscillator();x.frequency.value=880;x.connect(g);g.connect(c.destination);g.gain.setValueAtTime(.2,c.currentTime+o);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+o+.2);x.start(c.currentTime+o);x.stop(c.currentTime+o+.22)})}catch(e){}}
function notify(msg){const d=document.createElement('div');d.className='alert';d.innerHTML=`<span>🔔 ${esc(msg)}</span><button class="sm ghost" style="color:#fff;border-color:#fff8">Dismiss</button>`;d.querySelector('button').onclick=()=>d.remove();$('#alerts').prepend(d);beep()}
function check(){if(!me||me.role!=='student')return;const n=Date.now();
 myTasks().filter(t=>!mySub(t.id,me.id)).forEach(t=>{const ms=t.due-n;
  if(ms<=0&&ms>-864e5&&!fired[t.id+'n']){fired[t.id+'n']=1;notify(`Due now: ${t.title}`)}
  else if(ms>0&&ms<=864e5&&!fired[t.id+'b']){fired[t.id+'b']=1;notify(`Due in ${ms>36e5?Math.round(ms/36e5)+' hr':Math.round(ms/6e4)+' min'}: ${t.title}`)}})}
setInterval(check,20000);
/* auth */
function login(name,email,role){email=email.trim().toLowerCase();if(!email)return;
 let u=S.users.find(x=>x.email===email);
 if(!u){u={id:uid(),name:name||email.split('@')[0],email,role,done:0,xp:0};S.users.push(u);save()}
 me=u;fired={};tab=u.role==='student'?'tasks':'manage';render();setTimeout(check,800)}
function renderLogin(){setTimeout(initGoogle,0);$('#app').innerHTML=`<div class="card login"><div class="logo">🌿 Study Space</div><h1>Welcome back</h1>
<p class="mut">Plan your deadlines. Grow your plant.</p>
<label>Name</label><input id="ln" placeholder="Your name"><br><br><label>Email</label><input id="le" type="email" placeholder="Email Address"><br><br>
<label>I am a</label><select id="lr"><option value="student">Student</option><option value="instructor">Instructor</option></select><br><br>
<button onclick="login($('#ln').value,$('#le').value,$('#lr').value)" style="width:100%">Log in with email</button><br><br>
<div id="gbtn" style="display:flex;justify-content:center"></div>
<p class="mut" id="gnote"></p></div>`}
/* Google sign-in: paste your OAuth Web Client ID below (Google Cloud Console > Credentials) and add your Vercel URL under Authorized JavaScript origins */
const GOOGLE_CLIENT_ID='YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
function gcb(r){try{const p=JSON.parse(decodeURIComponent(escape(atob(r.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))));login(p.name,p.email,$('#lr').value)}catch(e){alert('Google sign-in failed. Please try again.')}}
function initGoogle(){const b=$('#gbtn'),n=$('#gnote');if(!b)return;
 const go=()=>{try{google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:gcb});google.accounts.id.renderButton(b,{theme:'outline',size:'large',width:340,text:'continue_with'})}catch(e){n.textContent='Google sign-in could not load.'}};
 if(window.google&&google.accounts){go();return}
 const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=go;s.onerror=()=>{n.textContent='Google sign-in is unavailable in this preview. It works once deployed on your own domain.'};document.head.appendChild(s)}
/* views */
function render(){if(!me)return renderLogin();
 const stud=me.role==='student',tabs=stud?[['tasks','Tasks'],['plant','My plant'],['rank','Ranks']]:[['manage','Create & manage'],['progress','Student progress']];
 $('#app').innerHTML=`<div class="top"><div><span class="logo">🌿 Study Space</span><div class="mut">${esc(me.name)} · ${me.role}${stud?' · '+rankOf(me):''}</div></div>
 <div><button class="ghost sm" onclick="beep()">🔊 Test alert</button> <button class="ghost sm" onclick="me=null;render()">Log out</button></div></div>
 <div class="tabs">${tabs.map(([k,l])=>`<button class="tab ${tab===k?'on':''}" onclick="tab='${k}';render()">${l}</button>`).join('')}</div><div id="view"></div>`;
 ({tasks:vTasks,plant:vPlant,rank:vRank,manage:vManage,progress:vProgress})[tab]()}
function taskForm(personal){const e=editId&&S.tasks.find(t=>t.id===editId);
 return `<div class="card"><h2>${e?'Edit':'Add'} ${personal?'personal task':'task'}</h2><div class="row">
 <div><label>Title</label><input id="ft" value="${esc(e?.title)}"></div>
 ${personal?'':`<div><label>Type</label><select id="fy">${['Activity','Assignment','Quiz'].map(x=>`<option ${e?.type===x?'selected':''}>${x}</option>`).join('')}</select></div>`}
 <div><label>Deadline</label><input id="fd" type="datetime-local" value="${e?new Date(e.due-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16):''}"></div>
 <div><label>Attach file</label><input id="ff" type="file"></div></div>
 <label>Details</label><textarea id="fx" rows="2">${esc(e?.desc)}</textarea><br><br>
 <button onclick="saveTask(${personal})">${e?'Save changes':'Add'}</button> ${e?'<button class="ghost" onclick="editId=null;render()">Cancel</button>':''}</div>`}
function saveTask(personal){const t=$('#ft').value.trim(),d=$('#fd').value;if(!t||!d)return alert('Add a title and a deadline.');
 const f=$('#ff').files[0]?.name,e=editId&&S.tasks.find(x=>x.id===editId),o={title:t,due:new Date(d).getTime(),desc:$('#fx').value,type:personal?'Personal':$('#fy').value};
 if(e)Object.assign(e,o,f?{file:f}:{});else S.tasks.push({id:uid(),by:personal?me.id:'inst-'+me.id,file:f||'',...o});
 if(!personal&&!e)S.tasks.at(-1).by='inst';editId=null;save();render()}
function vTasks(){const l=myTasks();
 $('#view').innerHTML=taskForm(true)+`<div class="card"><h2>All tasks · nearest deadline first</h2>${l.length?l.map(t=>{const s=mySub(t.id,me.id),over=!s&&t.due<Date.now();
 return `<div class="task"><div><span class="tag">${t.type}</span><b>${esc(t.title)}</b> ${t.file?'📎 '+esc(t.file):''}<div class="mut ${over?'late':''}">${over?'Overdue · ':'Due '}${fmt(t.due)}${t.desc?' · '+esc(t.desc):''}</div></div>
 <div>${s?`<span class="rank">✓ Done${s.score!==''?' · Score '+esc(s.score):''}${s.early?' · +5 bonus':''}</span>`:`<button class="sm" onclick="openSubmit('${t.id}')">${t.by==='inst'?'Submit':'Mark done'}</button>`}
 ${t.by===me.id?`<button class="sm ghost" onclick="editId='${t.id}';render()">Edit</button><button class="sm ghost" onclick="delTask('${t.id}')">Delete</button>`:''}</div></div>`}).join(''):'<p class="mut">No tasks yet.</p>'}</div>`}
function delTask(id){S.tasks=S.tasks.filter(t=>t.id!==id);save();render()}
function openSubmit(id){const t=S.tasks.find(x=>x.id===id);
 $('#dform').innerHTML=`<h2>${esc(t.title)}</h2><label>Upload file</label><input id="sf" type="file"><br><br><label>Score (if any, e.g. 18/20)</label><input id="ss"><br><br>
 <button type="button" onclick="submitTask('${id}')">Submit</button> <button class="ghost" value="x">Cancel</button>`;$('#dlg').showModal()}
function submitTask(id){const t=S.tasks.find(x=>x.id===id);if(mySub(id,me.id))return;const early=Date.now()<t.due;
 S.subs.push({t:id,u:me.id,at:Date.now(),file:$('#sf').files[0]?.name||'',score:$('#ss').value.trim(),early});
 me.done++;me.xp+=10+(early?5:0);save();$('#dlg').close();render()}
const STAGES=['🌱','🌿','🪴','🌳','🌸','🍎'];
function vPlant(){const lv=Math.floor(me.done/3),p=me.done%3,st=STAGES[Math.min(lv,5)];
 $('#view').innerHTML=`<div class="card"><div class="plant" style="font-size:${70+Math.min(lv,8)*10}px">${st}</div><h2 style="text-align:center">Level ${lv}</h2>
 <div class="bar"><i style="width:${p/3*100}%"></i></div><p class="mut" style="text-align:center">${p}/3 tasks to next level · ${me.done} done · ${me.xp} XP<br>Finish before the deadline for +5 bonus XP.</p></div>`}
function vRank(){const l=stu().slice().sort((a,b)=>b.done-a.done||b.xp-a.xp);
 $('#view').innerHTML=`<div class="card"><h2>Leaderboard</h2><table><tr><th>#</th><th>Student</th><th>Done</th><th>XP</th><th>Rank</th></tr>${l.map((u,i)=>`<tr ${u.id===me.id?'style="font-weight:700"':''}><td>${i+1}</td><td>${esc(u.name)}</td><td>${u.done}</td><td>${u.xp}</td><td class="rank">${rankOf(u)}</td></tr>`).join('')}</table></div>`}
function vManage(){const l=S.tasks.filter(t=>t.by==='inst').sort((a,b)=>a.due-b.due);
 $('#view').innerHTML=taskForm(false)+`<div class="card"><h2>Posted tasks</h2>${l.map(t=>{const n=S.subs.filter(s=>s.t===t.id).length;
 return `<div class="task"><div><span class="tag">${t.type}</span><b>${esc(t.title)}</b> ${t.file?'📎 '+esc(t.file):''}<div class="mut">Due ${fmt(t.due)} · ${n}/${stu().length} submitted</div></div>
 <div><button class="sm ghost" onclick="editId='${t.id}';render()">Edit</button><button class="sm ghost" onclick="delTask('${t.id}')">Delete</button></div></div>`}).join('')||'<p class="mut">Nothing posted yet.</p>'}</div>`}
function vProgress(){const l=S.tasks.filter(t=>t.by==='inst');
 $('#view').innerHTML=`<div class="card"><h2>Student progress</h2><div style="overflow-x:auto"><table><tr><th>Student</th><th>Rank</th><th>Done</th>${l.map(t=>`<th>${esc(t.title.slice(0,14))}</th>`).join('')}</tr>
 ${stu().map(u=>`<tr><td>${esc(u.name)}</td><td class="rank">${rankOf(u)}</td><td>${u.done}</td>${l.map(t=>{const s=mySub(t.id,u.id);return `<td>${s?'✓ '+esc(s.score):'<span class="mut">—</span>'}</td>`}).join('')}</tr>`).join('')}</table></div></div>`}
/* floating leaves */
for(let i=0;i<10;i++){const e=document.createElement('span');e.className='leaf';e.textContent=['🍃','🌿','✨'][i%3];e.style.left=Math.random()*100+'%';e.style.animationDuration=18+Math.random()*18+'s';e.style.animationDelay=-Math.random()*30+'s';$('#bg').appendChild(e)}
load();render();
