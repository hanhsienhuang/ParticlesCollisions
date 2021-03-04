let svgNS = "http://www.w3.org/2000/svg";
let root = undefined;
let svg = undefined;

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

    static initialize(width, height){
        root = document.getElementById("root");
        svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        root.append(svg);
    }
}