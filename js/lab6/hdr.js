const ctxHigh = document.getElementById('high').getContext('2d', { willReadFrequently: true });
const ctxMid = document.getElementById('mid').getContext('2d', { willReadFrequently: true });
const ctxLow = document.getElementById('low').getContext('2d', { willReadFrequently: true });
const ctxHDR = document.getElementById('myhdr').getContext('2d', { willReadFrequently: true });
const ctxPh = document.getElementById('photoshop').getContext('2d', { willReadFrequently: true });
const ctxHeatmap = document
	.getElementById('heatmap')
	.getContext('2d', { willReadFrequently: true });

const canvasWidth = 300;
const canvasHeight = 300;

function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

async function updateCanvas() {
	const high = await loadImage('./../img/photo/high.jpg');
	const mid = await loadImage('./../img/photo/mid.jpg');
	const low = await loadImage('./../img/photo/low.jpg');
	const phHDR = await loadImage('./../img/photo/hdr.jpg');
	ctxHigh.drawImage(high, 0, 0, canvasWidth, canvasHeight);
	ctxMid.drawImage(mid, 0, 0, canvasWidth, canvasHeight);
	ctxLow.drawImage(low, 0, 0, canvasWidth, canvasHeight);
	ctxPh.drawImage(phHDR, 0, 0, canvasWidth, canvasHeight);

	getHDR();
	getHeatmap();
}

updateCanvas();

async function getHDR() {
	const pixelsHigh = ctxHigh.getImageData(0, 0, canvasWidth, canvasHeight);
	const pixelsMid = ctxMid.getImageData(0, 0, canvasWidth, canvasHeight);
	const pixelsLow = ctxLow.getImageData(0, 0, canvasWidth, canvasHeight);

	const mergedPixels = mergeImages(pixelsHigh, pixelsMid, pixelsLow);
	const hdrImage = toneMapping(mergedPixels);

	ctxHDR.putImageData(hdrImage, 0, 0);
}

function calculateWeight(pixel, type) {
	const brightness = 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];
	return type === 'low' ? brightness : 255 - brightness;
}

function mergeImages(pixelsHigh, pixelsMid, pixelsLow) {
	// копируем веса Mid фотки
	const mergedData = pixelsMid.data.slice();

	for (let i = 0; i < pixelsHigh.data.length; i += 4) {
		// вычисляем веса для каждого изображения
		const weightHigh = calculateWeight(
			[pixelsHigh.data[i], pixelsHigh.data[i + 1], pixelsHigh.data[i + 2]],
			'high'
		);
		const weightMid = calculateWeight(
			[pixelsMid.data[i], pixelsMid.data[i + 1], pixelsMid.data[i + 2]],
			'mid'
		);
		const weightLow = calculateWeight(
			[pixelsLow.data[i], pixelsLow.data[i + 1], pixelsLow.data[i + 2]],
			'low'
		);

		// слияние пикселей
		for (let j = 0; j < 3; j++) {
			// RGB каналы
			mergedData[i + j] =
				(pixelsHigh.data[i + j] * weightHigh +
					pixelsMid.data[i + j] * weightMid +
					pixelsLow.data[i + j] * weightLow) /
				(weightHigh + weightMid + weightLow);
		}
	}

	return new ImageData(mergedData, pixelsHigh.width, pixelsHigh.height);
}

function toneMapping(mergedPixels) {
	for (let i = 0; i < mergedPixels.data.length; i += 4) {
		for (let j = 0; j < 3; j++) {
			// RGB каналы
			mergedPixels.data[i + j] = Math.min(255, mergedPixels.data[i + j] * 1.2); // Увеличение яркости
		}
	}
	return mergedPixels;
}

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

function getHeatmap() {
	let myhdr = ctxHDR.getImageData(0, 0, canvasWidth, canvasHeight);
	let photoshop = ctxPh.getImageData(0, 0, canvasWidth, canvasHeight);
	let heatmapData = ctxHeatmap.createImageData(canvasWidth, canvasHeight);

	let min = 255;
	let max = 0;

	const differences = [];
	for (let i = 0; i < myhdr.data.length; i += 4) {
		let diff = Math.abs(myhdr.data[i] - photoshop.data[i]);
		if (diff < min) {
			min = diff;
		}
		if (diff > max) {
			max = diff;
		}
		differences.push(diff);
	}

	const temp = [];

	for (let i = 0; i < myhdr.data.length; i += 4) {
		const colorIndex = map_range(differences[i / 4], min, max, 0, colors.length - 1);
		temp.push(colorIndex);
		const color = colors[colorIndex];
		heatmapData.data[i] = color.r; //red
		heatmapData.data[i + 1] = color.g; //green
		heatmapData.data[i + 2] = color.b; //blue
		heatmapData.data[i + 3] = 255; //alpha
	}

	ctxHeatmap.putImageData(heatmapData, 0, 0);

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
