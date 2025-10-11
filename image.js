// image.js - 독립적인 마크다운 이미지 렌더러 (PRE 태그 내부 처리 포함)

(function() {
    'use strict';

    // 스크립트 중복 실행 방지
    if (window.hasMarkdownImageRendererRun) {
        return;
    }
    window.hasMarkdownImageRendererRun = true;

    // ![대체텍스트](이미지URL) 패턴을 찾는 정규 표현식입니다.
    // 그룹 1: 대체텍스트 (alt attribute)
    // 그룹 2: 이미지 URL (src attribute, http 또는 https로 시작)
    const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;

    /**
     * CSS 스타일을 삽입하여 이미지 렌더링을 위한 기본 스타일을 제공합니다.
     * 이미지는 중앙 정렬되고 반응형으로 표시됩니다.
     */
    function injectDefaultImageStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .markdown-image-wrapper {
                display: block; /* 블록 요소로 만들어서 중앙 정렬 가능하게 함 */
                margin: 10px auto; /* 상하 여백 10px, 좌우 자동 마진으로 중앙 정렬 */
                max-width: 100%; /* 부모 요소 너비를 넘지 않도록 설정 */
                height: auto; /* 비율 유지를 위해 높이 자동 조절 */
                text-align: center; /* 내부 이미지 중앙 정렬 */
            }
            .markdown-image-wrapper img {
                max-width: 100%;
                height: auto;
                display: block; /* 인라인 요소의 여백 문제 해결 */
                margin: 0 auto; /* 이미지 자체도 중앙 정렬 */
                border-radius: 8px; /* 부드러운 모서리 (선택 사항) */
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 (선택 사항) */
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 특정 텍스트 노드를 처리하여 마크다운 이미지 문법을 실제 이미지 태그로 변환합니다.
     * 변환이 발생하면 원본 텍스트 노드를 대체합니다.
     * @param {Text} textNode - 처리할 텍스트 노드입니다.
     * @returns {boolean} - 변환이 이루어졌으면 true, 아니면 false를 반환합니다.
     */
    function processTextNodeForMarkdownImages(textNode) {
        const originalText = textNode.nodeValue;
        let lastIndex = 0;
        let fragment = document.createDocumentFragment();
        let replacementsMade = false;
        let match;

        // 정규식의 lastIndex를 초기화하여 반복적인 검색이 제대로 작동하도록 합니다.
        markdownImageRegex.lastIndex = 0;

        // 텍스트에서 모든 마크다운 이미지 패턴을 찾습니다.
        while ((match = markdownImageRegex.exec(originalText)) !== null) {
            replacementsMade = true;
            // 현재 매치 이전의 텍스트를 fragment에 추가합니다.
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(originalText.substring(lastIndex, match.index)));
            }

            // 이미지 요소를 생성하고 속성을 설정합니다.
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'markdown-image-wrapper'; // 스타일을 적용할 래퍼 div
            
            const img = document.createElement('img');
            img.src = match[2]; // 이미지 URL
            img.alt = match[1]; // 대체 텍스트
            img.title = match[1]; // 마우스 오버 시 표시될 툴팁 (선택 사항)
            img.loading = 'lazy'; // 이미지 지연 로딩

            // 이미지 로드 실패 시 대체 이미지 표시
            img.onerror = function() {
                console.warn('이미지 로드 실패:', this.src);
                this.src = 'https://via.placeholder.com/150?text=Image+Failed'; // 대체 이미지 URL
            };

            imgWrapper.appendChild(img);
            fragment.appendChild(imgWrapper);
            lastIndex = markdownImageRegex.lastIndex;
        }

        // 마지막 매치 이후에 남은 텍스트가 있다면 fragment에 추가합니다.
        if (replacementsMade && lastIndex < originalText.length) {
            fragment.appendChild(document.createTextNode(originalText.substring(lastIndex)));
        }

        // 변환이 이루어졌다면, 원본 텍스트 노드를 생성된 fragment로 대체합니다.
        if (replacementsMade) {
            textNode.parentNode.replaceChild(fragment, textNode);
            return true;
        }
        return false;
    }

    /**
     * 특정 DOM 요소를 시작으로 DOM 트리를 순회하며 텍스트 노드를 찾아 마크다운 이미지를 처리합니다.
     * @param {Element} element - 순회를 시작할 요소입니다.
     */
    function recursivelyProcessTextNodes(element) {
        // 유효한 요소 노드가 아니면 건너뜁니다.
        if (!element || element.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        // 스크립트, 스타일, 텍스트 입력 영역, 코드 블록, 이미지는 처리 대상에서 제외합니다.
        // 이전에 제외했던 'PRE' 태그를 여기서는 제외하지 않습니다.
        const tagName = element.tagName;
        if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'NOSCRIPT' || tagName === 'TEXTAREA' || tagName === 'CODE' || tagName === 'IMG') {
            return;
        }
        
        // 이미 처리된 콘텐츠 영역인 경우 중복 처리 방지 (예: <ms-text-chunk data-markdown-images-processed="true">)
        // 단, 자식 노드를 추가/변경할 가능성이 있는 컨테이너는 계속 감시해야 할 수 있으므로 주의 깊게 사용합니다.
        // 현재는 특정 요소에만 적용하며, 재귀적으로 깊이 들어갈 때 이미 처리된 자식 요소는 무시하도록 합니다.
        if (element.dataset.markdownImagesProcessed === 'true') {
            return;
        }

        let currentNode = element.firstChild;
        while (currentNode) {
            let nextNode = currentNode.nextSibling;

            if (currentNode.nodeType === Node.TEXT_NODE) {
                // 텍스트 노드인 경우 마크다운 이미지 패턴을 찾아 처리합니다.
                // 노드가 대체될 수 있으므로 nextNode를 활용합니다.
                processTextNodeForMarkdownImages(currentNode);
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                // 요소 노드인 경우 재귀적으로 내부를 순회합니다.
                recursivelyProcessTextNodes(currentNode);
            }
            currentNode = nextNode; // 다음 형제 노드로 이동합니다.
        }
        // 이 요소의 직접적인 텍스트 노드 처리 및 자식 요소 탐색이 완료되었음을 표시합니다.
        // 하지만, 이 태그에 'data-markdown-images-processed'를 추가하면 동적으로 로드되는 내용이
        // 이 태그의 '내부'에 들어올 때 처리되지 않을 수 있습니다.
        // `ms-cmark-node` 같은 동적 컨테이너에는 이 플래그를 바로 붙이지 않는 것이 좋습니다.
        // 대신, MutationObserver가 새로 추가된 하위 트리를 스캔할 때만 사용하도록 합니다.
        // 현재는 플래그를 제거하여 모든 변경에 반응하도록 합니다.
        // element.dataset.markdownImagesProcessed = 'true'; // 이 줄을 제거하여 항상 스캔하도록 함
    }

    // 문서의 DOM이 완전히 로드되면 스크립트를 실행합니다.
    function initializeImageRenderer() {
        injectDefaultImageStyles(); // 기본 스타일 삽입
        recursivelyProcessTextNodes(document.body); // 문서 전체를 스캔하여 이미지 변환
    }

    // 문서 로딩 상태에 따라 초기화 함수 호출
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeImageRenderer);
    } else {
        initializeImageRenderer();
    }

    // 동적으로 추가되거나 변경되는 콘텐츠를 처리하기 위해 MutationObserver를 사용합니다.
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                // 새로 추가된 노드가 요소 노드인 경우에만 처리합니다.
                // 또는 텍스트 노드이면서 부모가 이미지를 처리할 수 있는 요소인 경우
                if (node.nodeType === Node.ELEMENT_NODE) {
                    recursivelyProcessTextNodes(node); // 새로 추가된 요소 내부를 스캔
                } else if (node.nodeType === Node.TEXT_NODE && node.parentNode && node.parentNode.nodeType === Node.ELEMENT_NODE) {
                    // 텍스트 노드만 추가된 경우에도 처리
                    processTextNodeForMarkdownImages(node);
                }
            });
            // 텍스트 내용이 직접 변경된 경우 (단, 전체 노드가 아닌 텍스트만)
            if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
                 processTextNodeForMarkdownImages(mutation.target);
            }
        });
    });

    // body 요소의 자식 노드 변경 및 서브트리 변경, 그리고 텍스트 데이터 변경까지 감시합니다.
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    console.log("Markdown Image Renderer (image.js) loaded and active.");
})();
