const images = [
	'../img/Бараш.png',
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

let currentImageIndex = 0;
const img = new Image();
img.src = images[currentImageIndex];

document.getElementById('prevBtn').addEventListener('click', () => {
	currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
	img.src = images[currentImageIndex];
});

document.getElementById('nextBtn').addEventListener('click', () => {
	currentImageIndex = (currentImageIndex + 1) % images.length;
	img.src = images[currentImageIndex];
});

const brightnessSlider = document.getElementById('brightnessSlider');
const brightnessValue = document.getElementById('brightnessValue');
brightnessSlider.addEventListener('input', function () {
	brightnessValue.textContent = `Текущее значение: ${this.value}`;
	const brightness = parseInt(brightnessSlider.value);
	changeBrightness(brightness);
});

const contrastSlider = document.getElementById('contrastSlider');
const contrastValue = document.getElementById('contrastValue');
contrastSlider.addEventListener('input', function () {
	contrastValue.textContent = `Текущее значение: ${this.value}`;
	const contrast = parseInt(contrastSlider.value);
	changeContrast(contrast);
});

const canvasWidth = 200;
const canvasHeight = 200;

/**
 * Данные оригинального изображения.
 * @type {ImageData}
 */
let originalData;
/**
 * Данные текущего изображения, с которыми будет производиться работа.
 * @type {ImageData}
 */
let currentData;

const ctxO = document.getElementById('original').getContext('2d');
const ctxG = document.getElementById('grayscale').getContext('2d');
const ctxB = document.getElementById('brightness').getContext('2d');
const ctxC = document.getElementById('contrast').getContext('2d');

img.onload = () => {
	ctxO.drawImage(img, 0, 0, canvasWidth, canvasHeight);
	ctxB.drawImage(img, 0, 0, canvasWidth, canvasHeight);
	ctxC.drawImage(img, 0, 0, canvasWidth, canvasHeight);
	ctxG.drawImage(img, 0, 0, canvasWidth, canvasHeight);
	originalData = ctxO.getImageData(0, 0, canvasWidth, canvasHeight); //сохраняем original
	currentData = ctxO.getImageData(0, 0, canvasWidth, canvasHeight); //а работаем с current

	resetSliders();

	getGrayscale();
	getHistogram('original');
	getHistogram('grayscale');
	getHistogram('brightness');
	getHistogram('contrast');
};

/**
 * Изменить яркость изображения.
 * @param {number} brightness - Значение яркости.
 */
function changeBrightness(brightness) {
	const data = currentData.data;
	const original = originalData.data;
	for (let i = 0; i < data.length; i += 4) {
		data[i] = Math.min(255, Math.max(0, original[i] + brightness)); //red
		data[i + 1] = Math.min(255, Math.max(0, original[i + 1] + brightness)); //green
		data[i + 2] = Math.min(255, Math.max(0, original[i + 2] + brightness)); //blue
	}
	ctxB.putImageData(currentData, 0, 0);
	getHistogram('brightness');
}

/**
 * Изменить контраст изображения.
 * @param {number} brightness - Значение контраста.
 */
function changeContrast(contrast) {
	const data = currentData.data;
	const original = originalData.data;
	const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

	for (let i = 0; i < data.length; i += 4) {
		data[i] = Math.min(255, Math.max(0, factor * (original[i] - 128) + 128));
		data[i + 1] = Math.min(255, Math.max(0, factor * (original[i + 1] - 128) + 128));
		data[i + 2] = Math.min(255, Math.max(0, factor * (original[i + 2] - 128) + 128));
	}

	ctxC.putImageData(currentData, 0, 0);
	getHistogram('contrast');
}

/**
 * Преобразует изображение в оттенки серого.
 */
function getGrayscale() {
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

/**
 * Сбрасывает значения слайдеров яркости и контраста.
 */
function resetSliders() {
	brightnessSlider.value = 0;
	brightnessValue.textContent = `Текущее значение: 0`;
	contrastSlider.value = 0;
	contrastValue.textContent = `Текущее значение: 0`;
}

/**
 * Генерирует и отображает гистограмму для указанного canvas.
 * @param {string} canvasId - Идентификатор элемента canvas, для которого будет сгенерирована гистограмма.
 */
function getHistogram(canvasId) {
	const ctx = document.getElementById(canvasId).getContext('2d');
	const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	const data = imageData.data;
	const histogramData = new Array(256).fill(0);

	// Вычисляем гистограмму
	for (let i = 0; i < data.length; i += 4) {
		//y = 0.2126 + 0.7152 + 0.0722B
		const luminance = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
		histogramData[luminance]++;
	}

	// Находим максимальное значение для нормализации гистограммы
	const maxCount = Math.max(...histogramData);

	// Получаем canvas, где нужно нарисовать гистограмму
	const histogramCanvas = document.getElementById(canvasId + 'Histogram');
	const histogramCtx = histogramCanvas.getContext('2d');

	// Очищаем canvas перед отрисовкой
	histogramCtx.clearRect(0, 0, histogramCanvas.width, histogramCanvas.height);

	// Рисуем гистограмму
	histogramData.forEach((count, i) => {
		const x = i * (histogramCanvas.width / histogramData.length);
		const height = (Math.log(count + 1) / Math.log(maxCount + 1)) * histogramCanvas.height * 0.5;
		const y = histogramCanvas.height - height;

		histogramCtx.fillRect(x, y, histogramCanvas.width / histogramData.length, height);
	});
}
