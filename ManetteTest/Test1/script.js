// document.getElementById("muteBtn").addEventListener('click', () => {
//     alert("mute");
// })

const themeToggle = document.getElementById('theme');
const btn = document.getElementById('btn');
const icon = document.querySelector('#theme i');
const bouton = document.querySelector('#btn i');

themeToggle.addEventListener('click', function() {
    const currentTheme = document.body.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-bs-theme', newTheme);

    // Update the icon class
    if (newTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');

    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});