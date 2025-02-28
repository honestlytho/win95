function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currentTime').textContent = timeString;
}

updateTime(); // Initial call
setInterval(updateTime, 1000); // Update every second

//shortcut selection and double click functionality.

const shortcuts = document.querySelectorAll('.shortcut');
let selectedShortcut = null;

shortcuts.forEach(shortcut => {
    shortcut.addEventListener('click', () => {
        if (selectedShortcut) {
            selectedShortcut.classList.remove('selected');
        }
        shortcut.classList.add('selected');
        selectedShortcut = shortcut;
    });

    shortcut.addEventListener('dblclick', () => {
        const shortcutId = shortcut.id;
        console.log(`Double-clicked ${shortcutId}`);
        // Here you would add code to open the corresponding app/window
        //for now, it just console logs the id.
    });
});

// ... (previous JavaScript) ...

const startButton = document.querySelector('.start-button');
const startMenu = document.querySelector('.start-menu');
const menuItems = document.querySelectorAll('.menu-item');

startButton.addEventListener('click', () => {
    startMenu.classList.toggle('show');
});

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const action = item.dataset.action;
        console.log(`Menu item clicked: ${action}`);
        startMenu.classList.remove('show'); // close start menu after selection.
        // Add logic to handle different menu actions here
        if(action === 'calculator'){
            console.log("open calculator");
        } else if (action === 'notepad'){
            console.log("open notepad");
        }
    });
});

document.addEventListener('click', (event) => {
    if (!startButton.contains(event.target) && !startMenu.contains(event.target) && startMenu.classList.contains('show')) {
        startMenu.classList.remove('show');
    }
});

// ... (previous JavaScript) ...

const calculatorWindow = document.getElementById('calculator');
const notepadWindow = document.getElementById('notepad');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const action = item.dataset.action;
        console.log(`Menu item clicked: ${action}`);
        startMenu.classList.remove('show');
        if (action === 'calculator') {
            calculatorWindow.style.display = 'block';
        } else if (action === 'notepad') {
            notepadWindow.style.display = 'block';
        }
    });
});

const windows = document.querySelectorAll('.window');

windows.forEach(window => {
    const titlebar = window.querySelector('.window-titlebar');
    const closeButton = window.querySelector('.window-close');
    let isDragging = false;
    let offsetX, offsetY;

    titlebar.addEventListener('mousedown', (event) => {
        isDragging = true;
        offsetX = event.clientX - window.offsetLeft;
        offsetY = event.clientY - window.offsetTop;
    });

    document.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        window.style.left = event.clientX - offsetX + 'px';
        window.style.top = event.clientY - offsetY + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    closeButton.addEventListener('click', () => {
        window.style.display = 'none';
    });
});