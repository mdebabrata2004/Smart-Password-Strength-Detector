// main.js
// Core logic: name/dob analysis, entropy estimate, secure generator, helpers.

(function(global){
  
  function safeText(s){ return (s||'').toString().trim(); }

  function partsFromName(name){
    if(!name) return [];
    const cleaned = name.normalize('NFKD').replace(/[^\p{L}\s'-]/gu,' ').toLowerCase();
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    const parts = new Set();
    tokens.forEach(t=>{
      parts.add(t);
      if(t.length>1) parts.add(t.slice(0,1));
    });
    if(tokens.length>1){
      parts.add(tokens.join(''));               
      parts.add(tokens.map(t=>t[0]).join('')); 
    }
    
    tokens.forEach(t=>{
      for(let l=2;l<=Math.min(6,t.length);l++) parts.add(t.slice(0,l));
    });
    return Array.from(parts).filter(Boolean);
  }

  // DOB patterns extractor
  function dobPatterns(dob){
    if(!dob) return [];
    const [y,m,d] = dob.split('-');
    if(!y) return [];
    const yy = y.slice(2);
    const patterns = new Set();
    patterns.add(y); patterns.add(yy);
    patterns.add(d+m+y); patterns.add(d+m+yy);
    patterns.add(m+d+y); patterns.add(m+d+yy);
    patterns.add(d+m); patterns.add(m+d);
    patterns.add(d+yy); patterns.add(m+yy);
    return Array.from(patterns).filter(Boolean);
  }

  
  function analyzePasswordAgainstNameDob(pwd, name, dob){
    pwd = pwd||'';
    const pwdLow = pwd.toLowerCase();
    const warnings = [];
    const nameParts = partsFromName(name);
    nameParts.forEach(p=>{
      if(p.length>=2 && pwdLow.includes(p)) warnings.push({type:'name', token:p, text:`Password contains name fragment: "${p}"`});
    });
    const dobP = dobPatterns(dob);
    dobP.forEach(p=>{
      if(p && pwd.includes(p)) warnings.push({type:'dob', token:p, text:`Password contains DOB pattern: ${p}`});
    });

    
    const separators = ['@','.','_','-'];
    separators.forEach(sep=>{
      nameParts.forEach(p=>{
        dobP.forEach(dp=>{
          const combo1 = p+sep+dp;
          const combo2 = dp+sep+p;
          if(combo1.length>3 && pwdLow.includes(combo1)) warnings.push({type:'combo', token:combo1, text:`Pattern found: ${combo1}`});
          if(combo2.length>3 && pwdLow.includes(combo2)) warnings.push({type:'combo', token:combo2, text:`Pattern found: ${combo2}`});
        });
      });
    });

   
    for(let y=1950;y<=2035;y++){
      const s = String(y);
      if(pwd.includes(s)) warnings.push({type:'year', token:s, text:`Contains year: ${s}`});
    }

    
    const seqs = ['1234','4321','abcd','qwerty','password','pass','letmein'];
    seqs.forEach(s=>{
      if(pwd.toLowerCase().includes(s)) warnings.push({type:'common', token:s, text:`Common sequence/word: ${s}`});
    });

    if(warnings.length===0) warnings.push({type:'none', text:'No direct name/date of birth related part was found — but do not ignore the risk of pattern-based attacks.'});
    return warnings;
  }

  
  function estimateEntropy(pwd){
    if(!pwd) return {entropy:0,pool:1};
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasDigit = /[0-9]/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    let pool = 0;
    if(hasLower) pool += 26;
    if(hasUpper) pool += 26;
    if(hasDigit) pool += 10;
    if(hasSymbol) pool += 32; // rough symbol set
    if(pool===0) pool = 1;
    const entropy = pwd.length * Math.log2(pool);
    return {entropy, pool};
  }

  
  function secsToHuman(s){
    if(!isFinite(s)) return '∞';
    let rem = Math.floor(s);
    const year = 3600*24*365;
    const y = Math.floor(rem / year); rem %= year;
    const d = Math.floor(rem / (3600*24)); rem %= 3600*24;
    const h = Math.floor(rem / 3600); rem %= 3600;
    const m = Math.floor(rem / 60); rem = rem % 60;
    const parts = [];
    if(y) parts.push(y+'y');
    if(d) parts.push(d+'d');
    if(h) parts.push(h+'h');
    if(m) parts.push(m+'m');
    if(rem) parts.push(rem+'s');
    return parts.slice(0,3).join(' ') || '0s';
  }

  
  function secureRandomBytes(len){
    const arr = new Uint8Array(len);
    crypto.getRandomValues(arr);
    return arr;
  }

  
  function generateAvoiding(len, pools, forbiddenList){
    let chars = '';
    if(pools.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if(pools.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if(pools.digits) chars += '0123456789';
    if(pools.symbols) chars += "!@#$%^&*()-_=+[]{};:'\",.<>/?`~";
    if(!chars) return '';

    const out = [];
    const bytes = secureRandomBytes(len*2);
    for(let i=0;i<len;i++){
      let ch=''; let tries=0;
      while(tries<50){
        const idx = bytes[(i*2+tries)%bytes.length] % chars.length;
        ch = chars.charAt(idx);
        const candidate = (out.join('') + ch).toLowerCase();
        let bad = false;
        for(const f of forbiddenList){
          if(!f) continue;
          if(candidate.includes(String(f).toLowerCase())){ bad = true; break; }
        }
        if(!bad) break;
        tries++;
      }
      out.push(ch);
    }

    
    const must = [];
    if(pools.lower) must.push('abcdefghijklmnopqrstuvwxyz');
    if(pools.upper) must.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if(pools.digits) must.push('0123456789');
    if(pools.symbols) must.push("!@#$%^&*()-_=+[]{};:'\",.<>/?`~");
    for(let i=0;i<must.length && i<out.length;i++){
      const pos = Math.floor((secureRandomBytes(1)[0]/256) * out.length);
      const poolchars = must[i];
      out[pos] = poolchars[ secureRandomBytes(1)[0] % poolchars.length ];
    }

    return out.join('');
  }

 
  function targetedGuessEstimate(name, dob){
    
    const nameParts = partsFromName(name);
    const nameVariants = Math.min(50, Math.max(1, nameParts.length * 3)); 
    const separators = ['','@','.','_','-'];
    const years = dobPatterns(dob);
    const yearVariants = Math.max(1, Math.min(20, years.length + 5));
    const total = nameVariants * separators.length * yearVariants;
    return {total, nameVariants, separators:separators.length, yearVariants};
  }


  global.PasswordLogic = {
    safeText, partsFromName, dobPatterns, analyzePasswordAgainstNameDob,
    estimateEntropy, secsToHuman, secureRandomBytes, generateAvoiding,
    targetedGuessEstimate
  };

})(window);

