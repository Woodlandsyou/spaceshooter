let pow = 1, arrM = [], arrA = [];
let d = 360, c = 0;

function setup() {
    createCanvas(400, 400);
}

function draw() {
    background(0)
    rotateRect();
    noLoop();
}



function hexagon(x, y, r) {
    const xoff = r / 2, yoff = Math.sqrt(r * r * 0.75);
    fill(map(mouseX, 0, width, 0, 255));
    beginShape()
    vertex(x - xoff, y - yoff);
    vertex(x + xoff, y - yoff);
    vertex(x + r, y);
    vertex(x + xoff, y + yoff);
    vertex(x - xoff, y + yoff);
    vertex(x - r, y);
    endShape()
}

function rotateRect() {
    translate(50, 100);
    rectMode(CENTER);
    rotate(Math.PI / 4);
    rect(0, 0, 50);
}

function mapC() {
    c = map(mouseX, 0, width, 0, 255);
    background(c);
}
class Statistics {
    static fn() {
        for (let i = 0; i < 1000; i++) {
            const p = f(pow);
            arrM.push(p[0]);
            arrA.push(p[1]);
        }
    }
    
    static f(power, length = 25) {
        let arr = [], pow = 1;
        for(let i = 0; i < length; i++) {
            arr.push(random(4, 6) * Math.pow(1.4, power));
            pow += 1.1;
        }
        return [median(arr), aMean(arr)];
    }
    
    static median(arr) {
        l = arr.length - 1;
        if(l % 2) return aMean([arr[(l - 1) / 2], arr[(l + 1) / 2]]);
        if(!(l % 2)) return arr[l / 2];
    }
    
    static aMean(arr) {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum / arr.length;
    }
    
    static statistics(arr) {
        console.log(`Median: ${median(arr)} || arithmetic mean: ${aMean(arr)}`);
    }
}