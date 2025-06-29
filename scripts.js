/**
 * 365 Play Game
 * Main JavaScript file for theme functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }
    
    // 全屏功能实现
    initFullscreenFeature();
});

/**
 * 初始化全屏功能
 */
function initFullscreenFeature() {
    const gameContainer = document.getElementById('game-container');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    
    if (!gameContainer || !fullscreenBtn || !exitFullscreenBtn) {
        console.warn('全屏元素未找到');
        return;
    }
    
    // 全屏按钮点击事件
    fullscreenBtn.addEventListener('click', () => {
        enterFullscreen(gameContainer);
    });
    
    // 退出全屏按钮点击事件
    exitFullscreenBtn.addEventListener('click', () => {
        exitFullscreen();
    });
    
    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // 监听设备方向变化（在全屏模式下自动适配）
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
}

/**
 * 进入全屏模式
 */
function enterFullscreen(element) {
    try {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        } else {
            // 如果浏览器不支持全屏API，使用伪全屏
            enterPseudoFullscreen(element);
        }
    } catch (error) {
        console.error('进入全屏失败:', error);
        // 降级到伪全屏
        enterPseudoFullscreen(element);
    }
}

/**
 * 退出全屏模式
 */
function exitFullscreen() {
    try {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else {
            // 退出伪全屏
            exitPseudoFullscreen();
        }
    } catch (error) {
        console.error('退出全屏失败:', error);
        exitPseudoFullscreen();
    }
}

/**
 * 伪全屏模式（用于不支持全屏API的浏览器）
 */
function enterPseudoFullscreen(element) {
    element.classList.add('pseudo-fullscreen');
    document.body.classList.add('fullscreen-active');
    updateFullscreenButtons(true);
    
    // 隐藏地址栏（移动设备）
    if (window.innerHeight < window.innerWidth) {
        // 横屏模式
        setTimeout(() => {
            window.scrollTo(0, 1);
        }, 100);
    }
}

/**
 * 退出伪全屏模式
 */
function exitPseudoFullscreen() {
    const element = document.getElementById('game-container');
    if (element) {
        element.classList.remove('pseudo-fullscreen');
    }
    document.body.classList.remove('fullscreen-active');
    updateFullscreenButtons(false);
}

/**
 * 处理全屏状态变化
 */
function handleFullscreenChange() {
    const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    );
    
    updateFullscreenButtons(isFullscreen);
    
    if (isFullscreen) {
        // 进入全屏后，根据屏幕方向调整样式
        handleOrientationChange();
        // 隐藏移动端地址栏
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    }
}

/**
 * 更新全屏按钮显示状态
 */
function updateFullscreenButtons(isFullscreen) {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    
    if (fullscreenBtn && exitFullscreenBtn) {
        if (isFullscreen) {
            fullscreenBtn.style.display = 'none';
            exitFullscreenBtn.style.display = 'flex';
        } else {
            fullscreenBtn.style.display = 'flex';
            exitFullscreenBtn.style.display = 'none';
        }
    }
}

/**
 * 处理设备方向变化
 */
function handleOrientationChange() {
    // 延迟执行，等待方向变化完成
    setTimeout(() => {
        const gameContainer = document.getElementById('game-container');
        const iframe = document.getElementById('game-iframe');
        
        if (!gameContainer || !iframe) return;
        
        // 检查是否在全屏模式
        const isFullscreen = !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement ||
            gameContainer.classList.contains('pseudo-fullscreen')
        );
        
        if (isFullscreen) {
            // 全屏模式下根据屏幕方向优化显示
            const isLandscape = window.innerWidth > window.innerHeight;
            
            if (isLandscape) {
                // 横屏：游戏充满整个屏幕
                gameContainer.style.setProperty('--fullscreen-width', '100vw');
                gameContainer.style.setProperty('--fullscreen-height', '100vh');
            } else {
                // 竖屏：保持游戏比例，居中显示
                gameContainer.style.setProperty('--fullscreen-width', '100vw');
                gameContainer.style.setProperty('--fullscreen-height', '100vh');
            }
            
            // 强制刷新iframe以适应新尺寸
            const iframeSrc = iframe.src;
            iframe.src = '';
            setTimeout(() => {
                iframe.src = iframeSrc;
            }, 10);
        }
    }, 300);
}

/**
 * 检测设备类型
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 检测iOS设备
 */
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
} 