//Вывод текущего значения слайдера
const slider = document.getElementById('vol');
const value = document.getElementById('value');
slider.addEventListener('input', function () {
	value.textContent = `Текущее значение: ${this.value}`;
});

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const POINT_RADIUS = 5;
const GRAB_ZONE_RADIUS = 30;

let points = [
	{ color: 'green', x: 400, y: 100 },
	{ color: 'red', x: 600, y: 100 },
	{ color: 'red', x: 400, y: 300 },
	{ color: 'green', x: 600, y: 300 },
];

function drawPoint(x, y, color, radius) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.closePath();
}

function drawGrabZone(x, y, outerRadius) {
	ctx.strokeStyle = 'gray';
	ctx.beginPath();
	ctx.arc(x, y, outerRadius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.closePath();
}

function cubicBezier(t, P) {
	return {
		x:
			(1 - t) ** 3 * P[0].x +
			3 * (1 - t) ** 2 * t * P[1].x +
			3 * (1 - t) * t ** 2 * P[2].x +
			t ** 3 * P[3].x,
		y:
			(1 - t) ** 3 * P[0].y +
			3 * (1 - t) ** 2 * t * P[1].y +
			3 * (1 - t) * t ** 2 * P[2].y +
			t ** 3 * P[3].y,
	};
}

slider.oninput = () => {
	redrawCanvas();
};

function drawBezier() {
	ctx.beginPath();
	ctx.strokeStyle = 'blue';
	let point;
	ctx.moveTo(points[0].x, points[0].y);
	for (let t = 0; t <= 1; t += 1 / slider.value) {
		point = cubicBezier(t, points);
		ctx.lineTo(point.x, point.y);
	}
	point = cubicBezier(1, points);
	ctx.lineTo(point.x, point.y);
	ctx.stroke();
}

function connectPoints(x1, y1, x2, y2) {
	ctx.lineWidth = 0.2;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
	ctx.closePath();
}

function drawHelperLines() {
	connectPoints(points[0].x, points[0].y, points[1].x, points[1].y);
	connectPoints(points[3].x, points[3].y, points[2].x, points[2].y);
}

points.forEach(function (point) {
	drawPoint(point.x, point.y, point.color, POINT_RADIUS);
	drawGrabZone(point.x, point.y, GRAB_ZONE_RADIUS);
});

drawHelperLines();
drawBezier();

let isDragging = false;
let currentPointIndex = null;

canvas.addEventListener('mousedown', function (e) {
	let x = e.offsetX,
		y = e.offsetY;

	for (let i = 0; i < points.length; i++) {
		let point = points[i];
		let distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);

		if (distance < 60) {
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

	points.forEach(function (point) {
		drawPoint(point.x, point.y, point.color, POINT_RADIUS);
		drawGrabZone(point.x, point.y, GRAB_ZONE_RADIUS);
		drawHelperLines();
	});

	drawBezier();
}
