const imagesContainer = document.getElementById('images');
const images = [
	'img/Бараш.png',
	'img/Биби.png',
	'img/Ёжик.png',
	'img/Карыч.png',
	'img/Копатыч.png',
	'img/Крош.png',
	'img/Лосяш.png',
	'img/Нюша.png',
	'img/Пин.png',
	'img/Совунья.png',
];

function populateImages() {
	imagesContainer.innerHTML = ''; // Очищаем контейнер перед заполнением
	const shuffledImages = shuffleArray([...images, ...images, ...images]);
	for (let imgSrc of shuffledImages) {
		let img = new Image();
		img.src = imgSrc;
		imagesContainer.appendChild(img);
	}
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

if (window.innerWidth <= 767) {
	imageWidth = 350;
} else {
	imageWidth = 500;
}

function startAnimation() {
	// Сброс стилей переда началом анимацйи
	imagesContainer.style.transition = 'none';
	imagesContainer.style.transform = 'translateX(0)';

	// Вычисляем смещение, чтобы изображение остановилось ровно
	const totalRolls = Math.floor(images.length * 1.2 + Math.random() * images.length); // 1.2 - это примерное число прокруток, чтобы у нас был хороший эффект прокрутки
	const rollDistance = totalRolls * imageWidth;

	setTimeout(() => {
		imagesContainer.style.transition = 'transform 4s ease-out';
		imagesContainer.style.transform = `translateX(-${rollDistance}px)`;
	}, 100); // небольшая пауза перед началом анимации
}

populateImages();
