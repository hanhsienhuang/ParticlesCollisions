
class World{
    constructor(){
        this.particles = {};
        this.particleId = 0;

        this.doms = {};

        this.frameRate = 30;
        this.coefFriction = 0.5;
        this.coefRestitution = 0.9;
        this.loop = this.loop.bind(this);
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        this.physics = new Physics(this.windowWidth, this.windowHeight, this.coefFriction, this.coefRestitution);
        Element.initialize(this.windowWidth, this.windowHeight);

        //this.addParticle([230, 200], 0, [105,105], 1, 10, 200, ["blue", "red", "green"]);
        //this.addParticle([500, 500], 1.5, [-10,-10], 10, 1, 20, ["blue", "red", "green", "yellow"]);
        for(let i=0; i<20; ++i){
            for(let j=0;j<10; ++j){
                this.addParticle([100+40*i, 100+40*j], 0.5*i, [400,400], 1, 1, 18, ["blue", "red", "green", "yellow"]);
            }
        }
    }

    setWalls(width, height){
    }


    addParticle(pos, ang, vel, ang_vel, mass, radius, colors){
        let id = this.particleId ++;
        this.particles[id] = new Particle(pos, ang, vel, ang_vel, mass, radius);
        this.doms[id] = Element.create(pos,ang,radius, colors);
    }

    setParticle(id, pos, ang, vel, ang_vel, mass, radius){

    }

    render(){
        for(let id in this.particles){
            let p = this.particles[id];
            let dom = this.doms[id];
            dom.update([p.pos[0], p.pos[1]], p.ang);
        }
    }

    loop(){
        this.physics.progress(this.particles, 1/this.frameRate);
        this.render();
        setTimeout(this.loop, 1000/this.frameRate);
    }
}



window.addEventListener('load', ()=>{
    let world = new World();
    world.loop();
});