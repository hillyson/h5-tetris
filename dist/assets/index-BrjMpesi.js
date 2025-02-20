(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const c of o)if(c.type==="childList")for(const s of c.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const c={};return o.integrity&&(c.integrity=o.integrity),o.referrerPolicy&&(c.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?c.credentials="include":o.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function r(o){if(o.ep)return;o.ep=!0;const c=n(o);fetch(o.href,c)}})();const v=document.getElementById("gameCanvas"),f=v.getContext("2d"),x=document.getElementById("nextPieceCanvas"),_=x.getContext("2d"),H=document.getElementById("startBtn"),ne=document.getElementById("score"),re=document.getElementById("level"),oe=document.getElementById("lines"),l=30,p=10,S=20,T=["#000000","#FF0000","#00FF00","#0000FF","#FFFF00","#FF00FF","#00FFFF","#FFA500"],z=[[],[[1,1,1,1]],[[2,0,0],[2,2,2]],[[0,0,3],[3,3,3]],[[4,4],[4,4]],[[0,5,5],[5,5,0]],[[0,6,0],[6,6,6]],[[7,7,0],[0,7,7]]];let y=Array(S).fill().map(()=>Array(p).fill(0)),i=null,a=0,u=0,L=null,g=null,O=0,P=1,k=0,h=!1,d=!1;function q(){const e=Math.floor(Math.random()*(z.length-1))+1;return z[e]}function N(e,t,n,r=f){r.fillStyle=n,r.fillRect(e*l,t*l,l,l),r.strokeStyle="#000",r.strokeRect(e*l,t*l,l,l)}function K(){for(let e=0;e<S;e++)for(let t=0;t<p;t++)N(t,e,T[y[e][t]])}function R(e,t,n,r=f){e.forEach((o,c)=>{o.forEach((s,m)=>{s!==0&&N(t+m,n+c,T[s],r)})})}function Q(){if(_.clearRect(0,0,x.width,x.height),L){const e=(x.width/l-L[0].length)/2,t=(x.height/l-L.length)/2;R(L,e,t,_)}}function C(e,t,n){return e.some((r,o)=>r.some((c,s)=>{if(c===0)return!1;const m=t+s,F=n+o;return m<0||m>=p||F>=S||F>=0&&y[F][m]!==0}))}function ce(e){const t=Array(e[0].length).fill().map(()=>Array(e.length).fill(0));for(let n=0;n<e.length;n++)for(let r=0;r<e[0].length;r++)t[r][e.length-1-n]=e[n][r];return t}function ie(){i.forEach((e,t)=>{e.forEach((n,r)=>{n!==0&&(y[u+t][a+r]=n)})})}let w=1e3,A=!1,E=!1;function le(){let e=0,t=[];for(let n=S-1;n>=0;n--)y[n].every(r=>r!==0)&&(t.push(n),e++);e>0&&(E=!0,ae(t,()=>{t.forEach(n=>{y.splice(n,1),y.unshift(Array(p).fill(0))}),k+=e,O+=e*100*P,P=Math.floor(k/10)+1,U(),E=!1,b()}))}function ae(e,t){const r=Date.now();function o(){const s=(Date.now()-r)/500;if(s>=1){t();return}f.clearRect(0,0,v.width,v.height),K(),e.forEach(m=>{const F=Math.floor(p/2);for(let D=0;D<p;D++)if(y[m][D]!==0){const V=Math.abs(D-F),$=Math.max(F,p-F),ee=V/$,te=Math.max(0,1-(s+ee*.8));f.globalAlpha=te,N(D,m,T[y[m][D]]),f.globalAlpha=1}}),i&&(W(),R(i,a,u)),Q(),requestAnimationFrame(o)}o()}function se(){if(!g||h||d||E)return;A=!0,w=20;function e(){if(!A||C(i,a,u+1)){A=!1,w=1e3/P,Y();return}u++,b(),setTimeout(e,w)}e()}function fe(){!d&&!E&&Y()}function ue(){g||(y=Array(S).fill().map(()=>Array(p).fill(0)),O=0,P=1,k=0,h=!1,d=!1,w=1e3,U(),i=q(),L=q(),a=Math.floor((p-i[0].length)/2),u=0,b(),g=setInterval(fe,w),H.disabled=!0,X.disabled=!1,B.disabled=!1,B.textContent="暂停游戏")}function de(){clearInterval(g),g=null,alert("游戏结束！得分："+O),H.disabled=!1,X.disabled=!0,B.disabled=!0}function he(){!g||h||(d=!d,B.textContent=d?"继续游戏":"暂停游戏")}let I=0,M=0,G=0;v.addEventListener("touchstart",e=>{if(h||d)return;e.preventDefault();const t=e.touches[0];I=t.clientX,M=t.clientY,G=Date.now()});v.addEventListener("touchmove",e=>{if(h||d||E)return;e.preventDefault();const t=e.touches[0],n=t.clientX-I,r=t.clientY-M;if(Math.abs(n)>30&&(n>0?j():Z(),I=t.clientX),r>100){A=!0;const o=800,c=1e3,s=200,m=Math.min(r,o)/o;w=c-m*(c-s),Y()}});v.addEventListener("touchend",e=>{if(h||d||E)return;e.preventDefault(),A=!1,w=1e3/P;const n=Date.now()-G,r=e.changedTouches[0],o=r.clientX-I,c=r.clientY-M,s=Math.sqrt(o*o+c*c);n<200&&s<20&&J(),I=0,M=0,G=0});v.addEventListener("touchcancel",()=>{});document.addEventListener("keydown",e=>{if(!(h||!g))switch(e.key){case"ArrowLeft":Z();break;case"ArrowRight":j();break;case"ArrowDown":Y();break;case"ArrowUp":J();break}});H.addEventListener("click",ue);const X=document.getElementById("dropBtn"),B=document.getElementById("pauseBtn");X.addEventListener("click",se);B.addEventListener("click",he);X.disabled=!0;B.disabled=!0;function U(){ne.textContent=O,re.textContent=P,oe.textContent=k}function b(){f.clearRect(0,0,v.width,v.height),K(),i&&(W(),R(i,a,u)),Q()}function W(){if(!i)return;let e=u;for(;!C(i,a,e+1);)e++;i.forEach((t,n)=>{t.forEach((r,o)=>{r!==0&&(f.beginPath(),f.setLineDash([5,5]),f.strokeStyle=T[r],f.moveTo((a+o)*l+l/2,(u+n)*l+l/2),f.lineTo((a+o)*l+l/2,(e+n)*l+l/2),f.stroke(),f.setLineDash([]))})}),f.globalAlpha=.3,R(i,a,e),f.globalAlpha=1}function Z(){!g||h||d||E||C(i,a-1,u)||(a--,b())}function j(){!g||h||d||E||C(i,a+1,u)||(a++,b())}function Y(){if(!(!g||h||d||E))if(!C(i,a,u+1))u++,b();else{if(ie(),le(),u===0){h=!0,de();return}A=!1,w=1e3/P,i=L,L=q(),a=Math.floor((p-i[0].length)/2),u=0,b()}}function J(){if(!g||h||d||E)return;const e=ce(i);C(e,a,u)||(i=e,b())}
