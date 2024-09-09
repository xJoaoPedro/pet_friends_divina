const btn = document.getElementById('whats');
const adoptSection = document.getElementById('adopt');

window.onscroll = function () { scrollFunction() };

scrollFunction();

function scrollFunction() {
    document.documentElement.scrollTop > 500 ? btn.classList.add('show') : btn.classList.remove('show');

    if (document.documentElement.scrollTop > (adoptSection.offsetTop - 200) && document.documentElement.scrollTop < (adoptSection.offsetTop + adoptSection.offsetHeight - 200)) {
        btn.style.animation = 'highlight 3.5s infinite';
    } else {
        btn.style.animation = 'none';
    }

}

function adopt() {
    console.log(adoptSection.offsetTop)
    console.log(adoptSection.offsetHeight)
}