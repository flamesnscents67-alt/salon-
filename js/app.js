const C = window.SALON_CONFIG;
const live = !C.showcase && C.SUPABASE_URL && !C.SUPABASE_URL.includes("YOUR_") && window.supabase;
const sb = live ? supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;
const LS = (k, v) => v === undefined ? JSON.parse(localStorage.getItem(k) || "null") : localStorage.setItem(k, JSON.stringify(v));
const PHOTOS = {"haircut": "1634449571010-02389ed0f9b0", "colour": "1595475884562-073c30d45670", "blowdry": "1580618672591-eb180b1a973f", "manicure": "1519014816548-bf5fe059798b", "pedicure": "1658492055212-e1acbccfca5a", "facial": "1570172619644-dfd03ed5d881", "lash": "1589710751893-f9a6770ad71b", "bridal": "1774660810725-fb04e002003d", "hero": "1761839256840-7780a45b85dc", "party": "1581182815808-b6eb627a8798", "nailart": "1604654894610-df63bc536371", "massage": "1643684391140-c5056cfd3436", "skincare": "1552693673-1bf958298935"}; // free Unsplash photos (Unsplash License)
const img = n => `https://images.unsplash.com/photo-${PHOTOS[n]}?auto=format&fit=crop&w=900&q=70`;
const S = (id, name, description, price, sale_price, duration, popular, p) => ({id, name, description, price, sale_price, duration, popular, active: true, image_url: img(p)});
const SEED = [
  S(1,"Signature Haircut & Style","Consultation, wash, precision cut and a bouncy blow-dry.",2500,null,60,true,"haircut"),
  S(2,"Hair Colour & Gloss","Soft balayage, all-over colour or a shine-boosting gloss.",7500,6500,150,true,"colour"),
  S(3,"Blow-Dry & Curls","Silky straight, beachy waves or glam curls for any day.",1800,null,45,false,"blowdry"),
  S(4,"Gel Manicure","Shape, cuticle care and long-wear gel in your shade.",2200,null,50,true,"manicure"),
  S(5,"Nail Art Design","Hand-painted designs, chrome, glitter and tiny charms.",3200,null,75,false,"nailart"),
  S(6,"Spa Pedicure","Warm soak, scrub, massage and polish for happy feet.",2800,2400,60,false,"pedicure"),
  S(7,"Glow Facial","Deep cleanse, exfoliation and a hydrating mask.",4000,null,60,true,"facial"),
  S(8,"Skin Care Ritual","A tailored routine with serum, mask and SPF finish.",4800,null,70,false,"skincare"),
  S(9,"Relaxing Face Massage","Lymphatic massage to release tension and brighten skin.",2000,null,30,false,"massage"),
  S(10,"Lash Extensions","Classic or volume lashes for a wide-awake look.",5500,null,90,false,"lash"),
  S(11,"Party Makeup","Soft glam or full glam, lashes included.",6000,null,75,false,"party"),
  S(12,"Bridal Package","Makeup, hair styling and draping for your big day.",35000,null,240,false,"bridal")
];
function seedDemo() {
  if (live || LS("seeded2")) return;
  const d = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const rows = [["Ayesha Khan","Gel Manicure",2200,0,"11:00"],["Hira Malik","Signature Haircut & Style",2500,0,"14:00"],["Sana Rauf","Hair Colour & Gloss",6500,1,"10:00"],["Mahnoor Ali","Glow Facial",4000,1,"15:00"],["Zainab Tariq","Party Makeup",6000,2,"17:00"],["Fatima Noor","Spa Pedicure",2400,2,"12:00"],["Maryam Shah","Bridal Package",35000,3,"10:00"],["Areeba Imran","Blow-Dry & Curls",1800,4,"16:00"],["Noor Fatima","Gel Manicure",2200,4,"13:00"],["Iqra Saeed","Signature Haircut & Style",2500,5,"11:00"]];
  LS("bookings", rows.map((r, i) => ({id: i + 1, name: r[0], email: r[0].split(" ")[0].toLowerCase() + "@example.com", phone: "+92 300 12345" + (10 + i), notes: "", date: d(r[3]), time: r[4], services: [r[1]], total: r[2], created_at: new Date().toISOString()})));
  LS("seeded2", 1);
}
seedDemo();
function activity() {
  const n = ["Ayesha","Hira","Sana","Mahnoor","Zainab","Fatima","Maryam","Areeba","Noor","Iqra"], s = ["a Gel Manicure","a Signature Haircut","a Glow Facial","Party Makeup","a Blow-Dry & Curls","Hair Colour & Gloss","a Spa Pedicure"];
  const t = document.createElement("div"); t.className = "toast"; t.setAttribute("aria-live", "polite"); document.body.append(t);
  const show = () => { t.innerHTML = `<b>${n[Math.random() * n.length | 0]}</b> just booked ${s[Math.random() * s.length | 0]}<small>${1 + (Math.random() * 14 | 0)} min ago</small>`; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 5000); };
  setTimeout(show, 3500); setInterval(show, 13000);
}
const eff = s => s.sale_price && +s.sale_price < +s.price ? +s.sale_price : +s.price;
const money = n => `${C.currency} ${Number(n).toLocaleString()}`;
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

