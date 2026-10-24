const header = document.getElementById('header');
const hero = document.getElementById('home');
const heroTop = hero?.querySelector('.heroTop');
const menuButton = document.getElementById('menuButton');
const navMenu = document.getElementById('navMenu');
const navLinks = navMenu.querySelectorAll('.navLink');

// nas páginas internas não tem hero, então a header fica sempre visível
if (hero) {
    window.addEventListener('scroll', toggleHeader, { passive: true });
    toggleHeader();
} else {
    header.classList.add('visible');
}

// a header fica escondida na hero e aparece quando a barra com o logo da hero sai da tela
function toggleHeader() {
    const scrolled = window.scrollY > heroTop.offsetHeight;
    header.classList.toggle('visible', scrolled || navMenu.classList.contains('open'));
}

function setMenu(open) {
    navMenu.classList.toggle('open', open);
    menuButton.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', open);
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

menuButton.addEventListener('click', function () {
    setMenu(!navMenu.classList.contains('open'));
});

navMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
        setMenu(false);
    });
});

// nas páginas internas destaca o link da própria página
const currentFile = window.location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(function (link) {
    link.classList.toggle('active', link.getAttribute('href') === currentFile);
});

// na home, destaca no menu a section que está no meio da tela
const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
    });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section').forEach(function (section) {
    sectionObserver.observe(section);
});
