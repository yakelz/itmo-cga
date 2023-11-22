const thresholdSlider = document.getElementById('thresholdSlider');
const thresholdValue = document.getElementById('thresholdValue');
const ctxO = document.getElementById('original').getContext('2d', { willReadFrequently: true });
const ctxR = document
	.getElementById('reconstructed')
	.getContext('2d', { willReadFrequently: true });
const ctxG = document.getElementById('grayscale').getContext('2d', { willReadFrequently: true });
const ctxResult = document.getElementById('result').getContext('2d', { willReadFrequently: true });

const canvasWidth = 200;
const canvasHeight = 200;

const images = [
	'../img/Совунья.png',
	'../img/Биби.png',
	'../img/Ёжик.png',
	'../img/Карыч.png',
	'../img/Копатыч.png',
	'../img/Крош.png',
	'../img/Лосяш.png',
	'../img/Нюша.png',
	'../img/Пин.png',
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
	ctxO.clearRect(0, 0, canvasWidth, canvasHeight);
	ctxG.clearRect(0, 0, canvasWidth, canvasHeight);
	ctxR.clearRect(0, 0, canvasWidth, canvasHeight);
	ctxResult.clearRect(0, 0, canvasWidth, canvasHeight);
	ctxO.drawImage(img, 0, 0, canvasWidth, canvasHeight);
	originalData = ctxO.getImageData(0, 0, canvasWidth, canvasHeight);
	grayscaleData = getGrayscale(originalData);
	ctxG.putImageData(grayscaleData, 0, 0);
	getWavelet(0);
}

updateCanvas(0);

document.getElementById('prevBtn').addEventListener('click', () => {
	currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
	updateCanvas(currentImageIndex);
});

document.getElementById('nextBtn').addEventListener('click', () => {
	currentImageIndex = (currentImageIndex + 1) % images.length;
	updateCanvas(currentImageIndex);
});

/** @type {ImageData} */
let originalData;
/** @type {ImageData} */
let grayscaleData;

thresholdSlider.addEventListener('input', function () {
	thresholdValue.textContent = `Текущее значение: ${this.value}`;
	const threshold = parseInt(thresholdSlider.value);
	getWavelet(threshold);
});

/**
 * Получение Черно-Белого изображения.
 * @param {ImageData} imageData
 * @returns {ImageData}
 */
function getGrayscale(imageData) {
	//copy of original Image Data
	const copyImageData = new ImageData(
		new Uint8ClampedArray(imageData.data),
		canvasWidth,
		canvasHeight
	);
	const data = copyImageData.data;

	for (let i = 0; i < data.length; i += 4) {
		const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
		data[i] = data[i + 1] = data[i + 2] = avg;
	}
	return copyImageData;
}

/**
 * Получение вейвлета.
 * @param {number} threshold Порог, при котором пиксели будут обнуляться
 */
function getWavelet(threshold) {
	const transformedData = haarWaveletTransform(grayscaleData, threshold);
	ctxR.putImageData(transformedData, 0, 0);
}

/**
 * Получение вейвлета Хаара.
 * @param {ImageData} data Пиксели изображения
 * @param {number} cutoff Порог, при котором пиксели будут обнуляться
 * @returns {ImageData}
 */
function haarWaveletTransform(data, cutoff) {
	// Создаем копию оригинальных данных изображения
	const transformedData = new ImageData(
		new Uint8ClampedArray(data.data),
		canvasWidth,
		canvasHeight
	);

	const pixels = transformedData.data;
	let halfSum = [];
	let halfDiff = [];

	// Выполняем преобразование Хаара
	for (let i = 0; i < pixels.length; i += 8) {
		const hd = Math.abs((pixels[i] - pixels[i + 4]) / 2);
		const hs = (pixels[i] + pixels[i + 4]) / 2;

		const thresholdedHD = hd < cutoff ? 0 : hd;

		halfSum.push(hs);
		halfDiff.push(thresholdedHD);

		const resultPixel1 = thresholdedHD + hs;
		const resultPixel2 = hs - thresholdedHD;

		pixels[i] = resultPixel1;
		pixels[i + 1] = resultPixel1;
		pixels[i + 2] = resultPixel1;
		pixels[i + 4] = resultPixel2;
		pixels[i + 5] = resultPixel2;
		pixels[i + 6] = resultPixel2;
	}

	ctxResult.putImageData(
		new ImageData(new Uint8ClampedArray(pixels), canvasWidth, canvasHeight),
		0,
		0
	);

	// Заполняем изображение wavelet
	for (let i = 0; i < pixels.length; i += 4) {
		const x = (i / 4) % canvasWidth;

		if (x < canvasWidth / 2) {
			const value = halfDiff.shift();
			pixels[i] = value;
			pixels[i + 1] = value;
			pixels[i + 2] = value;
		} else {
			const value = halfSum.shift();
			pixels[i] = value;
			pixels[i + 1] = value;
			pixels[i + 2] = value;
		}
	}
	return transformedData;
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
