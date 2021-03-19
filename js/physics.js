class Particle{
    constructor(pos, ang, vel, ang_vel, mass, radius){
        this.pos = pos;
        this.ang = ang;
        this.vel = vel;
        this.ang_vel = ang_vel;
        this.mass = mass;
        this.radius = radius;
        this.inertia = 2/5*mass*radius*radius;
    }

    set ang(value){
        this.angle = value % (2*Math.PI);
    }

    get ang(){
        return this.angle;
    }
}


class Physics{
    constructor(width, height, coefFriction, coefRestitution, gravity){
        this.coefFriction = coefFriction;
        this.e = Math.sqrt(coefRestitution);
        this.gravity = gravity;
        this.width = width;
        this.height = height;

        this.time = 0
        this.particleId = 0;
        this.particles = {};
        this.collisions = {};
        this.collideWalls = {};

        this.pq = new PriorityQueue((a,b) => (a.value>b.value));
    }

    addParticle(pos, ang, vel, ang_vel, mass, radius){
        let id = (this.particleId ++).toString();
        this.particles[id] = 
            new Particle(pos, ang, vel, ang_vel, mass, radius);
        this.collisions[id] = {};
        this.collideWalls[id] = [];

        for(let s=0; s<4; ++s){
            let node = new Node(0, {type:"wall", i:id, s:s});
            this.pq.push(node);
            this.collideWalls[id].push(node);
        }
        for(let j in this.particles){
            if(id == j)continue;
            let node = new Node(0, {type:"particle", i:id, j:j});
            if(id < j){
                this.collisions[id][j] = node;
            }else{
                this.collisions[j][id] = node;
            }
            this.pq.push(node);
        }
        this.updateCollisionTimes(id);
        return id;
    }
    
    updateCollisionTimes(id){
        this.getParticleWallCollisionTime(id).forEach(
            (t, i) => {
                this.pq.changeValue(this.collideWalls[id][i], t);
            }
        )
        for(let j in this.particles){
            if(id == j)continue;
            let node = (id<j)?this.collisions[id][j]:this.collisions[j][id];
            this.pq.changeValue(node, this.getParticlesCollisionTime(id, j));
        }
    }

    progress(deltaT){ 
        let endTime = this.time + deltaT;
        while(!this.pq.isEmpty() && this.pq.peek().value < endTime){
            let node = this.pq.peek();
            //console.log(this.time, node.info.type, node.info.i, node.info.j, node.info.s);
            this.progressFree(node.value );
            if(node.info.type == "wall"){
                this.collideWithWall(node.info.i, node.info.s);
                this.updateCollisionTimes(node.info.i);
            }else{
                this.collide(node.info.i, node.info.j);
                this.updateCollisionTimes(node.info.i);
                this.updateCollisionTimes(node.info.j);
            }
        }
        this.progressFree(endTime);
    }


    getParticleWallCollisionTime(id){
        let p = this.particles[id];
        let x = p.pos[0], y =p.pos[1];
        let vx= p.vel[0], vy=p.vel[1];
        let r = p.radius;
        let row = []; // top, down, left, right

        row[0] = this.time + this._getCollideTime(y-r, -vy, this.gravity[1]);
        row[1] = this.time + this._getCollideTime(this.height-y-r, vy, -this.gravity[1]);
        row[2] = this.time + this._getCollideTime(x-r, -vx, -this.gravity[0]);
        row[3] = this.time + this._getCollideTime(this.width-x-r, vx, this.gravity[0]);
            
        return row;
    }

    _getCollideTime(dist, v, acc){
        let D = v*v+2*acc*dist;
        if(acc == 0){
            return v>0?dist/v:Infinity;
        }
        else if( D <= 0 || (acc<0 && v<=0)){
            return Infinity
        }
        return (-v + Math.sqrt(D))/acc;
    }

