class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Color {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

window.onload = function() {
    generateBackground();
}

window.onresize = function() {
    recalculateSVGHeight();
}

var imageWidth, imageHeight;

function generateBackground() {
    recalculateSVGHeight();

    let svg = document.getElementById("pcgBackground");
    svg.innerHTML = getSVGString();
}

function recalculateSVGHeight() {
    let svg = document.getElementById("pcgBackground");
    let viewBox = svg.getAttribute("viewBox").split(" ").map(x => Number(x));

    imageWidth = viewBox[2];
    imageHeight = (document.body.clientHeight / document.body.clientWidth) * imageWidth;
    viewBox[3] = imageHeight;
    svg.setAttribute("viewBox", viewBox.join(" "));

    console.log(`svg view box dimensions: ${imageWidth}, ${imageHeight}`);
}

function getSVGString() {
    const minVal = .9;
    const maxVal = 1;
    let color = new Color(
        randomBetween(minVal, maxVal),
        randomBetween(minVal, maxVal),
        randomBetween(minVal, maxVal),
    )

    const numberOfTris = 12;

    return (new Array(numberOfTris)).fill("").map(a => renderPoly(getRandomTri(), color)).join("\n");
}


function getRandomTri() {
    let align = Math.round(Math.random());

    return [
        new Point(align, Math.random()),
        new Point(align, Math.random()),
        new Point(Math.random(), Math.random()),
    ];
}

function renderPoly(points, fillColor) {
    return `<polygon points="${renderPoints(points)}"
    style="fill:${renderColor(fillColor)};opacity:0.9" />`;
}

function renderColor(color) {
    return `rgb(${color.r * 255},${color.g * 255},${color.b * 255})`;
}

function renderPoints(points) {
    const hMargin = 0.2;
    return points.map(p => `${p.x * imageWidth},${(-hMargin + p.y * (1 + hMargin * 2)) * imageHeight}`).join(" ");
}

function randomBetween(a, b) {
    return a + Math.random() * (b-a);
}