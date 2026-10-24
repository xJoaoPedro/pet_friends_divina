const btn = document.getElementById('whats');
const adoptSection = document.getElementById('adopt');

window.addEventListener('scroll', scrollFunction, { passive: true });

scrollFunction();

function scrollFunction() {
    const scrollTop = document.documentElement.scrollTop;

    btn.classList.toggle('show', scrollTop > 500);

    const inAdoptSection = scrollTop > (adoptSection.offsetTop - 200) && scrollTop < (adoptSection.offsetTop + adoptSection.offsetHeight - 200);
    btn.classList.toggle('highlight', inAdoptSection);
}
