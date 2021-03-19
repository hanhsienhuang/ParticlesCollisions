let svgNS = "http://www.w3.org/2000/svg";
let root = undefined;
let svg = undefined;

function initializeDisplay(width, height){
    root = document.getElementById("root");
    svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    root.append(svg);
}

class Element{
    constructor(id, radius, colors){
        this.posgroup = document.createElementNS(svgNS, "g");
        this.anggroup = document.createElementNS(svgNS, "g");
        this.posgroup.appendChild(this.anggroup);
        this.posgroup.setAttribute("data-id", id);

        colors = (typeof(colors)==="object" && colors.length==1)?colors[0]:colors;
        let r = radius;
        if(typeof(colors) === 'object'){
            let a = Math.PI*2/colors.length;
            for(let i=0; i<colors.length; ++i){
                let path = document.createElementNS(svgNS, "path")
                path.setAttribute("fill", colors[i]);
                path.setAttribute("d", 
                    `M 0,0 
                    L ${r*Math.cos(i*a)}, ${r*Math.sin(i*a)}
                    A ${r},${r},0,0,1,${r*Math.cos((i+1)*a)}, ${r*Math.sin((i+1)*a)}
                    z`
                );
                this.anggroup.appendChild(path);
            }
        }else{
            let circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("r", radius); 
            circle.setAttribute("fill", colors); 
            this.anggroup.appendChild(circle);
        }

        this.vel = document.createElementNS(svgNS, "path");
        this.vel.setAttribute("stroke", "black");
        this.vel.setAttribute("stroke-width", "3");

        this.ang_vel = document.createElementNS(svgNS, "path");
        this.ang_vel.setAttribute("fill", "none");
        this.ang_vel.setAttribute("stroke", "black");
        this.ang_vel.setAttribute("stroke-width", "3");

        this.posgroup.appendChild(this.vel);
        this.posgroup.appendChild(this.ang_vel);


        // Add layer to control style
        let outline = document.createElementNS(svgNS, "circle");
        outline.setAttribute("r", radius); 
        outline.setAttribute("opacity", 0); 
        outline.classList.add("particle");
        this.posgroup.appendChild(outline);

        svg.appendChild(this.posgroup);
        this.radius = radius;
    }

    updatePos(pos, ang){
        let translation = 
            `translate(${pos[0].toFixed(1)}, ${pos[1].toFixed(1)})`;
        let rotation = 
            `rotate(${(ang*180/Math.PI).toFixed(1)})`;
        this.posgroup.setAttribute("transform", translation);
        this.anggroup.setAttribute("transform", rotation);
    }

