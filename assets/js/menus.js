const MENUS = {
    'study': {
        title: '스터디',
        path: 'study',
    },
    'hackers-words': {
        title: '해커스 토익 영단어',
        description: '영단어 공부를 위한 페이지입니다.',
        path: 'hackers-words',
        parent: 'study',
    },
    'dev-tools': {
        title: '개발 도구',
        path: 'dev-tools',
    },
    'git-release-markdown-converter': {
        title: '릴리즈 노트 변환기',
        description: 'HTML 형식의 릴리즈 노트를 Markdown 형식으로 변환합니다.',
        path: 'git-release-markdown-converter',
        parent: 'dev-tools',
    },
    'utils': {
        title: '유틸리티',
        path: 'utils',
    }
};