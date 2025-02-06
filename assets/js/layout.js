// layout.js
async function initializeLayout() {
    await loadComponents();
    renderNavigation();
    initializeEventListeners();
    loadPage('home');
}

async function loadPage(pageName) {
    try {
        const currentPath = window.location.pathname;
        const projectRoot = currentPath.includes("/tools/") ? "/tools" : "";
        const path = `${projectRoot}/pages/${pageName}.html`;
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const html = await response.text();
        const pageInfo = MENUS[pageName];

        if (pageInfo) {
            document.getElementById('page-title').textContent = pageInfo.title;
            document.getElementById('page-description').textContent = pageInfo.description || '';
        }

        const pageContent = document.getElementById('page-content');

        // 기존 컨텐츠 삭제
        while (pageContent.firstChild) {
            pageContent.removeChild(pageContent.firstChild);
        }

        // 새로운 컨텐츠 삽입
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        pageContent.appendChild(tempDiv);

        // 기존 스크립트 삭제 후, 새로운 스크립트 실행
        executeScripts(pageContent);
    } catch (error) {
        console.error('페이지 로드 실패:', error);
        document.getElementById('page-content').innerHTML =
            `<p>페이지를 불러오는데 실패했습니다: ${error.message}</p>`;
    }
}

async function loadComponents() {
    const header = await fetch('components/header.html');
    const content = await fetch('components/content.html');

    document.body.insertAdjacentHTML('afterbegin', await header.text());
    document.body.insertAdjacentHTML('beforeend', await content.text());
}

function executeScripts(container) {
    const existingScripts = new Set();
    document.querySelectorAll("script").forEach(script => {
        if (script.src) existingScripts.add(script.src);
    });

    container.querySelectorAll("script").forEach(oldScript => {
        const newScript = document.createElement("script");

        if (oldScript.src) {
            if (!existingScripts.has(oldScript.src)) {
                newScript.src = oldScript.src;
                newScript.async = false;
                document.body.appendChild(newScript);
                existingScripts.add(oldScript.src);
            }
        } else {
            try {
                new Function(oldScript.textContent)(); // 🔥 eval() 대신 Function() 사용
            } catch (error) {
                console.error("스크립트 실행 오류:", error);
            }
        }
        oldScript.remove();
    });
}

function renderNavigation() {
    const navContent = Object.entries(MENUS).reduce((acc, [key, section]) => {
        if (!section.parent) {
            const children = Object.values(MENUS).filter(menu => menu.parent === key);
            return acc + createMenuSection(section, children);
        }
        return acc;
    }, '');

    ['mobileNav', 'desktopNav'].forEach(id => {
        document.getElementById(id).innerHTML = navContent;
    });
}

function createMenuSection(section, children) {
    return `
        <div class="mb-1">
            <button class="menu-section w-full flex justify-between items-center text-gray-600 px-3 py-2 rounded transition-colors">
                <span class="text-sm font-medium">${section.title}</span>
                <svg class="w-4 h-4 transform transition-transform opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </button>
            <div class="submenu hidden space-y-0.5 pl-3 mt-0.5">
                ${children.map(child => `
                    <a href="#" data-page="${child.path}" 
                       class="nav-link block px-3 py-2 text-gray-600 rounded transition-colors text-xs data-[active=true]:bg-[#4d72c3] data-[active=true]:text-[#edf1f9]">
                        ${child.title}
                    </a>
                `).join('')}
            </div>
        </div>
    `;
}

function initializeEventListeners() {
    // 메뉴 토글
    document.getElementById('menuButton')?.addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.toggle('-translate-y-full');
    });

    // 섹션 토글
    document.querySelectorAll('.menu-section').forEach(button => {
        button.addEventListener('click', () => {
            const submenu = button.nextElementSibling;
            const arrow = button.querySelector('svg');
            submenu.classList.toggle('hidden');
            arrow.classList.toggle('rotate-180');
        });
    });

    // 네비게이션 링크
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
}

async function handleNavigation(e) {
    e.preventDefault();
    const pageName = e.currentTarget.dataset.page;

    if (window.innerWidth < 768) {
        document.getElementById('mobileMenu').classList.add('-translate-y-full');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.dataset.active = link.dataset.page === pageName;
    });
    await loadPage(pageName);
}