    getParticlesCollisionTime(i, j){
        let pi = this.particles[i];
        let pj = this.particles[j];
        let x = pj.pos[0]-pi.pos[0], y =pj.pos[1]-pi.pos[1];
        let vx= pj.vel[0]-pi.vel[0], vy=pj.vel[1]-pi.vel[1];
        let r = pi.radius + pj.radius;
        let v_square = vx*vx+vy*vy;
        let v = Math.sqrt(v_square);
        if(v == 0){
            return Infinity;
        }
        let minDis = Math.abs(x*vy-y*vx)/v;
        if(minDis >= r){
            return Infinity;
        }
        let tMinDis = - (x*vx+y*vy)/v_square;
        if(tMinDis<=0){
            return Infinity;
        }
        return this.time + Math.max(0, tMinDis - Math.sqrt(r*r-minDis*minDis)/v);
    }

    progressFree(time){
        let deltaT = time - this.time ;
        let deltaT2 = deltaT*deltaT/2;
        if(deltaT==0)return;
        for(let p of Object.values(this.particles)){
            p.pos[0] += p.vel[0]*deltaT + this.gravity[0]*deltaT2;
            p.pos[1] += p.vel[1]*deltaT - this.gravity[1]*deltaT2;
            p.vel[0] += this.gravity[0] * deltaT;
            p.vel[1] += -this.gravity[1] * deltaT;
            p.ang += p.ang_vel * deltaT;
        }
        this.time = time;
    }

    collide(i, j){ 
        let pi = this.particles[i], pj = this.particles[j];
        let mi = pi.mass,
            vxi = pi.vel[0],
            vyi = pi.vel[1],
            oi = pi.ang_vel,
            Ii = pi.inertia,
            ri = pi.radius;
        let mj = pj.mass,
            vxj = pj.vel[0],
            vyj = pj.vel[1],
            oj = pj.ang_vel,
            Ij = pj.inertia,
            rj = pj.radius;
        let nx = (pi.pos[0]-pj.pos[0])/(ri+rj),
            ny = (pi.pos[1]-pj.pos[1])/(ri+rj);
        let tx = ny, ty = -nx;

        let D = ri*oi + (vxi*tx + vyi*ty) 
                + rj*oj - (vxj*tx + vyj*ty);

        let a0 = 1/mi+1/mj,
            a1 = 2*((vxi*nx+vyi*ny) - (vxj*nx+vyj*ny));
        let b0 = a0 + ri*ri/Ii+ rj*rj/Ij;

        let alpha = -a1/a0*(1+this.e)/2, beta = 0;
        if(D < 0){
            beta = Math.min(this.coefFriction*alpha, -D/b0);
        }else if(D > 0){
            beta = Math.max(-this.coefFriction*alpha, -D/b0);
        }

        pi.vel[0] += (alpha*nx + beta*tx)/mi;
        pi.vel[1] += (alpha*ny + beta*ty)/mi;
        pi.ang_vel += beta*ri/Ii;
        pj.vel[0] -= (alpha*nx + beta*tx)/mj;
        pj.vel[1] -= (alpha*ny + beta*ty)/mj;
        pj.ang_vel += beta*rj/Ij;
    }

    collideWithWall(i, side){
        let nx = undefined, ny = undefined;
        let tx = undefined, ty = undefined;
        switch(side){
            case 0:
                nx = 0;
                ny = 1;
                tx = 1;
                ty = 0;
                break;
            case 1:
                nx = 0;
                ny = -1;
                tx = -1;
                ty = 0;
                break;
            case 2:
                nx = 1;
                ny = 0;
                tx = 0;
                ty = -1;
                break;
            case 3:
                nx = -1;
                ny = 0;
                tx = 0;
                ty = 1;
                break;
        }
        let p = this.particles[i];
        let m = p.mass,
            vx = p.vel[0],
            vy = p.vel[1],
            o  = p.ang_vel,
            I  = p.inertia,
            r  = p.radius;
        let D = r*o + (vx*tx + vy*ty) ;

        let a0 = 1/m, b0 = 1/m + r*r/I;
        let a1 = 2*(vx*nx+vy*ny);

        let alpha = -a1/a0*(1+this.e)/2, beta = 0;
        if(D < 0){
            beta = Math.min(this.coefFriction*alpha, -D/b0);
        }else if(D > 0){
            beta = Math.max(-this.coefFriction*alpha, -D/b0);
        }

        p.vel[0] += (alpha*nx + beta*tx)/m;
        p.vel[1] += (alpha*ny + beta*ty)/m;
        p.ang_vel += beta*r/I;
    }
}