const API = {
  async services(all) {
    if (live) { let q = sb.from("services").select("*").order("id"); if (!all) q = q.eq("active", true); const {data} = await q; return data || []; }
    let s = LS("services2"); if (!s) { s = SEED; LS("services2", s); } return all ? s : s.filter(x => x.active);
  },
  async saveService(s) {
    if (live) { const {error} = s.id ? await sb.from("services").update(s).eq("id", s.id) : await sb.from("services").insert(s); if (error) throw error; return; }
    const list = await API.services(true);
    if (s.id) Object.assign(list.find(x => x.id == s.id), s); else list.push({...s, id: Date.now()});
    LS("services2", list);
  },
  async deleteService(id) {
    if (live) { await sb.from("services").delete().eq("id", id); return; }
    LS("services2", (await API.services(true)).filter(x => x.id != id));
  },
  async taken(date) {
    if (live) { const {data} = await sb.rpc("taken_slots", {d: date}); return (data || []).map(t => String(t).slice(0, 5)); }
    const h = [...date].reduce((x, ch) => (x * 31 + ch.charCodeAt(0)) >>> 0, 7), fake = [];
    for (let t = C.openHour; t <= C.closeHour; t++) if ((h >> t) % 3 === 0) fake.push(String(t).padStart(2, "0") + ":00");
    return [...new Set([...fake, ...(LS("bookings") || []).filter(b => b.date === date).map(b => b.time)])];
  },
  async book(b) {
    if (live) { const {error} = await sb.from("bookings").insert(b); if (error) throw error; return; }
    const l = LS("bookings") || []; l.push({...b, id: Date.now(), created_at: new Date().toISOString()}); LS("bookings", l);
  },
  async bookings() {
    if (live) { const {data} = await sb.from("bookings").select("*").order("date", {ascending: false}); return data || []; }
    return LS("bookings") || [];
  },
  async myBookings(email, phone) {
    const d = s => String(s).replace(/\D/g, "");
    if (live) { const {data} = await sb.rpc("my_bookings", {p_email: email, p_phone: phone}); return data || []; }
    return (LS("bookings") || []).filter(b => b.email.toLowerCase() === email.trim().toLowerCase() && d(b.phone) === d(phone));
  },
  async cancel(id, email, phone) {
    if (live) { await sb.rpc("cancel_booking", {p_id: id, p_email: email, p_phone: phone}); return; }
    LS("bookings", (LS("bookings") || []).filter(b => b.id != id));
  },
  async login(email, pw) {
    if (live) { const {error} = await sb.auth.signInWithPassword({email, password: pw}); return !error; }
    if (pw === C.demoAdminPassword) { sessionStorage.setItem("adm", "1"); return true; } return false;
  },
  async isAdmin() { if (live) { const {data} = await sb.auth.getSession(); return !!data.session; } return sessionStorage.getItem("adm") === "1"; },
  async logout() { if (live) await sb.auth.signOut(); sessionStorage.removeItem("adm"); }
};

async function uploadImage(file) {
  const blob = await new Promise(res => { const im = new Image(); im.onload = () => { const k = Math.min(1, 900 / im.width), c = document.createElement("canvas"); c.width = im.width * k; c.height = im.height * k; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); c.toBlob(res, "image/jpeg", .78); }; im.src = URL.createObjectURL(file); });
  if (live) { const p = Date.now() + ".jpg"; const {error} = await sb.storage.from("service-images").upload(p, blob, {contentType: "image/jpeg"}); if (error) throw error; return sb.storage.from("service-images").getPublicUrl(p).data.publicUrl; }
  return new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(blob); });
}
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
  const links = [["index.html","Home"],["services.html","Services"],["book.html","Book"],["mybookings.html","My bookings"]];
  document.body.insertAdjacentHTML("afterbegin", `<header class="nav"><a class="logo" href="index.html">${esc(C.name)}</a>
    <nav>${links.map(l => `<a href="${l[0]}" class="${l[0] === active ? "on" : ""}">${l[1]}</a>`).join("")}<a class="btn sm" href="book.html">Book now</a></nav></header>`);
  document.body.insertAdjacentHTML("beforeend", `<footer><div class="fgrid">
    <div class="fbrand"><b>${esc(C.name)}</b><p>${esc(C.about)}</p>
      <div class="soc"><a href="${esc(C.instagram)}" target="_blank" rel="noopener">Instagram</a><a href="${esc(C.facebook)}" target="_blank" rel="noopener">Facebook</a><a href="${esc(C.tiktok)}" target="_blank" rel="noopener">TikTok</a></div></div>
    <div><h4>Explore</h4><a href="index.html">Home</a><a href="services.html">Services &amp; prices</a><a href="book.html">Book online</a><a href="mybookings.html">My bookings</a></div>
    <div><h4>Opening hours</h4>${C.hoursList.map(h => `<p class="hr"><span>${esc(h[0])}</span><span>${esc(h[1])}</span></p>`).join("")}</div>
    <div><h4>Visit us</h4><p>${esc(C.address)}</p><p><a href="tel:${esc(C.phone.replace(/\s/g, ""))}">${esc(C.phone)}</a></p><p><a href="mailto:${esc(C.email)}">${esc(C.email)}</a></p>
      <p><a class="btn sm" href="https://wa.me/${esc(C.whatsapp)}" target="_blank" rel="noopener">Chat on WhatsApp</a></p></div></div>
    <div class="fbar"><span>© ${new Date().getFullYear()} ${esc(C.name)}. All rights reserved.</span><span>Free parking · Card &amp; cash accepted · Walk-ins welcome</span><a href="admin.html">Owner login</a></div></footer>`);
  if (!live) activity();
}
