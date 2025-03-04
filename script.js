// Login screen functionality
const loginButton = document.querySelector('.login-button');
const loginScreen = document.querySelector('.login-screen');
const loadingScreen = document.querySelector('.loading-screen');
const desktop = document.querySelector('.desktop');

// Handle login button click
loginButton.addEventListener('click', () => {
    // Hide login screen and show loading screen
    loginScreen.style.display = 'none';
    loadingScreen.style.display = 'flex';

    // Simulate Windows loading
    setTimeout(() => {
        // Hide loading screen and show desktop
        loadingScreen.style.display = 'none';
        desktop.style.display = 'block';

        // Start the normal desktop functionality
        updateTime();
        resetScreenSaver();
    }, 2000); // 2 second loading time
});

// Variables to track the screen saver
let screenSaverTimeout;
let lastActivity = Date.now();
const SCREEN_SAVER_DELAY = 300000; // 5 minutes in milliseconds

// Time update in system tray
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currentTime').textContent = timeString;
}

updateTime();
setInterval(updateTime, 60000); // Update every minute

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

        if (shortcutId === 'readme') {
            openWindow('readmeWindow');
        } else if (shortcutId === 'customApp') {
            openWindow('customAppWindow');
        } else if (shortcutId === 'game') {
            openWindow('gameWindow');
        } else {
            openWindow(shortcutId + 'Window');
        }
    });
});

// Start menu
const startButton = document.querySelector('.start-button');
const startMenu = document.querySelector('.start-menu');
const menuItems = document.querySelectorAll('.menu-item');

// Update Windows title to "Posh PC" in start menu header
const startMenuHeader = document.querySelector('.start-menu-header');
if (startMenuHeader) {
    startMenuHeader.textContent = "Posh PC";
}

// Initialize the start menu functionality once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.start-button');
    const startMenu = document.querySelector('.start-menu');

    if (startButton && startMenu) {
        startButton.addEventListener('click', () => {
            startMenu.classList.toggle('show');
            startButton.classList.toggle('active');
        });
    }
});

menuItems.forEach(item => {
    // Event handler code is in the next section
});

document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (event) => {
        const action = item.dataset.action;
        console.log(`Menu item clicked: ${action}`);

        // Don't close menu if clicking on submenu parent
        if (item.querySelector('.submenu') && !event.target.closest('.submenu')) {
            event.stopPropagation();
            return;
        }

        startMenu.classList.remove('show');
        startButton.classList.remove('active');

        // Handle different menu actions
        if (action === 'calculator') {
            openWindow('calculator');
        } else if (action === 'notepad') {
            openWindow('notepad');
        } else if (action === 'customApp') {
            openWindow('customAppWindow');
        } else if (action === 'settings') {
            openWindow('settingsWindow');
        } else if (action === 'game') {
            openWindow('gameWindow');
        } else if (action === 'documents') {
            openWindow('documentsWindow');
        } else if (action === 'readme') {
            openWindow('readmeWindow');
        } else if (action === 'shutdown') {
            console.log("Shutdown option clicked - no action taken");
            // Do nothing as requested - for safety, explicitly prevent any default actions
            event.preventDefault();
            return false;
        }
    });
});


// Close start menu when clicking elsewhere
document.addEventListener('click', (event) => {
    if (!startButton.contains(event.target) && !startMenu.contains(event.target) && startMenu.classList.contains('show')) {
        startMenu.classList.remove('show');
        startButton.classList.remove('active');
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
    if (windowId === 'notepad' || windowId === 'readmeWindow') iconSrc = 'images/notepad.png';
    if (windowId === 'myComputerWindow') iconSrc = 'images/mycomputer.png';
    if (windowId === 'recycleBinWindow') iconSrc = 'images/recyclebin.png';
    if (windowId === 'customAppWindow') iconSrc = 'images/joystick.png';
    if (windowId === 'settingsWindow') iconSrc = 'images/settings.png'; // Changed icon
    if (windowId === 'gameWindow') iconSrc = 'images/game.png'; // Added icon


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

    // Reset screen saver timer
    resetScreenSaver();
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
            windowElement.style.left = `${Math.max(0, left)}px`;
            windowElement.style.top = `${Math.max(0, top)}px`;
        }

        createTaskbarItem(windowElement);
    }

    activateWindow(windowElement);

    // Special handling for maximized custom app
    if (windowId === 'customAppWindow') {
        resizeCustomApp();
    }
}

