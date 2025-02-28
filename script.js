// Time update in system tray
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currentTime').textContent = timeString;
}

updateTime();
setInterval(updateTime, 60000); // Update every minute instead of every second

// Desktop shortcuts
const shortcuts = document.querySelectorAll('.shortcut');
let selectedShortcut = null;

shortcuts.forEach(shortcut => {
    shortcut.addEventListener('click', (event) => {
        // Clear previous selection
        if (selectedShortcut) {
            selectedShortcut.classList.remove('selected');
        }
        shortcut.classList.add('selected');
        selectedShortcut = shortcut;
        event.stopPropagation(); // Prevent desktop click from immediately deselecting
    });

    shortcut.addEventListener('dblclick', () => {
        const shortcutId = shortcut.id;
        console.log(`Double-clicked ${shortcutId}`);
        openWindow(shortcutId + 'Window');
    });
});

// Start menu
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
        startMenu.classList.remove('show');
        
        // Handle different menu actions
        if (action === 'calculator') {
            openWindow('calculator');
        } else if (action === 'notepad') {
            openWindow('notepad');
        } else if (action === 'shutdown') {
            if (confirm('Are you sure you want to shut down your computer?')) {
                document.body.innerHTML = '<div style="background: black; color: white; padding: 20px; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: monospace;">It is now safe to turn off your computer.</div>';
            }
        }
    });
});

// Close start menu when clicking elsewhere
document.addEventListener('click', (event) => {
    if (!startButton.contains(event.target) && !startMenu.contains(event.target) && startMenu.classList.contains('show')) {
        startMenu.classList.remove('show');
    }
    
    // Deselect desktop shortcuts when clicking on desktop
    if (!event.target.closest('.shortcut') && !event.target.closest('.window') && !event.target.closest('.taskbar')) {
        if (selectedShortcut) {
            selectedShortcut.classList.remove('selected');
            selectedShortcut = null;
        }
    }
});

// Windows management
const windows = document.querySelectorAll('.window');
let activeWindow = null;
const taskbarItems = document.querySelector('.taskbar-items');
let zIndex = 100;

// Function to create a taskbar item for a window
function createTaskbarItem(windowElement) {
    const title = windowElement.querySelector('.window-titlebar span').textContent;
    const windowId = windowElement.id;
    
    // Check if taskbar item already exists
    const existingItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
    if (existingItem) return existingItem;
    
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.setAttribute('data-window', windowId);
    
    // Try to find a relevant icon
    let iconSrc = 'images/default.png';
    if (windowId === 'calculator') iconSrc = 'images/calculator.png';
    if (windowId === 'notepad') iconSrc = 'images/notepad.png';
    if (windowId === 'myComputerWindow') iconSrc = 'images/mycomputer.png';
    if (windowId === 'recycleBinWindow') iconSrc = 'images/recyclebin.png';
    
    taskbarItem.innerHTML = `<img src="${iconSrc}" alt="${title}"> ${title}`;
    taskbarItems.appendChild(taskbarItem);
    
    taskbarItem.addEventListener('click', () => {
        const targetWindow = document.getElementById(windowId);
        if (targetWindow.style.display === 'block' && targetWindow === activeWindow) {
            // Minimize if clicking on active window's taskbar item
            targetWindow.style.display = 'none';
            taskbarItem.classList.remove('active');
        } else {
            // Show and activate window
            openWindow(windowId);
        }
    });
    
    return taskbarItem;
}

// Function to activate a window
function activateWindow(windowElement) {
    // Deactivate previously active window
    if (activeWindow) {
        activeWindow.classList.remove('active');
        const prevTaskbarItem = document.querySelector(`.taskbar-item[data-window="${activeWindow.id}"]`);
        if (prevTaskbarItem) prevTaskbarItem.classList.remove('active');
    }
    
    // Activate new window
    windowElement.classList.add('active');
    activeWindow = windowElement;
    
    // Update taskbar
    const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowElement.id}"]`);
    if (taskbarItem) taskbarItem.classList.add('active');
    
    // Bring to front
    windowElement.style.zIndex = zIndex++;
}

// Function to open a window
function openWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (!windowElement) return;
    
    // If window is not already displayed, position it
    if (windowElement.style.display !== 'block') {
        windowElement.style.display = 'block';
        
        // Position in the center if not already positioned
        if (!windowElement.style.left) {
            const left = (window.innerWidth - windowElement.offsetWidth) / 2;
            const top = (window.innerHeight - windowElement.offsetHeight) / 3;
            windowElement.style.left = `${left}px`;
            windowElement.style.top = `${top}px`;
        }
        
        createTaskbarItem(windowElement);
    }
    
    activateWindow(windowElement);
}

// Window controls (dragging, closing, etc.)
windows.forEach(windowElement => {
    const titlebar = windowElement.querySelector('.window-titlebar');
    const closeButton = windowElement.querySelector('.window-close');
    const minimizeButton = windowElement.querySelector('.window-minimize');
    const maximizeButton = windowElement.querySelector('.window-maximize');
    
    let isDragging = false;
    let offsetX, offsetY;
    
    // Make window active when clicked
    windowElement.addEventListener('mousedown', () => {
        activateWindow(windowElement);
    });
    
    // Titlebar dragging
    titlebar.addEventListener('mousedown', (event) => {
        if (event.target !== titlebar && !titlebar.contains(event.target)) return;
        
        isDragging = true;
        offsetX = event.clientX - windowElement.offsetLeft;
        offsetY = event.clientY - windowElement.offsetTop;
        activateWindow(windowElement);
    });
    
    document.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        
        const newLeft = event.clientX - offsetX;
        const newTop = event.clientY - offsetY;
        
        // Keep window within viewport
        const maxLeft = window.innerWidth - windowElement.offsetWidth;
        const maxTop = window.innerHeight - windowElement.offsetHeight;
        
        windowElement.style.left = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
        windowElement.style.top = `${Math.max(0, Math.min(newTop, maxTop))}px`;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Window controls
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            windowElement.style.display = 'none';
            const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowElement.id}"]`);
            if (taskbarItem) {
                taskbarItem.classList.remove('active');
            }
            if (activeWindow === windowElement) {
                activeWindow = null;
            }
        });
    }
    
    if (minimizeButton) {
        minimizeButton.addEventListener('click', () => {
            windowElement.style.display = 'none';
            const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowElement.id}"]`);
            if (taskbarItem) {
                taskbarItem.classList.remove('active');
            }
        });
    }
    
    if (maximizeButton) {
        maximizeButton.addEventListener('click', () => {
            if (windowElement.style.width === '100%') {
                // Restore
                windowElement.style.width = '';
                windowElement.style.height = '';
                windowElement.style.top = '50px';
                windowElement.style.left = '50px';
            } else {
                // Maximize
                windowElement.style.width = '100%';
                windowElement.style.height = 'calc(100vh - 30px)';
                windowElement.style.top = '0';
                windowElement.style.left = '0';
            }
        });
    }
});

// Calculator functionality
let calcDisplay = document.getElementById('calcDisplay');

function calcAppend(value) {
    if (calcDisplay.value === 'Error') {
        calcDisplay.value = '';
    }
    calcDisplay.value += value;
}

function calcEval() {
    try {
        calcDisplay.value = eval(calcDisplay.value);
    } catch (e) {
        calcDisplay.value = 'Error';
    }
}