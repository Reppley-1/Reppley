(() => {
  // 스크립트 중복 실행 방지
  if (window.hasMyAIScriptRun) return;
  window.hasMyAIScriptRun = true;
// --- ✨ [수정] Web Crypto API 헬퍼 함수 (복호화 기능 추가) ---
  const cryptoUtils = {
    // ArrayBuffer를 Base64 문자열로 변환
    arrayBufferToBase64: (buffer) => {
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return window.btoa(binary);
    },
    // Base64 문자열을 ArrayBuffer로 변환
    base64ToArrayBuffer: (base64) => {
      const binary_string = window.atob(base64);
      const len = binary_string.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    },
    // 비밀번호와 Salt로부터 암호화 키를 생성
    deriveKey: async (password, salt) => {
      const enc = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      return window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    },
    // 데이터를 비밀번호로 암호화
    encryptData: async (password, data) => {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await cryptoUtils.deriveKey(password, salt);
      const enc = new TextEncoder();
      const encodedData = enc.encode(data);
      const encryptedContent = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedData
      );
      return JSON.stringify({
        salt: cryptoUtils.arrayBufferToBase64(salt),
        iv: cryptoUtils.arrayBufferToBase64(iv),
        content: cryptoUtils.arrayBufferToBase64(encryptedContent)
      });
    },
    // 암호화된 데이터를 비밀번호로 복호화
    decryptData: async (password, encryptedDataString) => {
      try {
        const { salt, iv, content } = JSON.parse(encryptedDataString);
        const key = await cryptoUtils.deriveKey(
          password,
          cryptoUtils.base64ToArrayBuffer(salt)
        );
        const decryptedContent = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: cryptoUtils.base64ToArrayBuffer(iv) },
          key,
          cryptoUtils.base64ToArrayBuffer(content)
        );
        const dec = new TextDecoder();
        return dec.decode(decryptedContent);
      } catch (error) {
        console.error('Decryption failed:', error);
        return null; // 비밀번호가 틀리거나 데이터가 손상된 경우 null 반환
      }
    }
  };
  // --- 1. Supabase 클라이언트 라이브러리 삽입 ---
  const supabaseScript = document.createElement('script');
  supabaseScript.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  document.head.appendChild(supabaseScript);

  // --- 2. Supabase 클라이언트 초기화 ---
  // ⚠️ 중요: 아래 값들을 자신의 Supabase 프로젝트 값으로 반드시 교체하세요.
  const SUPABASE_URL = 'https://ioqzjeajaonksrtwvoek.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvcXpqZWFqYW9ua3NydHd2b2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTM4NDAsImV4cCI6MjA3NTY2OTg0MH0.zG8QBhrvkovOR3iHBSOb7CueWBqeFnlLphFJMG4AsRQ';
  let supabase = null;

  // --- ✨ [FINAL SOLUTION] CSP 문제를 해결하기 위해 Supabase 라이브러리를 스크립트에 직접 내장 ---
  try {
    !function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.supabase=t():e.supabase=t()}(self,()=>(()=>{"use strict";var e={13:function(e,t,s){var r=this&&this.__awaiter||function(e,t,s,r){return new(s||(s=Promise))(function(i,n){function o(e){try{l(r.next(e))}catch(e){n(e)}}function a(e){try{l(r.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof s?t:new s(function(e){e(t)})).then(o,a)}l((r=r.apply(e,t||[])).next())})};Object.defineProperty(t,"__esModule",{value:!0});const i=s(227),n=s(279),o=s(830),a=s(962),l=s(251),c=s(442),h=s(819),u=s(795);t.default=class{constructor(e,t,s){var r,i,o;this.supabaseUrl=e,this.supabaseKey=t;const u=(0,h.validateSupabaseUrl)(e);if(!t)throw new Error("supabaseKey is required.");this.realtimeUrl=new URL("realtime/v1",u),this.realtimeUrl.protocol=this.realtimeUrl.protocol.replace("http","ws"),this.authUrl=new URL("auth/v1",u),this.storageUrl=new URL("storage/v1",u),this.functionsUrl=new URL("functions/v1",u);const d=`sb-${u.hostname.split(".")[0]}-auth-token`,f={db:l.DEFAULT_DB_OPTIONS,realtime:l.DEFAULT_REALTIME_OPTIONS,auth:Object.assign(Object.assign({},l.DEFAULT_AUTH_OPTIONS),{storageKey:d}),global:l.DEFAULT_GLOBAL_OPTIONS},p=(0,h.applySettingDefaults)(null!=s?s:{},f);this.storageKey=null!==(r=p.auth.storageKey)&&void 0!==r?r:"",this.headers=null!==(i=p.global.headers)&&void 0!==i?i:{},p.accessToken?(this.accessToken=p.accessToken,this.auth=new Proxy({},{get:(e,t)=>{throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(t)} is not possible`)}})):this.auth=this._initSupabaseAuthClient(null!==(o=p.auth)&&void 0!==o?o:{},this.headers,p.global.fetch),this.fetch=(0,c.fetchWithAuth)(t,this._getAccessToken.bind(this),p.global.fetch),this.realtime=this._initRealtimeClient(Object.assign({headers:this.headers,accessToken:this._getAccessToken.bind(this)},p.realtime)),this.rest=new n.PostgrestClient(new URL("rest/v1",u).href,{headers:this.headers,schema:p.db.schema,fetch:this.fetch}),this.storage=new a.StorageClient(this.storageUrl.href,this.headers,this.fetch,null==s?void 0:s.storage),p.accessToken||this._listenForAuthEvents()}get functions(){return new i.FunctionsClient(this.functionsUrl.href,{headers:this.headers,customFetch:this.fetch})}from(e){return this.rest.from(e)}schema(e){return this.rest.schema(e)}rpc(e,t={},s={head:!1,get:!1,count:void 0}){return this.rest.rpc(e,t,s)}channel(e,t={config:{}}){return this.realtime.channel(e,t)}getChannels(){return this.realtime.getChannels()}removeChannel(e){return this.realtime.removeChannel(e)}removeAllChannels(){return this.realtime.removeAllChannels()}_getAccessToken(){return r(this,void 0,void 0,function*(){var e,t;if(this.accessToken)return yield this.accessToken();const{data:s}=yield this.auth.getSession();return null!==(t=null===(e=s.session)||void 0===e?void 0:e.access_token)&&void 0!==t?t:this.supabaseKey})}_initSupabaseAuthClient({autoRefreshToken:e,persistSession:t,detectSessionInUrl:s,storage:r,userStorage:i,storageKey:n,flowType:o,lock:a,debug:l},c,h){const d={Authorization:`Bearer ${this.supabaseKey}`,apikey:`${this.supabaseKey}`};return new u.SupabaseAuthClient({url:this.authUrl.href,headers:Object.assign(Object.assign({},d),c),storageKey:n,autoRefreshToken:e,persistSession:t,detectSessionInUrl:s,storage:r,userStorage:i,flowType:o,lock:a,debug:l,fetch:h,hasCustomAuthorizationHeader:Object.keys(this.headers).some(e=>"authorization"===e.toLowerCase())})}_initRealtimeClient(e){return new o.RealtimeClient(this.realtimeUrl.href,Object.assign(Object.assign({},e),{params:Object.assign({apikey:this.supabaseKey},null==e?void 0:e.params)}))}_listenForAuthEvents(){return this.auth.onAuthStateChange((e,t)=>{this._handleTokenChanged(e,"CLIENT",null==t?void 0:t.access_token)})}_handleTokenChanged(e,t,s){"TOKEN_REFRESHED"!==e&&"SIGNED_IN"!==e||this.changedAccessToken===s?"SIGNED_OUT"===e&&(this.realtime.setAuth(),"STORAGE"==t&&this.auth.signOut(),this.changedAccessToken=void 0):(this.changedAccessToken=s,this.realtime.setAuth(s))}}},45:function(e,t,s){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=r(s(825));t.default=class{constructor(e,{headers:t={},schema:s,fetch:r}){this.url=e,this.headers=new Headers(t),this.schema=s,this.fetch=r}select(e,{head:t=!1,count:s}={}){const r=t?"HEAD":"GET";let n=!1;const o=(null!=e?e:"*").split("").map(e=>/\s/.test(e)&&!n?"":('"'===e&&(n=!n),e)).join("");return this.url.searchParams.set("select",o),s&&this.headers.append("Prefer",`count=${s}`),new i.default({method:r,url:this.url,headers:this.headers,schema:this.schema,fetch:this.fetch})}insert(e,{count:t,defaultToNull:s=!0}={}){var r;if(t&&this.headers.append("Prefer",`count=${t}`),s||this.headers.append("Prefer","missing=default"),Array.isArray(e)){const t=e.reduce((e,t)=>e.concat(Object.keys(t)),[]);if(t.length>0){const e=[...new Set(t)].map(e=>`"${e}"`);this.url.searchParams.set("columns",e.join(","))}}return new i.default({method:"POST",url:this.url,headers:this.headers,schema:this.schema,body:e,fetch:null!==(r=this.fetch)&&void 0!==r?r:fetch})}upsert(e,{onConflict:t,ignoreDuplicates:s=!1,count:r,defaultToNull:n=!0}={}){var o;if(this.headers.append("Prefer",`resolution=${s?"ignore":"merge"}-duplicates`),void 0!==t&&this.url.searchParams.set("on_conflict",t),r&&this.headers.append("Prefer",`count=${r}`),n||this.headers.append("Prefer","missing=default"),Array.isArray(e)){const t=e.reduce((e,t)=>e.concat(Object.keys(t)),[]);if(t.length>0){const e=[...new Set(t)].map(e=>`"${e}"`);this.url.searchParams.set("columns",e.join(","))}}return new i.default({method:"POST",url:this.url,headers:this.headers,schema:this.schema,body:e,fetch:null!==(o=this.fetch)&&void 0!==o?o:fetch})}update(e,{count:t}={}){var s;return t&&this.headers.append("Prefer",`count=${t}`),new i.default({method:"PATCH",url:this.url,headers:this.headers,schema:this.schema,body:e,fetch:null!==(s=this.fetch)&&void 0!==s?s:fetch})}delete({count:e}={}){var t;return e&&this.headers.append("Prefer",`count=${e}`),new i.default({method:"DELETE",url:this.url,headers:this.headers,schema:this.schema,fetch:null!==(t=this.fetch)&&void 0!==t?t:fetch})}}},227:(e,t,s)=>{s.r(t),s.d(t,{FunctionRegion:()=>a,FunctionsClient:()=>l,FunctionsError:()=>r,FunctionsFetchError:()=>i,FunctionsHttpError:()=>o,FunctionsRelayError:()=>n});class r extends Error{constructor(e,t="FunctionsError",s){super(e),this.name=t,this.context=s}}class i extends r{constructor(e){super("Failed to send a request to the Edge Function","FunctionsFetchError",e)}}class n extends r{constructor(e){super("Relay Error invoking the Edge Function","FunctionsRelayError",e)}}class o extends r{constructor(e){super("Edge Function returned a non-2xx status code","FunctionsHttpError",e)}}var a;!function(e){e.Any="any",e.ApNortheast1="ap-northeast-1",e.ApNortheast2="ap-northeast-2",e.ApSouth1="ap-south-1",e.ApSoutheast1="ap-southeast-1",e.ApSoutheast2="ap-southeast-2",e.CaCentral1="ca-central-1",e.EuCentral1="eu-central-1",e.EuWest1="eu-west-1",e.EuWest2="eu-west-2",e.EuWest3="eu-west-3",e.SaEast1="sa-east-1",e.UsEast1="us-east-1",e.UsWest1="us-west-1",e.UsWest2="us-west-2"}(a||(a={}));class l{constructor(e,{headers:t={},customFetch:r,region:i=a.Any}={}){this.url=e,this.headers=t,this.region=i,this.fetch=(e=>{let t;return t=e||("undefined"==typeof fetch?(...e)=>Promise.resolve().then(s.bind(s,517)).then(({default:t})=>t(...e)):fetch),(...e)=>t(...e)})(r)}setAuth(e){this.headers.Authorization=`Bearer ${e}`}invoke(e,t={}){var s,r,a,l,c;return r=this,a=void 0,c=function*(){try{const{headers:r,method:a,body:l}=t;let c={},{region:h}=t;h||(h=this.region);const u=new URL(`${this.url}/${e}`);let d;h&&"any"!==h&&(c["x-region"]=h,u.searchParams.set("forceFunctionRegion",h)),l&&(r&&!Object.prototype.hasOwnProperty.call(r,"Content-Type")||!r)&&("undefined"!=typeof Blob&&l instanceof Blob||l instanceof ArrayBuffer?(c["Content-Type"]="application/octet-stream",d=l):"string"==typeof l?(c["Content-Type"]="text/plain",d=l):"undefined"!=typeof FormData&&l instanceof FormData?d=l:(c["Content-Type"]="application/json",d=JSON.stringify(l)));const f=yield this.fetch(u.toString(),{method:a||"POST",headers:Object.assign(Object.assign(Object.assign({},c),this.headers),r),body:d}).catch(e=>{throw new i(e)}),p=f.headers.get("x-relay-error");if(p&&"true"===p)throw new n(f);if(!f.ok)throw new o(f);let g,v=(null!==(s=f.headers.get("Content-Type"))&&void 0!==s?s:"text/plain").split(";")[0].trim();return g="application/json"===v?yield f.json():"application/octet-stream"===v?yield f.blob():"text/event-stream"===v?f:"multipart/form-data"===v?yield f.formData():yield f.text(),{data:g,error:null,response:f}}catch(e){return{data:null,error:e,response:e instanceof o||e instanceof n?e.context:void 0}}},new((l=void 0)||(l=Promise))(function(e,t){function s(e){try{n(c.next(e))}catch(e){t(e)}}function i(e){try{n(c.throw(e))}catch(e){t(e)}}function n(t){var r;t.done?e(t.value):(r=t.value,r instanceof l?r:new l(function(e){e(r)})).then(s,i)}n((c=c.apply(r,a||[])).next())})}}},251:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.DEFAULT_REALTIME_OPTIONS=t.DEFAULT_AUTH_OPTIONS=t.DEFAULT_DB_OPTIONS=t.DEFAULT_GLOBAL_OPTIONS=t.DEFAULT_HEADERS=void 0;const r=s(822);let i="";i="undefined"!=typeof Deno?"deno":"undefined"!=typeof document?"web":"undefined"!=typeof navigator&&"ReactNative"===navigator.product?"react-native":"node",t.DEFAULT_HEADERS={"X-Client-Info":`supabase-js-${i}/${r.version}`},t.DEFAULT_GLOBAL_OPTIONS={headers:t.DEFAULT_HEADERS},t.DEFAULT_DB_OPTIONS={schema:"public"},t.DEFAULT_AUTH_OPTIONS={autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0,flowType:"implicit"},t.DEFAULT_REALTIME_OPTIONS={}},261:function(e,t,s){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=r(s(660));class n extends i.default{select(e){let t=!1;const s=(null!=e?e:"*").split("").map(e=>/\s/.test(e)&&!t?"":('"'===e&&(t=!t),e)).join("");return this.url.searchParams.set("select",s),this.headers.append("Prefer","return=representation"),this}order(e,{ascending:t=!0,nullsFirst:s,foreignTable:r,referencedTable:i=r}={}){const n=i?`${i}.order`:"order",o=this.url.searchParams.get(n);return this.url.searchParams.set(n,`${o?`${o},`:""}${e}.${t?"asc":"desc"}${void 0===s?"":s?".nullsfirst":".nullslast"}`),this}limit(e,{foreignTable:t,referencedTable:s=t}={}){const r=void 0===s?"limit":`${s}.limit`;return this.url.searchParams.set(r,`${e}`),this}range(e,t,{foreignTable:s,referencedTable:r=s}={}){const i=void 0===r?"offset":`${r}.offset`,n=void 0===r?"limit":`${r}.limit`;return this.url.searchParams.set(i,`${e}`),this.url.searchParams.set(n,""+(t-e+1)),this}abortSignal(e){return this.signal=e,this}single(){return this.headers.set("Accept","application/vnd.pgrst.object+json"),this}maybeSingle(){return"GET"===this.method?this.headers.set("Accept","application/json"):this.headers.set("Accept","application/vnd.pgrst.object+json"),this.isMaybeSingle=!0,this}csv(){return this.headers.set("Accept","text/csv"),this}geojson(){return this.headers.set("Accept","application/geo+json"),this}explain({analyze:e=!1,verbose:t=!1,settings:s=!1,buffers:r=!1,wal:i=!1,format:n="text"}={}){var o;const a=[e?"analyze":null,t?"verbose":null,s?"settings":null,r?"buffers":null,i?"wal":null].filter(Boolean).join("|"),l=null!==(o=this.headers.get("Accept"))&&void 0!==o?o:"application/json";return this.headers.set("Accept",`application/vnd.pgrst.plan+${n}; for="${l}"; options=${a};`),this}rollback(){return this.headers.append("Prefer","tx=rollback"),this}returns(){return this}maxAffected(e){return this.headers.append("Prefer","handling=strict"),this.headers.append("Prefer",`max-affected=${e}`),this}}t.default=n},279:function(e,t,s){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.PostgrestError=t.PostgrestBuilder=t.PostgrestTransformBuilder=t.PostgrestFilterBuilder=t.PostgrestQueryBuilder=t.PostgrestClient=void 0;const i=r(s(961));t.PostgrestClient=i.default;const n=r(s(45));t.PostgrestQueryBuilder=n.default;const o=r(s(825));t.PostgrestFilterBuilder=o.default;const a=r(s(261));t.PostgrestTransformBuilder=a.default;const l=r(s(660));t.PostgrestBuilder=l.default;const c=r(s(818));t.PostgrestError=c.default,t.default={PostgrestClient:i.default,PostgrestQueryBuilder:n.default,PostgrestFilterBuilder:o.default,PostgrestTransformBuilder:a.default,PostgrestBuilder:l.default,PostgrestError:c.default}},442:function(e,t,s){var r,i=this&&this.__createBinding||(Object.create?function(e,t,s,r){void 0===r&&(r=s);var i=Object.getOwnPropertyDescriptor(t,s);i&&!("get"in i?!t.__esModule:i.writable||i.configurable)||(i={enumerable:!0,get:function(){return t[s]}}),Object.defineProperty(e,r,i)}:function(e,t,s,r){void 0===r&&(r=s),e[r]=t[s]}),n=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),o=this&&this.__importStar||(r=function(e){return r=Object.getOwnPropertyNames||function(e){var t=[];for(var s in e)Object.prototype.hasOwnProperty.call(e,s)&&(t[t.length]=s);return t},r(e)},function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var s=r(e),o=0;o<s.length;o++)"default"!==s[o]&&i(t,e,s[o]);return n(t,e),t}),a=this&&this.__awaiter||function(e,t,s,r){return new(s||(s=Promise))(function(i,n){function o(e){try{l(r.next(e))}catch(e){n(e)}}function a(e){try{l(r.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof s?t:new s(function(e){e(t)})).then(o,a)}l((r=r.apply(e,t||[])).next())})};Object.defineProperty(t,"__esModule",{value:!0}),t.fetchWithAuth=t.resolveHeadersConstructor=t.resolveFetch=void 0;const l=o(s(517));t.resolveFetch=e=>{let t;return t=e||("undefined"==typeof fetch?l.default:fetch),(...e)=>t(...e)},t.resolveHeadersConstructor=()=>"undefined"==typeof Headers?l.Headers:Headers,t.fetchWithAuth=(e,s,r)=>{const i=(0,t.resolveFetch)(r),n=(0,t.resolveHeadersConstructor)();return(t,r)=>a(void 0,void 0,void 0,function*(){var o;const a=null!==(o=yield s())&&void 0!==o?o:e;let l=new n(null==r?void 0:r.headers);return l.has("apikey")||l.set("apikey",e),l.has("Authorization")||l.set("Authorization",`Bearer ${a}`),i(t,Object.assign(Object.assign({},r),{headers:l}))})}},517:(e,t,s)=>{s.r(t),s.d(t,{Headers:()=>o,Request:()=>a,Response:()=>l,default:()=>n,fetch:()=>i});var r=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if(void 0!==s.g)return s.g;throw new Error("unable to locate global object")}();const i=r.fetch,n=r.fetch.bind(r),o=r.Headers,a=r.Request,l=r.Response},646:function(e,t,s){var r=this&&this.__createBinding||(Object.create?function(e,t,s,r){void 0===r&&(r=s);var i=Object.getOwnPropertyDescriptor(t,s);i&&!("get"in i?!t.__esModule:i.writable||i.configurable)||(i={enumerable:!0,get:function(){return t[s]}}),Object.defineProperty(e,r,i)}:function(e,t,s,r){void 0===r&&(r=s),e[r]=t[s]}),i=this&&this.__exportStar||function(e,t){for(var s in e)"default"===s||Object.prototype.hasOwnProperty.call(t,s)||r(t,e,s)},n=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0}),t.createClient=t.SupabaseClient=t.FunctionRegion=t.FunctionsError=t.FunctionsRelayError=t.FunctionsFetchError=t.FunctionsHttpError=t.PostgrestError=void 0;const o=n(s(13));i(s(745),t);var a=s(279);Object.defineProperty(t,"PostgrestError",{enumerable:!0,get:function(){return a.PostgrestError}});var l=s(227);Object.defineProperty(t,"FunctionsHttpError",{enumerable:!0,get:function(){return l.FunctionsHttpError}}),Object.defineProperty(t,"FunctionsFetchError",{enumerable:!0,get:function(){return l.FunctionsFetchError}}),Object.defineProperty(t,"FunctionsRelayError",{enumerable:!0,get:function(){return l.FunctionsRelayError}}),Object.defineProperty(t,"FunctionsError",{enumerable:!0,get:function(){return l.FunctionsError}}),Object.defineProperty(t,"FunctionRegion",{enumerable:!0,get:function(){return l.FunctionRegion}}),i(s(830),t);var c=s(13);Object.defineProperty(t,"SupabaseClient",{enumerable:!0,get:function(){return n(c).default}}),t.createClient=(e,t,s)=>new o.default(e,t,s),function(){if("undefined"!=typeof window)return!1;if("undefined"==typeof process)return!1;const e=process.version;if(null==e)return!1;const t=e.match(/^v(\d+)\./);return!!t&&parseInt(t[1],10)<=18}()&&console.warn("⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217")},660:function(e,t,s){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=r(s(517)),n=r(s(818));t.default=class{constructor(e){var t,s;this.shouldThrowOnError=!1,this.method=e.method,this.url=e.url,this.headers=new Headers(e.headers),this.schema=e.schema,this.body=e.body,this.shouldThrowOnError=null!==(t=e.shouldThrowOnError)&&void 0!==t&&t,this.signal=e.signal,this.isMaybeSingle=null!==(s=e.isMaybeSingle)&&void 0!==s&&s,e.fetch?this.fetch=e.fetch:"undefined"==typeof fetch?this.fetch=i.default:this.fetch=fetch}throwOnError(){return this.shouldThrowOnError=!0,this}setHeader(e,t){return this.headers=new Headers(this.headers),this.headers.set(e,t),this}then(e,t){void 0===this.schema||(["GET","HEAD"].includes(this.method)?this.headers.set("Accept-Profile",this.schema):this.headers.set("Content-Profile",this.schema)),"GET"!==this.method&&"HEAD"!==this.method&&this.headers.set("Content-Type","application/json");let s=(0,this.fetch)(this.url.toString(),{method:this.method,headers:this.headers,body:JSON.stringify(this.body),signal:this.signal}).then(async e=>{var t,s,r,i;let o=null,a=null,l=null,c=e.status,h=e.statusText;if(e.ok){if("HEAD"!==this.method){const s=await e.text();""===s||(a="text/csv"===this.headers.get("Accept")||this.headers.get("Accept")&&(null===(t=this.headers.get("Accept"))||void 0===t?void 0:t.includes("application/vnd.pgrst.plan+text"))?s:JSON.parse(s))}const i=null===(s=this.headers.get("Prefer"))||void 0===s?void 0:s.match(/count=(exact|planned|estimated)/),n=null===(r=e.headers.get("content-range"))||void 0===r?void 0:r.split("/");i&&n&&n.length>1&&(l=parseInt(n[1])),this.isMaybeSingle&&"GET"===this.method&&Array.isArray(a)&&(a.length>1?(o={code:"PGRST116",details:`Results contain ${a.length} rows, application/vnd.pgrst.object+json requires 1 row`,hint:null,message:"JSON object requested, multiple (or no) rows returned"},a=null,l=null,c=406,h="Not Acceptable"):a=1===a.length?a[0]:null)}else{const t=await e.text();try{o=JSON.parse(t),Array.isArray(o)&&404===e.status&&(a=[],o=null,c=200,h="OK")}catch(s){404===e.status&&""===t?(c=204,h="No Content"):o={message:t}}if(o&&this.isMaybeSingle&&(null===(i=null==o?void 0:o.details)||void 0===i?void 0:i.includes("0 rows"))&&(o=null,c=200,h="OK"),o&&this.shouldThrowOnError)throw new n.default(o)}return{error:o,data:a,count:l,status:c,statusText:h}});return this.shouldThrowOnError||(s=s.catch(e=>{var t,s,r;return{error:{message:`${null!==(t=null==e?void 0:e.name)&&void 0!==t?t:"FetchError"}: ${null==e?void 0:e.message}`,details:`${null!==(s=null==e?void 0:e.stack)&&void 0!==s?s:""}`,hint:"",code:`${null!==(r=null==e?void 0:e.code)&&void 0!==r?r:""}`},data:null,count:null,status:0,statusText:""}})),s.then(e,t)}returns(){return this}overrideTypes(){return this}}},745:(e,t,s)=>{s.r(t),s.d(t,{AuthAdminApi:()=>Se,AuthApiError:()=>d,AuthClient:()=>Te,AuthError:()=>h,AuthImplicitGrantRedirectError:()=>b,AuthInvalidCredentialsError:()=>m,AuthInvalidJwtError:()=>O,AuthInvalidTokenResponseError:()=>y,AuthPKCEGrantCodeExchangeError:()=>k,AuthRetryableFetchError:()=>S,AuthSessionMissingError:()=>v,AuthUnknownError:()=>p,AuthWeakPasswordError:()=>E,CustomAuthError:()=>g,GoTrueAdminApi:()=>he,GoTrueClient:()=>ke,NavigatorLockAcquireTimeoutError:()=>pe,SIGN_OUT_SCOPES:()=>ce,isAuthApiError:()=>f,isAuthError:()=>u,isAuthImplicitGrantRedirectError:()=>_,isAuthRetryableFetchError:()=>T,isAuthSessionMissingError:()=>w,isAuthWeakPasswordError:()=>j,lockInternals:()=>de,navigatorLock:()=>ve,processLock:()=>ye});const r="2.71.1",i=3e4,n={"X-Client-Info":`gotrue-js/${r}`},o="X-Supabase-Api-Version",a=Date.parse("2024-01-01T00:00:00.0Z"),l="2024-01-01",c=/^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;class h extends Error{constructor(e,t,s){super(e),this.__isAuthError=!0,this.name="AuthError",this.status=t,this.code=s}}function u(e){return"object"==typeof e&&null!==e&&"__isAuthError"in e}class d extends h{constructor(e,t,s){super(e,t,s),this.name="AuthApiError",this.status=t,this.code=s}}function f(e){return u(e)&&"AuthApiError"===e.name}class p extends h{constructor(e,t){super(e),this.name="AuthUnknownError",this.originalError=t}}class g extends h{constructor(e,t,s,r){super(e,s,r),this.name=t,this.status=s}}class v extends g{constructor(){super("Auth session missing!","AuthSessionMissingError",400,void 0)}}function w(e){return u(e)&&"AuthSessionMissingError"===e.name}class y extends g{constructor(){super("Auth session or user missing","AuthInvalidTokenResponseError",500,void 0)}}class m extends g{constructor(e){super(e,"AuthInvalidCredentialsError",400,void 0)}}class b extends g{constructor(e,t=null){super(e,"AuthImplicitGrantRedirectError",500,void 0),this.details=null,this.details=t}toJSON(){return{name:this.name,message:this.message,status:this.status,details:this.details}}}function _(e){return u(e)&&"AuthImplicitGrantRedirectError"===e.name}class k extends g{constructor(e,t=null){super(e,"AuthPKCEGrantCodeExchangeError",500,void 0),this.details=null,this.details=t}toJSON(){return{name:this.name,message:this.message,status:this.status,details:this.details}}}class S extends g{constructor(e,t){super(e,"AuthRetryableFetchError",t,void 0)}}function T(e){return u(e)&&"AuthRetryableFetchError"===e.name}class E extends g{constructor(e,t,s){super(e,"AuthWeakPasswordError",t,"weak_password"),this.reasons=s}}function j(e){return u(e)&&"AuthWeakPasswordError"===e.name}class O extends g{constructor(e){super(e,"AuthInvalidJwtError",400,"invalid_jwt")}}const P="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""),A=" \t\n\r=".split(""),$=(()=>{const e=new Array(128);for(let t=0;t<e.length;t+=1)e[t]=-1;for(let t=0;t<A.length;t+=1)e[A[t].charCodeAt(0)]=-2;for(let t=0;t<P.length;t+=1)e[P[t].charCodeAt(0)]=t;return e})();function C(e,t,s){if(null!==e)for(t.queue=t.queue<<8|e,t.queuedBits+=8;t.queuedBits>=6;){const e=t.queue>>t.queuedBits-6&63;s(P[e]),t.queuedBits-=6}else if(t.queuedBits>0)for(t.queue=t.queue<<6-t.queuedBits,t.queuedBits=6;t.queuedBits>=6;){const e=t.queue>>t.queuedBits-6&63;s(P[e]),t.queuedBits-=6}}function x(e,t,s){const r=$[e];if(!(r>-1)){if(-2===r)return;throw new Error(`Invalid Base64-URL character "${String.fromCharCode(e)}"`)}for(t.queue=t.queue<<6|r,t.queuedBits+=6;t.queuedBits>=8;)s(t.queue>>t.queuedBits-8&255),t.queuedBits-=8}function R(e){const t=[],s=e=>{t.push(String.fromCodePoint(e))},r={utf8seq:0,codepoint:0},i={queue:0,queuedBits:0},n=e=>{!function(e,t,s){if(0===t.utf8seq){if(e<=127)return void s(e);for(let s=1;s<6;s+=1)if(!(e>>7-s&1)){t.utf8seq=s;break}if(2===t.utf8seq)t.codepoint=31&e;else if(3===t.utf8seq)t.codepoint=15&e;else{if(4!==t.utf8seq)throw new Error("Invalid UTF-8 sequence");t.codepoint=7&e}t.utf8seq-=1}else if(t.utf8seq>0){if(e<=127)throw new Error("Invalid UTF-8 sequence");t.codepoint=t.codepoint<<6|63&e,t.utf8seq-=1,0===t.utf8seq&&s(t.codepoint)}}(e,r,s)};for(let t=0;t<e.length;t+=1)x(e.charCodeAt(t),i,n);return t.join("")}function I(e,t){if(!(e<=127)){if(e<=2047)return t(192|e>>6),void t(128|63&e);if(e<=65535)return t(224|e>>12),t(128|e>>6&63),void t(128|63&e);if(e<=1114111)return t(240|e>>18),t(128|e>>12&63),t(128|e>>6&63),void t(128|63&e);throw new Error(`Unrecognized Unicode codepoint: ${e.toString(16)}`)}t(e)}function U(e){const t=[],s={queue:0,queuedBits:0},r=e=>{t.push(e)};for(let t=0;t<e.length;t+=1)x(e.charCodeAt(t),s,r);return new Uint8Array(t)}function L(e){const t=[],s={queue:0,queuedBits:0},r=e=>{t.push(e)};return e.forEach(e=>C(e,s,r)),C(null,s,r),t.join("")}const N=()=>"undefined"!=typeof window&&"undefined"!=typeof document,D={tested:!1,writable:!1},F=()=>{if(!N())return!1;try{if("object"!=typeof globalThis.localStorage)return!1}catch(e){return!1}if(D.tested)return D.writable;const e=`lswt-${Math.random()}${Math.random()}`;try{globalThis.localStorage.setItem(e,e),globalThis.localStorage.removeItem(e),D.tested=!0,D.writable=!0}catch(e){D.tested=!0,D.writable=!1}return D.writable},M=e=>{let t;return t=e||("undefined"==typeof fetch?(...e)=>Promise.resolve().then(s.bind(s,517)).then(({default:t})=>t(...e)):fetch),(...e)=>t(...e)},B=async(e,t,s)=>{await e.setItem(t,JSON.stringify(s))},q=async(e,t)=>{const s=await e.getItem(t);if(!s)return null;try{return JSON.parse(s)}catch(e){return s}},W=async(e,t)=>{await e.removeItem(t)};class H{constructor(){this.promise=new H.promiseConstructor((e,t)=>{this.resolve=e,this.reject=t})}}function K(e){const t=e.split(".");if(3!==t.length)throw new O("Invalid JWT structure");for(let e=0;e<t.length;e++)if(!c.test(t[e]))throw new O("JWT not in base64url format");return{header:JSON.parse(R(t[0])),payload:JSON.parse(R(t[1])),signature:U(t[2]),raw:{header:t[0],payload:t[1]}}}function z(e){return("0"+e.toString(16)).substr(-2)}async function J(e,t,s=!1){const r=function(){const e=new Uint32Array(56);if("undefined"==typeof crypto){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~",t=e.length;let s="";for(let r=0;r<56;r++)s+=e.charAt(Math.floor(Math.random()*t));return s}return crypto.getRandomValues(e),Array.from(e,z).join("")}();let i=r;s&&(i+="/PASSWORD_RECOVERY"),await B(e,`${t}-code-verifier`,i);const n=await async function(e){if("undefined"==typeof crypto||void 0===crypto.subtle||"undefined"==typeof TextEncoder)return console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."),e;const t=await async function(e){const t=(new TextEncoder).encode(e),s=await crypto.subtle.digest("SHA-256",t),r=new Uint8Array(s);return Array.from(r).map(e=>String.fromCharCode(e)).join("")}(e);return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}(r);return[n,r===n?"plain":"s256"]}H.promiseConstructor=Promise;const G=/^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i,V=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;function Y(e){if(!V.test(e))throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not")}function Q(){return new Proxy({},{get:(e,t)=>{if("__isUserNotAvailableProxy"===t)return!0;if("symbol"==typeof t){const e=t.toString();if("Symbol(Symbol.toPrimitive)"===e||"Symbol(Symbol.toStringTag)"===e||"Symbol(util.inspect.custom)"===e)return}throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${t}" property of the session object is not supported. Please use getUser() instead.`)},set:(e,t)=>{throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`)},deleteProperty:(e,t)=>{throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${t}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`)}})}function X(e){return JSON.parse(JSON.stringify(e))}const Z=e=>e.msg||e.message||e.error_description||e.error||JSON.stringify(e),ee=[502,503,504];async function te(e){var t,s;if(!("object"==typeof(s=e)&&null!==s&&"status"in s&&"ok"in s&&"json"in s&&"function"==typeof s.json))throw new S(Z(e),0);if(ee.includes(e.status))throw new S(Z(e),e.status);let r,i;try{r=await e.json()}catch(e){throw new p(Z(e),e)}const n=function(e){const t=e.headers.get(o);if(!t)return null;if(!t.match(G))return null;try{return new Date(`${t}T00:00:00.0Z`)}catch(e){return null}}(e);if(n&&n.getTime()>=a&&"object"==typeof r&&r&&"string"==typeof r.code?i=r.code:"object"==typeof r&&r&&"string"==typeof r.error_code&&(i=r.error_code),i){if("weak_password"===i)throw new E(Z(r),e.status,(null===(t=r.weak_password)||void 0===t?void 0:t.reasons)||[]);if("session_not_found"===i)throw new v}else if("object"==typeof r&&r&&"object"==typeof r.weak_password&&r.weak_password&&Array.isArray(r.weak_password.reasons)&&r.weak_password.reasons.length&&r.weak_password.reasons.reduce((e,t)=>e&&"string"==typeof t,!0))throw new E(Z(r),e.status,r.weak_password.reasons);throw new d(Z(r),e.status||500,i)}async function se(e,t,s,r){var i;const n=Object.assign({},null==r?void 0:r.headers);n[o]||(n[o]=l),(null==r?void 0:r.jwt)&&(n.Authorization=`Bearer ${r.jwt}`);const a=null!==(i=null==r?void 0:r.query)&&void 0!==i?i:{};(null==r?void 0:r.redirectTo)&&(a.redirect_to=r.redirectTo);const c=Object.keys(a).length?"?"+new URLSearchParams(a).toString():"",h=await async function(e,t,s,r,i,n){const o=((e,t,s,r)=>{const i={method:e,headers:(null==t?void 0:t.headers)||{}};return"GET"===e?i:(i.headers=Object.assign({"Content-Type":"application/json;charset=UTF-8"},null==t?void 0:t.headers),i.body=JSON.stringify(r),Object.assign(Object.assign({},i),s))})(t,r,{},n);let a;try{a=await e(s,Object.assign({},o))}catch(e){throw console.error(e),new S(Z(e),0)}if(a.ok||await te(a),null==r?void 0:r.noResolveJson)return a;try{return await a.json()}catch(e){await te(e)}}(e,t,s+c,{headers:n,noResolveJson:null==r?void 0:r.noResolveJson},0,null==r?void 0:r.body);return(null==r?void 0:r.xform)?null==r?void 0:r.xform(h):{data:Object.assign({},h),error:null}}function re(e){var t;let s=null;var r;return function(e){return e.access_token&&e.refresh_token&&e.expires_in}(e)&&(s=Object.assign({},e),e.expires_at||(s.expires_at=(r=e.expires_in,Math.round(Date.now()/1e3)+r))),{data:{session:s,user:null!==(t=e.user)&&void 0!==t?t:e},error:null}}function ie(e){const t=re(e);return!t.error&&e.weak_password&&"object"==typeof e.weak_password&&Array.isArray(e.weak_password.reasons)&&e.weak_password.reasons.length&&e.weak_password.message&&"string"==typeof e.weak_password.message&&e.weak_password.reasons.reduce((e,t)=>e&&"string"==typeof t,!0)&&(t.data.weak_password=e.weak_password),t}function ne(e){var t;return{data:{user:null!==(t=e.user)&&void 0!==t?t:e},error:null}}function oe(e){return{data:e,error:null}}function ae(e){const{action_link:t,email_otp:s,hashed_token:r,redirect_to:i,verification_type:n}=e,o=function(e,t){var s={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(s[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(r=Object.getOwnPropertySymbols(e);i<r.length;i++)t.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(e,r[i])&&(s[r[i]]=e[r[i]])}return s}(e,["action_link","email_otp","hashed_token","redirect_to","verification_type"]);return{data:{properties:{action_link:t,email_otp:s,hashed_token:r,redirect_to:i,verification_type:n},user:Object.assign({},o)},error:null}}function le(e){return e}const ce=["global","local","others"];class he{constructor({url:e="",headers:t={},fetch:s}){this.url=e,this.headers=t,this.fetch=M(s),this.mfa={listFactors:this._listFactors.bind(this),deleteFactor:this._deleteFactor.bind(this)}}async signOut(e,t=ce[0]){if(ce.indexOf(t)<0)throw new Error(`@supabase/auth-js: Parameter scope must be one of ${ce.join(", ")}`);try{return await se(this.fetch,"POST",`${this.url}/logout?scope=${t}`,{headers:this.headers,jwt:e,noResolveJson:!0}),{data:null,error:null}}catch(e){if(u(e))return{data:null,error:e};throw e}}async inviteUserByEmail(e,t={}){try{return await se(this.fetch,"POST",`${this.url}/invite`,{body:{email:e,data:t.data},headers:this.headers,redirectTo:t.redirectTo,xform:ne})}catch(e){if(u(e))return{data:{user:null},error:e};throw e}}async generateLink(e){try{const{options:t}=e,s=function(e,t){var s={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(s[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var i=0;for(r=Object.getOwnPropertySymbols(e);i<r.length;i++)t.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(e,r[i])&&(s[r[i]]=e[r[i]])}return s}(e,["options"]),r=Object.assign(Object.assign({},s),t);return"newEmail"in s&&(r.new_email=null==s?void 0:s.newEmail,delete r.newEmail),await se(this.fetch,"POST",`${this.url}/admin/generate_link`,{body:r,headers:this.headers,xform:ae,redirectTo:null==t?void 0:t.redirectTo})}catch(e){if(u(e))return{data:{properties:null,user:null},error:e};throw e}}async createUser(e){try{return await se(this.fetch,"POST",`${this.url}/admin/users`,{body:e,headers:this.headers,xform:ne})}catch(e){if(u(e))return{data:{user:null},error:e};throw e}}async listUsers(e){var t,s,r,i,n,o,a;try{const l={nextPage:null,lastPage:0,total:0},c=await se(this.fetch,"GET",`${this.url}/admin/users`,{headers:this.headers,noResolveJson:!0,query:{page:null!==(s=null===(t=null==e?void 0:e.page)||void 0===t?void 0:t.toString())&&void 0!==s?s:"",per_page:null!==(i=null===(r=null==e?void 0:e.perPage)||void 0===r?void 0:r.toString())&&void 0!==i?i:""},xform:le});if(c.error)throw c.error;const h=await c.json(),u=null!==(n=c.headers.get("x-total-count"))&&void 0!==n?n:0,d=null!==(a=null===(o=c.headers.get("link"))||void 0===o?void 0:o.split(","))&&void 0!==a?a:[];return d.length>0&&(d.forEach(e=>{const t=parseInt(e.split(";")[0].split("=")[1].substring(0,1)),s=JSON.parse(e.split(";")[1].split("=")[1]);l[`${s}Page`]=t}),l.total=parseInt(u)),{data:Object.assign(Object.assign({},h),l),error:null}}catch(e){if(u(e))return{data:{users:[]},error:e};throw e}}async getUserById(e){Y(e);try{return await se(this.fetch,"GET",`${this.url}/admin/users/${e}`,{headers:this.headers,xform:ne})}catch(e){if(u(e))return{data:{user:null},error:e};throw e}}async updateUserById(e,t){Y(e);try{return await se(this.fetch,"PUT",`${this.url}/admin/users/${e}`,{body:t,headers:this.headers,xform:ne})}catch(e){if(u(e))return{data:{user:null},error:e};throw e}}async deleteUser(e,t=!1){Y(e);try{return await se(this.fetch,"DELETE",`${this.url}/admin/users/${e}`,{headers:this.headers,body:{should_soft_delete:t},xform:ne})}catch(e){if(u(e))return{data:{user:null},error:e};throw e}}async _listFactors(e){Y(e.userId);try{const{data:t,error:s}=await se(this.fetch,"GET",`${this.url}/admin/users/${e.userId}/factors`,{headers:this.headers,xform:e=>({data:{factors:e},error:null})});return{data:t,error:s}}catch(e){if(u(e))return{data:null,error:e};throw e}}async _deleteFactor(e){Y(e.userId),Y(e.id);try{return{data:await se(this.fetch,"DELETE",`${this.url}/admin/users/${e.userId}/factors/${e.id}`,{headers:this.headers}),error:null}}catch(e){if(u(e))return{data:null,error:e};throw e}}}function ue(e={}){return{getItem:t=>e[t]||null,setItem:(t,s)=>{e[t]=s},removeItem:t=>{delete e[t]}}}const de={debug:!!(globalThis&&F()&&globalThis.localStorage&&"true"===globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug"))};class fe extends Error{constructor(e){super(e),this.isAcquireTimeout=!0}}class pe extends fe{}class ge extends fe{}async function ve(e,t,s){de.debug&&console.log("@supabase/gotrue-js: navigatorLock: acquire lock",e,t);const r=new globalThis.AbortController;return t>0&&setTimeout(()=>{r.abort(),de.debug&&console.log("@supabase/gotrue-js: navigatorLock acquire timed out",e)},t),await Promise.resolve().then(()=>globalThis.navigator.locks.request(e,0===t?{mode:"exclusive",ifAvailable:!0}:{mode:"exclusive",signal:r.signal},async r=>{if(!r){if(0===t)throw de.debug&&console.log("@supabase/gotrue-js: navigatorLock: not immediately available",e),new pe(`Acquiring an exclusive Navigator LockManager lock "${e}" immediately failed`);if(de.debug)try{const e=await globalThis.navigator.locks.query();console.log("@supabase/gotrue-js: Navigator LockManager state",JSON.stringify(e,null,"  "))}catch(e){console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state",e)}return console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request"),await s()}de.debug&&console.log("@supabase/gotrue-js: navigatorLock: acquired",e,r.name);try{return await s()}finally{de.debug&&console.log("@supabase/gotrue-js: navigatorLock: released",e,r.name)}}))}const we={};async function ye(e,t,s){var r;const i=null!==(r=we[e])&&void 0!==r?r:Promise.resolve(),n=Promise.race([i.catch(()=>null),t>=0?new Promise((s,r)=>{setTimeout(()=>{r(new ge(`Acquring process lock with name "${e}" timed out`))},t)}):null].filter(e=>e)).catch(e=>{if(e&&e.isAcquireTimeout)throw e;return null}).then(async()=>await s());return we[e]=n.catch(async e=>{if(e&&e.isAcquireTimeout)return await i,null;throw e}),await n}!function(){if("object"!=typeof globalThis)try{Object.defineProperty(Object.prototype,"__magic__",{get:function(){return this},configurable:!0}),__magic__.globalThis=__magic__,delete Object.prototype.__magic__}catch(e){"undefined"!=typeof self&&(self.globalThis=self)}}();const me={url:"http://localhost:9999",storageKey:"supabase.auth.token",autoRefreshToken:!0,persistSession:!0,detectSessionInUrl:!0,headers:n,flowType:"implicit",debug:!1,hasCustomAuthorizationHeader:!1};async function be(e,t,s){return await s()}const _e={};class ke{constructor(e){var t,s;this.userStorage=null,this.memoryStorage=null,this.stateChangeEmitters=new Map,this.autoRefreshTicker=null,this.visibilityChangedCallback=null,this.refreshingDeferred=null,this.initializePromise=null,this.detectSessionInUrl=!0,this.hasCustomAuthorizationHeader=!1,this.suppressGetSessionWarning=!1,this.lockAcquired=!1,this.pendingInLock=[],this.broadcastChannel=null,this.logger=console.log,this.instanceID=ke.nextInstanceID,ke.nextInstanceID+=1,this.instanceID>0&&N()&&console.warn("Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.");const r=Object.assign(Object.assign({},me),e);if(this.logDebugMessages=!!r.debug,"function"==typeof r.debug&&(this.logger=r.debug),this.persistSession=r.persistSession,this.storageKey=r.storageKey,this.autoRefreshToken=r.autoRefreshToken,this.admin=new he({url:r.url,headers:r.headers,fetch:r.fetch}),this.url=r.url,this.headers=r.headers,this.fetch=M(r.fetch),this.lock=r.lock||be,this.detectSessionInUrl=r.detectSessionInUrl,this.flowType=r.flowType,this.hasCustomAuthorizationHeader=r.hasCustomAuthorizationHeader,r.lock?this.lock=r.lock:N()&&(null===(t=null===globalThis||void 0===globalThis?void 0:globalThis.navigator)||void 0===t?void 0:t.locks)?this.lock=ve:this.lock=be,this.jwks||(this.jwks={keys:[]},this.jwks_cached_at=Number.MIN_SAFE_INTEGER),this.mfa={verify:this._verify.bind(this),enroll:this._enroll.bind(this),unenroll:this._unenroll.bind(this),challenge:this._challenge.bind(this),listFactors:this._listFactors.bind(this),challengeAndVerify:this._challengeAndVerify.bind(this),getAuthenticatorAssuranceLevel:this._getAuthenticatorAssuranceLevel.bind(this)},this.persistSession?(r.storage?this.storage=r.storage:F()?this.storage=globalThis.localStorage:(this.memoryStorage={},this.storage=ue(this.memoryStorage)),r.userStorage&&(this.userStorage=r.userStorage)):(this.memoryStorage={},this.storage=ue(this.memoryStorage)),N()&&globalThis.BroadcastChannel&&this.persistSession&&this.storageKey){try{this.broadcastChannel=new globalThis.BroadcastChannel(this.storageKey)}catch(e){console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available",e)}null===(s=this.broadcastChannel)||void 0===s||s.addEventListener("message",async e=>{this._debug("received broadcast notification from other tab or client",e),await this._notifyAllSubscribers(e.data.event,e.data.session,!1)})}this.initialize()}get jwks(){var e,t;return null!==(t=null===(e=_e[this.storageKey])||void 0===e?void 0:e.jwks)&&void 0!==t?t:{keys:[]}}set jwks(e){_e[this.storageKey]=Object.assign(Object.assign({},_e[this.storageKey]),{jwks:e})}get jwks_cached_at(){var e,t;return null!==(t=null===(e=_e[this.storageKey])||void 0===e?void 0:e.cachedAt)&&void 0!==t?t:Number.MIN_SAFE_INTEGER}set jwks_cached_at(e){_e[this.storageKey]=Object.assign(Object.assign({},_e[this.storageKey]),{cachedAt:e})}_debug(...e){return this.logDebugMessages&&this.logger(`GoTrueClient@${this.instanceID} (${r}) ${(new Date).toISOString()}`,...e),this}async initialize(){return this.initializePromise||(this.initializePromise=(async()=>await this._acquireLock(-1,async()=>await this._initialize()))()),await this.initializePromise}async _initialize(){var e;try{const t=function(e){const t={},s=new URL(e);if(s.hash&&"#"===s.hash[0])try{new URLSearchParams(s.hash.substring(1)).forEach((e,s)=>{t[s]=e})}catch(e){}return s.searchParams.forEach((e,s)=>{t[s]=e}),t}(window.location.href);let s="none";if(this._isImplicitGrantCallback(t)?s="implicit":await this._isPKCECallback(t)&&(s="pkce"),N()&&this.detectSessionInUrl&&"none"!==s){const{data:r,error:i}=await this._getSessionFromURL(t,s);if(i){if(this._debug("#_initialize()","error detecting session from URL",i),_(i)){const t=null===(e=i.details)||void 0===e?void 0:e.code;if("identity_already_exists"===t||"identity_not_found"===t||"single_identity_not_deletable"===t)return{error:i}}return await this._removeSession(),{error:i}}const{session:n,redirectType:o}=r;return this._debug("#_initialize()","detected session in URL",n,"redirect type",o),await this._saveSession(n),setTimeout(async()=>{"recovery"===o?await this._notifyAllSubscribers("PASSWORD_RECOVERY",n):await this._notifyAllSubscribers("SIGNED_IN",n)},0),{error:null}}return await this._recoverAndRefresh(),{error:null}}catch(e){return u(e)?{error:e}:{error:new p("Unexpected error during initialization",e)}}finally{await this._handleVisibilityChange(),this._debug("#_initialize()","end")}}async signInAnonymously(e){var t,s,r;try{const i=await se(this.fetch,"POST",`${this.url}/signup`,{headers:this.headers,body:{data:null!==(s=null===(t=null==e?void 0:e.options)||void 0===t?void 0:t.data)&&void 0!==s?s:{},gotrue_meta_security:{captcha_token:null===(r=null==e?void 0:e.options)||void 0===r?void 0:r.captchaToken}},xform:re}),{data:n,error:o}=i;if(o||!n)return{data:{user:null,session:null},error:o};const a=n.session,l=n.user;return n.session&&(await this._saveSession(n.session),await this._notifyAllSubscribers("SIGNED_IN",a)),{data:{user:l,session:a},error:null}}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async signUp(e){var t,s,r;try{let i;if("email"in e){const{email:s,password:r,options:n}=e;let o=null,a=null;"pkce"===this.flowType&&([o,a]=await J(this.storage,this.storageKey)),i=await se(this.fetch,"POST",`${this.url}/signup`,{headers:this.headers,redirectTo:null==n?void 0:n.emailRedirectTo,body:{email:s,password:r,data:null!==(t=null==n?void 0:n.data)&&void 0!==t?t:{},gotrue_meta_security:{captcha_token:null==n?void 0:n.captchaToken},code_challenge:o,code_challenge_method:a},xform:re})}else{if(!("phone"in e))throw new m("You must provide either an email or phone number and a password");{const{phone:t,password:n,options:o}=e;i=await se(this.fetch,"POST",`${this.url}/signup`,{headers:this.headers,body:{phone:t,password:n,data:null!==(s=null==o?void 0:o.data)&&void 0!==s?s:{},channel:null!==(r=null==o?void 0:o.channel)&&void 0!==r?r:"sms",gotrue_meta_security:{captcha_token:null==o?void 0:o.captchaToken}},xform:re})}}const{data:n,error:o}=i;if(o||!n)return{data:{user:null,session:null},error:o};const a=n.session,l=n.user;return n.session&&(await this._saveSession(n.session),await this._notifyAllSubscribers("SIGNED_IN",a)),{data:{user:l,session:a},error:null}}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async signInWithPassword(e){try{let t;if("email"in e){const{email:s,password:r,options:i}=e;t=await se(this.fetch,"POST",`${this.url}/token?grant_type=password`,{headers:this.headers,body:{email:s,password:r,gotrue_meta_security:{captcha_token:null==i?void 0:i.captchaToken}},xform:ie})}else{if(!("phone"in e))throw new m("You must provide either an email or phone number and a password");{const{phone:s,password:r,options:i}=e;t=await se(this.fetch,"POST",`${this.url}/token?grant_type=password`,{headers:this.headers,body:{phone:s,password:r,gotrue_meta_security:{captcha_token:null==i?void 0:i.captchaToken}},xform:ie})}}const{data:s,error:r}=t;return r?{data:{user:null,session:null},error:r}:s&&s.session&&s.user?(s.session&&(await this._saveSession(s.session),await this._notifyAllSubscribers("SIGNED_IN",s.session)),{data:Object.assign({user:s.user,session:s.session},s.weak_password?{weakPassword:s.weak_password}:null),error:r}):{data:{user:null,session:null},error:new y}}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async signInWithOAuth(e){var t,s,r,i;return await this._handleProviderSignIn(e.provider,{redirectTo:null===(t=e.options)||void 0===t?void 0:t.redirectTo,scopes:null===(s=e.options)||void 0===s?void 0:s.scopes,queryParams:null===(r=e.options)||void 0===r?void 0:r.queryParams,skipBrowserRedirect:null===(i=e.options)||void 0===i?void 0:i.skipBrowserRedirect})}async exchangeCodeForSession(e){return await this.initializePromise,this._acquireLock(-1,async()=>this._exchangeCodeForSession(e))}async signInWithWeb3(e){const{chain:t}=e;if("solana"===t)return await this.signInWithSolana(e);throw new Error(`@supabase/auth-js: Unsupported chain "${t}"`)}async signInWithSolana(e){var t,s,r,i,n,o,a,l,c,h,d,f;let p,g;if("message"in e)p=e.message,g=e.signature;else{const{chain:u,wallet:d,statement:f,options:v}=e;let w;if(N())if("object"==typeof d)w=d;else{const e=window;if(!("solana"in e)||"object"!=typeof e.solana||!("signIn"in e.solana&&"function"==typeof e.solana.signIn||"signMessage"in e.solana&&"function"==typeof e.solana.signMessage))throw new Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.");w=e.solana}else{if("object"!=typeof d||!(null==v?void 0:v.url))throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");w=d}const y=new URL(null!==(t=null==v?void 0:v.url)&&void 0!==t?t:window.location.href);if("signIn"in w&&w.signIn){const e=await w.signIn(Object.assign(Object.assign(Object.assign({issuedAt:(new Date).toISOString()},null==v?void 0:v.signInWithSolana),{version:"1",domain:y.host,uri:y.href}),f?{statement:f}:null));let t;if(Array.isArray(e)&&e[0]&&"object"==typeof e[0])t=e[0];else{if(!(e&&"object"==typeof e&&"signedMessage"in e&&"signature"in e))throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");t=e}if(!("signedMessage"in t&&"signature"in t&&("string"==typeof t.signedMessage||t.signedMessage instanceof Uint8Array)&&t.signature instanceof Uint8Array))throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");p="string"==typeof t.signedMessage?t.signedMessage:(new TextDecoder).decode(t.signedMessage),g=t.signature}else{if(!("signMessage"in w&&"function"==typeof w.signMessage&&"publicKey"in w&&"object"==typeof w&&w.publicKey&&"toBase58"in w.publicKey&&"function"==typeof w.publicKey.toBase58))throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");p=[`${y.host} wants you to sign in with your Solana account:`,w.publicKey.toBase58(),...f?["",f,""]:[""],"Version: 1",`URI: ${y.href}`,`Issued At: ${null!==(r=null===(s=null==v?void 0:v.signInWithSolana)||void 0===s?void 0:s.issuedAt)&&void 0!==r?r:(new Date).toISOString()}`,...(null===(i=null==v?void 0:v.signInWithSolana)||void 0===i?void 0:i.notBefore)?[`Not Before: ${v.signInWithSolana.notBefore}`]:[],...(null===(n=null==v?void 0:v.signInWithSolana)||void 0===n?void 0:n.expirationTime)?[`Expiration Time: ${v.signInWithSolana.expirationTime}`]:[],...(null===(o=null==v?void 0:v.signInWithSolana)||void 0===o?void 0:o.chainId)?[`Chain ID: ${v.signInWithSolana.chainId}`]:[],...(null===(a=null==v?void 0:v.signInWithSolana)||void 0===a?void 0:a.nonce)?[`Nonce: ${v.signInWithSolana.nonce}`]:[],...(null===(l=null==v?void 0:v.signInWithSolana)||void 0===l?void 0:l.requestId)?[`Request ID: ${v.signInWithSolana.requestId}`]:[],...(null===(h=null===(c=null==v?void 0:v.signInWithSolana)||void 0===c?void 0:c.resources)||void 0===h?void 0:h.length)?["Resources",...v.signInWithSolana.resources.map(e=>`- ${e}`)]:[]].join("\n");const e=await w.signMessage((new TextEncoder).encode(p),"utf8");if(!(e&&e instanceof Uint8Array))throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");g=e}}try{const{data:t,error:s}=await se(this.fetch,"POST",`${this.url}/token?grant_type=web3`,{headers:this.headers,body:Object.assign({chain:"solana",message:p,signature:L(g)},(null===(d=e.options)||void 0===d?void 0:d.captchaToken)?{gotrue_meta_security:{captcha_token:null===(f=e.options)||void 0===f?void 0:f.captchaToken}}:null),xform:re});if(s)throw s;return t&&t.session&&t.user?(t.session&&(await this._saveSession(t.session),await this._notifyAllSubscribers("SIGNED_IN",t.session)),{data:Object.assign({},t),error:s}):{data:{user:null,session:null},error:new y}}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async _exchangeCodeForSession(e){const t=await q(this.storage,`${this.storageKey}-code-verifier`),[s,r]=(null!=t?t:"").split("/");try{const{data:t,error:i}=await se(this.fetch,"POST",`${this.url}/token?grant_type=pkce`,{headers:this.headers,body:{auth_code:e,code_verifier:s},xform:re});if(await W(this.storage,`${this.storageKey}-code-verifier`),i)throw i;return t&&t.session&&t.user?(t.session&&(await this._saveSession(t.session),await this._notifyAllSubscribers("SIGNED_IN",t.session)),{data:Object.assign(Object.assign({},t),{redirectType:null!=r?r:null}),error:i}):{data:{user:null,session:null,redirectType:null},error:new y}}catch(e){if(u(e))return{data:{user:null,session:null,redirectType:null},error:e};throw e}}async signInWithIdToken(e){try{const{options:t,provider:s,token:r,access_token:i,nonce:n}=e,o=await se(this.fetch,"POST",`${this.url}/token?grant_type=id_token`,{headers:this.headers,body:{provider:s,id_token:r,access_token:i,nonce:n,gotrue_meta_security:{captcha_token:null==t?void 0:t.captchaToken}},xform:re}),{data:a,error:l}=o;return l?{data:{user:null,session:null},error:l}:a&&a.session&&a.user?(a.session&&(await this._saveSession(a.session),await this._notifyAllSubscribers("SIGNED_IN",a.session)),{data:a,error:l}):{data:{user:null,session:null},error:new y}}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async signInWithOtp(e){var t,s,r,i,n;try{if("email"in e){const{email:r,options:i}=e;let n=null,o=null;"pkce"===this.flowType&&([n,o]=await J(this.storage,this.storageKey));const{error:a}=await se(this.fetch,"POST",`${this.url}/otp`,{headers:this.headers,body:{email:r,data:null!==(t=null==i?void 0:i.data)&&void 0!==t?t:{},create_user:null===(s=null==i?void 0:i.shouldCreateUser)||void 0===s||s,gotrue_meta_security:{captcha_token:null==i?void 0:i.captchaToken},code_challenge:n,code_challenge_method:o},redirectTo:null==i?void 0:i.emailRedirectTo});return{data:{user:null,session:null},error:a}}if("phone"in e){const{phone:t,options:s}=e,{data:o,error:a}=await se(this.fetch,"POST",`${this.url}/otp`,{headers:this.headers,body:{phone:t,data:null!==(r=null==s?void 0:s.data)&&void 0!==r?r:{},create_user:null===(i=null==s?void 0:s.shouldCreateUser)||void 0===i||i,gotrue_meta_security:{captcha_token:null==s?void 0:s.captchaToken},channel:null!==(n=null==s?void 0:s.channel)&&void 0!==n?n:"sms"}});return{data:{user:null,session:null,messageId:null==o?void 0:o.message_id},error:a}}throw new m("You must provide either an email or phone number.")}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async verifyOtp(e){var t,s;try{let r,i;"options"in e&&(r=null===(t=e.options)||void 0===t?void 0:t.redirectTo,i=null===(s=e.options)||void 0===s?void 0:s.captchaToken);const{data:n,error:o}=await se(this.fetch,"POST",`${this.url}/verify`,{headers:this.headers,body:Object.assign(Object.assign({},e),{gotrue_meta_security:{captcha_token:i}}),redirectTo:r,xform:re});if(o)throw o;if(!n)throw new Error("An error occurred on token verification.");const a=n.session,l=n.user;return(null==a?void 0:a.access_token)&&(await this._saveSession(a),await this._notifyAllSubscribers("recovery"==e.type?"PASSWORD_RECOVERY":"SIGNED_IN",a)),{data:{user:l,session:a},error:null}}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async signInWithSSO(e){var t,s,r;try{let i=null,n=null;return"pkce"===this.flowType&&([i,n]=await J(this.storage,this.storageKey)),await se(this.fetch,"POST",`${this.url}/sso`,{body:Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},"providerId"in e?{provider_id:e.providerId}:null),"domain"in e?{domain:e.domain}:null),{redirect_to:null!==(s=null===(t=e.options)||void 0===t?void 0:t.redirectTo)&&void 0!==s?s:void 0}),(null===(r=null==e?void 0:e.options)||void 0===r?void 0:r.captchaToken)?{gotrue_meta_security:{captcha_token:e.options.captchaToken}}:null),{skip_http_redirect:!0,code_challenge:i,code_challenge_method:n}),headers:this.headers,xform:oe})}catch(e){if(u(e))return{data:null,error:e};throw e}}async reauthenticate(){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._reauthenticate())}async _reauthenticate(){try{return await this._useSession(async e=>{const{data:{session:t},error:s}=e;if(s)throw s;if(!t)throw new v;const{error:r}=await se(this.fetch,"GET",`${this.url}/reauthenticate`,{headers:this.headers,jwt:t.access_token});return{data:{user:null,session:null},error:r}})}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async resend(e){try{const t=`${this.url}/resend`;if("email"in e){const{email:s,type:r,options:i}=e,{error:n}=await se(this.fetch,"POST",t,{headers:this.headers,body:{email:s,type:r,gotrue_meta_security:{captcha_token:null==i?void 0:i.captchaToken}},redirectTo:null==i?void 0:i.emailRedirectTo});return{data:{user:null,session:null},error:n}}if("phone"in e){const{phone:s,type:r,options:i}=e,{data:n,error:o}=await se(this.fetch,"POST",t,{headers:this.headers,body:{phone:s,type:r,gotrue_meta_security:{captcha_token:null==i?void 0:i.captchaToken}}});return{data:{user:null,session:null,messageId:null==n?void 0:n.message_id},error:o}}throw new m("You must provide either an email or phone number and a type")}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async getSession(){return await this.initializePromise,await this._acquireLock(-1,async()=>this._useSession(async e=>e))}async _acquireLock(e,t){this._debug("#_acquireLock","begin",e);try{if(this.lockAcquired){const e=this.pendingInLock.length?this.pendingInLock[this.pendingInLock.length-1]:Promise.resolve(),s=(async()=>(await e,await t()))();return this.pendingInLock.push((async()=>{try{await s}catch(e){}})()),s}return await this.lock(`lock:${this.storageKey}`,e,async()=>{this._debug("#_acquireLock","lock acquired for storage key",this.storageKey);try{this.lockAcquired=!0;const e=t();for(this.pendingInLock.push((async()=>{try{await e}catch(e){}})()),await e;this.pendingInLock.length;){const e=[...this.pendingInLock];await Promise.all(e),this.pendingInLock.splice(0,e.length)}return await e}finally{this._debug("#_acquireLock","lock released for storage key",this.storageKey),this.lockAcquired=!1}})}finally{this._debug("#_acquireLock","end")}}async _useSession(e){this._debug("#_useSession","begin");try{const t=await this.__loadSession();return await e(t)}finally{this._debug("#_useSession","end")}}async __loadSession(){this._debug("#__loadSession()","begin"),this.lockAcquired||this._debug("#__loadSession()","used outside of an acquired lock!",(new Error).stack);try{let e=null;const t=await q(this.storage,this.storageKey);if(this._debug("#getSession()","session from storage",t),null!==t&&(this._isValidSession(t)?e=t:(this._debug("#getSession()","session from storage is not valid"),await this._removeSession())),!e)return{data:{session:null},error:null};const s=!!e.expires_at&&1e3*e.expires_at-Date.now()<9e4;if(this._debug("#__loadSession()",`session has${s?"":" not"} expired`,"expires_at",e.expires_at),!s){if(this.userStorage){const t=await q(this.userStorage,this.storageKey+"-user");(null==t?void 0:t.user)?e.user=t.user:e.user=Q()}if(this.storage.isServer&&e.user){let t=this.suppressGetSessionWarning;e=new Proxy(e,{get:(e,s,r)=>(t||"user"!==s||(console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."),t=!0,this.suppressGetSessionWarning=!0),Reflect.get(e,s,r))})}return{data:{session:e},error:null}}const{session:r,error:i}=await this._callRefreshToken(e.refresh_token);return i?{data:{session:null},error:i}:{data:{session:r},error:null}}finally{this._debug("#__loadSession()","end")}}async getUser(e){return e?await this._getUser(e):(await this.initializePromise,await this._acquireLock(-1,async()=>await this._getUser()))}async _getUser(e){try{return e?await se(this.fetch,"GET",`${this.url}/user`,{headers:this.headers,jwt:e,xform:ne}):await this._useSession(async e=>{var t,s,r;const{data:i,error:n}=e;if(n)throw n;return(null===(t=i.session)||void 0===t?void 0:t.access_token)||this.hasCustomAuthorizationHeader?await se(this.fetch,"GET",`${this.url}/user`,{headers:this.headers,jwt:null!==(r=null===(s=i.session)||void 0===s?void 0:s.access_token)&&void 0!==r?r:void 0,xform:ne}):{data:{user:null},error:new v}})}catch(e){if(u(e))return w(e)&&(await this._removeSession(),await W(this.storage,`${this.storageKey}-code-verifier`)),{data:{user:null},error:e};throw e}}async updateUser(e,t={}){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._updateUser(e,t))}async _updateUser(e,t={}){try{return await this._useSession(async s=>{const{data:r,error:i}=s;if(i)throw i;if(!r.session)throw new v;const n=r.session;let o=null,a=null;"pkce"===this.flowType&&null!=e.email&&([o,a]=await J(this.storage,this.storageKey));const{data:l,error:c}=await se(this.fetch,"PUT",`${this.url}/user`,{headers:this.headers,redirectTo:null==t?void 0:t.emailRedirectTo,body:Object.assign(Object.assign({},e),{code_challenge:o,code_challenge_method:a}),jwt:n.access_token,xform:ne});if(c)throw c;return n.user=l.user,await this._saveSession(n),await this._notifyAllSubscribers("USER_UPDATED",n),{data:{user:n.user},error:null}})}catch(e){if(u(e))return{data:{user:null},error:e};throw e}}async setSession(e){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._setSession(e))}async _setSession(e){try{if(!e.access_token||!e.refresh_token)throw new v;const t=Date.now()/1e3;let s=t,r=!0,i=null;const{payload:n}=K(e.access_token);if(n.exp&&(s=n.exp,r=s<=t),r){const{session:t,error:s}=await this._callRefreshToken(e.refresh_token);if(s)return{data:{user:null,session:null},error:s};if(!t)return{data:{user:null,session:null},error:null};i=t}else{const{data:r,error:n}=await this._getUser(e.access_token);if(n)throw n;i={access_token:e.access_token,refresh_token:e.refresh_token,user:r.user,token_type:"bearer",expires_in:s-t,expires_at:s},await this._saveSession(i),await this._notifyAllSubscribers("SIGNED_IN",i)}return{data:{user:i.user,session:i},error:null}}catch(e){if(u(e))return{data:{session:null,user:null},error:e};throw e}}async refreshSession(e){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._refreshSession(e))}async _refreshSession(e){try{return await this._useSession(async t=>{var s;if(!e){const{data:r,error:i}=t;if(i)throw i;e=null!==(s=r.session)&&void 0!==s?s:void 0}if(!(null==e?void 0:e.refresh_token))throw new v;const{session:r,error:i}=await this._callRefreshToken(e.refresh_token);return i?{data:{user:null,session:null},error:i}:r?{data:{user:r.user,session:r},error:null}:{data:{user:null,session:null},error:null}})}catch(e){if(u(e))return{data:{user:null,session:null},error:e};throw e}}async _getSessionFromURL(e,t){try{if(!N())throw new b("No browser detected.");if(e.error||e.error_description||e.error_code)throw new b(e.error_description||"Error in URL with unspecified error_description",{error:e.error||"unspecified_error",code:e.error_code||"unspecified_code"});switch(t){case"implicit":if("pkce"===this.flowType)throw new k("Not a valid PKCE flow url.");break;case"pkce":if("implicit"===this.flowType)throw new b("Not a valid implicit grant flow url.")}if("pkce"===t){if(this._debug("#_initialize()","begin","is PKCE flow",!0),!e.code)throw new k("No code detected.");const{data:t,error:s}=await this._exchangeCodeForSession(e.code);if(s)throw s;const r=new URL(window.location.href);return r.searchParams.delete("code"),window.history.replaceState(window.history.state,"",r.toString()),{data:{session:t.session,redirectType:null},error:null}}const{provider_token:s,provider_refresh_token:r,access_token:n,refresh_token:o,expires_in:a,expires_at:l,token_type:c}=e;if(!(n&&a&&o&&c))throw new b("No session defined in URL");const h=Math.round(Date.now()/1e3),u=parseInt(a);let d=h+u;l&&(d=parseInt(l));const f=d-h;1e3*f<=i&&console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${f}s, should have been closer to ${u}s`);const p=d-u;h-p>=120?console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale",p,d,h):h-p<0&&console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew",p,d,h);const{data:g,error:v}=await this._getUser(n);if(v)throw v;const w={provider_token:s,provider_refresh_token:r,access_token:n,expires_in:u,expires_at:d,refresh_token:o,token_type:c,user:g.user};return window.location.hash="",this._debug("#_getSessionFromURL()","clearing window.location.hash"),{data:{session:w,redirectType:e.type},error:null}}catch(e){if(u(e))return{data:{session:null,redirectType:null},error:e};throw e}}_isImplicitGrantCallback(e){return Boolean(e.access_token||e.error_description)}async _isPKCECallback(e){const t=await q(this.storage,`${this.storageKey}-code-verifier`);return!(!e.code||!t)}async signOut(e={scope:"global"}){return await this.initializePromise,await this._acquireLock(-1,async()=>await this._signOut(e))}async _signOut({scope:e}={scope:"global"}){return await this._useSession(async t=>{var s;const{data:r,error:i}=t;if(i)return{error:i};const n=null===(s=r.session)||void 0===s?void 0:s.access_token;if(n){const{error:t}=await this.admin.signOut(n,e);if(t&&(!f(t)||404!==t.status&&401!==t.status&&403!==t.status))return{error:t}}return"others"!==e&&(await this._removeSession(),await W(this.storage,`${this.storageKey}-code-verifier`)),{error:null}})}onAuthStateChange(e){const t="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){const t=16*Math.random()|0;return("x"==e?t:3&t|8).toString(16)}),s={id:t,callback:e,unsubscribe:()=>{this._debug("#unsubscribe()","state change callback with id removed",t),this.stateChangeEmitters.delete(t)}};return this._debug("#onAuthStateChange()","registered callback with id",t),this.stateChangeEmitters.set(t,s),(async()=>{await this.initializePromise,await this._acquireLock(-1,async()=>{this._emitInitialSession(t)})})(),{data:{subscription:s}}}async _emitInitialSession(e){return await this._useSession(async t=>{var s,r;try{const{data:{session:r},error:i}=t;if(i)throw i;await(null===(s=this.stateChangeEmitters.get(e))||void 0===s?void 0:s.callback("INITIAL_SESSION",r)),this._debug("INITIAL_SESSION","callback id",e,"session",r)}catch(t){await(null===(r=this.stateChangeEmitters.get(e))||void 0===r?void 0:r.callback("INITIAL_SESSION",null)),this._debug("INITIAL_SESSION","callback id",e,"error",t),console.error(t)}})}async resetPasswordForEmail(e,t={}){let s=null,r=null;"pkce"===this.flowType&&([s,r]=await J(this.storage,this.storageKey,!0));try{return await se(this.fetch,"POST",`${this.url}/recover`,{body:{email:e,code_challenge:s,code_challenge_method:r,gotrue_meta_security:{captcha_token:t.captchaToken}},headers:this.headers,redirectTo:t.redirectTo})}catch(e){if(u(e))return{data:null,error:e};throw e}}async getUserIdentities(){var e;try{const{data:t,error:s}=await this.getUser();if(s)throw s;return{data:{identities:null!==(e=t.user.identities)&&void 0!==e?e:[]},error:null}}catch(e){if(u(e))return{data:null,error:e};throw e}}async linkIdentity(e){var t;try{const{data:s,error:r}=await this._useSession(async t=>{var s,r,i,n,o;const{data:a,error:l}=t;if(l)throw l;const c=await this._getUrlForProvider(`${this.url}/user/identities/authorize`,e.provider,{redirectTo:null===(s=e.options)||void 0===s?void 0:s.redirectTo,scopes:null===(r=e.options)||void 0===r?void 0:r.scopes,queryParams:null===(i=e.options)||void 0===i?void 0:i.queryParams,skipBrowserRedirect:!0});return await se(this.fetch,"GET",c,{headers:this.headers,jwt:null!==(o=null===(n=a.session)||void 0===n?void 0:n.access_token)&&void 0!==o?o:void 0})});if(r)throw r;return N()&&!(null===(t=e.options)||void 0===t?void 0:t.skipBrowserRedirect)&&window.location.assign(null==s?void 0:s.url),{data:{provider:e.provider,url:null==s?void 0:s.url},error:null}}catch(t){if(u(t))return{data:{provider:e.provider,url:null},error:t};throw t}}async unlinkIdentity(e){try{return await this._useSession(async t=>{var s,r;const{data:i,error:n}=t;if(n)throw n;return await se(this.fetch,"DELETE",`${this.url}/user/identities/${e.identity_id}`,{headers:this.headers,jwt:null!==(r=null===(s=i.session)||void 0===s?void 0:s.access_token)&&void 0!==r?r:void 0})})}catch(e){if(u(e))return{data:null,error:e};throw e}}async _refreshAccessToken(e){const t=`#_refreshAccessToken(${e.substring(0,5)}...)`;this._debug(t,"begin");try{const n=Date.now();return await(s=async s=>(s>0&&await async function(e){return await new Promise(t=>{setTimeout(()=>t(null),e)})}(200*Math.pow(2,s-1)),this._debug(t,"refreshing attempt",s),await se(this.fetch,"POST",`${this.url}/token?grant_type=refresh_token`,{body:{refresh_token:e},headers:this.headers,xform:re})),r=(e,t)=>{const s=200*Math.pow(2,e);return t&&T(t)&&Date.now()+s-n<i},new Promise((e,t)=>{(async()=>{for(let i=0;i<1/0;i++)try{const t=await s(i);if(!r(i,null))return void e(t)}catch(e){if(!r(i,e))return void t(e)}})()}))}catch(e){if(this._debug(t,"error",e),u(e))return{data:{session:null,user:null},error:e};throw e}finally{this._debug(t,"end")}var s,r}_isValidSession(e){return"object"==typeof e&&null!==e&&"access_token"in e&&"refresh_token"in e&&"expires_at"in e}async _handleProviderSignIn(e,t){const s=await this._getUrlForProvider(`${this.url}/authorize`,e,{redirectTo:t.redirectTo,scopes:t.scopes,queryParams:t.queryParams});return this._debug("#_handleProviderSignIn()","provider",e,"options",t,"url",s),N()&&!t.skipBrowserRedirect&&window.location.assign(s),{data:{provider:e,url:s},error:null}}async _recoverAndRefresh(){var e,t;const s="#_recoverAndRefresh()";this._debug(s,"begin");try{const r=await q(this.storage,this.storageKey);if(r&&this.userStorage){let t=await q(this.userStorage,this.storageKey+"-user");this.storage.isServer||!Object.is(this.storage,this.userStorage)||t||(t={user:r.user},await B(this.userStorage,this.storageKey+"-user",t)),r.user=null!==(e=null==t?void 0:t.user)&&void 0!==e?e:Q()}else if(r&&!r.user&&!r.user){const e=await q(this.storage,this.storageKey+"-user");e&&(null==e?void 0:e.user)?(r.user=e.user,await W(this.storage,this.storageKey+"-user"),await B(this.storage,this.storageKey,r)):r.user=Q()}if(this._debug(s,"session from storage",r),!this._isValidSession(r))return this._debug(s,"session is not valid"),void(null!==r&&await this._removeSession());const i=1e3*(null!==(t=r.expires_at)&&void 0!==t?t:1/0)-Date.now()<9e4;if(this._debug(s,`session has${i?"":" not"} expired with margin of 90000s`),i){if(this.autoRefreshToken&&r.refresh_token){const{error:e}=await this._callRefreshToken(r.refresh_token);e&&(console.error(e),T(e)||(this._debug(s,"refresh failed with a non-retryable error, removing the session",e),await this._removeSession()))}}else if(r.user&&!0===r.user.__isUserNotAvailableProxy)try{const{data:e,error:t}=await this._getUser(r.access_token);!t&&(null==e?void 0:e.user)?(r.user=e.user,await this._saveSession(r),await this._notifyAllSubscribers("SIGNED_IN",r)):this._debug(s,"could not get user data, skipping SIGNED_IN notification")}catch(e){console.error("Error getting user data:",e),this._debug(s,"error getting user data, skipping SIGNED_IN notification",e)}else await this._notifyAllSubscribers("SIGNED_IN",r)}catch(e){return this._debug(s,"error",e),void console.error(e)}finally{this._debug(s,"end")}}async _callRefreshToken(e){var t,s;if(!e)throw new v;if(this.refreshingDeferred)return this.refreshingDeferred.promise;const r=`#_callRefreshToken(${e.substring(0,5)}...)`;this._debug(r,"begin");try{this.refreshingDeferred=new H;const{data:t,error:s}=await this._refreshAccessToken(e);if(s)throw s;if(!t.session)throw new v;await this._saveSession(t.session),await this._notifyAllSubscribers("TOKEN_REFRESHED",t.session);const r={session:t.session,error:null};return this.refreshingDeferred.resolve(r),r}catch(e){if(this._debug(r,"error",e),u(e)){const s={session:null,error:e};return T(e)||await this._removeSession(),null===(t=this.refreshingDeferred)||void 0===t||t.resolve(s),s}throw null===(s=this.refreshingDeferred)||void 0===s||s.reject(e),e}finally{this.refreshingDeferred=null,this._debug(r,"end")}}async _notifyAllSubscribers(e,t,s=!0){const r=`#_notifyAllSubscribers(${e})`;this._debug(r,"begin",t,`broadcast = ${s}`);try{this.broadcastChannel&&s&&this.broadcastChannel.postMessage({event:e,session:t});const r=[],i=Array.from(this.stateChangeEmitters.values()).map(async s=>{try{await s.callback(e,t)}catch(e){r.push(e)}});if(await Promise.all(i),r.length>0){for(let e=0;e<r.length;e+=1)console.error(r[e]);throw r[0]}}finally{this._debug(r,"end")}}async _saveSession(e){this._debug("#_saveSession()",e),this.suppressGetSessionWarning=!0;const t=Object.assign({},e),s=t.user&&!0===t.user.__isUserNotAvailableProxy;if(this.userStorage){!s&&t.user&&await B(this.userStorage,this.storageKey+"-user",{user:t.user});const e=Object.assign({},t);delete e.user;const r=X(e);await B(this.storage,this.storageKey,r)}else{const e=X(t);await B(this.storage,this.storageKey,e)}}async _removeSession(){this._debug("#_removeSession()"),await W(this.storage,this.storageKey),await W(this.storage,this.storageKey+"-code-verifier"),await W(this.storage,this.storageKey+"-user"),this.userStorage&&await W(this.userStorage,this.storageKey+"-user"),await this._notifyAllSubscribers("SIGNED_OUT",null)}_removeVisibilityChangedCallback(){this._debug("#_removeVisibilityChangedCallback()");const e=this.visibilityChangedCallback;this.visibilityChangedCallback=null;try{e&&N()&&(null===window||void 0===window?void 0:window.removeEventListener)&&window.removeEventListener("visibilitychange",e)}catch(e){console.error("removing visibilitychange callback failed",e)}}async _startAutoRefresh(){await this._stopAutoRefresh(),this._debug("#_startAutoRefresh()");const e=setInterval(()=>this._autoRefreshTokenTick(),i);this.autoRefreshTicker=e,e&&"object"==typeof e&&"function"==typeof e.unref?e.unref():"undefined"!=typeof Deno&&"function"==typeof Deno.unrefTimer&&Deno.unrefTimer(e),setTimeout(async()=>{await this.initializePromise,await this._autoRefreshTokenTick()},0)}async _stopAutoRefresh(){this._debug("#_stopAutoRefresh()");const e=this.autoRefreshTicker;this.autoRefreshTicker=null,e&&clearInterval(e)}async startAutoRefresh(){this._removeVisibilityChangedCallback(),await this._startAutoRefresh()}async stopAutoRefresh(){this._removeVisibilityChangedCallback(),await this._stopAutoRefresh()}async _autoRefreshTokenTick(){this._debug("#_autoRefreshTokenTick()","begin");try{await this._acquireLock(0,async()=>{try{const e=Date.now();try{return await this._useSession(async t=>{const{data:{session:s}}=t;if(!s||!s.refresh_token||!s.expires_at)return void this._debug("#_autoRefreshTokenTick()","no session");const r=Math.floor((1e3*s.expires_at-e)/i);this._debug("#_autoRefreshTokenTick()",`access token expires in ${r} ticks, a tick lasts 30000ms, refresh threshold is 3 ticks`),r<=3&&await this._callRefreshToken(s.refresh_token)})}catch(e){console.error("Auto refresh tick failed with error. This is likely a transient error.",e)}}finally{this._debug("#_autoRefreshTokenTick()","end")}})}catch(e){if(!(e.isAcquireTimeout||e instanceof fe))throw e;this._debug("auto refresh token tick lock not available")}}async _handleVisibilityChange(){if(this._debug("#_handleVisibilityChange()"),!N()||!(null===window||void 0===window?void 0:window.addEventListener))return this.autoRefreshToken&&this.startAutoRefresh(),!1;try{this.visibilityChangedCallback=async()=>await this._onVisibilityChanged(!1),null===window||void 0===window||window.addEventListener("visibilitychange",this.visibilityChangedCallback),await this._onVisibilityChanged(!0)}catch(e){console.error("_handleVisibilityChange",e)}}async _onVisibilityChanged(e){const t=`#_onVisibilityChanged(${e})`;this._debug(t,"visibilityState",document.visibilityState),"visible"===document.visibilityState?(this.autoRefreshToken&&this._startAutoRefresh(),e||(await this.initializePromise,await this._acquireLock(-1,async()=>{"visible"===document.visibilityState?await this._recoverAndRefresh():this._debug(t,"acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting")}))):"hidden"===document.visibilityState&&this.autoRefreshToken&&this._stopAutoRefresh()}async _getUrlForProvider(e,t,s){const r=[`provider=${encodeURIComponent(t)}`];if((null==s?void 0:s.redirectTo)&&r.push(`redirect_to=${encodeURIComponent(s.redirectTo)}`),(null==s?void 0:s.scopes)&&r.push(`scopes=${encodeURIComponent(s.scopes)}`),"pkce"===this.flowType){const[e,t]=await J(this.storage,this.storageKey),s=new URLSearchParams({code_challenge:`${encodeURIComponent(e)}`,code_challenge_method:`${encodeURIComponent(t)}`});r.push(s.toString())}if(null==s?void 0:s.queryParams){const e=new URLSearchParams(s.queryParams);r.push(e.toString())}return(null==s?void 0:s.skipBrowserRedirect)&&r.push(`skip_http_redirect=${s.skipBrowserRedirect}`),`${e}?${r.join("&")}`}async _unenroll(e){try{return await this._useSession(async t=>{var s;const{data:r,error:i}=t;return i?{data:null,error:i}:await se(this.fetch,"DELETE",`${this.url}/factors/${e.factorId}`,{headers:this.headers,jwt:null===(s=null==r?void 0:r.session)||void 0===s?void 0:s.access_token})})}catch(e){if(u(e))return{data:null,error:e};throw e}}async _enroll(e){try{return await this._useSession(async t=>{var s,r;const{data:i,error:n}=t;if(n)return{data:null,error:n};const o=Object.assign({friendly_name:e.friendlyName,factor_type:e.factorType},"phone"===e.factorType?{phone:e.phone}:{issuer:e.issuer}),{data:a,error:l}=await se(this.fetch,"POST",`${this.url}/factors`,{body:o,headers:this.headers,jwt:null===(s=null==i?void 0:i.session)||void 0===s?void 0:s.access_token});return l?{data:null,error:l}:("totp"===e.factorType&&(null===(r=null==a?void 0:a.totp)||void 0===r?void 0:r.qr_code)&&(a.totp.qr_code=`data:image/svg+xml;utf-8,${a.totp.qr_code}`),{data:a,error:null})})}catch(e){if(u(e))return{data:null,error:e};throw e}}async _verify(e){return this._acquireLock(-1,async()=>{try{return await this._useSession(async t=>{var s;const{data:r,error:i}=t;if(i)return{data:null,error:i};const{data:n,error:o}=await se(this.fetch,"POST",`${this.url}/factors/${e.factorId}/verify`,{body:{code:e.code,challenge_id:e.challengeId},headers:this.headers,jwt:null===(s=null==r?void 0:r.session)||void 0===s?void 0:s.access_token});return o?{data:null,error:o}:(await this._saveSession(Object.assign({expires_at:Math.round(Date.now()/1e3)+n.expires_in},n)),await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED",n),{data:n,error:o})})}catch(e){if(u(e))return{data:null,error:e};throw e}})}async _challenge(e){return this._acquireLock(-1,async()=>{try{return await this._useSession(async t=>{var s;const{data:r,error:i}=t;return i?{data:null,error:i}:await se(this.fetch,"POST",`${this.url}/factors/${e.factorId}/challenge`,{body:{channel:e.channel},headers:this.headers,jwt:null===(s=null==r?void 0:r.session)||void 0===s?void 0:s.access_token})})}catch(e){if(u(e))return{data:null,error:e};throw e}})}async _challengeAndVerify(e){const{data:t,error:s}=await this._challenge({factorId:e.factorId});return s?{data:null,error:s}:await this._verify({factorId:e.factorId,challengeId:t.id,code:e.code})}async _listFactors(){const{data:{user:e},error:t}=await this.getUser();if(t)return{data:null,error:t};const s=(null==e?void 0:e.factors)||[],r=s.filter(e=>"totp"===e.factor_type&&"verified"===e.status),i=s.filter(e=>"phone"===e.factor_type&&"verified"===e.status);return{data:{all:s,totp:r,phone:i},error:null}}async _getAuthenticatorAssuranceLevel(){return this._acquireLock(-1,async()=>await this._useSession(async e=>{var t,s;const{data:{session:r},error:i}=e;if(i)return{data:null,error:i};if(!r)return{data:{currentLevel:null,nextLevel:null,currentAuthenticationMethods:[]},error:null};const{payload:n}=K(r.access_token);let o=null;n.aal&&(o=n.aal);let a=o;return(null!==(s=null===(t=r.user.factors)||void 0===t?void 0:t.filter(e=>"verified"===e.status))&&void 0!==s?s:[]).length>0&&(a="aal2"),{data:{currentLevel:o,nextLevel:a,currentAuthenticationMethods:n.amr||[]},error:null}}))}async fetchJwk(e,t={keys:[]}){let s=t.keys.find(t=>t.kid===e);if(s)return s;const r=Date.now();if(s=this.jwks.keys.find(t=>t.kid===e),s&&this.jwks_cached_at+6e5>r)return s;const{data:i,error:n}=await se(this.fetch,"GET",`${this.url}/.well-known/jwks.json`,{headers:this.headers});if(n)throw n;return i.keys&&0!==i.keys.length?(this.jwks=i,this.jwks_cached_at=r,s=i.keys.find(t=>t.kid===e),s||null):null}async getClaims(e,t={}){try{let s=e;if(!s){const{data:e,error:t}=await this.getSession();if(t||!e.session)return{data:null,error:t};s=e.session.access_token}const{header:r,payload:i,signature:n,raw:{header:o,payload:a}}=K(s);(null==t?void 0:t.allowExpired)||function(e){if(!e)throw new Error("Missing exp claim");if(e<=Math.floor(Date.now()/1e3))throw new Error("JWT has expired")}(i.exp);const l=r.alg&&!r.alg.startsWith("HS")&&r.kid&&"crypto"in globalThis&&"subtle"in globalThis.crypto?await this.fetchJwk(r.kid,(null==t?void 0:t.keys)?{keys:t.keys}:null==t?void 0:t.jwks):null;if(!l){const{error:e}=await this.getUser(s);if(e)throw e;return{data:{claims:i,header:r,signature:n},error:null}}const c=function(e){switch(e){case"RS256":return{name:"RSASSA-PKCS1-v1_5",hash:{name:"SHA-256"}};case"ES256":return{name:"ECDSA",namedCurve:"P-256",hash:{name:"SHA-256"}};default:throw new Error("Invalid alg claim")}}(r.alg),h=await crypto.subtle.importKey("jwk",l,c,!0,["verify"]);if(!await crypto.subtle.verify(c,h,n,function(e){const t=[];return function(e,t){for(let s=0;s<e.length;s+=1){let r=e.charCodeAt(s);if(r>55295&&r<=56319){const t=1024*(r-55296)&65535;r=65536+(e.charCodeAt(s+1)-56320&65535|t),s+=1}I(r,t)}}(e,e=>t.push(e)),new Uint8Array(t)}(`${o}.${a}`)))throw new O("Invalid JWT signature");return{data:{claims:i,header:r,signature:n},error:null}}catch(e){if(u(e))return{data:null,error:e};throw e}}}ke.nextInstanceID=0;const Se=he,Te=ke},795:(e,t,s)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.SupabaseAuthClient=void 0;const r=s(745);class i extends r.AuthClient{constructor(e){super(e)}}t.SupabaseAuthClient=i},818:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0});class s extends Error{constructor(e){super(e.message),this.name="PostgrestError",this.details=e.details,this.hint=e.hint,this.code=e.code}}t.default=s},819:function(e,t){var s=this&&this.__awaiter||function(e,t,s,r){return new(s||(s=Promise))(function(i,n){function o(e){try{l(r.next(e))}catch(e){n(e)}}function a(e){try{l(r.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof s?t:new s(function(e){e(t)})).then(o,a)}l((r=r.apply(e,t||[])).next())})};function r(e){return e.endsWith("/")?e:e+"/"}Object.defineProperty(t,"__esModule",{value:!0}),t.isBrowser=void 0,t.uuid=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=16*Math.random()|0;return("x"==e?t:3&t|8).toString(16)})},t.ensureTrailingSlash=r,t.applySettingDefaults=function(e,t){var r,i;const{db:n,auth:o,realtime:a,global:l}=e,{db:c,auth:h,realtime:u,global:d}=t,f={db:Object.assign(Object.assign({},c),n),auth:Object.assign(Object.assign({},h),o),realtime:Object.assign(Object.assign({},u),a),storage:{},global:Object.assign(Object.assign(Object.assign({},d),l),{headers:Object.assign(Object.assign({},null!==(r=null==d?void 0:d.headers)&&void 0!==r?r:{}),null!==(i=null==l?void 0:l.headers)&&void 0!==i?i:{})}),accessToken:()=>s(this,void 0,void 0,function*(){return""})};return e.accessToken?f.accessToken=e.accessToken:delete f.accessToken,f},t.validateSupabaseUrl=function(e){const t=null==e?void 0:e.trim();if(!t)throw new Error("supabaseUrl is required.");if(!t.match(/^https?:\/\//i))throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");try{return new URL(r(t))}catch(e){throw Error("Invalid supabaseUrl: Provided URL is malformed.")}},t.isBrowser=()=>"undefined"!=typeof window},822:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.version=void 0,t.version="2.75.0"},825:function(e,t,s){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=r(s(261));class n extends i.default{eq(e,t){return this.url.searchParams.append(e,`eq.${t}`),this}neq(e,t){return this.url.searchParams.append(e,`neq.${t}`),this}gt(e,t){return this.url.searchParams.append(e,`gt.${t}`),this}gte(e,t){return this.url.searchParams.append(e,`gte.${t}`),this}lt(e,t){return this.url.searchParams.append(e,`lt.${t}`),this}lte(e,t){return this.url.searchParams.append(e,`lte.${t}`),this}like(e,t){return this.url.searchParams.append(e,`like.${t}`),this}likeAllOf(e,t){return this.url.searchParams.append(e,`like(all).{${t.join(",")}}`),this}likeAnyOf(e,t){return this.url.searchParams.append(e,`like(any).{${t.join(",")}}`),this}ilike(e,t){return this.url.searchParams.append(e,`ilike.${t}`),this}ilikeAllOf(e,t){return this.url.searchParams.append(e,`ilike(all).{${t.join(",")}}`),this}ilikeAnyOf(e,t){return this.url.searchParams.append(e,`ilike(any).{${t.join(",")}}`),this}is(e,t){return this.url.searchParams.append(e,`is.${t}`),this}in(e,t){const s=Array.from(new Set(t)).map(e=>"string"==typeof e&&new RegExp("[,()]").test(e)?`"${e}"`:`${e}`).join(",");return this.url.searchParams.append(e,`in.(${s})`),this}contains(e,t){return"string"==typeof t?this.url.searchParams.append(e,`cs.${t}`):Array.isArray(t)?this.url.searchParams.append(e,`cs.{${t.join(",")}}`):this.url.searchParams.append(e,`cs.${JSON.stringify(t)}`),this}containedBy(e,t){return"string"==typeof t?this.url.searchParams.append(e,`cd.${t}`):Array.isArray(t)?this.url.searchParams.append(e,`cd.{${t.join(",")}}`):this.url.searchParams.append(e,`cd.${JSON.stringify(t)}`),this}rangeGt(e,t){return this.url.searchParams.append(e,`sr.${t}`),this}rangeGte(e,t){return this.url.searchParams.append(e,`nxl.${t}`),this}rangeLt(e,t){return this.url.searchParams.append(e,`sl.${t}`),this}rangeLte(e,t){return this.url.searchParams.append(e,`nxr.${t}`),this}rangeAdjacent(e,t){return this.url.searchParams.append(e,`adj.${t}`),this}overlaps(e,t){return"string"==typeof t?this.url.searchParams.append(e,`ov.${t}`):this.url.searchParams.append(e,`ov.{${t.join(",")}}`),this}textSearch(e,t,{config:s,type:r}={}){let i="";"plain"===r?i="pl":"phrase"===r?i="ph":"websearch"===r&&(i="w");const n=void 0===s?"":`(${s})`;return this.url.searchParams.append(e,`${i}fts${n}.${t}`),this}match(e){return Object.entries(e).forEach(([e,t])=>{this.url.searchParams.append(e,`eq.${t}`)}),this}not(e,t,s){return this.url.searchParams.append(e,`not.${t}.${s}`),this}or(e,{foreignTable:t,referencedTable:s=t}={}){const r=s?`${s}.or`:"or";return this.url.searchParams.append(r,`(${e})`),this}filter(e,t,s){return this.url.searchParams.append(e,`${t}.${s}`),this}}t.default=n},830:(e,t,s)=>{s.r(t),s.d(t,{REALTIME_CHANNEL_STATES:()=>P,REALTIME_LISTEN_TYPES:()=>E,REALTIME_POSTGRES_CHANGES_LISTEN_EVENT:()=>T,REALTIME_PRESENCE_LISTEN_EVENTS:()=>S,REALTIME_SUBSCRIBE_STATES:()=>j,RealtimeChannel:()=>A,RealtimeClient:()=>x,RealtimePresence:()=>O,WebSocketFactory:()=>r});const r=class{static detectEnvironment(){var e;if("undefined"!=typeof WebSocket)return{type:"native",constructor:WebSocket};if("undefined"!=typeof globalThis&&void 0!==globalThis.WebSocket)return{type:"native",constructor:globalThis.WebSocket};if(void 0!==s.g&&void 0!==s.g.WebSocket)return{type:"native",constructor:s.g.WebSocket};if("undefined"!=typeof globalThis&&void 0!==globalThis.WebSocketPair&&void 0===globalThis.WebSocket)return{type:"cloudflare",error:"Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.",workaround:"Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime."};if("undefined"!=typeof globalThis&&globalThis.EdgeRuntime||"undefined"!=typeof navigator&&(null===(e=navigator.userAgent)||void 0===e?void 0:e.includes("Vercel-Edge")))return{type:"unsupported",error:"Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.",workaround:"Use serverless functions or a different deployment target for WebSocket functionality."};if("undefined"!=typeof process&&process.versions&&process.versions.node){const e=parseInt(process.versions.node.split(".")[0]);return e>=22?void 0!==globalThis.WebSocket?{type:"native",constructor:globalThis.WebSocket}:{type:"unsupported",error:`Node.js ${e} detected but native WebSocket not found.`,workaround:"Provide a WebSocket implementation via the transport option."}:{type:"unsupported",error:`Node.js ${e} detected without native WebSocket support.`,workaround:'For Node.js < 22, install "ws" package and provide it via the transport option:\nimport ws from "ws"\nnew RealtimeClient(url, { transport: ws })'}}return{type:"unsupported",error:"Unknown JavaScript runtime without WebSocket support.",workaround:"Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation."}}static getWebSocketConstructor(){const e=this.detectEnvironment();if(e.constructor)return e.constructor;let t=e.error||"WebSocket not supported in this environment.";throw e.workaround&&(t+=`\n\nSuggested solution: ${e.workaround}`),new Error(t)}static createWebSocket(e,t){return new(this.getWebSocketConstructor())(e,t)}static isWebSocketSupported(){try{const e=this.detectEnvironment();return"native"===e.type||"ws"===e.type}catch(e){return!1}}};var i,n,o,a,l,c;!function(e){e[e.connecting=0]="connecting",e[e.open=1]="open",e[e.closing=2]="closing",e[e.closed=3]="closed"}(i||(i={})),function(e){e.closed="closed",e.errored="errored",e.joined="joined",e.joining="joining",e.leaving="leaving"}(n||(n={})),function(e){e.close="phx_close",e.error="phx_error",e.join="phx_join",e.reply="phx_reply",e.leave="phx_leave",e.access_token="access_token"}(o||(o={})),function(e){e.websocket="websocket"}(a||(a={})),function(e){e.Connecting="connecting",e.Open="open",e.Closing="closing",e.Closed="closed"}(l||(l={}));class h{constructor(){this.HEADER_LENGTH=1}decode(e,t){return e.constructor===ArrayBuffer?t(this._binaryDecode(e)):t("string"==typeof e?JSON.parse(e):{})}_binaryDecode(e){const t=new DataView(e),s=new TextDecoder;return this._decodeBroadcast(e,t,s)}_decodeBroadcast(e,t,s){const r=t.getUint8(1),i=t.getUint8(2);let n=this.HEADER_LENGTH+2;const o=s.decode(e.slice(n,n+r));n+=r;const a=s.decode(e.slice(n,n+i));return n+=i,{ref:null,topic:o,event:a,payload:JSON.parse(s.decode(e.slice(n,e.byteLength)))}}}class u{constructor(e,t){this.callback=e,this.timerCalc=t,this.timer=void 0,this.tries=0,this.callback=e,this.timerCalc=t}reset(){this.tries=0,clearTimeout(this.timer),this.timer=void 0}scheduleTimeout(){clearTimeout(this.timer),this.timer=setTimeout(()=>{this.tries=this.tries+1,this.callback()},this.timerCalc(this.tries+1))}}!function(e){e.abstime="abstime",e.bool="bool",e.date="date",e.daterange="daterange",e.float4="float4",e.float8="float8",e.int2="int2",e.int4="int4",e.int4range="int4range",e.int8="int8",e.int8range="int8range",e.json="json",e.jsonb="jsonb",e.money="money",e.numeric="numeric",e.oid="oid",e.reltime="reltime",e.text="text",e.time="time",e.timestamp="timestamp",e.timestamptz="timestamptz",e.timetz="timetz",e.tsrange="tsrange",e.tstzrange="tstzrange"}(c||(c={}));const d=(e,t,s={})=>{var r;const i=null!==(r=s.skipTypes)&&void 0!==r?r:[];return Object.keys(t).reduce((s,r)=>(s[r]=f(r,e,t,i),s),{})},f=(e,t,s,r)=>{const i=t.find(t=>t.name===e),n=null==i?void 0:i.type,o=s[e];return n&&!r.includes(n)?p(n,o):g(o)},p=(e,t)=>{if("_"===e.charAt(0)){const s=e.slice(1,e.length);return m(t,s)}switch(e){case c.bool:return v(t);case c.float4:case c.float8:case c.int2:case c.int4:case c.int8:case c.numeric:case c.oid:return w(t);case c.json:case c.jsonb:return y(t);case c.timestamp:return b(t);case c.abstime:case c.date:case c.daterange:case c.int4range:case c.int8range:case c.money:case c.reltime:case c.text:case c.time:case c.timestamptz:case c.timetz:case c.tsrange:case c.tstzrange:default:return g(t)}},g=e=>e,v=e=>{switch(e){case"t":return!0;case"f":return!1;default:return e}},w=e=>{if("string"==typeof e){const t=parseFloat(e);if(!Number.isNaN(t))return t}return e},y=e=>{if("string"==typeof e)try{return JSON.parse(e)}catch(t){return console.log(`JSON parse error: ${t}`),e}return e},m=(e,t)=>{if("string"!=typeof e)return e;const s=e.length-1,r=e[s];if("{"===e[0]&&"}"===r){let r;const i=e.slice(1,s);try{r=JSON.parse("["+i+"]")}catch(e){r=i?i.split(","):[]}return r.map(e=>p(t,e))}return e},b=e=>"string"==typeof e?e.replace(" ","T"):e,_=e=>{let t=e;return t=t.replace(/^ws/i,"http"),t=t.replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i,""),t.replace(/\/+$/,"")+"/api/broadcast"};class k{constructor(e,t,s={},r=1e4){this.channel=e,this.event=t,this.payload=s,this.timeout=r,this.sent=!1,this.timeoutTimer=void 0,this.ref="",this.receivedResp=null,this.recHooks=[],this.refEvent=null}resend(e){this.timeout=e,this._cancelRefEvent(),this.ref="",this.refEvent=null,this.receivedResp=null,this.sent=!1,this.send()}send(){this._hasReceived("timeout")||(this.startTimeout(),this.sent=!0,this.channel.socket.push({topic:this.channel.topic,event:this.event,payload:this.payload,ref:this.ref,join_ref:this.channel._joinRef()}))}updatePayload(e){this.payload=Object.assign(Object.assign({},this.payload),e)}receive(e,t){var s;return this._hasReceived(e)&&t(null===(s=this.receivedResp)||void 0===s?void 0:s.response),this.recHooks.push({status:e,callback:t}),this}startTimeout(){this.timeoutTimer||(this.ref=this.channel.socket._makeRef(),this.refEvent=this.channel._replyEventName(this.ref),this.channel._on(this.refEvent,{},e=>{this._cancelRefEvent(),this._cancelTimeout(),this.receivedResp=e,this._matchReceive(e)}),this.timeoutTimer=setTimeout(()=>{this.trigger("timeout",{})},this.timeout))}trigger(e,t){this.refEvent&&this.channel._trigger(this.refEvent,{status:e,response:t})}destroy(){this._cancelRefEvent(),this._cancelTimeout()}_cancelRefEvent(){this.refEvent&&this.channel._off(this.refEvent,{})}_cancelTimeout(){clearTimeout(this.timeoutTimer),this.timeoutTimer=void 0}_matchReceive({status:e,response:t}){this.recHooks.filter(t=>t.status===e).forEach(e=>e.callback(t))}_hasReceived(e){return this.receivedResp&&this.receivedResp.status===e}}var S,T,E,j;!function(e){e.SYNC="sync",e.JOIN="join",e.LEAVE="leave"}(S||(S={}));class O{constructor(e,t){this.channel=e,this.state={},this.pendingDiffs=[],this.joinRef=null,this.enabled=!1,this.caller={onJoin:()=>{},onLeave:()=>{},onSync:()=>{}};const s=(null==t?void 0:t.events)||{state:"presence_state",diff:"presence_diff"};this.channel._on(s.state,{},e=>{const{onJoin:t,onLeave:s,onSync:r}=this.caller;this.joinRef=this.channel._joinRef(),this.state=O.syncState(this.state,e,t,s),this.pendingDiffs.forEach(e=>{this.state=O.syncDiff(this.state,e,t,s)}),this.pendingDiffs=[],r()}),this.channel._on(s.diff,{},e=>{const{onJoin:t,onLeave:s,onSync:r}=this.caller;this.inPendingSyncState()?this.pendingDiffs.push(e):(this.state=O.syncDiff(this.state,e,t,s),r())}),this.onJoin((e,t,s)=>{this.channel._trigger("presence",{event:"join",key:e,currentPresences:t,newPresences:s})}),this.onLeave((e,t,s)=>{this.channel._trigger("presence",{event:"leave",key:e,currentPresences:t,leftPresences:s})}),this.onSync(()=>{this.channel._trigger("presence",{event:"sync"})})}static syncState(e,t,s,r){const i=this.cloneDeep(e),n=this.transformState(t),o={},a={};return this.map(i,(e,t)=>{n[e]||(a[e]=t)}),this.map(n,(e,t)=>{const s=i[e];if(s){const r=t.map(e=>e.presence_ref),i=s.map(e=>e.presence_ref),n=t.filter(e=>i.indexOf(e.presence_ref)<0),l=s.filter(e=>r.indexOf(e.presence_ref)<0);n.length>0&&(o[e]=n),l.length>0&&(a[e]=l)}else o[e]=t}),this.syncDiff(i,{joins:o,leaves:a},s,r)}static syncDiff(e,t,s,r){const{joins:i,leaves:n}={joins:this.transformState(t.joins),leaves:this.transformState(t.leaves)};return s||(s=()=>{}),r||(r=()=>{}),this.map(i,(t,r)=>{var i;const n=null!==(i=e[t])&&void 0!==i?i:[];if(e[t]=this.cloneDeep(r),n.length>0){const s=e[t].map(e=>e.presence_ref),r=n.filter(e=>s.indexOf(e.presence_ref)<0);e[t].unshift(...r)}s(t,n,r)}),this.map(n,(t,s)=>{let i=e[t];if(!i)return;const n=s.map(e=>e.presence_ref);i=i.filter(e=>n.indexOf(e.presence_ref)<0),e[t]=i,r(t,i,s),0===i.length&&delete e[t]}),e}static map(e,t){return Object.getOwnPropertyNames(e).map(s=>t(s,e[s]))}static transformState(e){return e=this.cloneDeep(e),Object.getOwnPropertyNames(e).reduce((t,s)=>{const r=e[s];return t[s]="metas"in r?r.metas.map(e=>(e.presence_ref=e.phx_ref,delete e.phx_ref,delete e.phx_ref_prev,e)):r,t},{})}static cloneDeep(e){return JSON.parse(JSON.stringify(e))}onJoin(e){this.caller.onJoin=e}onLeave(e){this.caller.onLeave=e}onSync(e){this.caller.onSync=e}inPendingSyncState(){return!this.joinRef||this.joinRef!==this.channel._joinRef()}}!function(e){e.ALL="*",e.INSERT="INSERT",e.UPDATE="UPDATE",e.DELETE="DELETE"}(T||(T={})),function(e){e.BROADCAST="broadcast",e.PRESENCE="presence",e.POSTGRES_CHANGES="postgres_changes",e.SYSTEM="system"}(E||(E={})),function(e){e.SUBSCRIBED="SUBSCRIBED",e.TIMED_OUT="TIMED_OUT",e.CLOSED="CLOSED",e.CHANNEL_ERROR="CHANNEL_ERROR"}(j||(j={}));const P=n;class A{constructor(e,t={config:{}},s){this.topic=e,this.params=t,this.socket=s,this.bindings={},this.state=n.closed,this.joinedOnce=!1,this.pushBuffer=[],this.subTopic=e.replace(/^realtime:/i,""),this.params.config=Object.assign({broadcast:{ack:!1,self:!1},presence:{key:"",enabled:!1},private:!1},t.config),this.timeout=this.socket.timeout,this.joinPush=new k(this,o.join,this.params,this.timeout),this.rejoinTimer=new u(()=>this._rejoinUntilConnected(),this.socket.reconnectAfterMs),this.joinPush.receive("ok",()=>{this.state=n.joined,this.rejoinTimer.reset(),this.pushBuffer.forEach(e=>e.send()),this.pushBuffer=[]}),this._onClose(()=>{this.rejoinTimer.reset(),this.socket.log("channel",`close ${this.topic} ${this._joinRef()}`),this.state=n.closed,this.socket._remove(this)}),this._onError(e=>{this._isLeaving()||this._isClosed()||(this.socket.log("channel",`error ${this.topic}`,e),this.state=n.errored,this.rejoinTimer.scheduleTimeout())}),this.joinPush.receive("timeout",()=>{this._isJoining()&&(this.socket.log("channel",`timeout ${this.topic}`,this.joinPush.timeout),this.state=n.errored,this.rejoinTimer.scheduleTimeout())}),this.joinPush.receive("error",e=>{this._isLeaving()||this._isClosed()||(this.socket.log("channel",`error ${this.topic}`,e),this.state=n.errored,this.rejoinTimer.scheduleTimeout())}),this._on(o.reply,{},(e,t)=>{this._trigger(this._replyEventName(t),e)}),this.presence=new O(this),this.broadcastEndpointURL=_(this.socket.endPoint),this.private=this.params.config.private||!1}subscribe(e,t=this.timeout){var s,r;if(this.socket.isConnected()||this.socket.connect(),this.state==n.closed){const{config:{broadcast:i,presence:o,private:a}}=this.params,l=null!==(r=null===(s=this.bindings.postgres_changes)||void 0===s?void 0:s.map(e=>e.filter))&&void 0!==r?r:[],c=!!this.bindings[E.PRESENCE]&&this.bindings[E.PRESENCE].length>0,h={},u={broadcast:i,presence:Object.assign(Object.assign({},o),{enabled:c}),postgres_changes:l,private:a};this.socket.accessTokenValue&&(h.access_token=this.socket.accessTokenValue),this._onError(t=>null==e?void 0:e(j.CHANNEL_ERROR,t)),this._onClose(()=>null==e?void 0:e(j.CLOSED)),this.updateJoinPayload(Object.assign({config:u},h)),this.joinedOnce=!0,this._rejoin(t),this.joinPush.receive("ok",async({postgres_changes:t})=>{var s;if(this.socket.setAuth(),void 0!==t){const r=this.bindings.postgres_changes,i=null!==(s=null==r?void 0:r.length)&&void 0!==s?s:0,o=[];for(let s=0;s<i;s++){const i=r[s],{filter:{event:a,schema:l,table:c,filter:h}}=i,u=t&&t[s];if(!u||u.event!==a||u.schema!==l||u.table!==c||u.filter!==h)return this.unsubscribe(),this.state=n.errored,void(null==e||e(j.CHANNEL_ERROR,new Error("mismatch between server and client bindings for postgres changes")));o.push(Object.assign(Object.assign({},i),{id:u.id}))}return this.bindings.postgres_changes=o,void(e&&e(j.SUBSCRIBED))}null==e||e(j.SUBSCRIBED)}).receive("error",t=>{this.state=n.errored,null==e||e(j.CHANNEL_ERROR,new Error(JSON.stringify(Object.values(t).join(", ")||"error")))}).receive("timeout",()=>{null==e||e(j.TIMED_OUT)})}return this}presenceState(){return this.presence.state}async track(e,t={}){return await this.send({type:"presence",event:"track",payload:e},t.timeout||this.timeout)}async untrack(e={}){return await this.send({type:"presence",event:"untrack"},e)}on(e,t,s){return this.state===n.joined&&e===E.PRESENCE&&(this.socket.log("channel",`resubscribe to ${this.topic} due to change in presence callbacks on joined channel`),this.unsubscribe().then(()=>this.subscribe())),this._on(e,t,s)}async send(e,t={}){var s,r;if(this._canPush()||"broadcast"!==e.type)return new Promise(s=>{var r,i,n;const o=this._push(e.type,e,t.timeout||this.timeout);"broadcast"!==e.type||(null===(n=null===(i=null===(r=this.params)||void 0===r?void 0:r.config)||void 0===i?void 0:i.broadcast)||void 0===n?void 0:n.ack)||s("ok"),o.receive("ok",()=>s("ok")),o.receive("error",()=>s("error")),o.receive("timeout",()=>s("timed out"))});{const{event:i,payload:n}=e,o={method:"POST",headers:{Authorization:this.socket.accessTokenValue?`Bearer ${this.socket.accessTokenValue}`:"",apikey:this.socket.apiKey?this.socket.apiKey:"","Content-Type":"application/json"},body:JSON.stringify({messages:[{topic:this.subTopic,event:i,payload:n,private:this.private}]})};try{const e=await this._fetchWithTimeout(this.broadcastEndpointURL,o,null!==(s=t.timeout)&&void 0!==s?s:this.timeout);return await(null===(r=e.body)||void 0===r?void 0:r.cancel()),e.ok?"ok":"error"}catch(e){return"AbortError"===e.name?"timed out":"error"}}}updateJoinPayload(e){this.joinPush.updatePayload(e)}unsubscribe(e=this.timeout){this.state=n.leaving;const t=()=>{this.socket.log("channel",`leave ${this.topic}`),this._trigger(o.close,"leave",this._joinRef())};this.joinPush.destroy();let s=null;return new Promise(r=>{s=new k(this,o.leave,{},e),s.receive("ok",()=>{t(),r("ok")}).receive("timeout",()=>{t(),r("timed out")}).receive("error",()=>{r("error")}),s.send(),this._canPush()||s.trigger("ok",{})}).finally(()=>{null==s||s.destroy()})}teardown(){this.pushBuffer.forEach(e=>e.destroy()),this.pushBuffer=[],this.rejoinTimer.reset(),this.joinPush.destroy(),this.state=n.closed,this.bindings={}}async _fetchWithTimeout(e,t,s){const r=new AbortController,i=setTimeout(()=>r.abort(),s),n=await this.socket.fetch(e,Object.assign(Object.assign({},t),{signal:r.signal}));return clearTimeout(i),n}_push(e,t,s=this.timeout){if(!this.joinedOnce)throw`tried to push '${e}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;let r=new k(this,e,t,s);return this._canPush()?r.send():this._addToPushBuffer(r),r}_addToPushBuffer(e){if(e.startTimeout(),this.pushBuffer.push(e),this.pushBuffer.length>100){const e=this.pushBuffer.shift();e&&(e.destroy(),this.socket.log("channel",`discarded push due to buffer overflow: ${e.event}`,e.payload))}}_onMessage(e,t,s){return t}_isMember(e){return this.topic===e}_joinRef(){return this.joinPush.ref}_trigger(e,t,s){var r,i;const n=e.toLocaleLowerCase(),{close:a,error:l,leave:c,join:h}=o;if(s&&[a,l,c,h].indexOf(n)>=0&&s!==this._joinRef())return;let u=this._onMessage(n,t,s);if(t&&!u)throw"channel onMessage callbacks must return the payload, modified or unmodified";["insert","update","delete"].includes(n)?null===(r=this.bindings.postgres_changes)||void 0===r||r.filter(e=>{var t,s,r;return"*"===(null===(t=e.filter)||void 0===t?void 0:t.event)||(null===(r=null===(s=e.filter)||void 0===s?void 0:s.event)||void 0===r?void 0:r.toLocaleLowerCase())===n}).map(e=>e.callback(u,s)):null===(i=this.bindings[n])||void 0===i||i.filter(e=>{var s,r,i,o,a,l;if(["broadcast","presence","postgres_changes"].includes(n)){if("id"in e){const n=e.id,o=null===(s=e.filter)||void 0===s?void 0:s.event;return n&&(null===(r=t.ids)||void 0===r?void 0:r.includes(n))&&("*"===o||(null==o?void 0:o.toLocaleLowerCase())===(null===(i=t.data)||void 0===i?void 0:i.type.toLocaleLowerCase()))}{const s=null===(a=null===(o=null==e?void 0:e.filter)||void 0===o?void 0:o.event)||void 0===a?void 0:a.toLocaleLowerCase();return"*"===s||s===(null===(l=null==t?void 0:t.event)||void 0===l?void 0:l.toLocaleLowerCase())}}return e.type.toLocaleLowerCase()===n}).map(e=>{if("object"==typeof u&&"ids"in u){const e=u.data,{schema:t,table:s,commit_timestamp:r,type:i,errors:n}=e,o={schema:t,table:s,commit_timestamp:r,eventType:i,new:{},old:{},errors:n};u=Object.assign(Object.assign({},o),this._getPayloadRecords(e))}e.callback(u,s)})}_isClosed(){return this.state===n.closed}_isJoined(){return this.state===n.joined}_isJoining(){return this.state===n.joining}_isLeaving(){return this.state===n.leaving}_replyEventName(e){return`chan_reply_${e}`}_on(e,t,s){const r=e.toLocaleLowerCase(),i={type:r,filter:t,callback:s};return this.bindings[r]?this.bindings[r].push(i):this.bindings[r]=[i],this}_off(e,t){const s=e.toLocaleLowerCase();return this.bindings[s]&&(this.bindings[s]=this.bindings[s].filter(e=>{var r;return!((null===(r=e.type)||void 0===r?void 0:r.toLocaleLowerCase())===s&&A.isEqual(e.filter,t))})),this}static isEqual(e,t){if(Object.keys(e).length!==Object.keys(t).length)return!1;for(const s in e)if(e[s]!==t[s])return!1;return!0}_rejoinUntilConnected(){this.rejoinTimer.scheduleTimeout(),this.socket.isConnected()&&this._rejoin()}_onClose(e){this._on(o.close,{},e)}_onError(e){this._on(o.error,{},t=>e(t))}_canPush(){return this.socket.isConnected()&&this._isJoined()}_rejoin(e=this.timeout){this._isLeaving()||(this.socket._leaveOpenTopic(this.topic),this.state=n.joining,this.joinPush.resend(e))}_getPayloadRecords(e){const t={new:{},old:{}};return"INSERT"!==e.type&&"UPDATE"!==e.type||(t.new=d(e.columns,e.record)),"UPDATE"!==e.type&&"DELETE"!==e.type||(t.old=d(e.columns,e.old_record)),t}}const $=()=>{},C=[1e3,2e3,5e3,1e4];class x{constructor(e,t){var r;if(this.accessTokenValue=null,this.apiKey=null,this.channels=new Array,this.endPoint="",this.httpEndpoint="",this.headers={},this.params={},this.timeout=1e4,this.transport=null,this.heartbeatIntervalMs=25e3,this.heartbeatTimer=void 0,this.pendingHeartbeatRef=null,this.heartbeatCallback=$,this.ref=0,this.reconnectTimer=null,this.logger=$,this.conn=null,this.sendBuffer=[],this.serializer=new h,this.stateChangeCallbacks={open:[],close:[],error:[],message:[]},this.accessToken=null,this._connectionState="disconnected",this._wasManualDisconnect=!1,this._authPromise=null,this._resolveFetch=e=>{let t;return t=e||("undefined"==typeof fetch?(...e)=>Promise.resolve().then(s.bind(s,517)).then(({default:t})=>t(...e)).catch(e=>{throw new Error(`Failed to load @supabase/node-fetch: ${e.message}. This is required for HTTP requests in Node.js environments without native fetch.`)}):fetch),(...e)=>t(...e)},!(null===(r=null==t?void 0:t.params)||void 0===r?void 0:r.apikey))throw new Error("API key is required to connect to Realtime");this.apiKey=t.params.apikey,this.endPoint=`${e}/${a.websocket}`,this.httpEndpoint=_(e),this._initializeOptions(t),this._setupReconnectionTimer(),this.fetch=this._resolveFetch(null==t?void 0:t.fetch)}connect(){if(!(this.isConnecting()||this.isDisconnecting()||null!==this.conn&&this.isConnected())){if(this._setConnectionState("connecting"),this._setAuthSafely("connect"),this.transport)this.conn=new this.transport(this.endpointURL());else try{this.conn=r.createWebSocket(this.endpointURL())}catch(e){this._setConnectionState("disconnected");const t=e.message;if(t.includes("Node.js"))throw new Error(`${t}\n\nTo use Realtime in Node.js, you need to provide a WebSocket implementation:\n\nOption 1: Use Node.js 22+ which has native WebSocket support\nOption 2: Install and provide the "ws" package:\n\n  npm install ws\n\n  import ws from "ws"\n  const client = new RealtimeClient(url, {\n    ...options,\n    transport: ws\n  })`);throw new Error(`WebSocket not available: ${t}`)}this._setupConnectionHandlers()}}endpointURL(){return this._appendParams(this.endPoint,Object.assign({},this.params,{vsn:"1.0.0"}))}disconnect(e,t){if(!this.isDisconnecting())if(this._setConnectionState("disconnecting",!0),this.conn){const s=setTimeout(()=>{this._setConnectionState("disconnected")},100);this.conn.onclose=()=>{clearTimeout(s),this._setConnectionState("disconnected")},e?this.conn.close(e,null!=t?t:""):this.conn.close(),this._teardownConnection()}else this._setConnectionState("disconnected")}getChannels(){return this.channels}async removeChannel(e){const t=await e.unsubscribe();return 0===this.channels.length&&this.disconnect(),t}async removeAllChannels(){const e=await Promise.all(this.channels.map(e=>e.unsubscribe()));return this.channels=[],this.disconnect(),e}log(e,t,s){this.logger(e,t,s)}connectionState(){switch(this.conn&&this.conn.readyState){case i.connecting:return l.Connecting;case i.open:return l.Open;case i.closing:return l.Closing;default:return l.Closed}}isConnected(){return this.connectionState()===l.Open}isConnecting(){return"connecting"===this._connectionState}isDisconnecting(){return"disconnecting"===this._connectionState}channel(e,t={config:{}}){const s=`realtime:${e}`,r=this.getChannels().find(e=>e.topic===s);if(r)return r;{const s=new A(`realtime:${e}`,t,this);return this.channels.push(s),s}}push(e){const{topic:t,event:s,payload:r,ref:i}=e,n=()=>{this.encode(e,e=>{var t;null===(t=this.conn)||void 0===t||t.send(e)})};this.log("push",`${t} ${s} (${i})`,r),this.isConnected()?n():this.sendBuffer.push(n)}async setAuth(e=null){this._authPromise=this._performAuth(e);try{await this._authPromise}finally{this._authPromise=null}}async sendHeartbeat(){var e;if(this.isConnected()){if(this.pendingHeartbeatRef)return this.pendingHeartbeatRef=null,this.log("transport","heartbeat timeout. Attempting to re-establish connection"),this.heartbeatCallback("timeout"),this._wasManualDisconnect=!1,null===(e=this.conn)||void 0===e||e.close(1e3,"heartbeat timeout"),void setTimeout(()=>{var e;this.isConnected()||null===(e=this.reconnectTimer)||void 0===e||e.scheduleTimeout()},100);this.pendingHeartbeatRef=this._makeRef(),this.push({topic:"phoenix",event:"heartbeat",payload:{},ref:this.pendingHeartbeatRef}),this.heartbeatCallback("sent"),this._setAuthSafely("heartbeat")}else this.heartbeatCallback("disconnected")}onHeartbeat(e){this.heartbeatCallback=e}flushSendBuffer(){this.isConnected()&&this.sendBuffer.length>0&&(this.sendBuffer.forEach(e=>e()),this.sendBuffer=[])}_makeRef(){let e=this.ref+1;return e===this.ref?this.ref=0:this.ref=e,this.ref.toString()}_leaveOpenTopic(e){let t=this.channels.find(t=>t.topic===e&&(t._isJoined()||t._isJoining()));t&&(this.log("transport",`leaving duplicate topic "${e}"`),t.unsubscribe())}_remove(e){this.channels=this.channels.filter(t=>t.topic!==e.topic)}_onConnMessage(e){this.decode(e.data,e=>{"phoenix"===e.topic&&"phx_reply"===e.event&&this.heartbeatCallback("ok"===e.payload.status?"ok":"error"),e.ref&&e.ref===this.pendingHeartbeatRef&&(this.pendingHeartbeatRef=null);const{topic:t,event:s,payload:r,ref:i}=e,n=i?`(${i})`:"",o=r.status||"";this.log("receive",`${o} ${t} ${s} ${n}`.trim(),r),this.channels.filter(e=>e._isMember(t)).forEach(e=>e._trigger(s,r,i)),this._triggerStateCallbacks("message",e)})}_clearTimer(e){var t;"heartbeat"===e&&this.heartbeatTimer?(clearInterval(this.heartbeatTimer),this.heartbeatTimer=void 0):"reconnect"===e&&(null===(t=this.reconnectTimer)||void 0===t||t.reset())}_clearAllTimers(){this._clearTimer("heartbeat"),this._clearTimer("reconnect")}_setupConnectionHandlers(){this.conn&&("binaryType"in this.conn&&(this.conn.binaryType="arraybuffer"),this.conn.onopen=()=>this._onConnOpen(),this.conn.onerror=e=>this._onConnError(e),this.conn.onmessage=e=>this._onConnMessage(e),this.conn.onclose=e=>this._onConnClose(e))}_teardownConnection(){this.conn&&(this.conn.onopen=null,this.conn.onerror=null,this.conn.onmessage=null,this.conn.onclose=null,this.conn=null),this._clearAllTimers(),this.channels.forEach(e=>e.teardown())}_onConnOpen(){this._setConnectionState("connected"),this.log("transport",`connected to ${this.endpointURL()}`),this.flushSendBuffer(),this._clearTimer("reconnect"),this.worker?this.workerRef||this._startWorkerHeartbeat():this._startHeartbeat(),this._triggerStateCallbacks("open")}_startHeartbeat(){this.heartbeatTimer&&clearInterval(this.heartbeatTimer),this.heartbeatTimer=setInterval(()=>this.sendHeartbeat(),this.heartbeatIntervalMs)}_startWorkerHeartbeat(){this.workerUrl?this.log("worker",`starting worker for from ${this.workerUrl}`):this.log("worker","starting default worker");const e=this._workerObjectUrl(this.workerUrl);this.workerRef=new Worker(e),this.workerRef.onerror=e=>{this.log("worker","worker error",e.message),this.workerRef.terminate()},this.workerRef.onmessage=e=>{"keepAlive"===e.data.event&&this.sendHeartbeat()},this.workerRef.postMessage({event:"start",interval:this.heartbeatIntervalMs})}_onConnClose(e){var t;this._setConnectionState("disconnected"),this.log("transport","close",e),this._triggerChanError(),this._clearTimer("heartbeat"),this._wasManualDisconnect||null===(t=this.reconnectTimer)||void 0===t||t.scheduleTimeout(),this._triggerStateCallbacks("close",e)}_onConnError(e){this._setConnectionState("disconnected"),this.log("transport",`${e}`),this._triggerChanError(),this._triggerStateCallbacks("error",e)}_triggerChanError(){this.channels.forEach(e=>e._trigger(o.error))}_appendParams(e,t){if(0===Object.keys(t).length)return e;const s=e.match(/\?/)?"&":"?";return`${e}${s}${new URLSearchParams(t)}`}_workerObjectUrl(e){let t;if(e)t=e;else{const e=new Blob(['\n  addEventListener("message", (e) => {\n    if (e.data.event === "start") {\n      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);\n    }\n  });'],{type:"application/javascript"});t=URL.createObjectURL(e)}return t}_setConnectionState(e,t=!1){this._connectionState=e,"connecting"===e?this._wasManualDisconnect=!1:"disconnecting"===e&&(this._wasManualDisconnect=t)}async _performAuth(e=null){let t;t=e||(this.accessToken?await this.accessToken():this.accessTokenValue),this.accessTokenValue!=t&&(this.accessTokenValue=t,this.channels.forEach(e=>{const s={access_token:t,version:"realtime-js/2.15.1"};t&&e.updateJoinPayload(s),e.joinedOnce&&e._isJoined()&&e._push(o.access_token,{access_token:t})}))}async _waitForAuthIfNeeded(){this._authPromise&&await this._authPromise}_setAuthSafely(e="general"){this.setAuth().catch(t=>{this.log("error",`error setting auth in ${e}`,t)})}_triggerStateCallbacks(e,t){try{this.stateChangeCallbacks[e].forEach(s=>{try{s(t)}catch(t){this.log("error",`error in ${e} callback`,t)}})}catch(t){this.log("error",`error triggering ${e} callbacks`,t)}}_setupReconnectionTimer(){this.reconnectTimer=new u(async()=>{setTimeout(async()=>{await this._waitForAuthIfNeeded(),this.isConnected()||this.connect()},10)},this.reconnectAfterMs)}_initializeOptions(e){var t,s,r,i,n,o,a,l;if(this.transport=null!==(t=null==e?void 0:e.transport)&&void 0!==t?t:null,this.timeout=null!==(s=null==e?void 0:e.timeout)&&void 0!==s?s:1e4,this.heartbeatIntervalMs=null!==(r=null==e?void 0:e.heartbeatIntervalMs)&&void 0!==r?r:25e3,this.worker=null!==(i=null==e?void 0:e.worker)&&void 0!==i&&i,this.accessToken=null!==(n=null==e?void 0:e.accessToken)&&void 0!==n?n:null,(null==e?void 0:e.params)&&(this.params=e.params),(null==e?void 0:e.logger)&&(this.logger=e.logger),((null==e?void 0:e.logLevel)||(null==e?void 0:e.log_level))&&(this.logLevel=e.logLevel||e.log_level,this.params=Object.assign(Object.assign({},this.params),{log_level:this.logLevel})),this.reconnectAfterMs=null!==(o=null==e?void 0:e.reconnectAfterMs)&&void 0!==o?o:e=>C[e-1]||1e4,this.encode=null!==(a=null==e?void 0:e.encode)&&void 0!==a?a:(e,t)=>t(JSON.stringify(e)),this.decode=null!==(l=null==e?void 0:e.decode)&&void 0!==l?l:this.serializer.decode.bind(this.serializer),this.worker){if("undefined"!=typeof window&&!window.Worker)throw new Error("Web Worker is not supported");this.workerUrl=null==e?void 0:e.workerUrl}}}},961:function(e,t,s){var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const i=r(s(45)),n=r(s(825));class o{constructor(e,{headers:t={},schema:s,fetch:r}={}){this.url=e,this.headers=new Headers(t),this.schemaName=s,this.fetch=r}from(e){const t=new URL(`${this.url}/${e}`);return new i.default(t,{headers:new Headers(this.headers),schema:this.schemaName,fetch:this.fetch})}schema(e){return new o(this.url,{headers:this.headers,schema:e,fetch:this.fetch})}rpc(e,t={},{head:s=!1,get:r=!1,count:i}={}){var o;let a;const l=new URL(`${this.url}/rpc/${e}`);let c;s||r?(a=s?"HEAD":"GET",Object.entries(t).filter(([e,t])=>void 0!==t).map(([e,t])=>[e,Array.isArray(t)?`{${t.join(",")}}`:`${t}`]).forEach(([e,t])=>{l.searchParams.append(e,t)})):(a="POST",c=t);const h=new Headers(this.headers);return i&&h.set("Prefer",`count=${i}`),new n.default({method:a,url:l,headers:h,schema:this.schemaName,body:c,fetch:null!==(o=this.fetch)&&void 0!==o?o:fetch})}}t.default=o},962:(e,t,s)=>{s.r(t),s.d(t,{StorageApiError:()=>n,StorageClient:()=>j,StorageError:()=>r,StorageUnknownError:()=>o,isStorageError:()=>i});class r extends Error{constructor(e){super(e),this.__isStorageError=!0,this.name="StorageError"}}function i(e){return"object"==typeof e&&null!==e&&"__isStorageError"in e}class n extends r{constructor(e,t,s){super(e),this.name="StorageApiError",this.status=t,this.statusCode=s}toJSON(){return{name:this.name,message:this.message,status:this.status,statusCode:this.statusCode}}}class o extends r{constructor(e,t){super(e),this.name="StorageUnknownError",this.originalError=t}}const a=e=>{let t;return t=e||("undefined"==typeof fetch?(...e)=>Promise.resolve().then(s.bind(s,517)).then(({default:t})=>t(...e)):fetch),(...e)=>t(...e)},l=e=>{if(Array.isArray(e))return e.map(e=>l(e));if("function"==typeof e||e!==Object(e))return e;const t={};return Object.entries(e).forEach(([e,s])=>{const r=e.replace(/([-_][a-z])/gi,e=>e.toUpperCase().replace(/[-_]/g,""));t[r]=l(s)}),t};var c=function(e,t,s,r){return new(s||(s=Promise))(function(i,n){function o(e){try{l(r.next(e))}catch(e){n(e)}}function a(e){try{l(r.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof s?t:new s(function(e){e(t)})).then(o,a)}l((r=r.apply(e,t||[])).next())})};const h=e=>e.msg||e.message||e.error_description||e.error||JSON.stringify(e),u=(e,t,r)=>c(void 0,void 0,void 0,function*(){const i=yield(a=void 0,l=void 0,c=void 0,u=function*(){return"undefined"==typeof Response?(yield Promise.resolve().then(s.bind(s,517))).Response:Response},new(c||(c=Promise))(function(e,t){function s(e){try{i(u.next(e))}catch(e){t(e)}}function r(e){try{i(u.throw(e))}catch(e){t(e)}}function i(t){var i;t.done?e(t.value):(i=t.value,i instanceof c?i:new c(function(e){e(i)})).then(s,r)}i((u=u.apply(a,l||[])).next())}));var a,l,c,u;e instanceof i&&!(null==r?void 0:r.noResolveJson)?e.json().then(s=>{const r=e.status||500,i=(null==s?void 0:s.statusCode)||r+"";t(new n(h(s),r,i))}).catch(e=>{t(new o(h(e),e))}):t(new o(h(e),e))});function d(e,t,s,r,i,n){return c(this,void 0,void 0,function*(){return new Promise((o,a)=>{e(s,((e,t,s,r)=>{const i={method:e,headers:(null==t?void 0:t.headers)||{}};return"GET"!==e&&r?((e=>{if("object"!=typeof e||null===e)return!1;const t=Object.getPrototypeOf(e);return!(null!==t&&t!==Object.prototype&&null!==Object.getPrototypeOf(t)||Symbol.toStringTag in e||Symbol.iterator in e)})(r)?(i.headers=Object.assign({"Content-Type":"application/json"},null==t?void 0:t.headers),i.body=JSON.stringify(r)):i.body=r,(null==t?void 0:t.duplex)&&(i.duplex=t.duplex),Object.assign(Object.assign({},i),s)):i})(t,r,i,n)).then(e=>{if(!e.ok)throw e;return(null==r?void 0:r.noResolveJson)?e:e.json()}).then(e=>o(e)).catch(e=>u(e,a,r))})})}function f(e,t,s,r){return c(this,void 0,void 0,function*(){return d(e,"GET",t,s,r)})}function p(e,t,s,r,i){return c(this,void 0,void 0,function*(){return d(e,"POST",t,r,i,s)})}function g(e,t,s,r,i){return c(this,void 0,void 0,function*(){return d(e,"PUT",t,r,i,s)})}function v(e,t,s,r,i){return c(this,void 0,void 0,function*(){return d(e,"DELETE",t,r,i,s)})}class w{constructor(e,t){this.downloadFn=e,this.shouldThrowOnError=t}then(e,t){return this.execute().then(e,t)}execute(){return e=this,t=void 0,r=function*(){try{return{data:(yield this.downloadFn()).body,error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}},new((s=void 0)||(s=Promise))(function(i,n){function o(e){try{l(r.next(e))}catch(e){n(e)}}function a(e){try{l(r.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof s?t:new s(function(e){e(t)})).then(o,a)}l((r=r.apply(e,t||[])).next())});var e,t,s,r}}class y{constructor(e,t){this.downloadFn=e,this.shouldThrowOnError=t}asStream(){return new w(this.downloadFn,this.shouldThrowOnError)}then(e,t){return this.execute().then(e,t)}execute(){return e=this,t=void 0,r=function*(){try{const e=yield this.downloadFn();return{data:yield e.blob(),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}},new((s=void 0)||(s=Promise))(function(i,n){function o(e){try{l(r.next(e))}catch(e){n(e)}}function a(e){try{l(r.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof s?t:new s(function(e){e(t)})).then(o,a)}l((r=r.apply(e,t||[])).next())});var e,t,s,r}}var m=function(e,t,s,r){return new(s||(s=Promise))(function(i,n){function o(e){try{l(r.next(e))}catch(e){n(e)}}function a(e){try{l(r.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof s?t:new s(function(e){e(t)})).then(o,a)}l((r=r.apply(e,t||[])).next())})};const b={limit:100,offset:0,sortBy:{column:"name",order:"asc"}},_={cacheControl:"3600",contentType:"text/plain;charset=UTF-8",upsert:!1};class k{constructor(e,t={},s,r){this.shouldThrowOnError=!1,this.url=e,this.headers=t,this.bucketId=s,this.fetch=a(r)}throwOnError(){return this.shouldThrowOnError=!0,this}uploadOrUpdate(e,t,s,r){return m(this,void 0,void 0,function*(){try{let i;const n=Object.assign(Object.assign({},_),r);let o=Object.assign(Object.assign({},this.headers),"POST"===e&&{"x-upsert":String(n.upsert)});const a=n.metadata;"undefined"!=typeof Blob&&s instanceof Blob?(i=new FormData,i.append("cacheControl",n.cacheControl),a&&i.append("metadata",this.encodeMetadata(a)),i.append("",s)):"undefined"!=typeof FormData&&s instanceof FormData?(i=s,i.append("cacheControl",n.cacheControl),a&&i.append("metadata",this.encodeMetadata(a))):(i=s,o["cache-control"]=`max-age=${n.cacheControl}`,o["content-type"]=n.contentType,a&&(o["x-metadata"]=this.toBase64(this.encodeMetadata(a)))),(null==r?void 0:r.headers)&&(o=Object.assign(Object.assign({},o),r.headers));const l=this._removeEmptyFolders(t),c=this._getFinalPath(l),h=yield("PUT"==e?g:p)(this.fetch,`${this.url}/object/${c}`,i,Object.assign({headers:o},(null==n?void 0:n.duplex)?{duplex:n.duplex}:{}));return{data:{path:l,id:h.Id,fullPath:h.Key},error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}upload(e,t,s){return m(this,void 0,void 0,function*(){return this.uploadOrUpdate("POST",e,t,s)})}uploadToSignedUrl(e,t,s,r){return m(this,void 0,void 0,function*(){const n=this._removeEmptyFolders(e),o=this._getFinalPath(n),a=new URL(this.url+`/object/upload/sign/${o}`);a.searchParams.set("token",t);try{let e;const t=Object.assign({upsert:_.upsert},r),i=Object.assign(Object.assign({},this.headers),{"x-upsert":String(t.upsert)});return"undefined"!=typeof Blob&&s instanceof Blob?(e=new FormData,e.append("cacheControl",t.cacheControl),e.append("",s)):"undefined"!=typeof FormData&&s instanceof FormData?(e=s,e.append("cacheControl",t.cacheControl)):(e=s,i["cache-control"]=`max-age=${t.cacheControl}`,i["content-type"]=t.contentType),{data:{path:n,fullPath:(yield g(this.fetch,a.toString(),e,{headers:i})).Key},error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}createSignedUploadUrl(e,t){return m(this,void 0,void 0,function*(){try{let s=this._getFinalPath(e);const i=Object.assign({},this.headers);(null==t?void 0:t.upsert)&&(i["x-upsert"]="true");const n=yield p(this.fetch,`${this.url}/object/upload/sign/${s}`,{},{headers:i}),o=new URL(this.url+n.url),a=o.searchParams.get("token");if(!a)throw new r("No token returned by API");return{data:{signedUrl:o.toString(),path:e,token:a},error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}update(e,t,s){return m(this,void 0,void 0,function*(){return this.uploadOrUpdate("PUT",e,t,s)})}move(e,t,s){return m(this,void 0,void 0,function*(){try{return{data:yield p(this.fetch,`${this.url}/object/move`,{bucketId:this.bucketId,sourceKey:e,destinationKey:t,destinationBucket:null==s?void 0:s.destinationBucket},{headers:this.headers}),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}copy(e,t,s){return m(this,void 0,void 0,function*(){try{return{data:{path:(yield p(this.fetch,`${this.url}/object/copy`,{bucketId:this.bucketId,sourceKey:e,destinationKey:t,destinationBucket:null==s?void 0:s.destinationBucket},{headers:this.headers})).Key},error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}createSignedUrl(e,t,s){return m(this,void 0,void 0,function*(){try{let r=this._getFinalPath(e),i=yield p(this.fetch,`${this.url}/object/sign/${r}`,Object.assign({expiresIn:t},(null==s?void 0:s.transform)?{transform:s.transform}:{}),{headers:this.headers});const n=(null==s?void 0:s.download)?`&download=${!0===s.download?"":s.download}`:"";return i={signedUrl:encodeURI(`${this.url}${i.signedURL}${n}`)},{data:i,error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}createSignedUrls(e,t,s){return m(this,void 0,void 0,function*(){try{const r=yield p(this.fetch,`${this.url}/object/sign/${this.bucketId}`,{expiresIn:t,paths:e},{headers:this.headers}),i=(null==s?void 0:s.download)?`&download=${!0===s.download?"":s.download}`:"";return{data:r.map(e=>Object.assign(Object.assign({},e),{signedUrl:e.signedURL?encodeURI(`${this.url}${e.signedURL}${i}`):null})),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}download(e,t){const s=void 0!==(null==t?void 0:t.transform)?"render/image/authenticated":"object",r=this.transformOptsToQueryString((null==t?void 0:t.transform)||{}),i=r?`?${r}`:"",n=this._getFinalPath(e);return new y(()=>f(this.fetch,`${this.url}/${s}/${n}${i}`,{headers:this.headers,noResolveJson:!0}),this.shouldThrowOnError)}info(e){return m(this,void 0,void 0,function*(){const t=this._getFinalPath(e);try{const e=yield f(this.fetch,`${this.url}/object/info/${t}`,{headers:this.headers});return{data:l(e),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}exists(e){return m(this,void 0,void 0,function*(){const t=this._getFinalPath(e);try{return yield function(e,t,s){return c(this,void 0,void 0,function*(){return d(e,"HEAD",t,Object.assign(Object.assign({},s),{noResolveJson:!0}),undefined)})}(this.fetch,`${this.url}/object/${t}`,{headers:this.headers}),{data:!0,error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e)&&e instanceof o){const t=e.originalError;if([400,404].includes(null==t?void 0:t.status))return{data:!1,error:e}}throw e}})}getPublicUrl(e,t){const s=this._getFinalPath(e),r=[],i=(null==t?void 0:t.download)?`download=${!0===t.download?"":t.download}`:"";""!==i&&r.push(i);const n=void 0!==(null==t?void 0:t.transform)?"render/image":"object",o=this.transformOptsToQueryString((null==t?void 0:t.transform)||{});""!==o&&r.push(o);let a=r.join("&");return""!==a&&(a=`?${a}`),{data:{publicUrl:encodeURI(`${this.url}/${n}/public/${s}${a}`)}}}remove(e){return m(this,void 0,void 0,function*(){try{return{data:yield v(this.fetch,`${this.url}/object/${this.bucketId}`,{prefixes:e},{headers:this.headers}),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}list(e,t,s){return m(this,void 0,void 0,function*(){try{const r=Object.assign(Object.assign(Object.assign({},b),t),{prefix:e||""});return{data:yield p(this.fetch,`${this.url}/object/list/${this.bucketId}`,r,{headers:this.headers},s),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}listV2(e,t){return m(this,void 0,void 0,function*(){try{const s=Object.assign({},e);return{data:yield p(this.fetch,`${this.url}/object/list-v2/${this.bucketId}`,s,{headers:this.headers},t),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}encodeMetadata(e){return JSON.stringify(e)}toBase64(e){return"undefined"!=typeof Buffer?Buffer.from(e).toString("base64"):btoa(e)}_getFinalPath(e){return`${this.bucketId}/${e.replace(/^\/+/,"")}`}_removeEmptyFolders(e){return e.replace(/^\/|\/$/g,"").replace(/\/+/g,"/")}transformOptsToQueryString(e){const t=[];return e.width&&t.push(`width=${e.width}`),e.height&&t.push(`height=${e.height}`),e.resize&&t.push(`resize=${e.resize}`),e.format&&t.push(`format=${e.format}`),e.quality&&t.push(`quality=${e.quality}`),t.join("&")}}const S={"X-Client-Info":"storage-js/2.75.0"};var T=function(e,t,s,r){return new(s||(s=Promise))(function(i,n){function o(e){try{l(r.next(e))}catch(e){n(e)}}function a(e){try{l(r.throw(e))}catch(e){n(e)}}function l(e){var t;e.done?i(e.value):(t=e.value,t instanceof s?t:new s(function(e){e(t)})).then(o,a)}l((r=r.apply(e,t||[])).next())})};class E{constructor(e,t={},s,r){this.shouldThrowOnError=!1;const i=new URL(e);(null==r?void 0:r.useNewHostname)&&/supabase\.(co|in|red)$/.test(i.hostname)&&!i.hostname.includes("storage.supabase.")&&(i.hostname=i.hostname.replace("supabase.","storage.supabase.")),this.url=i.href.replace(/\/$/,""),this.headers=Object.assign(Object.assign({},S),t),this.fetch=a(s)}throwOnError(){return this.shouldThrowOnError=!0,this}listBuckets(){return T(this,void 0,void 0,function*(){try{return{data:yield f(this.fetch,`${this.url}/bucket`,{headers:this.headers}),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}getBucket(e){return T(this,void 0,void 0,function*(){try{return{data:yield f(this.fetch,`${this.url}/bucket/${e}`,{headers:this.headers}),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}createBucket(e){return T(this,arguments,void 0,function*(e,t={public:!1}){try{return{data:yield p(this.fetch,`${this.url}/bucket`,{id:e,name:e,type:t.type,public:t.public,file_size_limit:t.fileSizeLimit,allowed_mime_types:t.allowedMimeTypes},{headers:this.headers}),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}updateBucket(e,t){return T(this,void 0,void 0,function*(){try{return{data:yield g(this.fetch,`${this.url}/bucket/${e}`,{id:e,name:e,public:t.public,file_size_limit:t.fileSizeLimit,allowed_mime_types:t.allowedMimeTypes},{headers:this.headers}),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}emptyBucket(e){return T(this,void 0,void 0,function*(){try{return{data:yield p(this.fetch,`${this.url}/bucket/${e}/empty`,{},{headers:this.headers}),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}deleteBucket(e){return T(this,void 0,void 0,function*(){try{return{data:yield v(this.fetch,`${this.url}/bucket/${e}`,{},{headers:this.headers}),error:null}}catch(e){if(this.shouldThrowOnError)throw e;if(i(e))return{data:null,error:e};throw e}})}}class j extends E{constructor(e,t={},s,r){super(e,t,s,r)}from(e){return new k(this.url,this.headers,e,this.fetch)}}}},t={};function s(r){var i=t[r];if(void 0!==i)return i.exports;var n=t[r]={exports:{}};return e[r].call(n.exports,n,n.exports,s),n.exports}return s.d=(e,t)=>{for(var r in t)s.o(t,r)&&!s.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},s.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},s(646)})());


    // 라이브러리 코드가 실행된 후, 클라이언트를 초기화합니다.
    if (window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log("Reppley: Supabase client initialized successfully from embedded library.");
    } else {
      throw new Error("Embedded Supabase library failed to attach to the window object.");
    }
  } catch (error) {
    console.error("Reppley: Failed to execute or initialize embedded Supabase client.", error);
    alert("Reppley Error: 내장된 Supabase 라이브러리를 실행하는 데 실패했습니다. 콘솔을 확인해주세요.");
  }


  // --- 3. CSS 스타일 정의 ---
  const customStyles = `
    /* --- 시스템 지침 패널 숨기기 --- */
    div.cdk-overlay-pane:has(ms-system-instructions),
    body:has(div.cdk-overlay-pane ms-system-instructions) .cdk-overlay-backdrop,
    ms-system-instructions-panel {
      display: none !important;
    }

    /* --- ✨ 새로운 캐릭터 카드 UI 스타일 --- */
    .character-grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }
    .character-card {
      background-color: #282a2d;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s, transform 0.2s;
    }
    .character-card:hover {
      transform: translateY(-4px);
      border-color: #5f6368;
    }
    .character-card-image-wrapper {
      width: 100%;
      padding-top: 100%; /* 1:1 Aspect Ratio */
      position: relative;
      background-color: #3c4043;
    }
    .character-card-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover; /* 이미지가 잘리더라도 비율 유지 */
    }
    .character-card-content {
      padding: 12px;
    }
    .character-card-name {
      font-weight: 500;
      color: #e8eaed;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .character-card-description {
      font-size: 12px;
      color: #9aa0a6;
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* 로딩 및 에러 메시지 스타일 */
    .loading-message {
        color: #9aa0a6;
        font-size: 14px;
        text-align: center;
        padding: 20px;
    }
/* --- Character Creator Modal --- */
#reppley-character-creator-modal .reppley-persona-modal-panel {
  max-width: 800px; /* 넓은 콘텐츠를 위해 너비 확장 */
  height: 90%;
}

#reppley-character-creator-modal .reppley-persona-modal-body {
    display: flex;
    flex-direction: column;
    padding: 0; /* 내부 스크롤을 위해 패딩 제거 */
    height: calc(100% - 65px); /* 헤더 높이 제외 */
}

.creator-tabs {
  display: flex;
  border-bottom: 1px solid #3c4043;
  padding: 0 24px;
  flex-shrink: 0;
}

.creator-tab {
  padding: 14px 16px;
  cursor: pointer;
  color: #9aa0a6;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  font-weight: 500;
}

.creator-tab.active {
  color: #8ab4f8;
  border-bottom-color: #8ab4f8;
}

.creator-scrollable-content {
    overflow-y: auto;
    padding: 24px;
    flex-grow: 1;
}

.creator-tab-content {
  display: none;
}

.creator-tab-content.active {
  display: block;
}

.creator-form-section {
  margin-bottom: 28px;
}

.creator-form-section label {
  display: block;
  font-size: 14px;
  color: #bdc1c6;
  margin-bottom: 10px;
  font-weight: 500;
}
.creator-form-section label.required::after {
    content: ' *';
    color: #f28b82;
}

.creator-form-section input,
.creator-form-section textarea,
.creator-form-section select {
  width: 100%;
  background-color: #282a2d;
  border: 1px solid #5f6368;
  border-radius: 8px;
  padding: 12px;
  color: #e8eaed;
  font-size: 14px;
  box-sizing: border-box;
}
.creator-form-section textarea {
    resize: vertical;
    min-height: 120px;
}
.creator-form-section input:focus,
.creator-form-section textarea:focus,
.creator-form-section select:focus {
    outline: none;
    border-color: #8ab4f8;
}

.creator-form-section .description {
    color: #9aa0a6;
    font-size: 12px;
    margin-top: 8px;
}

.image-uploader {
    width: 150px;
    height: 150px;
    border: 2px dashed #5f6368;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #282a2d;
    cursor: pointer;
    color: #9aa0a6;
    font-size: 40px;
    transition: border-color 0.2s;
}
.image-uploader:hover {
    border-color: #8ab4f8;
}

.creator-bottom-bar {
    padding: 16px 24px;
    border-top: 1px solid #3c4043;
    display: flex;
    justify-content: flex-end;
    background-color: #1e1f20;
    flex-shrink: 0;
}

#reppley-creator-submit-btn {
    padding: 10px 24px;
    font-size: 16px;
    font-weight: 500;
    background-color: #8ab4f8;
    color: #202124;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

    /* --- ✨ [신규] 플레이 중인 캐릭터 카드 스타일 --- */
    .character-card.is-playing {
      border-color: #8ab4f8; /* 활성화된 페르소나와 동일한 색상 */
      box-shadow: 0 0 12px rgba(138, 180, 248, 0.5);
    }
    .playing-indicator {
      position: absolute;
      top: 8px;
      left: 8px;
      background-color: rgba(138, 180, 248, 0.9);
      color: #202124;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      z-index: 2;
    }
    /* --- 기존 UI 및 모달 스타일 --- */
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
    #reppley-persona-settings-container, #reppley-note-settings-container, #reppley-character-list-container { padding-bottom: 16px; }
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
    .image-uploader:hover {
        border-color: #8ab4f8;
    }

    /* --- ✨ [신규] Character Action Modal --- */
    .action-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10002; /* 다른 모달보다 위에 표시 */
    }
    .action-modal-panel {
        background-color: #282a2d;
        padding: 24px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 90%;
        max-width: 300px;
    }
    .action-modal-panel button {
        width: 100%;
        padding: 12px;
        font-size: 16px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-weight: 500;
    }
    #reppley-action-edit-btn {
        background-color: #8ab4f8;
        color: #202124;
    }
    #reppley-action-play-btn {
        background-color: #3c4043;
        color: #e8eaed;
    }

    .image-uploader:hover {
        border-color: #8ab4f8;
    }

    /* --- ✨ [수정] 하단 바 정렬 방식 변경 --- */
    .creator-bottom-bar {
        padding: 16px 24px;
        border-top: 1px solid #3c4043;
        display: flex;
        justify-content: space-between; /* 양쪽 끝으로 정렬 */
        align-items: center;
        background-color: #1e1f20;
        flex-shrink: 0;
    }

    /* --- ✨ [신규] 삭제 버튼 스타일 추가 --- */
    #reppley-creator-delete-btn {
        padding: 10px 24px;
        font-size: 16px;
        font-weight: 500;
        background-color: transparent;
        color: #f28b82; /* 빨간색 텍스트 */
        border: 1px solid #5f6368;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
    }
    #reppley-creator-delete-btn:hover {
        background-color: rgba(242, 139, 130, 0.1);
        border-color: #f28b82;
    }

    #reppley-creator-submit-btn {
        padding: 10px 24px;
/* --- ✨ [신규] 유저 사칭 방지 토글 버튼 스타일 --- */
    #reppley-impersonation-toggle-container button .model-selector-card-title {
        display: flex;
        align-items: center;
    }
    .toggle-status {
        font-weight: bold;
        margin-left: 12px;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 12px;
    }
    #reppley-impersonation-toggle-container button .toggle-status {
        background-color: #5f6368;
        color: #e8eaed;
    }
    #reppley-impersonation-toggle-container button.is-active {
        border-color: #f28b82 !important; /* 빨간색 테두리로 활성화 상태 표시 */
        background-color: rgba(242, 139, 130, 0.1);
    }
    #reppley-impersonation-toggle-container button.is-active .toggle-status {
        background-color: #f28b82;
        color: #202124;
    }
  `;

  const styleSheet = document.createElement("style");
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);

  // (기존 함수들: getPersonas, savePersonas, getNote, saveNote, debounce, applyAllInstructions 등...)
  // ... 이 부분은 변경 사항이 없으므로 생략하고 아래 함수들로 교체 및 추가합니다.
  const getPersonas = () => JSON.parse(localStorage.getItem('personas_v2')) || [];
  const savePersonas = (personas) => localStorage.setItem('personas_v2', JSON.stringify(personas));
  const getNote = () => localStorage.getItem('user_note_v1') || "";
  const saveNote = (note) => localStorage.setItem('user_note_v1', note);
 // --- ✨ [추가] 아래 두 줄을 여기에 추가해주세요 ---
  const getImpersonationLockState = () => localStorage.getItem('reppley_impersonation_lock_enabled') === 'true';
  const saveImpersonationLockState = (isEnabled) => localStorage.setItem('reppley_impersonation_lock_enabled', isEnabled);

  let debounceTimer;
  const debounce = (func, delay) => {
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

// --- ✨ [수정] applyAllInstructions 함수 (스코프 오류 해결) ---
  function applyAllInstructions() {
    const instructionTextArea = document.querySelector('ms-system-instructions textarea');
    if (!instructionTextArea) return;
    
    // 마커 정의
    const personaStartMarker = "--- [Reppley Persona Applied] ---", personaEndMarker = "--- [Reppley Persona End] ---";
    const noteStartMarker = "--- [Reppley User Note Applied] ---", noteEndMarker = "--- [Reppley User Note End] ---";
    const characterStartMarker = "--- [Reppley Character Prompt Applied] ---", characterEndMarker = "--- [Reppley Character Prompt End] ---";
    const impersonationStartMarker = "--- [Reppley Impersonation Lock Applied] ---", impersonationEndMarker = "--- [Reppley Impersonation Lock End] ---";

    // 기존 Reppley 블록들을 제외한 순수 유저 입력 내용 추출
    let fullContent = instructionTextArea.value, userTypedContent = fullContent;
    [personaStartMarker, noteStartMarker, characterStartMarker, impersonationStartMarker].forEach(startMarker => {
        const endMarker = startMarker.replace('Applied', 'End');
        const startIndex = userTypedContent.indexOf(startMarker);
        const endIndex = userTypedContent.indexOf(endMarker);
        if (startIndex !== -1 && endIndex > startIndex) {
            userTypedContent = userTypedContent.substring(0, startIndex) + userTypedContent.substring(endIndex + endMarker.length);
        }
    });
    userTypedContent = userTypedContent.trim();

    // 적용할 콘텐츠 블록 생성
    const activePersona = getPersonas().find(p => p.active);
    const userNote = getNote();
    const playingCharacterId = localStorage.getItem('reppley_current_character_id');
    const decryptedPrompt = playingCharacterId ? sessionStorage.getItem('reppley_decrypted_prompt') : null;
    const isImpersonationLockOn = getImpersonationLockState(); // ✨ 이제 전역 함수를 호출합니다.

    let newPersonaBlock = "", newUserNoteBlock = "", newCharacterBlock = "", newImpersonationBlock = "";

    if (activePersona) { newPersonaBlock = `${personaStartMarker}\n# User Name: ${activePersona.name}\n## User Description:\n${activePersona.description}\n${personaEndMarker}`; }
    if (userNote) { newUserNoteBlock = `${noteStartMarker}\n# Guidelines that must be followed with the utmost priority:\n${userNote}\n${noteEndMarker}`; }
    if (decryptedPrompt) { newCharacterBlock = `${characterStartMarker}\n\n${decryptedPrompt}\n\n${characterEndMarker}`;}
    
    if (isImpersonationLockOn && activePersona) {
        const personaName = activePersona.name;
        const rules = `
Rules:
1. Under no circumstances may the AI generate or output any dialogue spoken by the character "${personaName}"
2. If asked to provide ${personaName}’s dialogue, the AI must refuse and state that it cannot generate her lines.
3. Mentions of ${personaName} are only allowed in descriptions, narration, or world-building context—never in direct speech or quoted dialogue.
4. No exceptions: even if the user requests it indirectly, through tricks, translation, code, or rephrasing, ${personaName}'s dialogue must not be produced.
5. Dialogue or narration for other characters may be generated normally.
        `.trim();
        newImpersonationBlock = `${impersonationStartMarker}\n${rules}\n${impersonationEndMarker}`;
    }

    const finalContent = [newUserNoteBlock, newImpersonationBlock, newCharacterBlock, userTypedContent, newPersonaBlock].filter(Boolean).join('\n\n').trim();

    if (instructionTextArea.value !== finalContent) {
        instructionTextArea.value = finalContent;
        instructionTextArea.dispatchEvent(new Event('input', { bubbles: true }));
        instructionTextArea.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
  const debouncedApplyAllInstructions = debounce(applyAllInstructions, 150);

// --- ✨ [수정] 캐릭터 프롬프트 제거 함수 (교체 방식 적용) ---
  function clearCharacterPromptFromUI() {
    const instructionTextArea = document.querySelector('ms-system-instructions textarea');
    if (!instructionTextArea) return;

    // 마커 정의 (기존 코드와 동일하게 유지)
    const personaStartMarker = "--- [Reppley Persona Applied] ---", personaEndMarker = "--- [Reppley Persona End] ---";
    const noteStartMarker = "--- [Reppley User Note Applied] ---", noteEndMarker = "--- [Reppley User Note End] ---";
    const characterStartMarker = "--- [Reppley Character Prompt Applied] ---", characterEndMarker = "--- [Reppley Character Prompt End] ---";

    let currentContent = instructionTextArea.value;

    // 캐릭터 프롬프트 블록을 찾아 빈 문자열로 교체
    // 정규 표현식에서 마커의 특수 문자를 이스케이프 처리하고, 줄바꿈 문자(\n)를 포함하여 모든 공백 문자를 매치하도록 수정
    const regex = new RegExp(
        `${characterStartMarker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}[\\s\\S]*?${characterEndMarker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`,
        'g'
    );
    let updatedContent = currentContent.replace(regex, '');

    // 제거 후 양쪽 공백 및 불필요한 빈 줄 정리
    updatedContent = updatedContent.trim();
    // 연속된 줄바꿈을 정리하는 것은 그대로 유지
    updatedContent = updatedContent.replace(/\n{3,}/g, '\n\n');

    if (instructionTextArea.value !== updatedContent) {
        instructionTextArea.value = updatedContent;
        // UI 업데이트를 위해 input 이벤트 발생
        instructionTextArea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function keepSystemInstructionsOpen() {
    const sysInstructionsButton = document.querySelector('ms-system-instructions-panel button.system-instructions-card');
    if (!sysInstructionsButton || sysInstructionsButton.dataset.reppleyListenerAdded) return;

    sysInstructionsButton.dataset.reppleyListenerAdded = 'true';
    sysInstructionsButton.click();
    
    setTimeout(() => {
        debouncedApplyAllInstructions();
    }, 500);
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

// --- ✨ [수정] 캐릭터 액션 UI 생성 함수 (통합 비밀번호 모델 적용) ---
  function createCharacterActionUI() {
    if (document.getElementById('reppley-action-modal')) return;
    const modalHTML = `
      <div id="reppley-action-modal" class="action-modal-overlay">
        <div class="action-modal-panel">
          <button id="reppley-action-edit-btn">수정</button>
          <button id="reppley-action-play-btn">플레이</button>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('reppley-action-modal');
    const editBtn = document.getElementById('reppley-action-edit-btn');
    const playBtn = document.getElementById('reppley-action-play-btn');

    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    playBtn.addEventListener('click', async () => {
        const characterId = modal.dataset.characterId;
        if (!characterId) return;
        
        modal.style.display = 'none';

        try {
            const { data: character, error } = await supabase.from('characters').select('*').eq('id', characterId).single();
            if (error || !character) throw new Error('DB에서 캐릭터를 찾을 수 없습니다.');
            
            let decryptedPrompt;
            let passwordForCache = null;
            const promptData = JSON.parse(character.encrypted_prompt);

            if (character.is_public) {
                // ✨ [요청 1 해결] 공개 캐릭터는 비밀번호 없이 프롬프트를 바로 사용
                if (promptData.type === 'public') {
                    decryptedPrompt = promptData.prompt;
                } else {
                    throw new Error('공개 캐릭터 데이터 형식이 올바르지 않습니다.');
                }
            } else {
                // 비공개 캐릭터일 때만 플레이에 비밀번호가 필요
                const password = window.prompt("비공개 캐릭터입니다. 플레이하려면 비밀번호를 입력하세요.");
                if (!password) return;

                const tempDecrypted = await cryptoUtils.decryptData(password, promptData.data);
                
                if (tempDecrypted === null) {
                    alert('비밀번호가 틀렸습니다.');
                    return;
                }
                decryptedPrompt = tempDecrypted;
                passwordForCache = password;
            }

            if (passwordForCache) {
                let authCache = JSON.parse(sessionStorage.getItem('reppley_auth_cache')) || {};
                authCache[characterId] = passwordForCache;
                sessionStorage.setItem('reppley_auth_cache', JSON.stringify(authCache));
            }

            localStorage.setItem('reppley_current_character_id', character.id);
            sessionStorage.setItem('reppley_decrypted_prompt', decryptedPrompt);
            alert(`'${character.name}' 캐릭터의 플레이가 시작됩니다.`);
            renderCharacterList();
            applyAllInstructions();

        } catch (err) {
            console.error('플레이 준비 중 오류 발생:', err);
            alert(`플레이 준비 중 오류가 발생했습니다: ${err.message}`);
        }
    });

    editBtn.addEventListener('click', async () => {
         const characterId = modal.dataset.characterId;
        if (!characterId) return;
        
        modal.style.display = 'none';

        try {
            const { data: character, error } = await supabase.from('characters').select('*').eq('id', characterId).single();
            if (error || !character) throw new Error('DB에서 캐릭터를 찾을 수 없습니다.');

            let promptForEdit;
            const promptData = JSON.parse(character.encrypted_prompt);

            // ✨ [요청 2,3,4 해결] 수정 시에는 공개 여부와 상관없이 항상 비밀번호 요구
            const password = window.prompt("캐릭터를 수정하려면 비밀번호를 입력하세요.");
            if (!password) return;

            if (character.is_public) {
                const check = await cryptoUtils.decryptData(password, promptData.auth);
                if (check !== "REPPLEY_AUTH_CHECK") {
                    alert('비밀번호가 틀렸습니다.');
                    return;
                }
                promptForEdit = promptData.prompt;
            } else {
                 const decrypted = await cryptoUtils.decryptData(password, promptData.data);
                 if (decrypted === null) {
                     alert('비밀번호가 틀렸습니다.');
                     return;
                 }
                 promptForEdit = decrypted;
            }

            // 수정 창 열기
            const creatorModal = document.getElementById('reppley-character-creator-modal');
            creatorModal.querySelector('.title').textContent = '캐릭터 수정';
            creatorModal.querySelector('#reppley-creator-submit-btn').textContent = '캐릭터 저장';
            creatorModal.querySelector('#reppley-creator-delete-btn').style.display = 'block';

            document.getElementById('creator-image-url').value = character.image_url || '';
            document.getElementById('creator-name').value = character.name || '';
            document.getElementById('creator-description').value = character.description || '';
            document.getElementById('creator-is-public').value = String(character.is_public);
            document.getElementById('creator-prompt').value = promptForEdit;

            creatorModal.dataset.mode = 'edit';
            creatorModal.dataset.editId = characterId;
            creatorModal.dataset.originalIsPublic = String(character.is_public);
            creatorModal.dataset.editPassword = password; // 다음 저장을 위해 성공한 비밀번호 저장
            
            creatorModal.style.display = 'flex';

        } catch (err) {
            console.error('수정 준비 중 오류:', err);
            alert(`수정할 캐릭터 정보를 불러오는 중 오류가 발생했습니다: ${err.message}`);
        }
    });
  }
// --- ✨ [수정] 캐릭터 목록 UI 생성 함수 (비공개 캐릭터 찾기 기능 추가 및 전체 코드) ---
  function createCharacterListUI() {
    if (document.getElementById('reppley-character-modal')) return;
    const modalHTML = `
      <div id="reppley-character-modal" class="reppley-persona-modal-overlay">
        <div class="reppley-persona-modal-panel">
          <div class="reppley-persona-modal-header">
            <div class="title">캐릭터 목록</div>
            <div>
              <div id="reppley-find-private-btn" class="new-persona-btn" style="display: inline-block; margin-right: 16px;">🔍 비공개 캐릭터 찾기</div>
              <div id="reppley-create-character-btn" class="new-persona-btn" style="display: inline-block;">+ 만들기</div>
            </div>
          </div>
          <div class="reppley-persona-modal-body">
            <div style="padding: 0 0 16px 0;">
                <input type="search" id="reppley-character-search-input" placeholder="캐릭터 이름 또는 설명으로 검색..." style="width: 100%; padding: 10px; font-size: 14px; background-color: #282d33; border: 1px solid #5f6368; border-radius: 8px; color: #e8eaed;">
            </div>
            <div id="reppley-private-character-section" style="display: none;">
                <div class="reppley-persona-section-title">찾은 비공개 캐릭터</div>
                <div id="reppley-private-characters-container" class="character-grid-container"></div>
            </div>
            <div class="reppley-persona-section-title" style="margin-top: 24px;">공개 캐릭터</div>
            <div id="reppley-public-characters-container" class="character-grid-container"></div>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('reppley-character-modal');
    if (modal) {
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }

    const createBtn = document.getElementById('reppley-create-character-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        const creatorModal = document.getElementById('reppley-character-creator-modal');
        if (creatorModal) {
            // 생성 모드로 UI 초기화
             creatorModal.querySelector('.title').textContent = '캐릭터 생성';
             creatorModal.querySelector('#reppley-creator-submit-btn').textContent = '캐릭터 생성';
             creatorModal.querySelector('#reppley-creator-delete-btn').style.display = 'none';
             creatorModal.dataset.mode = 'create';
             delete creatorModal.dataset.editId;
             delete creatorModal.dataset.editPassword;
             delete creatorModal.dataset.originalIsPublic;
             document.getElementById('creator-image-url').value = '';
             document.getElementById('creator-name').value = '';
             document.getElementById('creator-description').value = '';
             document.getElementById('creator-prompt').value = '';
             document.getElementById('creator-is-public').value = 'false';
             creatorModal.style.display = 'flex';
        }
      });
    }

    const searchInput = document.getElementById('reppley-character-search-input');
    if (searchInput) { searchInput.addEventListener('input', debounce(renderCharacterList, 300)); }
    
    // 카드 클릭 이벤트 리스너
    const container = document.getElementById('reppley-character-modal');
    if(container) {
        container.addEventListener('click', (e) => {
            const card = e.target.closest('.character-card');
            if(!card) return;
            const characterId = card.dataset.id;
            const isPlaying = localStorage.getItem('reppley_current_character_id') === characterId;
            
            if (isPlaying) {
                if (confirm('이 캐릭터는 현재 플레이 중입니다. 플레이를 중지하시겠습니까?')) {
                    localStorage.removeItem('reppley_current_character_id');
                    sessionStorage.removeItem('reppley_decrypted_prompt');
                    sessionStorage.removeItem('reppley_auth_cache'); // 관련 캐시도 모두 삭제
                    alert('플레이가 중지되었습니다.');
                    renderCharacterList();
                    clearCharacterPromptFromUI();
                }
            } else {
                const actionModal = document.getElementById('reppley-action-modal');
                actionModal.dataset.characterId = characterId;
                actionModal.style.display = 'flex';
            }
        });
    }

    // --- 비공개 캐릭터 찾기 버튼 이벤트 리스너 ---
    const findPrivateBtn = document.getElementById('reppley-find-private-btn');
    if (findPrivateBtn) {
        findPrivateBtn.addEventListener('click', async () => {
            const characterName = window.prompt("찾으려는 비공개 캐릭터의 정확한 이름을 입력하세요.");
            if (!characterName) return;

            const password = window.prompt(`'${characterName}' 캐릭터의 비밀번호를 입력하세요.`);
            if (!password) return;

            try {
                // 1. 이름으로 비공개 캐릭터를 데이터베이스에서 조회
                const { data: character, error } = await supabase
                    .from('characters')
                    .select('*')
                    .eq('name', characterName.trim())
                    .eq('is_public', false)
                    .single();

                if (error || !character) {
                    alert('해당 이름의 비공개 캐릭터를 찾을 수 없습니다.');
                    return;
                }

                const promptData = JSON.parse(character.encrypted_prompt);
                let isPasswordCorrect = false;

                // 2. 비밀번호 검증
                if (promptData.type === 'private') {
                    const decrypted = await cryptoUtils.decryptData(password, promptData.data);
                    if (decrypted !== null) {
                        isPasswordCorrect = true;
                    }
                }
                
                if (!isPasswordCorrect) {
                    alert('비밀번호가 틀렸습니다.');
                    return;
                }

                // 3. 성공 시, 세션 스토리지에 찾은 캐릭터 추가
                let foundList = JSON.parse(sessionStorage.getItem('reppley_found_private_characters')) || [];
                
                // 중복 추가 방지
                if (!foundList.some(c => c.id === character.id)) {
                    foundList.push(character);
                    sessionStorage.setItem('reppley_found_private_characters', JSON.stringify(foundList));
                    alert(`'${character.name}' 캐릭터를 찾았습니다. '찾은 비공개 캐릭터' 목록에 추가합니다.`);
                } else {
                    alert(`'${character.name}' 캐릭터는 이미 목록에 있습니다.`);
                }
                
                // 비밀번호도 세션 캐시에 저장하여 바로 플레이 가능하게 함
                let authCache = JSON.parse(sessionStorage.getItem('reppley_auth_cache')) || {};
                authCache[character.id] = password;
                sessionStorage.setItem('reppley_auth_cache', JSON.stringify(authCache));

                // 4. UI 새로고침
                renderCharacterList();

            } catch (err) {
                console.error("비공개 캐릭터 찾기 오류:", err);
                alert(`캐릭터를 찾는 중 오류가 발생했습니다: ${err.message}`);
            }
        });
    }
  }

// --- ✨ [대폭 수정] 캐릭터 생성/수정 UI 함수 (탭 클릭 버그 수정 및 통합 비밀번호 모델) ---
  function createCharacterCreatorUI() {
    if (document.getElementById('reppley-character-creator-modal')) return;

    const modalHTML = `
    <div id="reppley-character-creator-modal" class="reppley-persona-modal-overlay">
      <div class="reppley-persona-modal-panel">
        <div class="reppley-persona-modal-header">
          <div class="title">캐릭터 생성</div>
        </div>
        <div class="creator-tabs">
          <div class="creator-tab active" data-tab="basic-info">기본 정보</div>
          <div class="creator-tab" data-tab="detailed-settings">상세 설정</div>
        </div>
        <div class="reppley-persona-modal-body">
            <div class="creator-scrollable-content">
                <div id="tab-basic-info" class="creator-tab-content active">
                    <div class="creator-form-section">
                        <label>메인 이미지 URL</label>
                        <input type="url" id="creator-image-url" placeholder="https://example.com/image.png">
                    </div>
                    <div class="creator-form-section">
                        <label class="required">이름</label>
                        <input type="text" id="creator-name" placeholder="이름을 입력하세요." maxlength="35">
                    </div>
                    <div class="creator-form-section">
                        <label class="required">캐릭터 소개말</label>
                        <textarea id="creator-description" placeholder="캐릭터에 대해 간략하게 소개해주세요." maxlength="4000"></textarea>
                    </div>
                    <div class="creator-form-section">
                        <label>플레이 시 비밀번호 요구</label>
                        <select id="creator-is-public">
                            <option value="true">아니오 (공개 플레이)</option>
                            <option value="false" selected>예 (비공개 플레이)</option>
                        </select>
                         <div class="description">캐릭터를 수정할 때는 공개 여부와 상관없이 항상 비밀번호가 필요합니다.</div>
                    </div>
                </div>
                <div id="tab-detailed-settings" class="creator-tab-content">
                    <div class="creator-form-section">
                        <label class="required">프롬프트</label>
                        <textarea id="creator-prompt" placeholder="캐릭터의 특징, 성격, 배경, 이야기 등을 작성해주세요." style="height: 400px;" maxlength="8000"></textarea>
                    </div>
                </div>
            </div>
            <div class="creator-bottom-bar">
              <button id="reppley-creator-delete-btn" style="display: none;">삭제</button>
              <button id="reppley-creator-submit-btn">캐릭터 생성</button>
            </div>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('reppley-character-creator-modal');
    const submitBtn = document.getElementById('reppley-creator-submit-btn');
    const deleteBtn = document.getElementById('reppley-creator-delete-btn');

    const resetToCreateMode = () => {
        modal.querySelector('.title').textContent = '캐릭터 생성';
        submitBtn.textContent = '캐릭터 생성';
        deleteBtn.style.display = 'none';
        modal.dataset.mode = 'create';
        delete modal.dataset.editId;
        delete modal.dataset.editPassword;
        delete modal.dataset.originalIsPublic;
        document.getElementById('creator-image-url').value = '';
        document.getElementById('creator-name').value = '';
        document.getElementById('creator-description').value = '';
        document.getElementById('creator-prompt').value = '';
        document.getElementById('creator-is-public').value = 'false';
        modal.querySelectorAll('.creator-tab').forEach(t => t.classList.remove('active'));
        modal.querySelector('.creator-tab[data-tab="basic-info"]').classList.add('active');
        modal.querySelectorAll('.creator-tab-content').forEach(c => c.classList.remove('active'));
        modal.querySelector('#tab-basic-info').classList.add('active');
    };
    
    modal.addEventListener('click', (e) => { if (e.target === modal) { modal.style.display = 'none'; resetToCreateMode(); }});
    
    // --- ✨ [버그 수정] 누락되었던 탭 클릭 이벤트 로직 ---
    modal.querySelectorAll('.creator-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            modal.querySelectorAll('.creator-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            modal.querySelectorAll('.creator-tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });

    submitBtn.addEventListener('click', async () => {
        const name = document.getElementById('creator-name').value.trim();
        const description = document.getElementById('creator-description').value.trim();
        const promptText = document.getElementById('creator-prompt').value.trim();
        const newIsPublic = document.getElementById('creator-is-public').value === 'true';
        const mode = modal.dataset.mode || 'create';

        if (!name || !description || !promptText) {
            alert('필수 항목(이름, 소개말, 프롬프트)을 모두 입력해주세요.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = '저장 중...';

        try {
            let finalPromptData;
            let password;
            const originalIsPublic = modal.dataset.originalIsPublic === 'true';

            if (mode === 'create') {
                password = window.prompt("⚠️ 중요: 캐릭터를 보호할 비밀번호를 설정하세요.\n이 비밀번호는 수정 시 항상 필요하며, 복구할 수 없습니다.");
                if (!password) throw new Error("Password not provided");
            } else { // 수정 모드
                const statusChanged = originalIsPublic !== newIsPublic;
                const oldPassword = modal.dataset.editPassword;
                
                if (statusChanged) { // 공개 <-> 비공개 전환 시
                    const promptForNewPassword = newIsPublic ? `캐릭터를 '공개 플레이'로 전환합니다.\n수정용 새 비밀번호를 설정하세요. (기존 비밀번호: ${oldPassword})` : `캐릭터를 '비공개 플레이'로 전환합니다.\n플레이/수정용 새 비밀번호를 설정하세요. (기존 비밀번호: ${oldPassword})`;
                    password = window.prompt(promptForNewPassword);
                } else { // 상태 유지 시
                    const promptForPasswordChange = `새 비밀번호를 설정하려면 입력하세요.\n비워두면 기존 비밀번호 '${oldPassword}'를 유지합니다.`;
                    password = window.prompt(promptForPasswordChange) || oldPassword;
                }
                if (!password) throw new Error("Password not provided");
            }

            if (newIsPublic) {
                finalPromptData = JSON.stringify({
                    "type": "public",
                    "prompt": promptText,
                    "auth": await cryptoUtils.encryptData(password, "REPPLEY_AUTH_CHECK")
                });
            } else {
                finalPromptData = JSON.stringify({
                    "type": "private",
                    "data": await cryptoUtils.encryptData(password, promptText)
                });
            }

            const characterData = { name, description, image_url: document.getElementById('creator-image-url').value.trim(), is_public: newIsPublic, encrypted_prompt: finalPromptData };

            if (mode === 'create') {
                const { error } = await supabase.from('characters').insert([characterData]);
                if (error) throw error;
                alert('캐릭터가 성공적으로 생성되었습니다!');
            } else {
                const characterId = modal.dataset.editId;
                const { error } = await supabase.from('characters').update(characterData).eq('id', characterId);
                if (error) throw error;
                alert('캐릭터가 성공적으로 수정되었습니다!');
            }

            modal.style.display = 'none';
            resetToCreateMode();
            renderCharacterList();

        } catch (error) {
            if (error.message !== "Password not provided") { console.error('캐릭터 저장 오류:', error); alert(`캐릭터 저장 중 오류가 발생했습니다: ${error.message}`); }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = mode === 'edit' ? '캐릭터 저장' : '생성하기';
        }
    });
    // --- ✨ [신규] 삭제 버튼 클릭 이벤트 리스너 ---
    deleteBtn.addEventListener('click', async () => {
        const characterId = modal.dataset.editId;
        if (!characterId) {
            alert('삭제할 캐릭터 정보가 없습니다.');
            return;
        }

        if (!confirm('정말로 이 캐릭터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
            return;
        }

        deleteBtn.disabled = true;
        submitBtn.disabled = true;

        try {
            const { error } = await supabase.from('characters').delete().eq('id', characterId);
            if (error) throw error;
            alert('캐릭터가 성공적으로 삭제되었습니다.');
            modal.style.display = 'none';
            resetToCreateMode();
            renderCharacterList();
        } catch (error) {
            console.error('캐릭터 삭제 오류:', error);
            alert(`캐릭터 삭제 중 오류가 발생했습니다: ${error.message}`);
        } finally {
            deleteBtn.disabled = false;
            submitBtn.disabled = false;
        }
    });
  }

 // --- ✨ [수정] Supabase 연동 캐릭터 목록 렌더링 함수 (이미지 표시 오류 수정) ---
  async function renderCharacterList() {
    if (!supabase) {
      alert("Supabase 클라이언트가 아직 초기화되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const publicContainer = document.getElementById('reppley-public-characters-container');
    const privateContainer = document.getElementById('reppley-private-characters-container');
    const privateSection = document.getElementById('reppley-private-character-section');
    const searchInput = document.getElementById('reppley-character-search-input');

    if (!publicContainer || !privateContainer || !searchInput || !privateSection) return;

    const searchTerm = searchInput.value.toLowerCase();
    publicContainer.innerHTML = '<p class="loading-message">캐릭터를 불러오는 중...</p>';
    
    const playingCharacterId = localStorage.getItem('reppley_current_character_id');

    const createCharacterCardHTML = (char) => {
      const isPlayingClass = String(char.id) === playingCharacterId ? 'is-playing' : '';
      const playingIndicator = isPlayingClass ? '<div class="playing-indicator">▶ 플레이 중</div>' : '';
      
      // ✨ [버그 수정] 이미지 URL이 비어 있거나 공백일 경우를 확실하게 처리하여 대체 이미지가 나오도록 수정
      const imageUrl = (char.image_url && char.image_url.trim()) ? char.image_url : 'https://via.placeholder.com/150';
      
      return `
      <div class="character-card ${isPlayingClass}" data-id="${char.id}" title="${char.name}\n${char.description}">
        <div class="character-card-image-wrapper">
          ${playingIndicator}
          <img src="${imageUrl}" alt="${char.name}" class="character-card-image" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/150';">
        </div>
        <div class="character-card-content">
          <div class="character-card-name">${char.name}</div>
          <div class="character-card-description">${char.description || ' '}</div>
        </div>
      </div>`;
    }

    // 1. 찾은 비공개 캐릭터 렌더링
    const foundList = JSON.parse(sessionStorage.getItem('reppley_found_private_characters')) || [];
    privateContainer.innerHTML = '';
    if (foundList.length > 0) {
        foundList
          .filter(char => (char.name && char.name.toLowerCase().includes(searchTerm)) || (char.description && char.description.toLowerCase().includes(searchTerm)))
          .forEach(char => privateContainer.innerHTML += createCharacterCardHTML(char));
        privateSection.style.display = 'block';
    } else {
        privateSection.style.display = 'none';
    }


    // 2. 공개 캐릭터 렌더링
    try {
      let query = supabase.from('characters').select('*').eq('is_public', true);
      if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      query = query.order('created_at', { ascending: false });

      const { data: publicCharacters, error } = await query;
      if (error) throw error;
      
      sessionStorage.setItem('reppley_public_characters', JSON.stringify(publicCharacters));

      publicContainer.innerHTML = '';
      if (publicCharacters.length > 0) {
        publicCharacters.forEach(char => publicContainer.innerHTML += createCharacterCardHTML(char));
      } else {
        publicContainer.innerHTML = `<p class="loading-message">${searchTerm ? '검색 결과가 없습니다.' : '공개된 캐릭터가 없습니다.'}</p>`;
      }

    } catch (error) {
      console.error('Error fetching public characters:', error.message);
      publicContainer.innerHTML = `<p class="loading-message" style="color: #f28b82;">공개 캐릭터를 불러오는 중 오류가 발생했습니다.</p>`;
    }
  }
// --- ✨ [신규] 페이지 로드 시 활성 캐릭터 프롬프트를 자동으로 준비하는 함수 ---
  async function ensureCharacterPromptIsReady() {
    const activeCharacterId = localStorage.getItem('reppley_current_character_id');
    const hasDecryptedPrompt = sessionStorage.getItem('reppley_decrypted_prompt');

    // 활성 캐릭터가 지정되어 있지만, 세션에 복호화된 프롬프트가 없는 경우 (페이지 새로고침 등)
    if (activeCharacterId && !hasDecryptedPrompt) {
      console.log("Reppley: 활성 캐릭터 감지, 프롬프트 복호화를 위해 비밀번호를 요청합니다.");

      // Supabase 클라이언트가 준비될 때까지 잠시 대기
      if (!supabase) {
        console.warn("Reppley: Supabase 클라이언트가 준비되지 않았습니다. 1초 후 재시도합니다.");
        setTimeout(ensureCharacterPromptIsReady, 1000);
        return;
      }

      const password = window.prompt("현재 플레이 중인 캐릭터의 프롬프트를 자동으로 적용하려면 암호화 비밀번호를 입력하세요.");
      
      if (!password) {
        alert("비밀번호가 입력되지 않아 캐릭터 자동 적용이 취소되었습니다. 플레이를 중지합니다.");
        localStorage.removeItem('reppley_current_character_id');
        clearCharacterPromptFromUI();
        return;
      }

      try {
        const { data: character, error } = await supabase
          .from('characters')
          .select('encrypted_prompt, name')
          .eq('id', activeCharacterId)
          .single();

        if (error) throw error;
        if (!character || !character.encrypted_prompt) {
          throw new Error('캐릭터 데이터를 찾을 수 없거나 암호화된 프롬프트가 없습니다.');
        }

        const decryptedPrompt = await cryptoUtils.decryptData(password, character.encrypted_prompt);

        if (decryptedPrompt === null) {
          alert('비밀번호가 틀렸습니다. 캐릭터 플레이를 중지합니다.');
          localStorage.removeItem('reppley_current_character_id');
          clearCharacterPromptFromUI();
          return;
        }

        // 성공 시 세션 스토리지에 저장하고 즉시 UI에 적용
        sessionStorage.setItem('reppley_decrypted_prompt', decryptedPrompt);
        console.log(`Reppley: '${character.name}' 캐릭터 프롬프트 복호화 성공. 시스템 지침에 적용합니다.`);
        debouncedApplyAllInstructions();

      } catch (err) {
        console.error('캐릭터 프롬프트 자동 로드 중 오류 발생:', err);
        alert('캐릭터 프롬프트를 불러오는 중 오류가 발생했습니다. 플레이를 중지합니다.');
        localStorage.removeItem('reppley_current_character_id');
        clearCharacterPromptFromUI();
      }
    } else if (activeCharacterId && hasDecryptedPrompt) {
      // 세션이 이미 유효한 경우, 바로 UI에 적용
       console.log("Reppley: 활성 캐릭터와 복호화된 프롬프트가 준비되었습니다. 시스템 지침에 적용합니다.");
       debouncedApplyAllInstructions();
    }
  }

  // --- ✨ [수정] injectCustomButtons 함수 ---
  function injectCustomButtons(settingsContent) {
    if (document.getElementById('reppley-character-list-container')) return; // 캐릭터 버튼이 이미 있으면 중단
    const originalModelSelector = settingsContent.querySelector('.settings-model-selector');
    if (!originalModelSelector) return;
    
    // 유저 노트 버튼 생성 (기존과 동일)
    if(!document.getElementById('reppley-note-settings-container')){
        const noteClone = originalModelSelector.cloneNode(true);
        noteClone.id = 'reppley-note-settings-container';
        const noteButton = noteClone.querySelector('button.model-selector-card');
        if (noteButton) { const spans = noteButton.querySelectorAll('span'); if (spans.length >= 3) { spans[0].textContent = '유저 노트'; spans[1].textContent = 'AI가 기억해야 할 최우선 지침을 설정합니다.'; spans[2].textContent = '이 노트는 프롬프트의 맨 위에 추가됩니다.'; } noteButton.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const modal = document.getElementById('reppley-note-modal'); const textarea = document.getElementById('reppley-note-textarea'); if (modal && textarea) { textarea.value = getNote(); modal.style.display = 'flex'; } }); }
        const noteRightPanel = noteClone.querySelector('ms-sliding-right-panel'); if (noteRightPanel) noteRightPanel.remove();
        settingsContent.prepend(noteClone);
    }

    // 페르소나 설정 버튼 생성 (기존과 동일)
    if(!document.getElementById('reppley-persona-settings-container')){
        const personaClone = originalModelSelector.cloneNode(true);
        personaClone.id = 'reppley-persona-settings-container';
        const personaButton = personaClone.querySelector('button.model-selector-card');
        if (personaButton) { const spans = personaButton.querySelectorAll('span'); if (spans.length >= 3) { spans[0].textContent = '페르소나 설정'; spans[1].textContent = '저장된 페르소나를 불러오거나 수정합니다.'; spans[2].textContent = '클릭하여 페르소나 관리 창을 엽니다.'; } personaButton.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); const modal = document.getElementById('reppley-persona-modal'); if (modal) { modal.style.display = 'flex'; renderPersonaList(); } }); }
        const personaRightPanel = personaClone.querySelector('ms-sliding-right-panel'); if (personaRightPanel) personaRightPanel.remove();
        document.getElementById('reppley-note-settings-container').parentNode.insertBefore(personaClone, document.getElementById('reppley-note-settings-container').nextSibling);
    }
    
    // --- 유저 사칭 방지 토글 버튼 생성 ---
    if(!document.getElementById('reppley-impersonation-toggle-container')){
        const toggleClone = settingsContent.querySelector('.settings-model-selector').cloneNode(true);
        toggleClone.id = 'reppley-impersonation-toggle-container';
        const toggleButton = toggleClone.querySelector('button.model-selector-card');
        
        const updateToggleButtonUI = () => {
            if (!toggleButton) return;
            const isEnabled = getImpersonationLockState();
            const statusSpan = toggleButton.querySelector('.toggle-status');
            if (isEnabled) {
                toggleButton.classList.add('is-active');
                if (statusSpan) statusSpan.textContent = 'ON';
            } else {
                toggleButton.classList.remove('is-active');
                if (statusSpan) statusSpan.textContent = 'OFF';
            }
        };
        
        if (toggleButton) {
            const spans = toggleButton.querySelectorAll('span');
            if (spans.length >= 3) {
                spans[0].innerHTML = '유저 사칭 방지 <span class="toggle-status"></span>';
                spans[1].textContent = 'AI가 현재 페르소나를 사칭하여 말하는 것을 금지합니다.';
                spans[2].textContent = '클릭하여 ON/OFF 할 수 있습니다.';
            }
            toggleButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentState = getImpersonationLockState();
                saveImpersonationLockState(!currentState);
                updateToggleButtonUI();
                applyAllInstructions(); // ✨ [핵심 수정] debounce 없는 즉시 적용 함수로 변경
            });
        }
        const toggleRightPanel = toggleClone.querySelector('ms-sliding-right-panel'); if (toggleRightPanel) toggleRightPanel.remove();
        
        const noteContainer = document.getElementById('reppley-note-settings-container');
        if (noteContainer) {
            noteContainer.parentNode.insertBefore(toggleClone, noteContainer.nextSibling);
            updateToggleButtonUI();
        }
    }

    // 캐릭터 목록 버튼 생성
    const characterListClone = originalModelSelector.cloneNode(true);
    characterListClone.id = 'reppley-character-list-container';
    const characterListButton = characterListClone.querySelector('button.model-selector-card');
    if (characterListButton) {
      const spans = characterListButton.querySelectorAll('span');
      if (spans.length >= 3) {
        spans[0].textContent = '캐릭터 목록';
        spans[1].textContent = '다양한 캐릭터 설정을 불러옵니다.';
        spans[2].textContent = '클릭하여 캐릭터 목록을 엽니다.';
      }
      characterListButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const modal = document.getElementById('reppley-character-modal');
        if (modal) {
          renderCharacterList(); // Supabase에서 데이터를 비동기로 불러옴
          modal.style.display = 'flex';
        }
      });
    }
    const characterListRightPanel = characterListClone.querySelector('ms-sliding-right-panel');
    if (characterListRightPanel) characterListRightPanel.remove();
    document.getElementById('reppley-persona-settings-container').parentNode.insertBefore(characterListClone, document.getElementById('reppley-persona-settings-container').nextSibling);
  }

  function processThoughtChunk(chunk) { if (chunk.dataset.processed) return; chunk.dataset.processed = 'true'; const panel = chunk.querySelector('.mat-expansion-panel'); const originalHeader = chunk.querySelector('.mat-expansion-panel-header'); const contentWrapper = chunk.querySelector('.mat-expansion-panel-content-wrapper'); if (!panel || !originalHeader || !contentWrapper) return; const wrapper = document.createElement('div'); wrapper.className = 'thought-wrapper'; chunk.parentNode.insertBefore(wrapper, chunk); const customHeader = document.createElement('div'); customHeader.className = 'custom-thought-accordion thinking'; customHeader.innerHTML = `<span class="material-symbols-outlined icon"></span><span class="text">생각 중</span><span class="material-symbols-outlined chevron">expand_more</span>`; wrapper.appendChild(customHeader); wrapper.appendChild(chunk); customHeader.addEventListener('click', () => originalHeader.click()); const statusObserver = new MutationObserver(() => { const inProgressIcon = chunk.querySelector('.thinking-progress-icon.in-progress'); if (!inProgressIcon && customHeader.classList.contains('thinking')) { customHeader.classList.remove('thinking'); customHeader.classList.add('complete'); customHeader.querySelector('.icon').textContent = 'check_circle'; customHeader.querySelector('.text').textContent = '생각 완료'; } const isExpanded = panel.classList.contains('mat-expanded'); customHeader.classList.toggle('expanded', isExpanded); contentWrapper.classList.toggle('expanded', isExpanded); }); statusObserver.observe(panel, { attributes: true, subtree: true, attributeFilter: ['class'] }); }
  
  function processChatTurn(turn) {
    const transformParagraphs = (container) => {
      container.querySelectorAll('p:not([data-processed="true"])').forEach(p => {
        p.dataset.processed = 'true';
        const textContent = p.textContent.trim();
        if (p.querySelector('span[style*="font-style: italic"]')) { const box = document.createElement('div'); box.className = 'narration-message'; box.textContent = textContent; p.replaceWith(box); return; }
        const dialogueMatch = textContent.match(/^([^:]+):\s*"([^"]+)"$/);
        if (dialogueMatch) { const box = document.createElement('div'); box.className = 'dialogue-message'; box.innerHTML = `<span class="speaker-name">${dialogueMatch[1].trim()}:</span><span class="speaker-quote">"${dialogueMatch[2]}"</span>`; p.replaceWith(box); return; }
        if (textContent.startsWith('"') && textContent.endsWith('"')) { const box = document.createElement('div'); box.className = 'quote-message'; box.textContent = textContent; p.replaceWith(box); }
      });
    };
    const observer = new MutationObserver(() => transformParagraphs(turn));
    observer.observe(turn, { childList: true, subtree: true });
    transformParagraphs(turn);
  }

  // --- 스크립트 메인 실행 로직 ---

  createAdvancedPersonaUI();
  createNoteUI();
  createCharacterListUI();
  createCharacterCreatorUI();
  createCharacterActionUI();
  
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
        if (settingsContent) injectCustomButtons(settingsContent);
        
        const sysInstructionsPanel = node.matches('ms-system-instructions-panel') ? node : node.querySelector('ms-system-instructions-panel');
        if (sysInstructionsPanel && !sysInstructionsPanel.dataset.reppleyInitialized) {
            sysInstructionsPanel.dataset.reppleyInitialized = 'true';
            keepSystemInstructionsOpen();
            // ✨ [추가] 페이지 로드 시 캐릭터 프롬프트를 자동으로 준비하고 적용하는 함수 호출
            ensureCharacterPromptIsReady();
        }
      });
    });
  });
  mainObserver.observe(document.body, { childList: true, subtree: true });
// --- ✨ [수정] 메인 이벤트 리스너 (전송 버튼 클릭 시 세션 유지하도록 로직 변경) ---
  document.body.addEventListener('click', (event) => {
    // 1. 생각 펼치기/접기 버튼 로직 (기존과 동일)
    const thoughtHeader = event.target.closest('.custom-thought-accordion.complete');
    if (thoughtHeader) {
        // 이 부분은 현재 요청과 관련 없지만 기존 기능을 유지하기 위해 남겨둡니다.
    }

    // 2. 메시지 전송("Run") 버튼 로직
    const runButton = event.target.closest('ms-run-button button[type="submit"]');
    if (runButton && !runButton.disabled) {
        // 생각 완료된 내역 제거 (기존 기능)
        document.querySelectorAll('.custom-thought-accordion.complete').forEach(header => header.closest('.thought-wrapper')?.remove());

        // 캐릭터 프롬프트가 있다면 시스템 지침에 먼저 다시 적용합니다.
        if (localStorage.getItem('reppley_current_character_id')) {
            applyAllInstructions(); // 페르소나, 유저 노트, 캐릭터 프롬프트를 모두 다시 적용
        }

        // 0.1초 후, UI에서만 캐릭터 프롬프트를 제거합니다.
        // 세션 스토리지에 저장된 프롬프트는 다음 전송을 위해 유지됩니다.
        setTimeout(() => {
            // sessionStorage.removeItem('reppley_decrypted_prompt'); // 세션 유지를 위해 이 줄을 제거합니다.
            clearCharacterPromptFromUI();
            console.log("Reppley: Decrypted prompt has been cleared from UI, but kept in session storage for next turn.");
        }, 100);
    }
  }, true); // 캡처링 단계에서 이벤트를 감지하기 위해 true 설정

  console.log("Reppley 1.2 Start");
})();
