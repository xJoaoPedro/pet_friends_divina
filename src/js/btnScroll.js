window.onscroll = function () { scrollFunction() };

const btn = document.getElementById('back-to-top');

scrollFunction();

function scrollFunction() {
    document.documentElement.scrollTop > 500 ? btn.classList.add('show') : btn.classList.remove('show');

    if (document.documentElement.scrollTop > 1400 && document.documentElement.scrollTop < 4800) {
        btn.style.animation = 'highlight 3.5s infinite';
    } else {
        btn.style.animation = 'none';
    }

}