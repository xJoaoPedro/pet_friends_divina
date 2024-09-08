let image = document.getElementById('adoptImage');
image.style.bottom = `-${image.width.toString()[0]}${image.width.toString()[1]}px`;

window.addEventListener('resize', function() {
    image.style.bottom = `-${image.width.toString()[0]}${image.width.toString()[1]}px`;
})