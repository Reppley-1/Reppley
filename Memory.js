(() => {
  // 스크립트 중복 실행 방지
  if (window.hasReppleyMemoryScriptRun) return;
  window.hasReppleyMemoryScriptRun = true;
  window.reppley = window.reppley || {};

  // Type 1 실시간 업데이트 인터벌 ID (이제는 사용되지 않음)
  let historyUpdateInterval = null;

  // Type 2 Gemini API 요약 요청 프롬프트 (영문 요약 지시)
  const SUMMARY_PROMPT = "Your task is to summarize the following conversation log. The summary must be in English. Focus on key plot points, character developments, important decisions, and any crucial context that would be needed for an AI to understand the conversation's history. Provide only the summary text, without any introductory phrases like 'Here is the summary:'.\n\nConversation Log:\n";

  // --- 1. 데이터 관리 ---
  const getActiveMemoryType = () => localStorage.getItem('reppley_memory_active_type_v3') || 'type2';
  const setActiveMemoryType = (type) => localStorage.setItem('reppley_memory_active_type_v3', type);
  
  const getGoogleApiKey = () => localStorage.getItem('reppley_google_api_key_v1') || "";
  const saveGoogleApiKey = (key) => localStorage.setItem('reppley_google_api_key_v1', key);
  
  const getGeminiModel = () => localStorage.getItem('reppley_gemini_model_v1') || "gemini-1.5-flash-latest"; 
  const saveGeminiModel = (model) => localStorage.setItem('reppley_gemini_model_v1', model);

  const getGeminiSummaries = () => JSON.parse(localStorage.getItem('reppley_gemini_summaries_v1') || '[]') || [];
  const saveGeminiSummaries = (summaries) => localStorage.setItem('reppley_gemini_summaries_v1', JSON.stringify(summaries));

  const getLatestGeminiSummary = () => {
      const summaries = getGeminiSummaries();
      if (summaries.length === 0) return "";
      return summaries[summaries.length - 1].text;
  };

  // --- 2. 핵심 로직 ---

  // ✨ [수정] content.js가 호출할 메모리 블록 제공 함수
  function getMemoryBlock() {
    const activeType = getActiveMemoryType();
    let memoryBlock = "";

    if (activeType === 'type1') {
      const historyLog = gatherConversationHistory();
      if (historyLog) {
        memoryBlock = `--- [Reppley Full History Memory Applied] ---\n# Full Conversation History:\n${historyLog}\n--- [Reppley Full History Memory End] ---`;
      }
    } else { // type2
      const summaryContent = getLatestGeminiSummary();
      if (summaryContent) {
        memoryBlock = `--- [Reppley Gemini Summary Memory Applied] ---\n# Conversation Summary (English):\n${summaryContent}\n--- [Reppley Gemini Summary Memory End] ---`;
      }
    }
    return memoryBlock;
  }
  // 전역 reppley 객체에 함수 등록
  window.reppley.getMemoryBlock = getMemoryBlock;

  // ✨ [수정] 이제 이 함수는 실시간 업데이트 인터벌을 켜고 끄는 역할만 합니다.
  function manageHistoryInterval() {
    if (historyUpdateInterval) clearInterval(historyUpdateInterval);
    historyUpdateInterval = null;
    if (getActiveMemoryType() === 'type1') {
      // Type 1일 때만 1초마다 content.js의 업데이트 함수를 호출하도록 요청
      historyUpdateInterval = setInterval(() => {
        if (window.reppley && window.reppley.updateSystemInstructions) {
          window.reppley.updateSystemInstructions();
        }
      }, 1000);
    }
  }

  function gatherConversationHistory() {
    const historyLog = [];
    document.querySelectorAll('ms-chat-turn').forEach(turn => {
      const userMsg = turn.querySelector('[data-turn-role="User"] ms-editable-content')?.textContent.trim();
      const modelMsg = turn.querySelector('[data-turn-role="Model"] ms-prompt-chunk')?.textContent.trim();
      if (userMsg) historyLog.push(`User: ${userMsg}`);
      if (modelMsg) historyLog.push(`Model: ${modelMsg}`);
    });
    return historyLog.length > 0 ? historyLog.join('\n') : null;
  }

  async function generateAndSaveGeminiSummary() {
    const apiKey = getGoogleApiKey();
    const model = getGeminiModel();

    if (!apiKey) {
      alert("Google AI Studio API 키를 먼저 입력해주세요.");
      return;
    }

    const history = gatherConversationHistory();
    if (!history) {
      alert("요약할 대화 기록이 없습니다.");
      return;
    }

    const summaryBtn = document.getElementById('reppley-generate-summary-btn');
    const originalBtnText = summaryBtn.textContent;
    summaryBtn.disabled = true;
    summaryBtn.textContent = '영문 요약 생성 중...';

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const requestBody = {
      contents: [{
        parts: [{ "text": SUMMARY_PROMPT + history }]
      }]
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const summary = data.candidates[0]?.content?.parts[0]?.text;

      if (!summary) {
        throw new Error("API 응답에서 요약 내용을 찾을 수 없습니다.");
      }

      const currentSummaries = getGeminiSummaries();
      currentSummaries.push({
          id: Date.now(),
          timestamp: new Date().toLocaleString(),
          text: summary.trim()
      });
      saveGeminiSummaries(currentSummaries);

      alert("대화의 영문 요약이 생성되어 저장되었습니다.");
      updateMemoryModalUI();
      
      if (window.reppley && window.reppley.updateSystemInstructions) {
        window.reppley.updateSystemInstructions();
      }
    } catch (error) {
      console.error("Gemini Summary Error:", error);
      alert(`요약 생성에 실패했습니다: ${error.message}`);
    } finally {
      summaryBtn.disabled = false;
      summaryBtn.textContent = originalBtnText;
    }
  }

  function updateSummary(id, newText) {
      const summaries = getGeminiSummaries();
      const index = summaries.findIndex(s => s.id === id);
      if (index !== -1) {
          summaries[index].text = newText;
          summaries[index].timestamp = new Date().toLocaleString() + ' (수정됨)';
          saveGeminiSummaries(summaries);
          updateMemoryModalUI();
          if (window.reppley && window.reppley.updateSystemInstructions) {
              window.reppley.updateSystemInstructions();
          }
          alert('요약이 수정되었습니다.');
      }
  }

  function deleteSummary(id) {
      if (!confirm('정말로 이 요약을 삭제하시겠습니까?')) return;
      // ✨ [버그 수정] getPersonas()가 아니라 getGeminiSummaries()를 호출해야 합니다.
      const summaries = getGeminiSummaries(); 
      const updatedSummaries = summaries.filter(s => s.id !== id);
      saveGeminiSummaries(updatedSummaries);
      updateMemoryModalUI();
      if (window.reppley && window.reppley.updateSystemInstructions) {
          window.reppley.updateSystemInstructions();
      }
      alert('요약이 삭제되었습니다.');
  }

  // --- 3. UI 생성 및 관리 ---

  let currentEditingSummaryId = null;

  function createMemoryModal() {
    if (document.getElementById('reppley-memory-modal')) return;
    const modalHTML = `
      <div id="reppley-memory-modal" class="reppley-note-modal-overlay">
        <div class="reppley-note-modal-content" style="max-width: 600px;">
          <h2 style="margin-bottom: 20px;">장기 기억 타입 설정</h2>
          
          <div id="reppley-memory-type1-btn" class="reppley-persona-item" style="cursor: pointer; border-width: 2px;">
              <div class="reppley-persona-content">
                  <div class="reppley-persona-name-wrapper"><div class="reppley-persona-name">Type 1: 전체 대화 기록 (실시간)</div></div>
                  <div class="reppley-persona-description" style="max-height: none;">1초마다 모든 대화 기록을 시스템 지침에 자동으로 업데이트합니다.</div>
              </div>
          </div>
          
          <div id="reppley-memory-type2-btn" class="reppley-persona-item" style="cursor: pointer; border-width: 2px; margin-top: 16px;">
              <div class="reppley-persona-content">
                  <div class="reppley-persona-name-wrapper"><div class="reppley-persona-name">Type 2: Gemini 자동 요약 (기본값)</div></div>
                  <div class="reppley-persona-description" style="max-height: none;">Google Gemini API를 사용하여 현재 대화를 영어로 요약하고 저장합니다.</div>
              </div>
          </div>

          <div id="reppley-gemini-settings-section" style="margin-top: 24px; display: none;">
              <div class="reppley-persona-input-group">
                  <label for="reppley-api-key-input">Google AI Studio API Key</label>
                  <input type="password" id="reppley-api-key-input" placeholder="API 키를 여기에 붙여넣으세요.">
                   <p class="description" style="font-size: 12px; color: #9aa0a6; margin-top: 8px;">
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #8ab4f8;">API 키 발급 사이트 (무료)</a>에서 발급 뒤 복사해서 이곳에 붙여넣어주세요.
                   </p>
              </div>
               <div class="reppley-persona-input-group" style="margin-top: 16px;">
                  <label for="reppley-gemini-model-select">AI 모델 선택</label>
                  <select id="reppley-gemini-model-select" class="creator-form-section select">
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (빠름, 비권장)</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (빠름, 권장)</option>
		      <option value="gemini-2.5-pro">Gemini 2.5 Pro (느림, 정확)</option>
                  </select>
              </div>

              <h3 style="font-size: 16px; color: #bdc1c6; border-bottom: 1px solid #3c4043; padding-bottom: 8px; margin-top: 24px;">저장된 영문 요약 목록</h3>
              <div id="reppley-summaries-list-container" style="background-color: #282a2d; padding: 12px; border-radius: 8px; max-height: 250px; overflow-y: auto; margin-top: 12px; color: #9aa0a6;">
                  <div id="reppley-summaries-list">
                      <p style="font-size: 14px; text-align: center;">저장된 요약이 없습니다.</p>
                  </div>
              </div>
              <button id="reppley-generate-summary-btn" style="width: 100%; margin-top: 16px; padding: 10px; font-size: 15px; background-color: #8ab4f8; color: #202124; border: none; border-radius: 8px; cursor: pointer;">현재 대화로 영문 요약 생성/추가</button>
          </div>
        </div>
      </div>
      <div id="reppley-summary-edit-modal" class="reppley-note-modal-overlay">
          <div class="reppley-note-modal-content">
              <h2>영문 요약 수정</h2>
              <textarea id="reppley-edit-summary-textarea" style="min-height: 200px;" placeholder="요약 내용을 수정하세요..."></textarea>
              <div class="reppley-note-modal-actions">
                  <button id="reppley-edit-summary-close-btn">취소</button>
                  <button id="reppley-edit-summary-save-btn">저장</button>
              </div>
          </div>
      </div>
      `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('reppley-memory-modal');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('reppley-memory-type1-btn').addEventListener('click', () => {
      setActiveMemoryType('type1');
      manageHistoryInterval();
      updateMemoryModalUI();
      if (window.reppley && window.reppley.updateSystemInstructions) {
        window.reppley.updateSystemInstructions();
      }
      alert('장기 기억이 [Type 1: 전체 대화 기록 (실시간)]으로 설정되었습니다.');
      modal.style.display = 'none';
    });

    document.getElementById('reppley-memory-type2-btn').addEventListener('click', () => {
      setActiveMemoryType('type2');
      manageHistoryInterval();
      updateMemoryModalUI();
      if (window.reppley && window.reppley.updateSystemInstructions) {
        window.reppley.updateSystemInstructions();
      }
    });

    document.getElementById('reppley-generate-summary-btn').addEventListener('click', generateAndSaveGeminiSummary);
    
    let apiKeyDebounce;
    document.getElementById('reppley-api-key-input').addEventListener('input', (e) => {
        clearTimeout(apiKeyDebounce);
        apiKeyDebounce = setTimeout(() => saveGoogleApiKey(e.target.value), 500);
    });
    document.getElementById('reppley-gemini-model-select').addEventListener('change', (e) => {
        saveGeminiModel(e.target.value);
    });

    document.getElementById('reppley-summaries-list-container').addEventListener('click', (e) => {
        const editBtn = e.target.closest('.reppley-summary-edit-btn');
        const deleteBtn = e.target.closest('.reppley-summary-delete-btn');
        
        if (editBtn) {
            const summaryId = parseInt(editBtn.dataset.summaryId);
            const summaries = getGeminiSummaries();
            const summaryToEdit = summaries.find(s => s.id === summaryId);
            if (summaryToEdit) {
                currentEditingSummaryId = summaryId;
                const editModal = document.getElementById('reppley-summary-edit-modal');
                editModal.querySelector('#reppley-edit-summary-textarea').value = summaryToEdit.text;
                editModal.style.display = 'flex';
            }
        } else if (deleteBtn) {
            const summaryId = parseInt(deleteBtn.dataset.summaryId);
            deleteSummary(summaryId);
        }
    });

    const editSummaryModal = document.getElementById('reppley-summary-edit-modal');
    editSummaryModal.addEventListener('click', (e) => { if (e.target === editSummaryModal) editSummaryModal.style.display = 'none'; });
    editSummaryModal.querySelector('#reppley-edit-summary-close-btn').addEventListener('click', () => { editSummaryModal.style.display = 'none'; });
    editSummaryModal.querySelector('#reppley-edit-summary-save-btn').addEventListener('click', () => {
        const newText = editSummaryModal.querySelector('#reppley-edit-summary-textarea').value.trim();
        if (currentEditingSummaryId !== null && newText) {
            updateSummary(currentEditingSummaryId, newText);
            editSummaryModal.style.display = 'none';
            currentEditingSummaryId = null;
        } else {
            alert('수정된 요약 내용이 비어있을 수 없습니다.');
        }
    });
  }

  function updateMemoryModalUI() {
    const memoryButton = document.querySelector('#reppley-memory-settings-container button');
    if (!memoryButton) return;

    const activeType = getActiveMemoryType();
    memoryButton.querySelector('span:nth-of-type(2)').textContent = `현재 타입: ${activeType === 'type1' ? 'Type 1 (실시간 기록)' : 'Type 2 (Gemini 요약)'}`;

    const type1Btn = document.getElementById('reppley-memory-type1-btn');
    const type2Btn = document.getElementById('reppley-memory-type2-btn');
    const geminiSection = document.getElementById('reppley-gemini-settings-section');
    const summariesListDiv = document.getElementById('reppley-summaries-list');

    type1Btn.classList.toggle('is-active', activeType === 'type1');
    type2Btn.classList.toggle('is-active', activeType === 'type2');
    
    geminiSection.style.display = activeType === 'type2' ? 'block' : 'none';

    if (activeType === 'type2') {
      document.getElementById('reppley-api-key-input').value = getGoogleApiKey();
      document.getElementById('reppley-gemini-model-select').value = getGeminiModel();
      
      const summaries = getGeminiSummaries();
      if (summaries.length > 0) {
          summariesListDiv.innerHTML = summaries.map(s => `
              <div class="reppley-persona-item" style="margin-bottom: 8px; padding: 10px; align-items: stretch;">
                  <div class="reppley-persona-content">
                      <div style="font-size: 12px; color: #aaa; margin-bottom: 4px;">${s.timestamp}</div>
                      <div style="font-size: 14px; color: #e8eaed; white-space: pre-wrap; word-break: break-word;">${s.text}</div>
                  </div>
                  <div class="reppley-persona-actions" style="flex-direction: column; justify-content: space-around;">
                      <div class="reppley-persona-action-btn reppley-summary-edit-btn" data-summary-id="${s.id}" style="margin-bottom: 4px;">수정</div>
                      <div class="reppley-persona-action-btn reppley-summary-delete-btn" data-summary-id="${s.id}">삭제</div>
                  </div>
              </div>
          `).join('');
          const summariesListContainer = document.getElementById('reppley-summaries-list-container');
          if (summariesListContainer) {
              summariesListContainer.scrollTop = summariesListContainer.scrollHeight;
          }
      } else {
          summariesListDiv.innerHTML = '<p style="font-size: 14px; text-align: center;">저장된 요약이 없습니다.</p>';
      }
    }
  }

  function injectMemoryButton() {
    const impersonationToggleContainer = document.querySelector('#reppley-impersonation-toggle-container');
    if (document.getElementById('reppley-memory-settings-container') || !impersonationToggleContainer) return;
    const originalSelector = document.querySelector('.settings-model-selector');
    if (!originalSelector) return;
    const memoryClone = originalSelector.cloneNode(true);
    memoryClone.id = 'reppley-memory-settings-container';
    const memoryButton = memoryClone.querySelector('button.model-selector-card');
    memoryButton.querySelector('span:nth-of-type(1)').textContent = '장기 기억 메모리';
    memoryButton.querySelector('span:nth-of-type(3)').textContent = '클릭하여 메모리 타입을 설정합니다.';
    memoryButton.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      document.getElementById('reppley-memory-modal').style.display = 'flex';
      updateMemoryModalUI();
    });
    const rightPanel = memoryClone.querySelector('ms-sliding-right-panel');
    if (rightPanel) rightPanel.remove();
    impersonationToggleContainer.parentNode.insertBefore(memoryClone, impersonationToggleContainer);
    updateMemoryModalUI();
  }

  // --- 4. 메인 실행 및 감시 로직 ---

  createMemoryModal();
  
  // ✨ [수정] MutationObserver는 이제 버튼 주입 역할만 담당합니다.
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.querySelector('#reppley-impersonation-toggle-container')) {
          injectMemoryButton();
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // 페이지 로드 시 초기 상태에 맞게 인터벌 설정
  manageHistoryInterval();

  console.log("Reppley Memory Script 1.4 (Final Fix) Start");
})();