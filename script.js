(function(){
var $=function(i){return document.getElementById(i)};
var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var screens=document.querySelectorAll(".screen");
function go(id){
  screens.forEach(function(s){s.classList.toggle("active",s.id===id)});
  var s=$(id);if(s)s.scrollTop=0;
}

var cv=$("sparks"),cx=cv.getContext("2d"),W=0,H=0,parts=[],boost=0;
function size(){
  var d=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);
}
function spawn(burst){
  parts.push({
    x:burst?W/2:Math.random()*W,
    y:burst?H/2:H+10,
    r:Math.random()*1.8+.6,
    vx:(Math.random()-.5)*(burst?3:.4),
    vy:burst?-(Math.random()*2.5+.5):-(Math.random()*.7+.2),
    a:Math.random()*.6+.3,
    t:Math.random()*6
  });
}
function loop(){
  cx.clearRect(0,0,W,H);
  var max=window.innerWidth<600?28:55;
  if(!reduce&&parts.length<max&&Math.random()<.35)spawn(false);
  if(boost>0){for(var k=0;k<3;k++)spawn(true);boost--}
  for(var i=parts.length-1;i>=0;i--){
    var p=parts[i];
    p.t+=.03;p.x+=p.vx+Math.sin(p.t)*.25;p.y+=p.vy;p.a-=.0012;
    if(p.y<-10||p.a<=0){parts.splice(i,1);continue}
    cx.beginPath();
    cx.fillStyle="rgba(243,205,120,"+Math.max(p.a,0)+")";
    cx.shadowColor="rgba(255,200,90,.8)";cx.shadowBlur=8;
    cx.arc(p.x,p.y,p.r,0,6.283);cx.fill();
  }
  requestAnimationFrame(loop);
}
size();window.addEventListener("resize",size);
if(!reduce)loop();else cx.clearRect(0,0,W,H);

$("openDoor").addEventListener("click",function(){
  var b=this;b.disabled=true;
  document.querySelector(".scene").classList.add("opened");
  if(!reduce)boost=40;
  setTimeout(function(){go("s-welcome")},reduce?50:1900);
});
$("toLetter").addEventListener("click",function(){go("s-letter")});

var paras=[],io=null,ready=false;
$("openLetter").addEventListener("click",function(){
  this.disabled=true;
  $("envelope").classList.add("open");
  setTimeout(function(){
    $("envStage").classList.add("out");
    setTimeout(function(){
      $("envStage").classList.add("hidden");
      $("readStage").classList.remove("hidden");
      startReading();
    },reduce?20:650);
  },reduce?50:2000);
});

function startReading(){
  var sc=$("s-letter");
  paras=[].slice.call(document.querySelectorAll("#letter p"));
  if("IntersectionObserver" in window){
    io=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add("show");io.unobserve(e.target)}
      });
    },{root:sc,threshold:.12});
    paras.forEach(function(p,i){p.style.transitionDelay=(i<4?i*.25:0)+"s";io.observe(p)});
  }else{paras.forEach(function(p){p.classList.add("show")})}
  sc.addEventListener("scroll",onScroll,{passive:true});
  onScroll();
}
function onScroll(){
  var sc=$("s-letter"),max=sc.scrollHeight-sc.clientHeight;
  var pct=max>0?sc.scrollTop/max:1;
  $("bar").style.width=(pct*100)+"%";
  if(pct>.97&&!ready){ready=true;$("toFinal").disabled=false}
}
$("toFinal").addEventListener("click",function(){
  go("s-final");
  if(!reduce)boost=50;
});

$("restart").addEventListener("click",function(){
  var sc=$("s-letter");
  sc.removeEventListener("scroll",onScroll);
  if(io){io.disconnect();io=null}
  paras.forEach(function(p){p.classList.remove("show");p.style.transitionDelay=""});
  ready=false;
  $("toFinal").disabled=true;
  $("bar").style.width="0";
  $("readStage").classList.add("hidden");
  $("envStage").classList.remove("hidden","out");
  $("envelope").classList.remove("open");
  $("openLetter").disabled=false;
  document.querySelector(".scene").classList.remove("opened");
  $("openDoor").disabled=false;
  sc.scrollTop=0;
  go("s-door");
});
})();