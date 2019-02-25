var imgData, data;
var palette;
var w, h;
var points;
var done = false;

function indecesOf(x, y=null) {
    let r;
    if(y == null) {
        r = x;
    } else {
        r = (y * w + x) * 4;
    }
    let i = {};
    i.r = r;
    i.g = r + 1;
    i.b = r + 2;
    i.a = r + 3;
    return i;
}

function relativeIndeces(index, dX, dY) {
    let r = (dY * w + dX) * 4
    let i = {};
    i.r = index.r + r;
    i.g = index.g + r;
    i.b = index.b + r;
    i.a = index.a + r;
    return i;
}

function arrayAtIndex(i) {
    return [data[i], data[i+1], data[i+2], data[i+3]];
}

function arrayAt(x, y) {
    let i = (y*w + x) * 4;
    return arrayAtIndex(i);
}

function colorDiff2(arr1, arr2) {
    // console.log('arr1', arr1, 'arr2', arr2);
    let dR = (arr1[0] - arr2[0]) / 255;
    let dG = (arr1[1] - arr2[1]) / 255;
    let dB = (arr1[2] - arr2[2]) / 255;
    let dA = (arr1[3] - arr2[3]) / 255;

    let dRGB2 = dR*dR + dG*dG + dB*dB;
    // return dA*dA / 2 + dRGB2 * arr1[3] * arr2[3] / (255 * 255);
    // console.log('diff:', dRGB2 + dA*dA)
    return dRGB2 * arr1[3] * arr2[3] / 255 / 255 + dA*dA;
}

function closestPaletteIndex(arr, pal=palette) {
    let index = 0;
    let min = colorDiff2(arr, pal[index]);
    // console.log(arr, pal);
    for(let i = 1; i < pal.length; i++) {
        let diff2 = colorDiff2(arr, pal[i]);
        if(diff2 < min) {
            index = i;
            min = diff2;
        }
    }
    return index;
}

function getPointIndexClosestToPalette(colored, pal=palette) {
    let index = null;
    let min;
    for(let x = 0; x < w; x++) {
        for(let y = 0; y < h; y++) {
            let i = indecesOf(x, y);
            if(!colored[i.r/4]) {
                let arr = arrayAt(x, y);
                let diff = colorDiff2(arr, pal[closestPaletteIndex(arr, pal)]);
                if(index == null || diff < min) {
                    min = diff;
                    index = i;
                }
            }
        }
    }
    return index;
}

function popPoint() {
    return points.pop();
}

function popLeastPoint() {
    let leastPI = -1
    for(let i = 0; i < points.length; i++) {
        if(leastPI == -1 || points[i][1] < points[leastPI][1]) {
            leastPI = i;
        }
    }
    if(leastPI == -1) {
        return null;
    }
    return points.splice(leastPI, 1)[0]
}

function getDistanceFromPalette(arr, pal=palette) {
    return colorDiff2(arr, pal[closestPaletteIndex(arr, pal)]);
}

function getError(og, appr) {
    return [og[0] - appr[0], og[1] - appr[1], og[2] - appr[2], og[3] - appr[3]]
}

Array.prototype.swap = function (x,y) {
  let b = this[x];
  this[x] = this[y];
  this[y] = b;
  return this;
}

Array.prototype.shuffle = function () {
    for(let i = this.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i+1))
        this.swap(i, j);
    }
}

function sortAtPointIndex(pi) {
    while(pi < points.length-1 && points[pi][1] > points[pi+1][1]) {
        points.swap(pi, pi+1);
        pi++;
    }
    while(pi > 0 && points[pi][1] < points[pi-1][1]) {
        points.swap(pi, pi-1);
        pi--;
    }
}

function insertionSort() {
    for(let i = 0; i < points.length; i++) {
        sortAtPointIndex(i);
    }
}

function getPointIndexOf(i) {
    for(let pi = 0; pi < points.length; pi++) {
        if(points[pi][0] == i) {
            return pi;
        }
    }
    return null;
}

