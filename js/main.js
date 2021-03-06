let frameRate = 30;
let coefFriction = 0.3;
let coefRestitution = .9;
let gravity = [0, 0];

window.addEventListener('load', ()=>{
    let world = new World(frameRate,
        coefFriction,
        coefRestitution,
        gravity);
    world.addParticle([229, 200], 0, [105,105], 10, 100, 200, ["blue", "red", "green"]);
    world.addParticle([499, 500], 1.5, [-10,-10], 10, 1, 20, ["blue", "red", "green", "yellow"]);
    /*
    for(let i=-1; i<20; ++i){
        world.addParticle([44 +40*i, 100], 1.5, [-50,0], 0, 1, 20, ["blue", "red", "green", "yellow"]);
    }
    */
    /*
    for(let i=-1; i<20; ++i){
        for(let j=-1;j<10; ++j){
            world.addParticle([99+40*i, 100+40*j], 0.5*i, [400,400], 1, 1+i, 19, ["blue", "red", "green", "yellow"]);
        }
    }
    */
    
    world.loop();
});

