import { useEffect, useMemo, useState } from "react";

const PRICE_UAH = 20;
const LS_KEY = "classified_ads_v1";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [ads, setAds] = useState([]);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  // завантажити з localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setAds(JSON.parse(raw));
    } catch {}
  }, []);

  // зберегти в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(ads));
    } catch {}
  }, [ads]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...ads].sort((a, b) => b.createdAt - a.createdAt);
    if (!q) return list;
    return list.filter((a) =>
      [a.title, a.description, a.phone].some((t) =>
        (t || "").toLowerCase().includes(q)
      )
    );
  }, [ads, query]);

  return (
    <div style={{minHeight: "100vh", background: "#fafafa", color: "#111" }}>
      <header style={{
        position: "sticky", top: 0, background: "white", borderBottom: "1px solid #e5e5e5"
      }}>
        <div style={{maxWidth: 1100, margin: "0 auto", padding: "12px 16px", display: "flex", gap: 12, alignItems: "center"}}>
          <div style={{fontWeight: 800, fontSize: 20}}>🌟 Моя Дошка</div>
          <input
            placeholder="Пошук оголошень…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{marginLeft: "auto", padding: "8px 10px", borderRadius: 8, border: "1px solid #d0d0d0"}}
          />
          <button
            onClick={() => setAdding(true)}
            style={{padding: "8px 12px", borderRadius: 10, border: "1px solid #4f46e5", background: "#4f46e5", color: "white", fontWeight: 600}}
          >
            Додати оголошення
          </button>
        </div>
      </header>

      <main style={{maxWidth: 1100, margin: "0 auto", padding: 16}}>
        {filtered.length === 0 ? (
          <div style={{textAlign: "center", padding: "48px 0", color: "#666"}}>
            Поки що оголошень немає. Додай своє за {PRICE_UAH} ₴.
          </div>
        ) : (
          <div style={{display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))"}}>
            {filtered.map((ad) => (
              <div key={ad.id} style={{background: "white", border: "1px solid #eee", borderRadius: 16}}>
                <div style={{padding: 12}}>
                  <div style={{fontWeight: 700, fontSize: 16}}>{ad.title}</div>
                  <div style={{marginTop: 6, color: "#444"}}>{ad.description}</div>
                  <div style={{marginTop: 6, fontSize: 14, color: "#555"}}>Телефон: <b>{ad.phone}</b></div>
                  {ad.price != null && (
                    <div style={{marginTop: 6, fontWeight: 700}}>{ad.price} ₴</div>
                  )}
                  <div style={{marginTop: 10, display: "flex", gap: 8}}>
                    <button
                      onClick={() => {
                        if (confirm("Видалити оголошення?")) {
                          setAds(prev => prev.filter(x => x.id !== ad.id));
                        }
                      }}
                      style={{padding: "6px 10px", borderRadius: 10, border: "1px solid #e5e5e5", background: "#fff"}}
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {adding && (
        <AddModal
          onClose={() => setAdding(false)}
          onPublish={(newAd) => {
            setAds(prev => [newAd, ...prev]);
            setAdding(false);
          }}
        />
      )}
    </div>
  );
}

function AddModal({ onClose, onPublish }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("details"); // details -> payment -> done
  const [error, setError] = useState("");

  function validate() {
    if (!title.trim()) return "Вкажи заголовок";
    if (!description.trim()) return "Опиши товар";
    if (price && isNaN(Number(price))) return "Ціна має бути числом";
    if (!/\+?\d[\d\s\-()]{7,}/.test(phone.trim())) return "Телефон виглядає некоректно";
    return "";
  }

  function nextFromDetails() {
    const e = validate();
    if (e) { setError(e); return; }
    setError("");
    setStep("payment");
  }

  async function fakePay() {
    // імітація успіху
    const newAd = {
      id: uid(),
      title: title.trim(),
      description: description.trim(),
      price: price ? Number(price) : null,
      phone: phone.trim(),
      createdAt: Date.now(),
    };
    onPublish(newAd);
    setStep("done");
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, zIndex: 50
    }}>
      <div style={{background: "white", borderRadius: 16, width: "100%", maxWidth: 560, overflow: "hidden"}}>
        <div style={{padding: 12, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between"}}>
          <b>Додати оголошення</b>
          <button onClick={onClose} style={{border: "1px solid #eee", borderRadius: 10, padding: "4px 10px"}}>×</button>
        </div>

        {step === "details" && (
          <div style={{padding: 16}}>
            <div style={{display: "grid", gap: 10}}>
              <label>
                <div style={{fontSize: 13, marginBottom: 4}}>Заголовок</div>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Напр.: iPhone 12, як новий" style={inp}/>
              </label>
              <label>
                <div style={{fontSize: 13, marginBottom: 4}}>Опис</div>
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Стан, комплектація, місто..." rows={5} style={inp}/>
              </label>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
                <label>
                  <div style={{fontSize: 13, marginBottom: 4}}>Ціна (₴)</div>
                  <input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Напр.: 3500" style={inp}/>
                </label>
                <label>
                  <div style={{fontSize: 13, marginBottom: 4}}>Телефон</div>
                  <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+380 67 123 45 67" style={inp}/>
                </label>
              </div>
              {error && <div style={{color:"#b91c1c", fontSize: 13}}>{error}</div>}
            </div>

            <div style={{display:"flex", justifyContent:"flex-end", gap: 8, marginTop: 14}}>
              <button onClick={onClose} style={btn}>Скасувати</button>
              <button onClick={nextFromDetails} style={{...btn, background:"#4f46e5", color:"#fff", borderColor:"#4f46e5"}}>Далі</button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div style={{padding: 16}}>
            <div style={{fontWeight: 600, fontSize: 16}}>Оплата {PRICE_UAH} ₴</div>
            <div style={{fontSize: 14, color: "#555", marginTop: 6}}>
              Демо-режим: натисни кнопку, щоб імітувати успішну оплату.
            </div>
            <div style={{display:"flex", gap:8, marginTop: 14}}>
              <button onClick={()=>setStep("details")} style={btn}>Назад</button>
              <button onClick={fakePay} style={{...btn, background:"#059669", color:"#fff", borderColor:"#059669"}}>
                Оплатити {PRICE_UAH} ₴ (демо)
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div style={{padding: 24, textAlign:"center"}}>
            <div style={{fontSize: 18, fontWeight: 700}}>Готово! Оголошення опубліковано.</div>
            <button onClick={onClose} style={{...btn, marginTop: 12}}>Закрити</button>
          </div>
        )}
      </div>
    </div>
  );
}

const inp = { width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #d0d0d0", outline: "none" };
const btn = { padding:"8px 12px", borderRadius:10, border:"1px solid #e5e5e5", background:"#fff", fontWeight:600 };
