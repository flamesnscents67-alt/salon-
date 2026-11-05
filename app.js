const C = window.SALON_CONFIG;
const live = C.SUPABASE_URL && !C.SUPABASE_URL.includes("YOUR_") && window.supabase;
const sb = live ? supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;
const LS = (k, v) => v === undefined ? JSON.parse(localStorage.getItem(k) || "null") : localStorage.setItem(k, JSON.stringify(v));
const PHOTOS = {"haircut": "1634449571010-02389ed0f9b0", "colour": "1595475884562-073c30d45670", "blowdry": "1580618672591-eb180b1a973f", "manicure": "1519014816548-bf5fe059798b", "pedicure": "1658492055212-e1acbccfca5a", "facial": "1570172619644-dfd03ed5d881", "makeup": "1589710751893-f9a6770ad71b", "bridal": "1774660810725-fb04e002003d", "hero": "1761839256840-7780a45b85dc"}; // free Unsplash photos (Unsplash License)
const img = n => `https://images.unsplash.com/photo-${PHOTOS[n]}?auto=format&fit=crop&w=900&q=70`;
const SEED = [
  {id:1,name:"Signature Haircut & Style",description:"Consultation, wash, precision cut and a bouncy blow-dry.",price:2500,sale_price:null,duration:60,popular:true,active:true,image_url:img("haircut")},
  {id:2,name:"Hair Colour & Gloss",description:"Soft balayage, all-over colour or a shine-boosting gloss.",price:7500,sale_price:6500,duration:150,popular:true,active:true,image_url:img("colour")},
  {id:3,name:"Blow-Dry & Curls",description:"Silky straight, beachy waves or glam curls for any day.",price:1800,sale_price:null,duration:45,popular:false,active:true,image_url:img("blowdry")},
  {id:4,name:"Gel Manicure",description:"Shape, cuticle care and long-wear gel in your shade.",price:2200,sale_price:null,duration:50,popular:true,active:true,image_url:img("manicure")},
  {id:5,name:"Spa Pedicure",description:"Warm soak, scrub, massage and polish for happy feet.",price:2800,sale_price:2400,duration:60,popular:false,active:true,image_url:img("pedicure")},
  {id:6,name:"Glow Facial",description:"Deep cleanse, exfoliation and a hydrating mask.",price:4000,sale_price:null,duration:60,popular:false,active:true,image_url:img("facial")},
  {id:7,name:"Party Makeup",description:"Soft glam or full glam, lashes included.",price:6000,sale_price:null,duration:75,popular:false,active:true,image_url:img("makeup")},
  {id:8,name:"Bridal Package",description:"Makeup, hair styling and draping for your big day.",price:35000,sale_price:null,duration:240,popular:false,active:true,image_url:img("bridal")}
];
const eff = s => s.sale_price && +s.sale_price < +s.price ? +s.sale_price : +s.price;
const money = n => `${C.currency} ${Number(n).toLocaleString()}`;
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const API = {
  async services(all) {
    if (live) { let q = sb.from("services").select("*").order("id"); if (!all) q = q.eq("active", true); const {data} = await q; return data || []; }
    let s = LS("services"); if (!s) { s = SEED; LS("services", s); } return all ? s : s.filter(x => x.active);
  },
  async saveService(s) {
    if (live) { const {error} = s.id ? await sb.from("services").update(s).eq("id", s.id) : await sb.from("services").insert(s); if (error) throw error; return; }
    const list = await API.services(true);
    if (s.id) Object.assign(list.find(x => x.id == s.id), s); else list.push({...s, id: Date.now()});
    LS("services", list);
  },
  async deleteService(id) {
    if (live) { await sb.from("services").delete().eq("id", id); return; }
    LS("services", (await API.services(true)).filter(x => x.id != id));
  },
  async taken(date) {
    if (live) { const {data} = await sb.rpc("taken_slots", {d: date}); return (data || []).map(t => String(t).slice(0, 5)); }
    return (LS("bookings") || []).filter(b => b.date === date).map(b => b.time);
  },
  async book(b) {
    if (live) { const {error} = await sb.from("bookings").insert(b); if (error) throw error; return; }
    const l = LS("bookings") || []; l.push({...b, id: Date.now(), created_at: new Date().toISOString()}); LS("bookings", l);
  },
  async bookings() {
    if (live) { const {data} = await sb.from("bookings").select("*").order("date", {ascending: false}); return data || []; }
    return LS("bookings") || [];
  },
  async login(email, pw) {
    if (live) { const {error} = await sb.auth.signInWithPassword({email, password: pw}); return !error; }
    if (pw === C.demoAdminPassword) { sessionStorage.setItem("adm", "1"); return true; } return false;
  },
  async isAdmin() { if (live) { const {data} = await sb.auth.getSession(); return !!data.session; } return sessionStorage.getItem("adm") === "1"; },
  async logout() { if (live) await sb.auth.signOut(); sessionStorage.removeItem("adm"); }
};

function priceHTML(s) { return s.sale_price && +s.sale_price < +s.price ? `<span class="was">${money(s.price)}</span> <b>${money(s.sale_price)}</b>` : `<b>${money(s.price)}</b>`; }
function cardHTML(s, pick) {
  const sale = s.sale_price && +s.sale_price < +s.price;
  return `<article class="card${pick ? " pick" : ""}" data-id="${s.id}" ${pick ? 'tabindex="0" role="checkbox" aria-checked="false"' : ""}>
    <div class="ph"><img src="${esc(s.image_url)}" alt="${esc(s.name)}" loading="lazy" onerror="this.remove()">
      ${s.popular ? '<span class="tag">Popular</span>' : ""}${sale ? '<span class="tag sale">Sale</span>' : ""}</div>
    <div class="cb"><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p>
      <div class="meta"><span>${priceHTML(s)}</span><span class="dur">${s.duration} min</span></div></div></article>`;
}
function layout(active) {
  const links = [["index.html","Home"],["services.html","Services"],["book.html","Book"]];
  document.body.insertAdjacentHTML("afterbegin", `<header class="nav"><a class="logo" href="index.html">${esc(C.name)}</a>
    <nav>${links.map(l => `<a href="${l[0]}" class="${l[0] === active ? "on" : ""}">${l[1]}</a>`).join("")}<a class="btn sm" href="book.html">Book now</a></nav></header>`);
  document.body.insertAdjacentHTML("beforeend", `<footer><div><b>${esc(C.name)}</b><p>${esc(C.tagline)}</p></div>
    <div><p>${esc(C.address)}</p><p>${esc(C.phone)} · ${esc(C.hours)}</p></div><div><a href="admin.html">Owner login</a></div></footer>`);
}
