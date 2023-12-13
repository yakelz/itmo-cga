function toggleDropdown() {
	const menu = document.getElementById('dropdownMenu');
	menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', function (event) {
	const dropdown = document.querySelector('.dropdown');
	const isClickInside = dropdown.contains(event.target);

	if (!isClickInside) {
		document.getElementById('dropdownMenu').style.display = 'none';
	}
});
