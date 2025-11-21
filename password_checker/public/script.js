// script.js
// Wire main.js functions to the page elements (assumes your index.html has corresponding ids)

(function(){
  const fullnameEl = document.getElementById('fullname');
  const dobEl = document.getElementById('dob');
  const pwdEl = document.getElementById('pwd');
  const checkBtn = document.getElementById('checkBtn');
  const showBtn = document.getElementById('showBtn');
  const genBtn = document.getElementById('genBtn');
  const warningsEl = document.getElementById('warnings') || document.createElement('div');
  const entropyEl = document.getElementById('entropy') || document.createElement('div');
  const timesEl = document.getElementById('times') || document.createElement('div');
  const analysisEl = document.getElementById('analysis') || document.createElement('div');
  const generatedEl = document.getElementById('generated') || document.createElement('pre');
  const copyBtn = document.getElementById('copyBtn');

  // helper for displaying warnings list
  function showWarnings(warns){
    warningsEl.innerHTML = '';
    warns.forEach(w=>{
      const d = document.createElement('div');
      d.textContent = w.text || w;
      warningsEl.appendChild(d);
    });
  }

  function updateDisplay(){
    const name = PasswordLogic.safeText(fullnameEl.value);
    const dob = dobEl.value;
    const pwd = pwdEl.value || '';
    warningsEl.innerHTML=''; analysisEl.innerHTML=''; entropyEl.textContent=''; timesEl.innerHTML='';

    if(!pwd) return;
    // name/dob warnings
    const warns = PasswordLogic.analyzePasswordAgainstNameDob(pwd,name,dob);
    showWarnings(warns);

    // entropy & brute-force times
    const ent = PasswordLogic.estimateEntropy(pwd);
    const entTxt = `Entropy ≈ ${ent.entropy.toFixed(2)} bits (pool ≈ ${ent.pool})`;
    entropyEl.textContent = entTxt;

    const combos = Math.pow(2, ent.entropy);
    const speeds = [1000, 1000000, 1000000000, 100000000000];
    timesEl.innerHTML = '';
    speeds.forEach(sp=>{
      const secs = combos / sp;
      const div = document.createElement('div');
      div.textContent = `${sp.toLocaleString()} attempts/sec → ${PasswordLogic.secsToHuman ? PasswordLogic.secsToHuman(secs) : secsToHuman(secs)}`;
      timesEl.appendChild(div);
    });

    // targeted-attack estimate
    const tgt = PasswordLogic.targetedGuessEstimate(name,dob);
    const targetedExamples = `Targeted-attack heuristic: ~${tgt.total.toLocaleString()} guesses (nameVariants≈${tgt.nameVariants}, separators≈${tgt.separators}, yearVariants≈${tgt.yearVariants}).\nIf attacker tries these at 1k/s → ${PasswordLogic.secsToHuman(tgt.total/1000)} (≈${(tgt.total/1000).toFixed(2)} seconds).`;
    const ul = document.createElement('div');
    ul.textContent = targetedExamples;
    analysisEl.appendChild(ul);

    // strength message
    const msg = document.createElement('div');
    if(ent.entropy < 40) msg.textContent = 'Weak: entropy is low. Use a longer, more mixed password.';
    else if(ent.entropy < 60) msg.textContent = 'Moderate: medium strength. If name-based patterns are present it may be cracked quickly.';
    else msg.textContent = 'Strong (random-model): entropy is good — but if the password contains name/DOB, targeted attacks can still break it quickly.';
    analysisEl.appendChild(msg);
  }

  // generator: two modes: (A) fully random, (B) name-prefixed (name + random suffix)
  function generatePasswordUI(){
    const len = Math.min(128, Math.max(6, Number(document.getElementById('genLen')?.value || 16)));
    const pools = {
      lower: document.getElementById('optLower') ? document.getElementById('optLower').checked : true,
      upper: document.getElementById('optUpper') ? document.getElementById('optUpper').checked : true,
      digits: document.getElementById('optDigits') ? document.getElementById('optDigits').checked : true,
      symbols: document.getElementById('optSymbols') ? document.getElementById('optSymbols').checked : true
    };
    const name = PasswordLogic.safeText(fullnameEl.value);
    const useNamePrefix = !!name; // if name provided, create variant that includes name at start (user wanted this)
    const forbidden = [].concat(PasswordLogic.partsFromName(name), PasswordLogic.dobPatterns(dobEl.value));

    let pw;
    if(useNamePrefix){
      // Create: CapitalizedName + '-' + random suffix of (len - name.length -1)
      const baseName = name.split(/\s+/)[0] || name; // first token
      const cap = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      const suffixLen = Math.max(6, len - (cap.length + 1));
      const suffix = PasswordLogic.generateAvoiding(suffixLen, pools, forbidden);
      pw = cap + '-' + suffix;
    } else {
      pw = PasswordLogic.generateAvoiding(len, pools, forbidden);
    }

    generatedEl.textContent = pw;
    // also populate pwd box for immediate analysis
    if(pwdEl) pwdEl.value = pw;
    updateDisplay();
  }

  // attach events (if elements exist)
  if(checkBtn) checkBtn.addEventListener('click', updateDisplay);
  if(pwdEl) pwdEl.addEventListener('input', updateDisplay);
  if(showBtn) showBtn.addEventListener('click', ()=>{ pwdEl.type = (pwdEl.type==='password')? 'text':'password'; });
  if(genBtn) genBtn.addEventListener('click', generatePasswordUI);
  if(copyBtn) copyBtn.addEventListener('click', async ()=>{
    const txt = generatedEl.textContent;
    if(!txt) return;
    await navigator.clipboard.writeText(txt);
    alert('Copied to clipboard');
  });

  

})();
