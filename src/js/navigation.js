let header = document.getElementById('header');
let menuButton = document.getElementById('menuButton');
let navMenu = document.getElementById('navMenu');
let listItems = document.getElementsByClassName('navListItem');
const navDivs = ['home', 'donate', 'adopt', 'contact']

menuButton.src = '/assets/icons/menu-icon.svg';

window.onload = navConfig();

function navConfig() {

    if (document.documentElement.offsetWidth < 610) {

        menuButton.addEventListener('click', function () {
            if (navMenu.style.maxHeight) {
                header.style.boxShadow = '0px 10px 30px 10px #15207180';
                menuButton.src = '/assets/icons/menu-icon.svg';
                navMenu.style.maxHeight = null;
                navMenu.style.boxShadow = 'none';
            } else {
                header.style.boxShadow = 'none';
                menuButton.src = '/assets/icons/close.svg';
                navMenu.style.maxHeight = navMenu.scrollHeight + "px";
                navMenu.style.boxShadow = '0px 10px 30px 10px #15207180';
            }
        });

        for (let i = 0; i < listItems.length; i++) {
            let item = listItems[i];
            const selectedDiv = document.getElementById(navDivs[i]);
        
            item.addEventListener('click', function () {
                window.scrollTo({ top: (selectedDiv.offsetTop - 90), behavior: "smooth" })
                navMenu.style.maxHeight = null;
                menuButton.src = '/assets/icons/menu-icon.svg';
            });
        }

    } else {
        
        header.style.boxShadow = 'none';
        navMenu.style.maxHeight = navMenu.scrollHeight + "px";
        navMenu.style.boxShadow = '0px 10px 30px 10px #15207180';
    
        for (let i = 0; i < listItems.length; i++) {
            let item = listItems[i];
            const selectedDiv = document.getElementById(navDivs[i]);
        
            item.addEventListener('click', function () {
                window.scrollTo({ top: (selectedDiv.offsetTop - document.getElementById('header').offsetHeight - navMenu.offsetHeight), behavior: "smooth" })
            });
        }

    }
}