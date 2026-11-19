import { createHuman, createDrofa } from './characters.js';
const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let motion = !reduced.matches;
const updateMotion = () => {
  document.documentElement.classList.toggle('motion-off', !motion);
  $('#motion-toggle').textContent = motion ? '◌ Анимация включена' : '◌ Анимация выключена';
  $('#motion-toggle').setAttribute('aria-pressed', String(!motion));
};
updateMotion();
$('#motion-toggle').addEventListener('click', () => { motion = !motion; updateMotion(); });
const followMotionPreference = (event) => { motion = !event.matches; updateMotion(); };
if (reduced.addEventListener) reduced.addEventListener('change', followMotionPreference);
else reduced.addListener(followMotionPreference);
$('#year').textContent = new Date().getFullYear();
document.documentElement.classList.add('js-motion');
const observer = new IntersectionObserver((entries) => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
}), { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

$('#theme-switch').addEventListener('click', () => $('.mini-site').classList.toggle('alt'));
let collection = 0;
$('#demo-explore').addEventListener('click', () => {
  collection = (collection + 1) % 3;
  $('.sculpture').style.transform = `rotate(${[-18, 22, -40][collection]}deg) scale(${[1,.88,1.07][collection]})`;
  $('#demo-caption').textContent = ['01 / A new perspective', '02 / Objects with character', '03 / Room to imagine'][collection];
});
$('#run-query').addEventListener('click', () => {
  const button = $('#run-query'); button.disabled = true;
  $('#query-result').textContent = 'Выполняем демо-запрос…';
  setTimeout(() => {
    $('#query-result').textContent = '1 строка · «Ваша идея» → готово к воплощению';
    button.disabled = false; button.textContent = '↻ Ещё раз';
  }, motion ? 850 : 0);
});
const repairButton = $('#repair-button');
repairButton.addEventListener('click', async () => {
  const area = $('.repair-demo');
  const status = $('#repair-status');
  const label = repairButton.lastElementChild;
  area.classList.remove('repaired');
  area.classList.add('running');
  repairButton.disabled = true;
  status.textContent = 'Проверяем детали…';
  label.textContent = 'Улучшаем интерфейс…';
  if (motion) {
    await new Promise(resolve => setTimeout(resolve, 500));
    status.textContent = 'Обновляем интерфейс…';
    await new Promise(resolve => setTimeout(resolve, 700));
  }
  area.classList.remove('running');
  area.classList.add('repaired');
  status.textContent = 'Интерфейс обновлён';
  label.textContent = 'Повторить апгрейд';
  repairButton.disabled = false;
});

const waveLabel = $('.wave-label');
let greetingTimer;
function showGreeting() {
  waveLabel.textContent = 'Рад знакомству';
  clearTimeout(greetingTimer);
  greetingTimer = setTimeout(() => { waveLabel.textContent = 'Привет!'; }, 2700);
}
let greet = showGreeting;
$('#wave').addEventListener('click', () => greet());
let rotate = false, wireframe = false;
$('#rotate').addEventListener('click', () => {
  rotate = !rotate;
  $('#rotate').setAttribute('aria-pressed', String(rotate));
  $('#rotate span').textContent = rotate ? 'Остановить' : 'Вращение';
});
const fail3D = (canvas) => {
  canvas.hidden = true;
  canvas.parentElement.querySelector('.model-fallback').hidden = false;
  if (canvas.id === 'model-canvas') $('.model-controls').hidden = true;
};

import('./assets/three.module.js').then(THREE => {
  const scenes = [];
  function createScene(canvas, model=false) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'}); }
    catch { fail3D(canvas);return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
    renderer.setClearColor(0x121412,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.4;
    const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,1,.1,60);
    camera.position.set(0,.4,model?7.7:7.7);camera.lookAt(0,0,0);
    scene.add(new THREE.HemisphereLight(0xf0f7dd,0x33482a,3));
    const key=new THREE.DirectionalLight(0xfff8e9,4);key.position.set(-4,6,5);scene.add(key);
    const rim=new THREE.DirectionalLight(0xbeeb8b,3);rim.position.set(4,2,-3);scene.add(rim);
    const fill=new THREE.DirectionalLight(0xffffff,.8);fill.position.set(3,0,5);scene.add(fill);
    const data=model ? createDrofa(THREE) : createHuman(THREE);scene.add(data.robot);
    data.robot.rotation.set(-.025,-.28,-.08);
    if(model) {data.robot.scale.setScalar(.93); data.robot.position.y=.1;}
    const torus=meshTorus();scene.add(torus);
    function meshTorus(){const m=new THREE.Mesh(new THREE.TorusGeometry(.87,.012,8,80),new THREE.MeshBasicMaterial({color:0x687c4f,transparent:true,opacity:.65}));m.rotation.x=Math.PI/2;m.position.y=model?-1.71:-2.06;m.scale.y=.72;return m;}
    const resize = () => {
      const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
      camera.position.z=model?7.7:(w/h<.9?8.5:7.7);
      renderer.render(scene,camera);
    };
    new ResizeObserver(resize).observe(canvas);resize();
    const state={renderer,scene,camera,...data,model,visible:true,turn:0};scenes.push(state);
    new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;},{rootMargin:'80px'}).observe(canvas);
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();state.visible=false;fail3D(canvas);});
    return state;
  }
  const hero=createScene($('#hero-canvas'));
  const model=createScene($('#model-canvas'),true);
  let mouseX=0,mouseY=0,waveUntil=0;
  $('.hero-art').addEventListener('pointermove',e=>{
    const r=e.currentTarget.getBoundingClientRect();mouseX=(e.clientX-r.left)/r.width-.5;mouseY=(e.clientY-r.top)/r.height-.5;
  });
  $('.hero-art').addEventListener('pointerleave',()=>{mouseX=mouseY=0;});
  greet = () => {
    waveUntil = performance.now() + 2500;
    showGreeting();
  };
  $('#wireframe').addEventListener('click',()=>{
    wireframe=!wireframe;$('#wireframe').setAttribute('aria-pressed',String(wireframe));
    model?.materials.forEach(mat=>mat.wireframe=wireframe);
  });
  let dragX=null;
  $('#model-canvas').addEventListener('pointerdown',e=>{dragX=e.clientX;e.currentTarget.setPointerCapture(e.pointerId);});
  $('#model-canvas').addEventListener('pointermove',e=>{if(dragX!==null&&model){model.turn+=(e.clientX-dragX)*.015;dragX=e.clientX;}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>$('#model-canvas').addEventListener(type,()=>dragX=null));
  let last=0,elapsed=0;
  function render(now) {
    requestAnimationFrame(render);
    const dt=Math.min((now-last)/1000,.05);last=now;
    if(document.hidden)return;
    if(motion)elapsed+=dt;
    scenes.forEach(s=>{
      if(!s.visible)return;
      if(s.model){
        if (rotate && dragX === null) s.turn += dt * .85;
        s.robot.rotation.y=s.turn-.3;
        s.robot.position.y = .12 + (motion ? Math.sin(elapsed * 1.3) * .055 : 0);
        // Both rotors share one angle so the body's turn affects their speed equally.
        const rotorAngle = (elapsed * 1.5) % (2 * Math.PI);
        s.rotors.forEach(rotor => { rotor.rotation.y = rotorAngle; });
      }else{
        s.robot.position.y=motion?Math.sin(elapsed*1.5)*.085:0;
        s.robot.rotation.z=motion?-.07+Math.sin(elapsed)*.025:-.07;
        s.head.rotation.y+=( (motion?mouseX*.4:0)-s.head.rotation.y)*.06;
        s.head.rotation.x+=( (motion?mouseY*.15:0)-s.head.rotation.x)*.06;
        const active=now<waveUntil;
        s.waveHand.rotation.z = motion ? Math.sin(elapsed * (active ? 11 : 4)) * (active ? .32 : .15) : 0;
      }
      s.renderer.render(s.scene,s.camera);
    });
  }
  requestAnimationFrame(render);
}).catch(error=>{
  console.error('Не удалось загрузить 3D:',error);
  document.querySelectorAll('canvas').forEach(fail3D);
});
