// Procedural portfolio characters. Drofa is a fan-art reconstruction, not an extracted game asset.
function kit(T) {
  const materials=[];
  const material=(color,roughness=.6,metalness=0)=>{const m=new T.MeshStandardMaterial({color,roughness,metalness});materials.push(m);return m;};
  const mesh=(parent,g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;};
  const ball=(p,m,x,y,z,a,b=a,c=a)=>{const o=mesh(p,new T.SphereGeometry(1,36,24),m,x,y,z);o.scale.set(a,b,c);return o;};
  const capsule=(p,m,x,y,z,r,l)=>mesh(p,new T.CapsuleGeometry(r,l,8,24),m,x,y,z);
  const tube=(p,m,points,r=.025)=>mesh(p,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v=>new T.Vector3(...v))),40,r,8,false),m);
  const rod=(p,m,a,b,r=.03)=>{const u=new T.Vector3(...a),v=new T.Vector3(...b),d=v.clone().sub(u);const o=mesh(p,new T.CylinderGeometry(r,r,d.length(),16),m);o.position.copy(u.add(v).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;};
  return {materials,material,mesh,ball,capsule,tube,rod};
}

export function createHuman(T) {
  const {materials,material,mesh,ball,capsule,tube,rod}=kit(T);
  const robot=new T.Group();
  const skin=material(0xd9a078,.72),cheek=material(0xc78167,.8),hair=material(0x35251e,.85);
  const hoodie=material(0xa8c982,.9),rib=material(0x819c62,.9),pants=material(0x323b38,.92);
  const white=material(0xf1eedf,.8),ink=material(0x24231f,.55),sole=material(0xbbc0ae,.8);
  // Soft fabric silhouette, continuous arms and legs rather than mechanical joints.
  ball(robot,hoodie,0,-.02,0,.57,.67,.35);
  capsule(robot,rib,0,-.48,0,.46,.06).scale.set(1,.25,.7);
  ball(robot,hoodie,0,.48,-.15,.4,.24,.3);
  capsule(robot,skin,0,.6,0,.16,.22);
  const head=new T.Group();head.position.set(0,1.12,.03);robot.add(head);
  ball(head,skin,0,.03,0,.46,.56,.4);
  ball(head,skin,-.46,.015,0,.09,.14,.075);ball(head,skin,.46,.015,0,.09,.14,.075);
  ball(head,cheek,-.47,.015,.055,.035,.075,.025);ball(head,cheek,.47,.015,.055,.035,.075,.025);
  ball(head,hair,0,.35,-.075,.48,.36,.39);
  // Swept fringe and short sideburns.
  for(const [x,y,z,a,b,c] of [[-.3,.41,.19,.23,.2,.2],[-.08,.52,.21,.27,.21,.22],[.18,.53,.16,.26,.18,.23],[.34,.37,.1,.16,.2,.22]])ball(head,hair,x,y,z,a,b,c);
  ball(head,hair,-.405,.16,-.015,.07,.18,.16);ball(head,hair,.405,.16,-.015,.07,.18,.16);
  for(const sign of [-1,1]) {
    ball(head,white,sign*.18,.06,.365,.105,.115,.047);
    ball(head,ink,sign*.18,.05,.41,.045,.06,.023);
    ball(head,white,sign*.17,.076,.431,.014);
    tube(head,hair,[[sign*.1,.235,.38],[sign*.19,.26,.38],[sign*.29,.22,.335]],.025);
    ball(head,cheek,sign*.31,-.1,.31,.07,.035,.02);
  }
  ball(head,skin,0,-.04,.41,.075,.105,.09);
  tube(head,ink,[[-.13,-.21,.338],[0,-.25,.37],[.13,-.2,.338]],.015);
  // Hoodie drawstrings, front seam and kangaroo pocket.
  for(const sign of [-1,1]){tube(robot,white,[[sign*.1,.46,.29],[sign*.12,.27,.35],[sign*.1,.1,.36]],.016);capsule(robot,ink,sign*.1,.08,.36,.018,.04);}
  tube(robot,rib,[[-.3,-.24,.29],[-.27,-.4,.31],[.27,-.4,.31],[.3,-.24,.29]],.014);
  const badge=mesh(robot,new T.PlaneGeometry(.15,.11),ink,-.3,.2,.31);badge.rotation.y=-.35;
  let waveHand;
  for(const sign of [-1,1]) {
    const arm=new T.Group();arm.position.set(sign*.48,.32,0);robot.add(arm);
    capsule(arm,hoodie,0,-.25,0,.19,.42);
    const elbow = new T.Group();
    elbow.position.y = -.48;
    arm.add(elbow);
    capsule(elbow,hoodie,0,-.19,0,.16,.3);
    capsule(elbow,rib,0,-.39,0,.155,.03);
    const hand = new T.Group();
    hand.position.y = -.45;
    elbow.add(hand);
    ball(hand,skin,0,-.105,.02,.13,.155,.075);
    for(let j=0;j<4;j++) {
      const finger=capsule(hand,skin,(j-1.5)*.064,-.265-Math.sin(j*Math.PI/3)*.035,.02,.028,.14);
      finger.rotation.z=(j-1.5)*-.1;
    }
    const thumb=capsule(hand,skin,.145,-.105,.04,.044,.14);
    thumb.rotation.z = .65;
    arm.rotation.z = sign < 0 ? -.12 : 1.28;
    if (sign > 0) {
      elbow.rotation.z = 1.8;
      waveHand = hand;
    }
    capsule(robot,pants,sign*.255,-.99,0,.24,.62);
    capsule(robot,pants,sign*.26,-1.39,.02,.205,.28);
    ball(robot,white,sign*.26,-1.68,.13,.24,.16,.36);
    ball(robot,sole,sign*.26,-1.78,.14,.245,.065,.36);
    for(let j=0;j<3;j++)rod(robot,sole,[sign*.26-.1,-1.61,.27+j*.045],[sign*.26+.1,-1.61,.27+j*.045],.012);
  }

  return {robot,head,waveHand,materials};
}

