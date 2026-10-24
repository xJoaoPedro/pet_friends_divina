const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canAnimate = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion;

if (canAnimate) {
    gsap.registerPlugin(ScrollTrigger);
    playHeroIntro();
    revealOnScroll(document.querySelectorAll('main .reveal'));
    // o footer fica no fim da página e nunca chega aos 90% da tela, então dispara já na borda de baixo
    revealOnScroll(document.querySelectorAll('.footer .reveal'), 'top bottom');
    revealPeeks();
} else {
    // sem GSAP (CDN fora do ar) ou com movimento reduzido, tudo aparece direto
    document.documentElement.classList.remove('js');
}

// primeiro o texto no meio, depois o sublinhado, o bichinho da esquerda, o da direita e a imagem de baixo
function playHeroIntro() {
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    intro
        .fromTo('.heroTop', { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: .6 })
        .fromTo('.heroContent > *', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .12 }, '-=.3')
        .to('.underline', { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power2.inOut' }, '-=.4')
        .fromTo('.heroSideLeft img', { autoAlpha: 0, xPercent: -100 }, { autoAlpha: 1, xPercent: 0, duration: .9 }, '-=.2')
        .fromTo('.heroSideRight img', { autoAlpha: 0, xPercent: 100 }, { autoAlpha: 1, xPercent: 0, duration: .9 }, '-=.35')
        .add(peekOverWall(), '-=.3');
}

// a borda da hero é o "muro": os bichinhos sobem escondidos atrás dela, dão um pulinho,
// as patas passam por cima e eles quicam até assentar
function peekOverWall() {
    const wall = document.querySelector('.heroPets');
    const pets = wall.querySelector('img');
    // 32% de baixo da imagem são as patas, que ficam penduradas abaixo da borda
    const behindWall = 'inset(-60% 0% 32% 0%)';
    const overWall = 'inset(-60% 0% -10% 0%)';

    // o recorte entra já, senão a imagem aparece abaixo do muro antes da animação começar
    gsap.set(wall, { clipPath: behindWall });

    return gsap.timeline()
        .fromTo(pets, { autoAlpha: 1, yPercent: 75 }, { yPercent: -14, duration: .6, ease: 'power2.out' })
        .set(wall, { clipPath: overWall })
        .to(pets, { yPercent: 0, duration: .9, ease: 'bounce.out' })
        .set(wall, { clearProps: 'clipPath' });
}

// também é chamada pelo adoptAnimals.js para os cards criados depois do fetch
function revealOnScroll(elements, start = 'top 90%') {
    if (!canAnimate) return;

    ScrollTrigger.batch(elements, {
        start,
        once: true,
        onEnter: (batch) => gsap.fromTo(batch,
            { autoAlpha: 0, y: 48 },
            { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .12, clearProps: 'transform' }
        ),
    });
}

// os bichinhos que espiam das bordas sobem quando a section aparece
function revealPeeks() {
    gsap.from('.peekPuppy', {
        yPercent: 100,
        duration: 1,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '#adoptList', start: 'bottom 95%' },
    });

    gsap.from('.footerDog img', {
        yPercent: 100,
        duration: .9,
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: '.footer', start: 'top 98%' },
    });
}
