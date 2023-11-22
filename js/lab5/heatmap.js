const ctxO = document.getElementById('original').getContext('2d', { willReadFrequently: true });
const ctxG = document.getElementById('grayscale').getContext('2d', { willReadFrequently: true });
const ctxP = document.getElementById('photoshop').getContext('2d', { willReadFrequently: true });
const ctxH = document.getElementById('heatmap').getContext('2d', { willReadFrequently: true });

const canvasWidth = 200;
const canvasHeight = 200;

const images = [
	'../img/Биби.png',
	'../img/Ёжик.png',
	'../img/Карыч.png',
	'../img/Копатыч.png',
	'../img/Крош.png',
	'../img/Лосяш.png',
	'../img/Нюша.png',
	'../img/Пин.png',
	'../img/Совунья.png',
];

const photoshop = [
	'../img/ЧБ/Биби.png',
	'../img/ЧБ/Ёжик.png',
	'../img/ЧБ/Карыч.png',
	'../img/ЧБ/Копатыч.png',
	'../img/ЧБ/Крош.png',
	'../img/ЧБ/Лосяш.png',
	'../img/ЧБ/Нюша.png',
	'../img/ЧБ/Пин.png',
	'../img/ЧБ/Совунья.png',
];

let currentImageIndex = 0;

function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

async function updateCanvas(index) {
	const img = await loadImage(images[index]);
	const ph = await loadImage(photoshop[index]);
	ctxO.clearRect(0, 0, canvasWidth, canvasHeight);
	ctxP.clearRect(0, 0, canvasWidth, canvasHeight);
	ctxG.clearRect(0, 0, canvasWidth, canvasHeight);
	ctxH.clearRect(0, 0, canvasWidth, canvasHeight);
	ctxO.drawImage(img, 0, 0, canvasWidth, canvasHeight);
	ctxP.drawImage(ph, 0, 0, canvasWidth, canvasHeight);
	let currentData = ctxO.getImageData(0, 0, canvasWidth, canvasHeight);
	getGrayscale(currentData);
	getHeatmap();
}

document.getElementById('prevBtn').addEventListener('click', () => {
	currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
	updateCanvas(currentImageIndex);
});

document.getElementById('nextBtn').addEventListener('click', () => {
	currentImageIndex = (currentImageIndex + 1) % images.length;
	updateCanvas(currentImageIndex);
});

const colors = [
	{ r: 64, g: 190, b: 64 },
	{ r: 161, g: 219, b: 73 },
	{ r: 215, g: 232, b: 78 },
	{ r: 238, g: 223, b: 78 },
	{ r: 238, g: 202, b: 79 },
	{ r: 238, g: 180, b: 80 },
	{ r: 238, g: 152, b: 79 },
	{ r: 238, g: 97, b: 79 },
];

function createColorBlocks(min, max) {
	const colorContainer = document.getElementById('colorContainer');
	colorContainer.innerHTML = '';
	colors.forEach((color, index) => {
		const colorDiv = document.createElement('div');
		colorDiv.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
		const minRange = map_range(index, 0, colors.length - 1, min, max);
		const maxRange = map_range(index + 1, 0, colors.length - 1, min, max);
		colorDiv.innerHTML = `${minRange} - ${maxRange - 1}`;
		colorContainer.appendChild(colorDiv);
	});
}

function getHeatmap() {
	let grayscale = ctxG.getImageData(0, 0, canvasWidth, canvasHeight);
	let photoshop = ctxP.getImageData(0, 0, canvasWidth, canvasHeight);
	let heatmapData = ctxH.createImageData(canvasWidth, canvasHeight);

	let min = 255;
	let max = 0;

	const differences = [];
	for (let i = 0; i < grayscale.data.length; i += 4) {
		let diff = Math.abs(grayscale.data[i] - photoshop.data[i]);
		if (diff < min) {
			min = diff;
		}
		if (diff > max) {
			max = diff;
		}
		differences.push(diff);
	}

	const temp = [];

	for (let i = 0; i < grayscale.data.length; i += 4) {
		const colorIndex = map_range(differences[i / 4], min, max, 0, colors.length - 1);
		temp.push(colorIndex);
		const color = colors[colorIndex];
		heatmapData.data[i] = color.r; //red
		heatmapData.data[i + 1] = color.g; //green
		heatmapData.data[i + 2] = color.b; //blue
		heatmapData.data[i + 3] = 255; //alpha
	}

	ctxH.putImageData(heatmapData, 0, 0);

	createColorBlocks(min, max);
}
/*
  low1 - минимальная разница пикселей
  high1 - максимальная разница пикселей
  low2 - минимальное кол-во цветов
  high2 - максимальное кол-во цветов
*/
function map_range(value, low1, high1, low2, high2) {
	return Math.round(low2 + ((high2 - low2) * (value - low1)) / (high1 - low1));
}

/**
 * Преобразует изображение в оттенки серого.
 */
function getGrayscale(currentData) {
	const data = currentData.data;
	for (let i = 0; i < data.length; i += 4) {
		const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
		data[i] = data[i + 1] = data[i + 2] = avg;
	}
	ctxG.putImageData(currentData, 0, 0);
}

document.querySelectorAll('.downloadBtn').forEach((btn, index) => {
	btn.addEventListener('click', function () {
		const canvas = this.closest('.main__block').querySelector('canvas');
		downloadCanvas(canvas);
	});
});

/**
 * Скачивание Canvas.
 * @param {HTMLCanvasElement} canvas
 */
function downloadCanvas(canvas) {
	const link = document.createElement('a');
	link.download = 'canvasImage.jpg';
	link.href = canvas.toDataURL('image/jpeg');
	link.click();
}

updateCanvas(0);