// Function to show an error dialog
function showError(message) {
    const errorDialog = document.getElementById('errorDialog');
    const errorMessage = document.getElementById('errorMessage');

    errorMessage.textContent = message;
    errorDialog.style.display = 'block';

    // Set up event listener for OK button
    const okButton = errorDialog.querySelector('.dialog-ok');
    okButton.addEventListener('click', () => {
        errorDialog.style.display = 'none';
    });

    // Close button
    const closeButton = errorDialog.querySelector('.dialog-close');
    closeButton.addEventListener('click', () => {
        errorDialog.style.display = 'none';
    });
}

// Function to resize the custom app iframe when window size changes
function resizeCustomApp() {
    const customAppWindow = document.getElementById('customAppWindow');
    const customAppFrame = document.getElementById('customAppFrame');
    if (customAppWindow && customAppFrame) {
        const titlebarHeight = customAppWindow.querySelector('.window-titlebar').offsetHeight;
        const windowHeight = customAppWindow.offsetHeight;
        const frameHeight = windowHeight - titlebarHeight;
        customAppFrame.style.height = `${frameHeight}px`;
    }
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
        if (event.target.classList.contains('window-button')) return;

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

        // For custom app, resize the iframe when moving
        if (windowElement.id === 'customAppWindow') {
            resizeCustomApp();
        }
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
                taskbarItem.remove(); // Remove from taskbar completely
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
                windowElement.style.height = `calc(100vh - 56px)`; // Adjusted for doubled taskbar
                windowElement.style.top = '0';
                windowElement.style.left = '0';
            }

            // For custom app, resize the iframe after maximizing/restoring
            if (windowElement.id === 'customAppWindow') {
                setTimeout(resizeCustomApp, 0);
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

// Background settings functionality
const backgroundOptions = document.querySelectorAll('.background-option');
const backgroundPreview = document.getElementById('backgroundPreview');
const applyBackgroundButton = document.getElementById('applyBackground');
const cancelSettingsButton = document.getElementById('cancelSettings');
const okSettingsButton = document.getElementById('okSettings');
let selectedBackground = 'images/bg.png'; // Default to bg.png
let isBackgroundImage = true; // Default to image background

backgroundOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove selected class from all options
        backgroundOptions.forEach(opt => opt.classList.remove('selected'));

        // Add selected class to clicked option
        option.classList.add('selected');

        // Update preview
        const bgValue = option.dataset.bg;

        // Check if this is the image option
        if (bgValue === 'image') {
            isBackgroundImage = true;
            selectedBackground = 'images/bg.png';
            backgroundPreview.style.backgroundImage = `url('${selectedBackground}')`;
            backgroundPreview.style.backgroundSize = 'cover';
            backgroundPreview.style.backgroundPosition = 'center';
            backgroundPreview.style.backgroundColor = '';
        } else {
            isBackgroundImage = false;
            selectedBackground = bgValue;
            backgroundPreview.style.backgroundImage = '';
            backgroundPreview.style.backgroundColor = bgValue;
        }
    });
});

// Set default background to bg.png on load if available
window.addEventListener('load', () => {
    // Try to preload the background image to check if it exists
    const img = new Image();
    img.onload = function() {
        // Image exists, set as background
        isBackgroundImage = true;
        selectedBackground = 'images/bg.png';
        const desktop = document.querySelector('.desktop');
        desktop.style.backgroundImage = `url('${selectedBackground}')`;
        desktop.style.backgroundSize = 'cover';
        desktop.style.backgroundPosition = 'center';
        desktop.style.backgroundColor = '';
    };
    img.onerror = function() {
        // Image doesn't exist, use default color
        console.log("Background image not found, using default color");
    };
    img.src = 'images/bg.png';
});

