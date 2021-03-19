
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
        this.loopid = null;
        this.lastFrameTime = null;
        this.estFrameRate = 0;
    }

    handlePause(e){
        this.pause = !this.pause;
        if(this.pause){
            e.target.innerText = "Start";
            if(this.loopid != null){
                clearTimeout(this.loopid);
                this.loopid = null;
            }
        }else{
            e.target.innerText = "Pause";
            if(this.loopid == null){
                this.loopid = setTimeout(this.loop, 1000/this.frameRate);
            }
        }
    }

    setWalls(width, height){
    }


    addParticle(pos, ang, vel, ang_vel, mass, radius, colors){
        let id = this.physics.addParticle(pos, ang, vel, ang_vel, mass, radius);
        this.doms[id] = Element.create(id, pos,ang,radius, colors);
    }

    setParticle(id, pos, ang, vel, ang_vel, mass, radius){

    }

    render(){
        let particles = this.physics.particles; 
        for(let id in particles){
            let p = particles[id];
            let dom = this.doms[id];
            dom.updatePos(p.pos, p.ang);
            dom.updateVel(p.vel, p.ang_vel);
        }
    }

    updateFrameRate(){
        let t = Date.now();
        if(this.lastFrameTime != null){
            this.estFrameRate = 0.9 * this.estFrameRate + 0.1*1000/(t-this.lastFrameTime);
        }
        this.lastFrameTime = t;
        this.controlPanel.updateFrameRate(this.estFrameRate.toFixed(2));
    }

    loop(){
        this.physics.progress(1/this.frameRate);
        this.render();
        this.updateFrameRate();
        this.loopid = setTimeout(this.loop, 1000/this.frameRate);
    }
}
