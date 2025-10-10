(() => {
  // 스크립트 중복 실행 방지
  if (window.hasMyAIScriptRun) return;
  window.hasMyAIScriptRun = true;

  // 1. CSS 스타일 정의 및 페이지에 삽입
  const customStyles = `
    .thought-wrapper { display: flex; flex-direction: column; align-items: center; width: 100%; }
    ms-thought-chunk .mat-expansion-panel { background: transparent !important; box-shadow: none !important; border: none !important; }
    ms-thought-chunk .mat-expansion-panel-header { display: none !important; }
    ms-thought-chunk .mat-expansion-panel-content-wrapper { max-height: 0; overflow: hidden; padding: 0; margin: 0; width: 100%; background-color: transparent !important; border: 1px solid transparent; border-radius: 12px; transition: max-height 0.4s ease-in-out, margin-top 0.4s ease-in-out, border-color 0.3s ease-in-out, padding: 0.4s ease-in-out; }
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
    .narration-message { display: block !important; text-align: center; color: #6c757d; margin: 8px auto !important; max-width: 90%; box-sizing: border-box; }
    .quote-message { display: block !important; text-align: center; color: #FFA500; font-weight: 500; margin: 16px auto !important; max-width: 90%; box-sizing: border-box; }
    .dialogue-message { display: block !important; text-align: center; margin: 12px auto !important; max-width: 90%; box-sizing: border-box; }
    .speaker-name { font-weight: bold; color: #FFFFFF; margin-right: 8px; }
    .speaker-quote { color: #FFA500; }
    #reppley-persona-settings-container, #reppley-note-settings-container { padding-bottom: 16px; }
    .reppley-persona-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); display: none; justify-content: center; align-items: center; z-index: 10000; }
    .reppley-persona-modal-panel { background-color: #1e1f20; color: #e8eaed; width: 95%; max-width: 680px; height: 85%; border-radius: 16px; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .reppley-persona-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid #3c4043; flex-shrink: 0; }
    .reppley-persona-modal-header .title { display: flex; align-items: center; font-size: 18px; font-weight: 500; }
    .reppley-persona-modal-header .back-btn { cursor: pointer; margin-right: 16px; font-size: 24px; }
    .new-persona-btn { color: #8ab4f8; font-size: 14px; cursor: pointer; font-weight: 500; }
    .reppley-persona-modal-body { overflow-y: auto; padding: 24px; flex-grow: 1; }
    .reppley-persona-view { display: none; }
    .reppley-persona-view.active { display: block; }
    .reppley-persona-section-title { font-size: 14px; color: #9aa0a6; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #3c4043; }
    .reppley-persona-item { background-color: #282a2d; border-radius: 12px; padding: 16px; margin-bottom: 12px; display: flex; align-items: flex-start; border: 2px solid transparent; transition: border-color 0.2s; }
    .reppley-persona-item.is-active { border-color: #8ab4f8; background-color: #3c4043; }
    .reppley-persona-profile-circle { width: 40px; height: 40px; border-radius: 50%; background-color: #4a4d52; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; color: #e8eaed; margin-right: 16px; flex-shrink: 0; }
    .reppley-persona-content { flex-grow: 1; }
    .reppley-persona-name-wrapper { display: flex; align-items: center; margin-bottom: 8px; }
    .reppley-persona-name { font-size: 16px; font-weight: 500; color: #e8eaed; }
    .reppley-persona-default-tag { font-size: 10px; background-color: #8ab4f8; color: #202124; padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: bold; }
    .reppley-persona-description { font-size: 14px; color: #bdc1c6; white-space: pre-wrap; max-height: 60px; overflow: hidden; text-overflow: ellipsis; }
    .reppley-persona-actions { margin-left: 16px; display: flex; gap: 8px; }
    .reppley-persona-action-btn { font-size: 12px; color: #9aa0a6; cursor: pointer; padding: 4px 8px; border-radius: 4px; background-color: #3c4043; }
    .reppley-persona-input-group { margin-bottom: 24px; }
    .reppley-persona-input-group label { display: block; font-size: 14px; color: #9aa0a6; margin-bottom: 8px; }
    .reppley-persona-input-group input, .reppley-persona-input-group textarea { width: 100%; background-color: #282a2d; border: 1px solid #5f6368; border-radius: 8px; padding: 12px; color: #e8eaed; font-size: 14px; box-sizing: border-box; }
    .reppley-persona-input-group textarea { height: 200px; resize: vertical; }
    .char-counter { font-size: 12px; color: #9aa0a6; text-align: right; margin-top: 4px; }
    #reppley-persona-save-edit-btn { width: 100%; padding: 14px; font-size: 16px; font-weight: 500; background-color: #8860d0; color: #fff; border: none; border-radius: 8px; cursor: pointer; margin-top: 16px; }
    .reppley-note-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); display: none; justify-content: center; align-items: center; z-index: 10001; }
    .reppley-note-modal-content { background-color: #1e1f20; color: #e8eaed; padding: 24px; border-radius: 12px; width: 90%; max-width: 600px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
    .reppley-note-modal-content h2 { margin-top: 0; margin-bottom: 16px; font-size: 18px; }
    .reppley-note-modal-content textarea { width: 100%; height: 300px; background-color: #282a2d; border: 1px solid #5f6368; border-radius: 8px; color: #e8eaed; padding: 12px; font-size: 14px; resize: vertical; box-sizing: border-box; }
    .reppley-note-modal-actions { margin-top: 20px; text-align: right; }
    .reppley-note-modal-actions button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin-left: 10px; }
    #reppley-note-save-btn { background-color: #8860d0; color: white; }
    #reppley-note-close-btn { background-color: #545458; color: white; }
    ms-system-instructions-panel > ms-sliding-right-panel[is-open="true"] {
        position: fixed !important;
        top: -200vh !important;
        left: -200vw !important;
        visibility: hidden !important;
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);

  const getPersonas = () => JSON.parse(localStorage.getItem('personas_v2')) || [];
  const savePersonas = (personas) => localStorage.setItem('personas_v2', JSON.stringify(personas));
  const getNote = () => localStorage.getItem('user_note_v1') || "";
  const saveNote = (note) => localStorage.setItem('user_note_v1', note);

  let debounceTimer;
  const debounce = (func, delay) => {
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  function applyAllInstructions() {
    const instructionTextArea = document.querySelector('ms-system-instructions textarea');
    if (!instructionTextArea) return;
    const personaStartMarker = "--- [Reppley Persona Applied] ---", personaEndMarker = "--- [Reppley Persona End] ---";
    const noteStartMarker = "--- [Reppley User Note Applied] ---", noteEndMarker = "--- [Reppley User Note End] ---";
    let fullContent = instructionTextArea.value, userTypedContent = fullContent;
    const personaStartIndex = userTypedContent.indexOf(personaStartMarker), personaEndIndex = userTypedContent.indexOf(personaEndMarker);
    if (personaStartIndex !== -1 && personaEndIndex > personaStartIndex) { userTypedContent = userTypedContent.substring(0, personaStartIndex) + userTypedContent.substring(personaEndIndex + personaEndMarker.length); }
    const noteStartIndex = userTypedContent.indexOf(noteStartMarker), noteEndIndex = userTypedContent.indexOf(noteEndMarker);
    if (noteStartIndex !== -1 && noteEndIndex > noteStartIndex) { userTypedContent = userTypedContent.substring(0, noteStartIndex) + userTypedContent.substring(noteEndIndex + noteEndMarker.length); }
    userTypedContent = userTypedContent.trim();
    const activePersona = getPersonas().find(p => p.active), userNote = getNote();
    let newPersonaBlock = "", newUserNoteBlock = "";
    if (activePersona) { newPersonaBlock = `${personaStartMarker}\n# User Name: ${activePersona.name}\n## User Description:\n${activePersona.description}\n${personaEndMarker}`; }
    if (userNote) { newUserNoteBlock = `${noteStartMarker}\n# Guidelines that must be followed with the utmost priority:\n${userNote}\n${noteEndMarker}`; }
    const finalContent = [newUserNoteBlock, userTypedContent, newPersonaBlock].filter(Boolean).join('\n\n').trim();
    if (instructionTextArea.value !== finalContent) { instructionTextArea.value = finalContent; instructionTextArea.dispatchEvent(new Event('input', { bubbles: true })); instructionTextArea.dispatchEvent(new Event('change', { bubbles: true })); }
  }

  const debouncedApplyAllInstructions = debounce(applyAllInstructions, 150);

  let hasAutoOpenedInstructions = false;
  function autoOpenSystemInstructions() {
      if (hasAutoOpenedInstructions) return;
      const sysInstructionPanel = document.querySelector('ms-system-instructions-panel > ms-sliding-right-panel');
      if (!sysInstructionPanel || sysInstructionPanel.getAttribute('is-open') === 'false') {
          const sysInstructionButton = document.querySelector('button[data-test-system-instructions-card]');
          if (sysInstructionButton) {
              sysInstructionButton.click();
              hasAutoOpenedInstructions = true;
              setTimeout(debouncedApplyAllInstructions, 200);
          }
      } else {
          hasAutoOpenedInstructions = true;
          debouncedApplyAllInstructions();
      }
  }
  
  function createNoteUI() {
    if (document.getElementById('reppley-note-modal')) return;
    const modalHTML = `<div id="reppley-note-modal" class="reppley-note-modal-overlay"><div class="reppley-note-modal-content"><h2>유저 노트 설정</h2><textarea id="reppley-note-textarea" placeholder="AI가 최우선으로 기억해야 할 지침을 입력하세요..."></textarea><div class="reppley-note-modal-actions"><button id="reppley-note-close-btn">닫기</button><button id="reppley-note-save-btn">저장</button></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('reppley-note-modal'), closeBtn = document.getElementById('reppley-note-close-btn'), saveBtn = document.getElementById('reppley-note-save-btn'), textarea = document.getElementById('reppley-note-textarea');
    if(modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    if(closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    if(saveBtn) saveBtn.addEventListener('click', () => { saveNote(textarea.value); debouncedApplyAllInstructions(); modal.style.display = 'none'; alert('유저 노트가 저장되었습니다.'); });
  }

  function createAdvancedPersonaUI() {
    if (document.getElementById('reppley-persona-modal')) return;
    const modalHTML = `<div id="reppley-persona-modal" class="reppley-persona-modal-overlay"><div class="reppley-persona-modal-panel"><div id="reppley-persona-list-view" class="reppley-persona-view active"><div class="reppley-persona-modal-header"><div class="title"><span class="material-symbols-outlined back-btn" style="opacity:0; pointer-events:none;">arrow_back</span>페르소나 설정</div><div id="reppley-show-editor-btn" class="new-persona-btn">+ 새로운 페르소나</div></div><div class="reppley-persona-modal-body"><div class="reppley-persona-section-title">현재 사용 중</div><div id="reppley-active-persona-container"></div><div class="reppley-persona-section-title" style="margin-top: 24px;">다른 페르소나</div><div id="reppley-other-personas-container"></div></div></div><div id="reppley-persona-editor-view" class="reppley-persona-view"><div class="reppley-persona-modal-header"><div class="title"><span id="reppley-back-to-list-btn" class="material-symbols-outlined back-btn">arrow_back</span><span id="reppley-editor-title"></span></div></div><div class="reppley-persona-modal-body"><form id="reppley-persona-editor-form"><input type="hidden" id="reppley-persona-id-input" /><div class="reppley-persona-input-group"><label for="reppley-persona-name-input">이름</label><input id="reppley-persona-name-input" type="text" maxlength="50" required /><div class="char-counter" id="reppley-name-char-counter"></div></div><div class="reppley-persona-input-group"><label for="reppley-persona-desc-input">설명</label><textarea id="reppley-persona-desc-input" maxlength="4000" required></textarea><div class="char-counter" id="reppley-desc-char-counter"></div></div><button type="submit" id="reppley-persona-save-edit-btn"></button></form></div></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('reppley-persona-modal'); if (!modal) return;
    const listView = document.getElementById('reppley-persona-list-view'), editorView = document.getElementById('reppley-persona-editor-view'), showEditorBtn = document.getElementById('reppley-show-editor-btn'), backToListBtn = document.getElementById('reppley-back-to-list-btn'), form = document.getElementById('reppley-persona-editor-form'), idInput = document.getElementById('reppley-persona-id-input'), nameInput = document.getElementById('reppley-persona-name-input'), descInput = document.getElementById('reppley-persona-desc-input'), editorTitle = document.getElementById('reppley-editor-title'), saveBtn = document.getElementById('reppley-persona-save-edit-btn'), nameCounter = document.getElementById('reppley-name-char-counter'), descCounter = document.getElementById('reppley-desc-char-counter'), modalBody = modal.querySelector('.reppley-persona-modal-body');
    const showListView = () => { if(listView) listView.classList.add('active'); if(editorView) editorView.classList.remove('active'); renderPersonaList(); };
    const showEditorView = (persona = null) => { if(listView) listView.classList.remove('active'); if(editorView) editorView.classList.add('active'); if(form) form.reset(); if (idInput) idInput.value = persona ? persona.id : ''; if (nameInput) nameInput.value = persona ? persona.name : ''; if (descInput) descInput.value = persona ? persona.description : ''; if (editorTitle) editorTitle.textContent = persona ? '페르소나 수정' : '새 페르소나 만들기'; if (saveBtn) saveBtn.textContent = persona ? '저장하기' : '생성하기'; updateCharCounters(); };
    const updateCharCounters = () => { if (nameInput && nameCounter) nameCounter.textContent = `${nameInput.value.length} / 50`; if (descInput && descCounter) descCounter.textContent = `${descInput.value.length} / 4000`; };
    if (showEditorBtn) showEditorBtn.addEventListener('click', () => showEditorView());
    if (backToListBtn) backToListBtn.addEventListener('click', showListView);
    modal.addEventListener('click', (e) => { if (e.target === modal) { showListView(); modal.style.display = 'none'; }});
    if (form) { form.addEventListener('submit', (e) => { e.preventDefault(); const personas = getPersonas(); const personaData = { id: idInput.value ? Number(idInput.value) : Date.now(), name: nameInput.value.trim(), description: descInput.value.trim(), active: false }; if (idInput.value) { const index = personas.findIndex(p => p.id === personaData.id); if (index !== -1) { personaData.active = personas[index].active; personas[index] = personaData; } } else { if (personas.length === 0) personaData.active = true; personas.push(personaData); } savePersonas(personas); showListView(); debouncedApplyAllInstructions(); }); }
    if (nameInput) nameInput.addEventListener('input', updateCharCounters);
    if (descInput) descInput.addEventListener('input', updateCharCounters);
    if (modalBody) { modalBody.addEventListener('click', e => { const target = e.target; const personaItem = target.closest('.reppley-persona-item'); if (!personaItem) return; const id = Number(personaItem.dataset.id); let personas = getPersonas(); if (target.closest('.reppley-persona-edit-btn')) { const personaToEdit = personas.find(p => p.id === id); if(personaToEdit) showEditorView(personaToEdit); } else if (target.closest('.reppley-persona-delete-btn')) { if (confirm('정말로 이 페르소나를 삭제하시겠습니까?')) { const wasActive = personaItem.classList.contains('is-active'); personas = personas.filter(p => p.id !== id); if (wasActive && personas.length > 0) { personas[0].active = true; } savePersonas(personas); renderPersonaList(); debouncedApplyAllInstructions(); } } else { personas.forEach(p => p.active = (p.id === id)); savePersonas(personas); renderPersonaList(); debouncedApplyAllInstructions(); } }); }
  }

  function renderPersonaList() {
    const personas = getPersonas(); const activeContainer = document.getElementById('reppley-active-persona-container'); const othersContainer = document.getElementById('reppley-other-personas-container'); if (!activeContainer || !othersContainer) return; activeContainer.innerHTML = ''; othersContainer.innerHTML = '';
    const createPersonaHTML = (p) => `<div class="reppley-persona-item ${p.active ? 'is-active' : ''}" data-id="${p.id}"><div class="reppley-persona-profile-circle">${p.name.charAt(0).toUpperCase() || '?'}</div><div class="reppley-persona-content"><div class="reppley-persona-name-wrapper"><div class="reppley-persona-name">${p.name}</div>${p.active ? '<div class="reppley-persona-default-tag">사용 중</div>' : ''}</div><div class="reppley-persona-description">${p.description}</div></div><div class="reppley-persona-actions"><div class="reppley-persona-action-btn reppley-persona-edit-btn">수정</div><div class="reppley-persona-action-btn reppley-persona-delete-btn">삭제</div></div></div>`;
    const activePersona = personas.find(p => p.active); activeContainer.innerHTML = activePersona ? createPersonaHTML(activePersona) : '<p style="font-size:14px; color:#9aa0a6;">사용 중인 페르소나가 없습니다.</p>';
    personas.filter(p => !p.active).forEach(p => { othersContainer.innerHTML += createPersonaHTML(p); });
    if (othersContainer.innerHTML === '') { othersContainer.innerHTML = '<p style="font-size:14px; color:#9aa0a6;">다른 페르소나가 없습니다.</p>'; }
  }

  function injectCustomButtons(settingsContent) {
    if (document.getElementById('reppley-persona-settings-container')) return;
    const originalModelSelector = settingsContent.querySelector('.settings-model-selector');
    if (!originalModelSelector) return;

    const noteClone = originalModelSelector.cloneNode(true);
    noteClone.id = 'reppley-note-settings-container';
    const noteButton = noteClone.querySelector('button.model-selector-card');
    if (noteButton) {
        const spans = noteButton.querySelectorAll('span');
        if (spans.length >= 3) { spans[0].textContent = '유저 노트'; spans[1].textContent = 'AI가 기억해야 할 최우선 지침을 설정합니다.'; spans[2].textContent = '이 노트는 프롬프트의 맨 위에 추가됩니다.'; }
        noteButton.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const modal = document.getElementById('reppley-note-modal'); const textarea = document.getElementById('reppley-note-textarea'); if (modal && textarea) { textarea.value = getNote(); modal.style.display = 'flex'; } });
    }
    const noteRightPanel = noteClone.querySelector('ms-sliding-right-panel'); if (noteRightPanel) noteRightPanel.remove();
    settingsContent.prepend(noteClone);

    const personaClone = originalModelSelector.cloneNode(true);
    personaClone.id = 'reppley-persona-settings-container';
    const personaButton = personaClone.querySelector('button.model-selector-card');
    if (personaButton) {
      const spans = personaButton.querySelectorAll('span');
      if (spans.length >= 3) { spans[0].textContent = '페르소나 설정'; spans[1].textContent = '저장된 페르소나를 불러오거나 수정합니다.'; spans[2].textContent = '클릭하여 페르소나 관리 창을 엽니다.'; }
      personaButton.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const modal = document.getElementById('reppley-persona-modal'); if (modal) { modal.style.display = 'flex'; renderPersonaList(); } });
    }
    const personaRightPanel = personaClone.querySelector('ms-sliding-right-panel'); if (personaRightPanel) personaRightPanel.remove();
    settingsContent.prepend(personaClone);
  }

  function processThoughtChunk(chunk) { if (chunk.dataset.processed) return; chunk.dataset.processed = 'true'; const panel = chunk.querySelector('.mat-expansion-panel'); const originalHeader = chunk.querySelector('.mat-expansion-panel-header'); const contentWrapper = chunk.querySelector('.mat-expansion-panel-content-wrapper'); if (!panel || !originalHeader || !contentWrapper) return; const wrapper = document.createElement('div'); wrapper.className = 'thought-wrapper'; chunk.parentNode.insertBefore(wrapper, chunk); const customHeader = document.createElement('div'); customHeader.className = 'custom-thought-accordion thinking'; customHeader.innerHTML = `<span class="material-symbols-outlined icon"></span><span class="text">생각 중</span><span class="material-symbols-outlined chevron">expand_more</span>`; wrapper.appendChild(customHeader); wrapper.appendChild(chunk); customHeader.addEventListener('click', () => originalHeader.click()); const statusObserver = new MutationObserver(() => { const inProgressIcon = chunk.querySelector('.thinking-progress-icon.in-progress'); if (!inProgressIcon && customHeader.classList.contains('thinking')) { customHeader.classList.remove('thinking'); customHeader.classList.add('complete'); customHeader.querySelector('.icon').textContent = 'check_circle'; customHeader.querySelector('.text').textContent = '생각 완료'; } const isExpanded = panel.classList.contains('mat-expanded'); customHeader.classList.toggle('expanded', isExpanded); contentWrapper.classList.toggle('expanded', isExpanded); }); statusObserver.observe(panel, { attributes: true, subtree: true, attributeFilter: ['class'] }); }
  function processChatTurn(turn) {
    const transformParagraphs = (container) => {
      const paragraphs = container.querySelectorAll('p:not([data-processed="true"])');
      paragraphs.forEach(p => {
        const textContent = p.textContent.trim();
        const imageRegex = /^\{([^}]+)\}\(([^)]+)\)$/; const imageMatch = textContent.match(imageRegex);
        if (imageMatch) { p.dataset.processed = 'true'; const altText = imageMatch[1]; const imageUrl = imageMatch[2]; const img = document.createElement('img'); img.src = imageUrl; img.alt = altText; img.style.maxWidth = '100%'; img.style.height = 'auto'; img.style.display = 'block'; img.style.margin = '10px auto'; img.style.borderRadius = '8px'; p.replaceWith(img); return; }
        if (p.querySelector('span[style*="font-style: italic"]')) { p.dataset.processed = 'true'; const text = p.textContent.trim(); if (text) { const narrationBox = document.createElement('div'); narrationBox.className = 'narration-message'; narrationBox.textContent = text; p.replaceWith(narrationBox); } return; }
        const dialogueRegex = /^([^:]+):\s*"([^"]+)"$/; const dialogueMatch = textContent.match(dialogeRegex);
        if (dialogueMatch) { p.dataset.processed = 'true'; const speaker = dialogueMatch[1].trim(); const quote = dialogueMatch[2]; const dialogueBox = document.createElement('div'); dialogueBox.className = 'dialogue-message'; dialogueBox.innerHTML = `<span class="speaker-name">${speaker}:</span><span class="speaker-quote">"${quote}"</span>`; p.replaceWith(dialogueBox); return; }
        if (textContent.startsWith('"') && textContent.endsWith('"')) { p.dataset.processed = 'true'; const quoteBox = document.createElement('div'); quoteBox.className = 'quote-message'; quoteBox.textContent = textContent; p.replaceWith(quoteBox); }
      });
    };
    const observer = new MutationObserver(() => transformParagraphs(turn));
    observer.observe(turn, { childList: true, subtree: true });
    transformParagraphs(turn);
  }

  createAdvancedPersonaUI();
  createNoteUI();
  
  if (localStorage.getItem('userPersona')) {
      const oldPersonaDesc = localStorage.getItem('userPersona'); const personas = getPersonas();
      if (!personas.some(p => p.description === oldPersonaDesc)) { personas.push({ id: Date.now(), name: "기본 페르소나", description: oldPersonaDesc, active: personas.length === 0 }); savePersonas(personas); }
      localStorage.removeItem('userPersona');
  }

  const mainObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        
        (node.matches('ms-thought-chunk') ? [node] : node.querySelectorAll('ms-thought-chunk')).forEach(processThoughtChunk);
        (node.matches('ms-chat-turn') ? [node] : node.querySelectorAll('ms-chat-turn')).forEach(processChatTurn);
        
        const settingsContent = node.matches('ms-prompt-run-settings') ? node : node.querySelector('ms-prompt-run-settings');
        if (settingsContent) {
          injectCustomButtons(settingsContent);
          autoOpenSystemInstructions();
        }
        
        if (node.matches('ms-system-instructions') || node.querySelector('ms-system-instructions')) {
          debouncedApplyAllInstructions();
        }
      });
    });
  });

  mainObserver.observe(document.body, { childList: true, subtree: true });
  document.body.addEventListener('click', (event) => {
    const runButton = event.target.closest('ms-run-button button[type="submit"]');
    if (runButton && !runButton.disabled) { document.querySelectorAll('.custom-thought-accordion.complete').forEach(header => { const wrapper = header.closest('.thought-wrapper'); if (wrapper) wrapper.remove(); }); }
  }, true);

  setTimeout(debouncedApplyAllInstructions, 2000);

  console.log("Reppley 1.1 Start");
})();