function applyBackground() {
    const desktop = document.querySelector('.desktop');
    if (isBackgroundImage) {
        desktop.style.backgroundImage = `url('${selectedBackground}')`;
        desktop.style.backgroundSize = 'cover';
        desktop.style.backgroundPosition = 'center';
        desktop.style.backgroundColor = '';
    } else {
        desktop.style.backgroundImage = '';
        desktop.style.backgroundColor = selectedBackground;
    }
}

applyBackgroundButton.addEventListener('click', applyBackground);

cancelSettingsButton.addEventListener('click', () => {
    const settingsWindow = document.getElementById('settingsWindow');
    settingsWindow.style.display = 'none';

    const taskbarItem = document.querySelector(`.taskbar-item[data-window="settingsWindow"]`);
    if (taskbarItem) {
        taskbarItem.classList.remove('active');
    }

    if (activeWindow === settingsWindow) {
        activeWindow = null;
    }
});

okSettingsButton.addEventListener('click', () => {
    // Apply the background
    applyBackground();

    // Close the window
    const settingsWindow = document.getElementById('settingsWindow');
    settingsWindow.style.display = 'none';

    const taskbarItem = document.querySelector(`.taskbar-item[data-window="settingsWindow"]`);
    if (taskbarItem) {
        taskbarItem.classList.remove('active');
    }

    if (activeWindow === settingsWindow) {
        activeWindow = null;
    }
});

// Screen saver functionality
function startScreenSaver() {
    const screenSaver = document.getElementById('screenSaver');
    screenSaver.style.display = 'block';

    const logo = document.querySelector('.screensaver-logo');
    let x = 0;
    let y = 0;
    let dx = 2;
    let dy = 2;

    function animateScreenSaver() {
        const maxX = window.innerWidth - logo.offsetWidth;
        const maxY = window.innerHeight - logo.offsetHeight;

        x += dx;
        y += dy;

        if (x <= 0 || x >= maxX) dx = -dx;
        if (y <= 0 || y >= maxY) dy = -dy;

        logo.style.left = `${x}px`;
        logo.style.top = `${y}px`;

        requestAnimationFrame(animateScreenSaver);
    }

    animateScreenSaver();

    // Exit screen saver on mouse move or click
    function exitScreenSaver() {
        screenSaver.style.display = 'none';
        document.removeEventListener('mousemove', exitScreenSaver);
        document.removeEventListener('click', exitScreenSaver);
        document.removeEventListener('keydown', exitScreenSaver);
        resetScreenSaver();
    }

    document.addEventListener('mousemove', exitScreenSaver);
    document.addEventListener('click', exitScreenSaver);
    document.addEventListener('keydown', exitScreenSaver);
}

function resetScreenSaver() {
    lastActivity = Date.now();
    clearTimeout(screenSaverTimeout);
    screenSaverTimeout = setTimeout(startScreenSaver, SCREEN_SAVER_DELAY);
}

// Track user activity to reset screen saver timer
document.addEventListener('mousemove', resetScreenSaver);
document.addEventListener('click', resetScreenSaver);
document.addEventListener('keydown', resetScreenSaver);

// Initialize the screen saver timeout
resetScreenSaver();

// Handle window resize events for custom app iframe
window.addEventListener('resize', () => {
    const customAppWindow = document.getElementById('customAppWindow');
    if (customAppWindow && customAppWindow.style.display === 'block') {
        resizeCustomApp();
    }
});

// Auto-open README window when the page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        openWindow('readmeWindow');
    }, 1000);
});

// Create images directory placeholder
function createImagesFolder() {
    console.log("Make sure to create an 'images' folder with Windows 95 style icons for desktop shortcuts");
    console.log("Required icons: mycomputer.png, recyclebin.png, iexplore.png, network.png, app.png, notepad.png, calculator.png, programs.png, documents.png, settings.png, find.png, help.png, run.png, shutdown.png, windows-logo.png, volume.png, display.png, control-panel.png, paint.png, drive.png, folder.png, error.png, game.png"); //Added game.png
}

createImagesFolder();

// Add click handler for folder items
document.querySelectorAll('.folder-item').forEach(item => {
    item.addEventListener('click', () => {
        const action = item.dataset.action;
        if (action === 'readme') {
            openWindow('readmeWindow');
        }
    });
});