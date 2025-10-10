(() => {
  // 스크립트 중복 실행 방지
  if (window.hasMyAIScriptRun) return;
  window.hasMyAIScriptRun = true;

  // 1. CSS 스타일 정의 및 페이지에 삽입
  const customStyles = `
    /* ... '생각 중' UI 스타일 ... */
    .thought-wrapper { display: flex; flex-direction: column; align-items: center; width: 100%; }
    ms-thought-chunk .mat-expansion-panel { background: transparent !important; box-shadow: none !important; border: none !important; }
    ms-thought-chunk .mat-expansion-panel-header { display: none !important; }
    ms-thought-chunk .mat-expansion-panel-content-wrapper { max-height: 0; overflow: hidden; padding: 0; margin: 0; width: 100%; background-color: transparent !important; border: 1px solid transparent; border-radius: 12px; transition: max-height 0.4s ease-in-out, margin-top 0.4s ease-in-out, border-color 0.3s ease-in-out, padding 0.4s ease-in-out; }
    ms-thought-chunk .mat-expansion-panel-body { padding: 16px 8px !important; }
    ms-thought-chunk .mat-expansion-panel-content-wrapper.expanded { margin-top: 12px; max-height: 1500px; border-color: rgba(0, 0, 0, 0.1); padding: 16px; }
    .custom-thought-accordion { display: flex; align-items: center; justify-content: center; width: 100%; padding: 8px 0; margin-top: 16px; cursor: pointer; position: relative; }
    .custom-thought-accordion .text { color: #9AA0A6; font-size: 14px; font-style: italic; transition: color 0.3s ease; }
    .custom-thought-accordion .icon { font-size: 16px; margin-right: 8px; display: none; }
    .custom-thought-accordion.thinking .text::after { content: '.'; position: absolute; animation: dots-animation 1.4s steps(5, end) infinite; }
    @keyframes dots-animation { 0%, 20% { color: rgba(0,0,0,0); text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); } 40% { color: #9AA0A6; text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); } 60% { text-shadow: .25em 0 0 #9AA0A6, .5em 0 0 rgba(0,0,0,0); } 80%, 100% { text-shadow: .25em 0 0 #9AA0A6, .5em 0 0 #9AA0A6; } }
    .custom-thought-accordion.complete .icon { display: inline-block; color: #34a853; }
    .custom-thought-accordion.complete .text { color: #5f6368; }
    .custom-thought-accordion .chevron { font-size: 20px; color: #9AA0A6; margin-left: 8px; transition: transform 0.3s ease; }
    .custom-thought-accordion.expanded .chevron { transform: rotate(180deg); }


    /* 1. 나레이션 스타일 (이탤릭, 상자 없음) */
    .narration-message { display: block !important; text-align: center; color: #6c757d; margin: 8px auto !important; max-width: 90%; box-sizing: border-box; }

    /* 2. 단순 인용구 스타일 (주황색, 중앙 정렬) */
    .quote-message { display: block !important; text-align: center; color: #FFA500; font-weight: 500; margin: 16px auto !important; max-width: 90%; box-sizing: border-box; }
    
    .dialogue-message {
      display: block !important;
      text-align: center;
      margin: 12px auto !important;
      max-width: 90%;
      box-sizing: border-box;
    }
    .speaker-name {
      font-weight: bold;
      color: #FFFFFF; /* 짙은 회색 */
      margin-right: 8px;
    }
    .speaker-quote {
      color: #FFA500; /* 주황색 */
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);

  function processThoughtChunk(chunk) { /* ... 이전과 동일 ... */ if (chunk.dataset.processed) return; chunk.dataset.processed = 'true'; const panel = chunk.querySelector('.mat-expansion-panel'); const originalHeader = chunk.querySelector('.mat-expansion-panel-header'); const contentWrapper = chunk.querySelector('.mat-expansion-panel-content-wrapper'); if (!panel || !originalHeader || !contentWrapper) return; const wrapper = document.createElement('div'); wrapper.className = 'thought-wrapper'; chunk.parentNode.insertBefore(wrapper, chunk); const customHeader = document.createElement('div'); customHeader.className = 'custom-thought-accordion thinking'; customHeader.innerHTML = `<span class="material-symbols-outlined icon"></span><span class="text">생각 중</span><span class="material-symbols-outlined chevron">expand_more</span>`; wrapper.appendChild(customHeader); wrapper.appendChild(chunk); customHeader.addEventListener('click', () => originalHeader.click()); const statusObserver = new MutationObserver(() => { const inProgressIcon = chunk.querySelector('.thinking-progress-icon.in-progress'); if (!inProgressIcon && customHeader.classList.contains('thinking')) { customHeader.classList.remove('thinking'); customHeader.classList.add('complete'); customHeader.querySelector('.icon').textContent = 'check_circle'; customHeader.querySelector('.text').textContent = '생각 완료'; } const isExpanded = panel.classList.contains('mat-expanded'); customHeader.classList.toggle('expanded', isExpanded); contentWrapper.classList.toggle('expanded', isExpanded); }); statusObserver.observe(panel, { attributes: true, subtree: true, attributeFilter: ['class'] }); }

  // ★★★ [수정] 3가지 규칙을 모두 처리하는 최종 로직 ★★★
  function processChatTurn(turn) {
    const transformParagraphs = (container) => {
      const paragraphs = container.querySelectorAll('p:not([data-processed="true"])');

      paragraphs.forEach(p => {
        // 규칙 1: 나레이션 (이탤릭 스타일)
        if (p.querySelector('span[style*="font-style: italic"]')) {
          p.dataset.processed = 'true';
          const text = p.textContent.trim();
          if (text) {
            const narrationBox = document.createElement('div');
            narrationBox.className = 'narration-message';
            narrationBox.textContent = text;
            p.replaceWith(narrationBox);
          }
          return;
        }

        const textContent = p.textContent.trim();
        // 정규식: (이름): "대사" 패턴을 찾음. 이름과 콜론 사이 공백 허용.
        const dialogueRegex = /^([^:]+):\s*"([^"]+)"$/;
        const dialogueMatch = textContent.match(dialogueRegex);

        // 규칙 2: 대화문 (이름: "대사")
        if (dialogueMatch) {
          p.dataset.processed = 'true';
          const speaker = dialogueMatch[1].trim();
          const quote = dialogueMatch[2];

          const dialogueBox = document.createElement('div');
          dialogueBox.className = 'dialogue-message';
          dialogueBox.innerHTML = `<span class="speaker-name">${speaker}:</span><span class="speaker-quote">"${quote}"</span>`;
          p.replaceWith(dialogueBox);
          return;
        }

        // 규칙 3: 단순 인용구 ("대사")
        if (textContent.startsWith('"') && textContent.endsWith('"')) {
          p.dataset.processed = 'true';
          const quoteBox = document.createElement('div');
          quoteBox.className = 'quote-message';
          quoteBox.textContent = textContent;
          p.replaceWith(quoteBox);
        }
      });
    };

    const observer = new MutationObserver(() => transformParagraphs(turn));
    observer.observe(turn, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    transformParagraphs(turn);
  }

  const mainObserver = new MutationObserver((mutations) => { /* ... 이전과 동일 ... */ mutations.forEach(mutation => mutation.addedNodes.forEach(node => { if (node.nodeType !== 1) return; const thoughts = node.matches('ms-thought-chunk') ? [node] : node.querySelectorAll('ms-thought-chunk'); thoughts.forEach(processThoughtChunk); const turns = node.matches('ms-chat-turn') ? [node] : node.querySelectorAll('ms-chat-turn'); turns.forEach(processChatTurn); })) });
  mainObserver.observe(document.body, { childList: true, subtree: true });
  document.body.addEventListener('click', (event) => { /* ... 이전과 동일 ... */ const runButton = event.target.closest('ms-run-button button[type="submit"]'); if (runButton && !runButton.disabled) { document.querySelectorAll('.custom-thought-accordion.complete').forEach(header => { const wrapper = header.closest('.thought-wrapper'); if (wrapper) wrapper.remove(); }); } }, true);

  console.log("Reppley 1.0 Start");

})();