function w_myDither() {

    points = [];

    for(let x = 0; x < w; x++) {
        for(let y = 0; y < h; y++) {
            let i = indecesOf(x, y);
            let diff = getDistanceFromPalette(arrayAtIndex(i.r))
            points.push([i.r, diff]);
        }
    }
    // points.shuffle();
    // insertionSort();
    for(let count = 0; points.length > 0; count++) {
        // i = getPointIndexClosestToPalette(colored, palette);
        // console.log(points);
        let point = popLeastPoint();
        if(point == null) {
            break;
        }
        // console.log(point[0]);
        let i = indecesOf(point[0]);
        // console.log(i);
        // console.log(i);
        let arr = arrayAtIndex(i.r);
        let p = closestPaletteIndex(arr);
        // console.log(p);
        // data[i.r] = 255; //palette[p][0];
        // data[i.g] = 0; //palette[p][1];
        // data[i.b] = 255; //palette[p][2];
        // data[i.a] = 255; //palette[p][3];

        // data[i.r] = 255 - palette[p][0];
        // data[i.g] = 255 - palette[p][1];
        // data[i.b] = 255 - palette[p][2];
        // data[i.a] = 255 //palette[p][3];

        data[i.r] = palette[p][0];
        data[i.g] = palette[p][1];
        data[i.b] = palette[p][2];
        data[i.a] = palette[p][3];

        // colored[i.r/4] = true;

        // console.log('changed', i.r);

        let err = getError(arr, palette[p]);

        let f1 = 0.1;
        let f2 = 0.3;
        let f3 = 0.1;
        let f4 = 0;
        let f5 = 0.1;
        let f6 = 0.3;
        let f7 = 0.1;
        let f8 = 0;

        let i1 = relativeIndeces(i, 1, 0);
        let pi1 = getPointIndexOf(i1.r);
        if(pi1 !== null) {
            data[i1.r] += err[0] * f1;
            data[i1.g] += err[1] * f1;
            data[i1.b] += err[2] * f1;
            data[i1.a] += err[3] * f1;
            points[pi1][1] = getDistanceFromPalette(arrayAtIndex(i1.r))
            // sortAtPointIndex(pi1);
        }
        let i2 = relativeIndeces(i, 1, 1);
        let pi2 = getPointIndexOf(i2.r);
        if(pi2 !== null) {
            data[i2.r] += err[0] * f2;
            data[i2.g] += err[1] * f2;
            data[i2.b] += err[2] * f2;
            data[i2.a] += err[3] * f2;
            points[pi2][1] = getDistanceFromPalette(arrayAtIndex(i2.r))
            // sortAtPointIndex(pi2);
        }
        let i3 = relativeIndeces(i, 0, 1);
        let pi3 = getPointIndexOf(i3.r);
        if(pi3 !== null) {
            data[i3.r] += err[0] * f3;
            data[i3.g] += err[1] * f3;
            data[i3.b] += err[2] * f3;
            data[i3.a] += err[3] * f3;
            points[pi3][1] = getDistanceFromPalette(arrayAtIndex(i3.r))
            // sortAtPointIndex(pi3);
        }
        let i4 = relativeIndeces(i, -1, 1);
        let pi4 = getPointIndexOf(i4.r);
        if(pi4 !== null) {
            data[i4.r] += err[0] * f4;
            data[i4.g] += err[1] * f4;
            data[i4.b] += err[2] * f4;
            data[i4.a] += err[3] * f4;
            points[pi4][1] = getDistanceFromPalette(arrayAtIndex(i4.r))
            // sortAtPointIndex(pi4);
        }
        let i5 = relativeIndeces(i, -1, 0);
        let pi5 = getPointIndexOf(i5.r);
        if(pi5 !== null) {
            data[i5.r] += err[0] * f5;
            data[i5.g] += err[1] * f5;
            data[i5.b] += err[2] * f5;
            data[i5.a] += err[3] * f5;
            points[pi5][1] = getDistanceFromPalette(arrayAtIndex(i5.r))
            // sortAtPointIndex(pi5);
        }
        let i6 = relativeIndeces(i, -1, -1);
        let pi6 = getPointIndexOf(i6.r);
        if(pi6 !== null) {
            data[i6.r] += err[0] * f6;
            data[i6.g] += err[1] * f6;
            data[i6.b] += err[2] * f6;
            data[i6.a] += err[3] * f6;
            points[pi6][1] = getDistanceFromPalette(arrayAtIndex(i6.r))
            // sortAtPointIndex(pi6);
        }
        let i7 = relativeIndeces(i, 0, -1);
        let pi7 = getPointIndexOf(i7.r);
        if(pi7 !== null) {
            data[i7.r] += err[0] * f7;
            data[i7.g] += err[1] * f7;
            data[i7.b] += err[2] * f7;
            data[i7.a] += err[3] * f7;
            points[pi7][1] = getDistanceFromPalette(arrayAtIndex(i7.r))
            // sortAtPointIndex(pi7);
        }
        let i8 = relativeIndeces(i, 1, -1);
        let pi8 = getPointIndexOf(i8.r);
        if(pi8 !== null) {
            data[i8.r] += err[0] * f8;
            data[i8.g] += err[1] * f8;
            data[i8.b] += err[2] * f8;
            data[i8.a] += err[3] * f8;
            points[pi8][1] = getDistanceFromPalette(arrayAtIndex(i8.r))
            // sortAtPointIndex(pi8);
        }
        if(count % 10 == 0) {
            // console.log(count);
            // console.log(i);
            // ctx.putImageData(imgData, 0, 0);
            postMessage(imgData);
        }
        if(count % 10000 == 0) {
            console.log(points.length);
        }
    }
    console.log('finished.');
    done = true;
    postMessage(imgData);
}

/*
TODO
sort all pixels (index => distance, sorted)
pop nearest (index)
repaint
mark as painted (painted[index] = true)
dissapate error among nearest 8 pixels (that aren't painted)
-don't re-sort

*/

function redrawLoop() {
    postMessage(imgData);
    console.log('redraw');
    if(!done) {
        setTimeout(redrawLoop, 1);
    }
}

onmessage = function(e) {
    // data = e.data.data;
    // palette = e.data.palette;
    // w = e.data.w;
    // h = e.data.h;
    imgData = e.data[0];
    data = imgData.data;
    palette = e.data[1];
    w = e.data[2];
    h = e.data[3];
    // console.log(data, palette, 'w', w, 'h', h);
    // redrawLoop();
    w_myDither();
}

console.log('worker started.');
