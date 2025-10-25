// script.js
// Advanced DOM-manipulation implementation for Dynamic Quote Generator

(() => {
  // Persistent key for localStorage
  const STORAGE_KEY = 'dqg_quotes_v1';

  // Default initial quotes
  const DEFAULT_QUOTES = [
    { text: "Simplicity is the ultimate sophistication.", category: "Philosophy" },
    { text: "Programs must be written for people to read, and only incidentally for machines to execute.", category: "Programming" },
    { text: "Learning never exhausts the mind.", category: "Motivation" },
    { text: "Debugging is like being the detective in a crime movie where you are also the murderer.", category: "Programming" },
    { text: "The only way to do great work is to love what you do.", category: "Motivation" }
  ];

  // State (keeps in-memory copy)
  let quotes = loadQuotes();
  let categories = new Set(quotes.map(q => q.category));

  // DOM elements
  const quoteDisplayEl = document.getElementById('quoteDisplay');
  const quoteMetaEl = document.getElementById('quoteMeta');
  const newQuoteBtn = document.getElementById('newQuote');
  const categorySelect = document.getElementById('categorySelect');
  const addFormContainer = document.getElementById('addFormContainer');
  const quotesList = document.getElementById('quotesList');

  // --- Initialization ---
  populateCategorySelect();
  renderQuotesList();
  injectAddQuoteForm();
  bindEvents();

  // --- Functions ---

  function loadQuotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUOTES));
        return DEFAULT_QUOTES.slice();
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('bad data');
      return parsed;
    } catch (err) {
      // fallback: reset to defaults
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_QUOTES));
      return DEFAULT_QUOTES.slice();
    }
  }

  function saveQuotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  }

  function populateCategorySelect() {
    // clear
    categorySelect.innerHTML = '';
    // Add "All" option
    const allOpt = document.createElement('option');
    allOpt.value = '__all__';
    allOpt.textContent = 'All categories';
    categorySelect.appendChild(allOpt);

    const cats = Array.from(new Set(quotes.map(q => q.category))).sort();
    cats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  }

  function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    let pool = quotes.slice();
    if (selectedCategory && selectedCategory !== '__all__') {
      pool = pool.filter(q => q.category === selectedCategory);
    }
    if (pool.length === 0) {
      animateText(quoteDisplayEl, `No quotes in "${selectedCategory}" yet — add one below!`);
      quoteMetaEl.textContent = '';
      return;
    }
    // choose random
    const idx = Math.floor(Math.random() * pool.length);
    const chosen = pool[idx];
    animateText(quoteDisplayEl, `“${chosen.text}”`);
    quoteMetaEl.textContent = `Category: ${chosen.category} (${pool.length} in this filter)`;
  }

  function animateText(el, text) {
    // simple fade/transform animation using classless inline changes
    el.style.opacity = 0;
    el.style.transform = 'translateY(10px)';
    // force reflow to make transition apply
    void el.offsetWidth;
    setTimeout(() => {
      el.textContent = text;
      el.style.transition = 'opacity 360ms ease, transform 360ms ease';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      // cleanup after
      setTimeout(() => {
        el.style.transition = '';
      }, 400);
    }, 180);
  }

  function injectAddQuoteForm() {
    // Build form purely with DOM methods (advanced DOM usage)
    const form = document.createElement('form');
    form.id = 'addQuoteForm';
    form.autocomplete = 'off';

    const textInput = document.createElement('input');
    textInput.id = 'newQuoteText';
    textInput.placeholder = 'Enter a new quote';
    textInput.required = true;

    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category (e.g. Motivation)';
    categoryInput.required = true;

    const addBtn = document.createElement('button');
    addBtn.type = 'submit';
    addBtn.textContent = 'Add Quote';
    addBtn.className = 'btn';

    const addCategoryBtn = document.createElement('button');
    addCategoryBtn.type = 'button';
    addCategoryBtn.textContent = 'Add New Category Only';
    addCategoryBtn.className = 'small';

    // append elements
    form.appendChild(textInput);
    form.appendChild(categoryInput);

    const controlsWrap = document.createElement('div');
    controlsWrap.style.display = 'flex';
    controlsWrap.style.gap = '8px';
    controlsWrap.style.flexWrap = 'wrap';
    controlsWrap.appendChild(addBtn);
    controlsWrap.appendChild(addCategoryBtn);

    form.appendChild(controlsWrap);

    // handle events
    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const t = textInput.value.trim();
      const c = categoryInput.value.trim() || 'Uncategorized';
      if (!t) {
        textInput.focus();
        return;
      }
      addQuote({ text: t, category: c });
      textInput.value = '';
      // keep category for subsequent entries
    });

    addCategoryBtn.addEventListener('click', () => {
      const c = categoryInput.value.trim();
      if (!c) return;
      addCategory(c);
      categoryInput.value = '';
    });

    addFormContainer.appendChild(form);
  }

  function addQuote({ text, category }) {
    // create and mutate DOM & state
    const quoteObj = { text, category };
    quotes.push(quoteObj);
    saveQuotes();

    categories.add(category);
    populateCategorySelect();
    renderQuotesList();

    // after adding show it
    animateText(quoteDisplayEl, `“${text}”`);
    quoteMetaEl.textContent = `Category: ${category}`;

    // select the category the user added (UX)
    categorySelect.value = category;
  }

  function addCategory(categoryName) {
    if (!categoryName) return;
    categories.add(categoryName);
    // no quote added, but update select
    populateCategorySelect();
    // auto-select it
    categorySelect.value = categoryName;
    animateText(quoteDisplayEl, `Category "${categoryName}" added — no quotes yet.`);
    quoteMetaEl.textContent = '';
  }

  function renderQuotesList() {
    quotesList.innerHTML = '';
    // show last added first
    const arr = quotes.slice().reverse();
    arr.forEach((q, idx) => {
      const li = document.createElement('li');
      li.className = 'quotes-list-item';

      const left = document.createElement('div');
      left.style.flex = '1';
      const p = document.createElement('div');
      p.textContent = q.text;
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = q.category;
      left.appendChild(p);
      left.appendChild(meta);

      const right = document.createElement('div');
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.title = 'Remove this quote';
      removeBtn.addEventListener('click', () => {
        // find original index (quotesList is reversed)
        const origIdx = quotes.length - 1 - idx;
        quotes.splice(origIdx, 1);
        saveQuotes();
        populateCategorySelect();
        renderQuotesList();
        animateText(quoteDisplayEl, 'Quote removed.');
        quoteMetaEl.textContent = '';
      });
      right.appendChild(removeBtn);

      li.appendChild(left);
      li.appendChild(right);
      quotesList.appendChild(li);
    });
  }

  function bindEvents() {
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categorySelect.addEventListener('change', () => {
      // auto show a quote in new filter for better UX
      showRandomQuote();
    });

    // keyboard shortcuts: N = new quote
    window.addEventListener('keydown', (e) => {
      if (e.key === 'N' || e.key === 'n') {
        showRandomQuote();
      }
    });
  }

  // expose functions for debugging in console (optional)
  window._dqg = {
    showRandomQuote, addQuote, addCategory, getQuotes: () => quotes.slice()
  };

})();

