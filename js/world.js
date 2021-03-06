
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
        this.windowWidth = document.documentElement.clientWidth;
        this.windowHeight = document.documentElement.clientHeight;

        this.physics = new Physics(
            this.windowWidth,
            this.windowHeight,
            this.coefFriction,
            this.coefRestitution,
            this.gravity);
        initializeDisplay(this.windowWidth, this.windowHeight);

        this.pause = false;
        this.controlPanel = new ControlPanel({
            onClickPause:this.handlePause.bind(this),
        });
    }

    handlePause(e){
        this.pause = !this.pause;
        if(this.pause){
            e.target.innerText = "Start";
        }else{
            e.target.innerText = "Pause";
        }
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
        if(!this.pause){
            this.physics.progress(1/this.frameRate);
            this.render();
        }
        setTimeout(this.loop, 1000/this.frameRate);
    }
}
