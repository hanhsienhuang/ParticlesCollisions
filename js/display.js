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
    constructor(radius, colors){
        this.group = document.createElementNS(svgNS, "g");
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
                this.group.appendChild(path);
            }
        }else{
            let circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("r", radius); 
            circle.setAttribute("fill", colors); 
            this.group.appendChild(circle);
        }

        // Add layer to control style
        let outline = document.createElementNS(svgNS, "circle");
        outline.setAttribute("r", radius); 
        outline.setAttribute("opacity", 0); 
        outline.classList.add("particle");
        this.group.appendChild(outline);

        svg.appendChild(this.group);
    }

    update(pos, ang){
        let translation = 
            `translate(${pos[0]}, ${pos[1]})`;
        let rotation = 
            `rotate(${ang*180/Math.PI})`;
        this.group.setAttribute("transform", translation+rotation);
    }

    remove(){

    }

    static create(pos, ang, radius, colors){
        let element = new Element(radius, colors);
        element.update(pos, ang);
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
        this.dragging = false;
        this.dragbar.addEventListener("mousedown", ()=>{
            this.dragging = true;
        });
        document.addEventListener("mousemove", (e)=>{
            if(this.dragging){
                this.updateWidth(e.clientX);
            }
        });
        document.addEventListener("mouseup", ()=>{
            this.dragging = false;
        });

        this.container = document.createElement("div");
        this.container.id = "control-container";

        this.control.appendChild(this.button);
        this.control.appendChild(this.dragbar);
        this.control.appendChild(this.container);

        root.append(this.control);
        this.open();

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
        this.control.style.left = `-${this.width}px`;
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