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
}


class Physics{
    constructor(width, height, coefFriction, coefRestitution){
        this.coefFriction = coefFriction;
        this.e = Math.sqrt(coefRestitution);
        this.width = width;
        this.height = height;
    }

    progress(state, deltaT){ 
        let ids = Object.keys(state);
        while(deltaT>0){
            let collisionMatrix = this.getParticlesCollisionTimes(state, ids);
            let collisionMatrixWall = this.getParticleWallCollisionTimes(state, ids);
            let collideTime = Infinity;
            
            let collisionWall = [];
            for(let i=0; i<ids.length; ++i){
                for(let s=0; s<4; ++s){
                    let t =collisionMatrixWall[i][s];
                    if(t==collideTime){
                        collisionWall.push([ids[i], s]);
                    }
                    if(t<collideTime){
                        collideTime = t;
                        collisionWall = [[ids[i], s]];
                    }
                }
            }
            let collisions = [];
            for(let i=0; i<ids.length; ++i){
                for(let j=0; j<i; ++j){
                    let t = collisionMatrix[i][j];
                    if(t==collideTime){
                        collisions.push([ids[i], ids[j]]);
                    }
                    if(t<collideTime){
                        collideTime = t;
                        collisionWall = [];
                        collisions = [[ids[i], ids[j]]];
                    }
                }
            }

            if(collideTime < deltaT){
                this.progressFree(state, collideTime);

                for(let c of collisionWall){
                    this.collideWithWall(state, c[0], c[1])
                }
                for(let c of collisions){
                    this.collide(state, c[0], c[1])
                }
                deltaT -= collideTime;
            }else{
                this.progressFree(state, deltaT);
                deltaT = 0;
            }
        }
    }

    getParticleWallCollisionTimes(state, ids){
        let matrix = [];

        for(let i=0; i<ids.length; ++i){
            let p = state[ids[i]];
            let x = p.pos[0], y =p.pos[1];
            let vx= p.vel[0], vy=p.vel[1];
            let r = p.radius;
            let row = []; // top, down, left, right

            row[0] = vy<0?-(y-r)/vy:Infinity;
            row[1] = vy>0?(this.height-y-r)/vy:Infinity;
            row[2] = vx<0?-(x-r)/vx:Infinity;
            row[3] = vx>0?(this.width-x-r)/vx:Infinity;
            
            matrix.push(row);
        }
        return matrix;
    }

    getParticlesCollisionTimes(state, ids){
        let matrix = [];

        for(let i=0; i<ids.length; ++i){
            let pi = state[ids[i]];
            let row = []
            for(let j=0; j<i; ++j){
                let pj = state[ids[j]];
                let x = pj.pos[0]-pi.pos[0], y =pj.pos[1]-pi.pos[1];
                let vx= pj.vel[0]-pi.vel[0], vy=pj.vel[1]-pi.vel[1];
                let r = pi.radius + pj.radius;
                let v_square = vx*vx+vy*vy;
                let v = Math.sqrt(v_square);
                if(v == 0){
                    row.push(Infinity);
                    continue;
                }
                let minDis = Math.abs(x*vy-y*vx)/v;
                if(minDis >= r){
                    row.push(Infinity);
                    continue;
                }
                let tMinDis = - (x*vx+y*vy)/v_square;
                if(tMinDis<=0){
                    row.push(Infinity);
                    continue;
                }
                let t = tMinDis - Math.sqrt(r*r-minDis*minDis)/v;
                row.push(t);
            }
            matrix.push(row);
        }
        return matrix;
    }

    progressFree(state, deltaT){
        for(let p of Object.values(state)){
            p.pos[0] += p.vel[0]*deltaT;
            p.pos[1] += p.vel[1]*deltaT;
            p.ang += p.ang_vel * deltaT;
        }
    }

    collide(state, i, j){ 
        let pi = state[i], pj = state[j];
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

    collideWithWall(state, i, side){
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
        let p = state[i];
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