    updateVel(vel, ang_vel){
        let scale = 0.5;
        let v = [vel[0]*scale, vel[1]*scale];
        let vmag = Math.sqrt(v[0]*v[0]+ v[1]*v[1]);
        let vhat = [v[0]/vmag,v[1]/vmag];
        let n = [-vhat[1], vhat[0]];
        let arrowScale = Math.min(vmag, 3);
        let a = [arrowScale, arrowScale*3/4];
        this.vel.setAttribute("d", 
            `M 0,0 
            L ${v[0].toFixed(1)} ${v[1].toFixed(1)} 
            L ${(v[0] - vhat[0]*a[0]+n[0]*a[1]).toFixed(1)} ${(v[1] - vhat[1]*a[0]+n[1]*a[1]).toFixed(1)}
            L ${(v[0] - vhat[0]*a[0]-n[0]*a[1]).toFixed(1)} ${(v[1] - vhat[1]*a[0]-n[1]*a[1]).toFixed(1)}
            L ${v[0].toFixed(1)} ${v[1].toFixed(1)} 
            `
        );

        let poly = 6, d = this.radius/4/poly, r = this.radius*1.1;
        let dangle = 2*Math.PI/poly;
        let cos = Math.cos(dangle), 
            sin = Math.sin(dangle);
        let direction = [0, -1];
        let p = [0, -r];
        let path = `M 0 -${r.toFixed(1)}`;
        let angle = Math.abs(ang_vel);
        arrowScale = Math.min(angle*r, 3);
        a = [arrowScale, arrowScale*3/4];

        while(angle > 0 ){
            r += d;
            p[0] -= direction[0]*r;
            p[1] -= direction[1]*r;
            if(angle<dangle){
                cos = Math.cos(angle), 
                sin = Math.sin(angle);
            }
            direction = [
                direction[0]*cos - direction[1]*sin,
                direction[1]*cos + direction[0]*sin,
            ];
            p[0] += direction[0]*r;
            p[1] += direction[1]*r;
            path += `A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
            angle -= dangle;
        }
        let pmag = Math.sqrt(p[0]*p[0] + p[1]*p[1]);
        let phat = [p[0]/pmag, p[1]/pmag];
        let np = [-phat[1], phat[0]];
        path += `L ${(p[0] - a[0]*np[0] + a[1]*phat[0]).toFixed(1)} ${(p[1] - a[0]*np[1] + a[1]*phat[1]).toFixed(1)}`;
        path += `L ${(p[0] - a[0]*np[0] - a[1]*phat[0]).toFixed(1)} ${(p[1] - a[0]*np[1] - a[1]*phat[1]).toFixed(1)}`;
        path += `L ${(p[0]).toFixed(1)} ${(p[1]).toFixed(1)}`;
        this.ang_vel.setAttribute("d", path);
        if(ang_vel >= 0){
            this.ang_vel.removeAttribute("transform");
        }else{
            this.ang_vel.setAttribute("transform", "matrix(-1 0 0 1 0 0)");
        }

    }

    remove(){

    }

    static create(id, pos, ang, radius, colors){
        let element = new Element(id, radius, colors);
        element.updatePos(pos, ang);
        return element;
    }
}

class ControlPanel{
    constructor(eventHandlers){
        this.initializeContainer();
        let pause = document.createElement("button");
        pause.innerText = "Pause";
        pause.addEventListener("click", eventHandlers.onClickPause);
        this.container.appendChild(pause);

        this.frameRate = document.createElement("div");
        this.updateFrameRate("");
        this.container.appendChild(this.frameRate);
    }

    updateFrameRate(rate){
        this.frameRate.innerText = "Frame rate: " + rate;
    }
    
    initializeContainer(){
        this.width = 300;
        this.minWidth = 200;
        this.maxWidth = 500;
        this.isOpen = true;

        this.control = document.createElement("div");
        this.control.id = "control";
        this.control.style.width = `${this.width}px`;


        this.button = document.createElement("div");
        this.button.id = "control-button";
        this.button.style.left = "100%";
        this.button.style.position = "relative";

        this.icon = document.createElementNS(svgNS, "svg");
        this.icon.id = "control-button-icon";
        let arrow = document.createElementNS(svgNS, "polygon");
        arrow.setAttribute("points", "35,0 20,0 5,20 20,40 35,40 20,20");
        arrow.setAttribute("fill", "#aaaaaa");
        this.icon.appendChild(arrow);

        this.dragbar = document.createElement("div");
        this.dragbar.id = "control-dragbar";

        this.button.appendChild(this.icon);
        this.button.addEventListener("click", 
            this.toggleOpen.bind(this)
        );
        this.dragBar = this.dragBar.bind(this);
        this.dragbar.addEventListener("mousedown", ()=>{
            document.addEventListener("mousemove", this.dragBar);
        });
        document.addEventListener("mouseup", ()=>{
            document.removeEventListener("mousemove", this.dragBar);
        });

        this.container = document.createElement("div");
        this.container.id = "control-container";

        this.control.appendChild(this.container);
        this.control.appendChild(this.button);
        this.control.appendChild(this.dragbar);

        root.append(this.control);
        this.open();

    }

    dragBar(e){
        this.updateWidth(e.clientX);
    }

    updateWidth(w){
        this.width = Math.max(Math.min(this.maxWidth, w), this.minWidth);
        this.control.style.width = `${this.width}px`;
    }

    open(){
        this.control.style.left = 0;
        this.icon.style.transform="";
    }

    close(){
        this.control.style.left = `-${this.width+2}px`;
        this.icon.style.transform="rotate(180deg)";

    }

    toggleOpen(){
        this.isOpen = !this.isOpen;
        console.log(this);
        if(this.isOpen){
            this.open();
        }else{
            this.close();
        }
    }
}