export function createDrofa(T) {
  const {materials,material,mesh,ball,capsule,tube,rod}=kit(T);
  const robot=new T.Group(),rotors=[];
  const shell=material(0xd8d5c7,.43,.45),steel=material(0x7d8582,.35,.8),dark=material(0x252e2b,.52,.65);
  const blade=material(0x9baba6,.36,.7),red=material(0x882e24,.65,.25);
  blade.side=T.DoubleSide;
  // Fine painted-metal variation, deterministic and generated locally.
  const paint=document.createElement('canvas');paint.width=256;paint.height=256;
  const pc=paint.getContext('2d');pc.fillStyle='#dbd9cc';pc.fillRect(0,0,256,256);
  let seed=3826;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<3800;i++){pc.fillStyle=`rgba(48,55,47,${rand()*.15})`;pc.fillRect(rand()*256,rand()*256,.4+rand()*1.7,.4+rand()*3);}
  const paintMap=new T.CanvasTexture(paint);paintMap.colorSpace=T.SRGBColorSpace;shell.map=paintMap;
  // The narrow main fuselage and rounded upper dome of the DF-02A.
  const profile=[[.05,-1.12],[.12,-1.03],[.14,-.75],[.19,-.57],[.24,-.3],[.3,-.05],[.31,.35],[.34,.57],[.29,.8],[.18,.96],[0,1.02]].map(p=>new T.Vector2(...p));
  mesh(robot,new T.LatheGeometry(profile,64),shell);
  for(const y of [.38,.48,-.07])mesh(robot,new T.TorusGeometry(y<0?.29:.32,.017,8,64),steel,0,y,0).rotation.x=Math.PI/2;
  capsule(robot,steel,0,1.06,0,.026,.08);
  const lens=mesh(robot,new T.CylinderGeometry(.055,.055,.035,24),dark,0,.02,.3);lens.rotation.x=Math.PI/2;
  ball(robot,steel,0,.02,.323,.028);
  for(const x of [-.22,.22])ball(robot,dark,x,.45,.24,.026);
  // In-world stencil, intentionally a fan-art display label.
  const stencil=document.createElement('canvas');stencil.width=256;stencil.height=256;
  const ctx=stencil.getContext('2d');ctx.fillStyle='#773d32';ctx.textAlign='center';ctx.font='44px Arial';ctx.fillText('★',128,55);
  ctx.fillStyle='#303b36';ctx.font='bold 62px Arial';ctx.fillText('ДФ',128,139);ctx.font='bold 26px Arial';ctx.fillText('02А',128,177);
  const map=new T.CanvasTexture(stencil);map.colorSpace=T.SRGBColorSpace;
  const label=new T.MeshBasicMaterial({map,transparent:true,depthWrite:false});materials.push(label);
  mesh(robot,new T.PlaneGeometry(.37,.37),label,0,-.16,.296);
  for(const sign of [-1,1]) {
    const x=sign*1.2;
    // Two offset steel arms support each vertical rotor cage.
    for(const y of [.12,.43])rod(robot,steel,[sign*.28,y,0],[sign*.63,y,0],.06);
    const cage=new T.Group();cage.position.set(x,.24,0);robot.add(cage);
    const frame=mesh(cage,new T.TorusGeometry(1,.035,8,80),steel);frame.scale.set(.77,1.1,1);
    const inner=mesh(cage,new T.TorusGeometry(1,.013,6,80),dark,0,0,-.035);inner.scale.set(.72,1.04,1);
    for(const y of [-1.1,1.1]){
      mesh(cage,new T.CylinderGeometry(.085,.085,.16,24),steel,0,y,0);
      mesh(cage,new T.CylinderGeometry(.1,.1,.025,24),shell,0,y+Math.sign(y)*.08,0);
    }
    for(let j=0;j<12;j++){
      const a=j/12*Math.PI*2;ball(cage,dark,Math.sin(a)*.77,Math.cos(a)*1.1,.03,.017);
    }
    const rotor=new T.Group();cage.add(rotor);rotors.push(rotor);
    rod(rotor,dark,[0,-1.05,0],[0,1.05,0],.04);
    // Broad helical sheets create Drofa's distinctive barrel-shaped turbines.
    for(let b=0;b<8;b++) {
      const pos=[],uv=[],indices=[],steps=36,across=6;
      for(let j=0;j<=steps;j++)for(let k=0;k<=across;k++){
        const v=j/steps,y=(v*2-1)*1.035;
        const radius=.7*Math.pow(Math.max(0,1-Math.pow(y/1.045,2)),.6);
        const a=b/8*Math.PI*2+(v-.5)*1.8+(k/across-.5)*.68;
        pos.push(Math.cos(a)*radius,y,Math.sin(a)*radius);uv.push(k/across,v);
        if(j<steps&&k<across){const n=j*(across+1)+k;indices.push(n,n+1,n+across+1,n+1,n+across+2,n+across+1);}
      }
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();mesh(rotor,geo,blade);
    }
    // Articulated transport claw below the body.
    tube(robot,steel,[[sign*.12,-.92,0],[sign*.43,-.82,0],[sign*.36,-1.27,0],[sign*.1,-1.85,.03]],.035);
    rod(robot,dark,[sign*.16,-.99,.035],[sign*.11,-1.55,.035],.023);
    capsule(robot,steel,sign*.11,-1.45,.035,.036,.26);
    ball(robot,steel,sign*.38,-.95,.02,.065);
    rod(robot,dark,[sign*.1,-1.85,.03],[sign*.08,-2.02,.15],.033);
  }
  return {robot,materials,rotors};
}
