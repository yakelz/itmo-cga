//Вывод текущего значения слайдера
const slider = document.getElementById('vol');
const value = document.getElementById('value');
slider.addEventListener('input', function () {
    value.textContent = `Текущее значение: ${this.value}`;
});

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let points = [
    { x: 100, y: 100 },
    { x: 150, y: 50 },
    { x: 550, y: 200 },
    { x: 300, y: 100 },
];

function drawPoint(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

points.forEach(function(point) {
    drawPoint(point.x, point.y, 10);
});

function drawGrabZone(x, y, outerRadius, innerRadius) {
    ctx.beginPath();
    ctx.arc(x, y, outerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'gray';
    ctx.stroke();
    ctx.closePath();
    
    ctx.beginPath();
    ctx.arc(x, y, innerRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
}

points.forEach(function(point) {
    drawGrabZone(point.x, point.y, 40, 10); // Зона хвата вокруг точки
});


function cubicBezier(t, P) {
    return {
        x: (1 - t) ** 3 * P[0].x + 3 * (1 - t) ** 2 * t * P[1].x + 3 * (1 - t) * t ** 2 * P[2].x + t ** 3 * P[3].x,
        y: (1 - t) ** 3 * P[0].y + 3 * (1 - t) ** 2 * t * P[1].y + 3 * (1 - t) * t ** 2 * P[2].y + t ** 3 * P[3].y
    };
}


ctx.beginPath();
ctx.moveTo(points[0].x, points[0].y);
for (let t = 0; t <= 1; t += 0.01) {
    let point = cubicBezier(t, points);
    ctx.lineTo(point.x, point.y);
}
ctx.stroke();

function ConnectHelperPoints(x1, y1, x2, y2) {
    ctx.lineWidth = 0.2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function DrawHelperLines() {
    ConnectHelperPoints(points[0].x, points[0].y, points[1].x, points[1].y);
    ConnectHelperPoints(points[3].x, points[3].y, points[2].x, points[2].y);
}

DrawHelperLines();


let isDragging = false;
let currentPointIndex = null;

canvas.addEventListener('mousedown', function (e) {
    let x = e.offsetX,
        y = e.offsetY;

    for (let i = 0; i < points.length; i++) {
        let point = points[i];
        let distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);

        if (distance < 40) { // 15 - это радиус зоны хвата
            isDragging = true;
            currentPointIndex = i;
            break;
        }
    }
});

canvas.addEventListener('mousemove', function (e) {
    if (!isDragging) return;

    points[currentPointIndex].x = e.offsetX;
    points[currentPointIndex].y = e.offsetY;

    redrawCanvas();
});

canvas.addEventListener('mouseup', function () {
    isDragging = false;
    currentPointIndex = null;
});

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    points.forEach(function(point) {
        drawPoint(point.x, point.y, 10);
        drawGrabZone(point.x, point.y, 40, 10);
        DrawHelperLines();
    });

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let t = 0; t <= 1; t += 0.01) {
        let point = cubicBezier(t, points);
        ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
}

