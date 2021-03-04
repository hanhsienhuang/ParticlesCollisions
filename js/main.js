
class World{
    constructor(frameRate,
            coefFriction,
            coefResitution,
            gravity
            ){
        this.doms = {};

        this.frameRate = frameRate;
        this.coefFriction = coefFriction;
        this.coefRestitution = coefResitution;
        this.gravity = gravity;
        this.loop = this.loop.bind(this);
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        this.physics = new Physics(
            this.windowWidth,
            this.windowHeight,
            this.coefFriction,
            this.coefRestitution,
            this.gravity);
        Element.initialize(this.windowWidth, this.windowHeight);

    }

    setWalls(width, height){
    }


    addParticle(pos, ang, vel, ang_vel, mass, radius, colors){
        let id = this.physics.addParticle(pos, ang, vel, ang_vel, mass, radius);
        this.doms[id] = Element.create(pos,ang,radius, colors);
    }

    setParticle(id, pos, ang, vel, ang_vel, mass, radius){

    }

    render(){
        let particles = this.physics.particles; 
        for(let id in particles){
            let p = particles[id];
            let dom = this.doms[id];
            dom.update([p.pos[0], p.pos[1]], p.ang);
        }
    }

    loop(){
        this.physics.progress(1/this.frameRate);
        this.render();
        setTimeout(this.loop, 1000/this.frameRate);
    }
}


window.addEventListener('load', ()=>{
    let world = new World(frameRate,
        coefFriction,
        coefRestitution,
        gravity);
    //world.addParticle([230, 200], 0, [105,105], 1, 10, 200, ["blue", "red", "green"]);
    //world.addParticle([500, 500], 1.5, [-10,-10], 10, 1, 20, ["blue", "red", "green", "yellow"]);
    /*
    for(let i=0; i<20; ++i){
        world.addParticle([45 +40*i, 100], 1.5, [-50,0], 0, 1, 20, ["blue", "red", "green", "yellow"]);
    }
    */
    for(let i=0; i<20; ++i){
        for(let j=0;j<10; ++j){
            world.addParticle([100+40*i, 100+40*j], 0.5*i, [40,40], 1, 1+i, 19, ["blue", "red", "green", "yellow"]);
        }
    }
    
    world.loop();
});

let frameRate = 30;
let coefFriction = 0.5;
let coefRestitution = .9;
let gravity = [0, 0];
