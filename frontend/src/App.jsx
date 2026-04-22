
import React, { useState, useEffect } from "react";

const API = "http://52.70.51.119:30082";

const STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL",
  "IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY"];
const LIKED_OPTIONS    = ["students","location","campus","atmosphere","dorm rooms","sports"];
const INTEREST_OPTIONS = ["friends","television","internet","other"];
const RECOMMEND_OPTIONS= ["Very Likely","Likely","Unlikely"];

const emptyForm = () => ({
  first_name:"", last_name:"", street_address:"", city:"", state:"",
  zip_code:"", telephone:"", email:"", survey_date:"",
  liked_most:[], interest_source:"", recommendation:""
});


const css = {
  page:         { fontFamily:"Segoe UI,sans-serif", minHeight:"100vh", background:"#f0f2f5" },
  nav:          { background:"#2f5d34", padding:"0 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 },
  navTitle:     { color:"#fff", fontWeight:700, fontSize:20 },
  navBtnActive: { background:"#fff", color:"#2f5d34", border:"1px solid #fff", borderRadius:6, padding:"6px 16px", cursor:"pointer", fontWeight:500, fontSize:14, marginLeft:8 },
  navBtnIdle:   { background:"transparent", color:"#fff", border:"1px solid #fff", borderRadius:6, padding:"6px 16px", cursor:"pointer", fontWeight:500, fontSize:14, marginLeft:8 },
  wrap:         { maxWidth:1000, margin:"2rem auto", padding:"0 1rem" },
  alertOk:      { padding:"12px 16px", borderRadius:8, marginBottom:16, background:"#d4edda", color:"#155724", border:"1px solid #c3e6cb" },
  alertErr:     { padding:"12px 16px", borderRadius:8, marginBottom:16, background:"#f8d7da", color:"#721c24", border:"1px solid #f5c6cb" },
  card:         { background:"#fff", borderRadius:12, padding:"2rem", boxShadow:"0 2px 8px rgba(0,0,0,0.08)" },
  cardTable:    { background:"#fff", borderRadius:12, padding:0, boxShadow:"0 2px 8px rgba(0,0,0,0.08)", overflowX:"auto" },
  row:          { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 },
  h4:           { margin:0, color:"#2f5d34" },
  primaryBtn:   { background:"#2f5d34", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", cursor:"pointer", fontWeight:600, fontSize:14 },
  dangerBtn:    { background:"#dc3545", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", cursor:"pointer", fontWeight:600, fontSize:14, marginRight:10 },
  secondaryBtn: { background:"#fff", color:"#2f5d34", border:"1px solid #2f5d34", borderRadius:8, padding:"10px 24px", cursor:"pointer", fontWeight:600, fontSize:14 },
  table:        { width:"100%", borderCollapse:"collapse", fontSize:14 },
  th:           { padding:"12px 14px", textAlign:"left", whiteSpace:"nowrap", background:"#2f5d34", color:"#fff" },
  td:           { padding:"10px 14px", color:"#333" },
  trEven:       { borderBottom:"1px solid #eee", background:"#fff" },
  trOdd:        { borderBottom:"1px solid #eee", background:"#f9f9f9" },
  editBtn:      { background:"#e8f0fe", color:"#2f5d34", border:"none", borderRadius:6, padding:"4px 12px", cursor:"pointer", marginRight:6, fontSize:13, fontWeight:500 },
  delBtn:       { background:"#fde8e8", color:"#c0392b", border:"none", borderRadius:6, padding:"4px 12px", cursor:"pointer", fontSize:13, fontWeight:500 },
  secTitle:     { fontWeight:600, fontSize:15, color:"#2f5d34", borderBottom:"2px solid #2f5d34", paddingBottom:6, marginBottom:16, marginTop:20 },
  grid2:        { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  grid3:        { display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:16 },
  label:        { display:"block", fontWeight:500, fontSize:13, color:"#444", marginBottom:4 },
  inputOk:      { width:"100%", padding:"8px 12px", borderRadius:6, border:"1px solid #ccc", fontSize:14, boxSizing:"border-box", outline:"none" },
  inputErr:     { width:"100%", padding:"8px 12px", borderRadius:6, border:"1px solid #dc3545", fontSize:14, boxSizing:"border-box", outline:"none" },
  errTxt:       { color:"#dc3545", fontSize:12, marginTop:2 },
  badgeGreen:   { padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, background:"#d4edda", color:"#155724" },
  badgeYellow:  { padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, background:"#fff3cd", color:"#856404" },
  badgeRed:     { padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:600, background:"#f8d7da", color:"#721c24" },
  overlay:      { position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 },
  modal:        { background:"#fff", borderRadius:12, padding:"2rem", maxWidth:400, width:"90%", textAlign:"center" },
  checkRow:     { display:"flex", flexWrap:"wrap", gap:"10px 28px", marginTop:8 },
  checkLabel:   { display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:14 },
  empty:        { textAlign:"center", padding:"3rem", color:"#666" },
};

function badgeStyle(r) {
  if (r === "Very Likely") return css.badgeGreen;
  if (r === "Likely") return css.badgeYellow;
  return css.badgeRed;
}

function Field({ label, name, type, value, error, onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={css.label}>{label}</label>
      <input
        type={type || "text"}
        name={name}
        value={value}
        onChange={onChange}
        style={error ? css.inputErr : css.inputOk}
        autoComplete="off"
      />
      {error && <div style={css.errTxt}>{error}</div>}
    </div>
  );
}

export default function App() {
  const [view,    setView]    = useState("list");
  const [surveys, setSurveys] = useState([]);
  const [form,    setForm]    = useState(emptyForm());
  const [editId,  setEditId]  = useState(null);
  const [msg,     setMsg]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [delId,   setDelId]   = useState(null);
  const [errors,  setErrors]  = useState({});

  useEffect(() => { if (view === "list") fetchSurveys(); }, [view]);

  async function fetchSurveys() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/surveys`);
      setSurveys(await r.json());
    } catch {
      showMsg("error", "Cannot connect to backend. Is it running on port 8000?");
    }
    setLoading(false);
  }

  function showMsg(type, text) {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm(prev => ({
        ...prev,
        liked_most: checked
          ? [...prev.liked_most, value]
          : prev.liked_most.filter(v => v !== value)
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const req = ["first_name","last_name","street_address","city","state",
                 "zip_code","telephone","email","survey_date","interest_source","recommendation"];
    const errs = {};
    req.forEach(k => { if (!form[k]) errs[k] = "Required"; });
    if (form.zip_code && !/^\d{5}$/.test(form.zip_code)) errs.zip_code = "Must be 5 digits";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const url = editId ? `${API}/surveys/${editId}` : `${API}/surveys`;
      const r = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      const data = await r.json();

    if (!r.ok) {
      console.log("Backend error:", data);
      throw new Error(JSON.stringify(data));
    }

showMsg("success", editId ? "Survey updated!" : "Survey submitted!");


      setForm(emptyForm()); setEditId(null); setView("list");
    } catch(err) {
      console.error("Save error:", err);
      showMsg("error", err.message || "Save failed. Please try again.");
      
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    setLoading(true);
    try {
      await fetch(`${API}/surveys/${id}`, { method: "DELETE" });
      setSurveys(s => s.filter(x => x.id !== id));
      showMsg("success", "Survey deleted.");
    } catch { showMsg("error", "Delete failed."); }
    setDelId(null); setLoading(false);
  }

  function startEdit(s) {
    setForm({ ...s, liked_most: s.liked_most || [] });
    setEditId(s.id); setErrors({}); setView("add");
  }

  function startNew() {
    setForm(emptyForm()); setEditId(null); setErrors({}); setView("add");
  }

  return (
    <div style={css.page}>

    <nav style={{
      background: "#2f5d34",
      color: "white",
      padding: "14px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "3px solid #d4af37"
    }}>
      <div style={{ fontWeight: "bold", fontSize: "18px" }}>
         Student Survey Portal
      </div>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <span
          onClick={() => setView("add")}
          style={{
            cursor: "pointer",
            fontWeight: view === "add" ? "700" : "500",
            fontSize: view === "add" ? "20px" : "16px",
            opacity: view === "add" ? 1 : 0.75,
            transition: "all 0.2s ease"
          }}
        >
          Student Survey
        </span>

        <span
          onClick={() => setView("list")}
          style={{
            cursor: "pointer",
            fontWeight: view === "list" ? "700" : "500",
            fontSize: view === "list" ? "20px" : "16px",
            opacity: view === "list" ? 1 : 0.75,
            transition: "all 0.2s ease"
          }}
        >
          Survey List
        </span>
      </div>
    </nav>

      <div style={css.wrap}>
        {msg && <div style={msg.type==="success" ? css.alertOk : css.alertErr}>{msg.text}</div>}

        
        {view === "list" && (
          <div>
            <div style={css.row}>
              <h4 style={css.h4}>Submitted Surveys ({surveys.length})</h4>
              <button onClick={startNew} style={css.primaryBtn}>+ Add Survey</button>
            </div>
            {loading ? <p>Loading...</p> : surveys.length === 0 ? (
              <div style={{ ...css.card, ...css.empty }}>
                No surveys yet.{" "}
                <span onClick={startNew} style={{ color:"#003366", cursor:"pointer", textDecoration:"underline" }}>
                  Submit the first one!
                </span>
              </div>
            ) : (
              <div style={css.cardTable}>
                <table style={css.table}>
                  <thead>
                    <tr>
                      {["ID","Name","Email","Phone","City, State","Date","Recommendation","Actions"].map(h =>
                        <th key={h} style={css.th}>{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {surveys.map((sv, i) => (
                      <tr key={sv.id} style={i%2===0 ? css.trEven : css.trOdd}>
                        <td style={css.td}>{i+1}</td>
                        <td style={css.td}>{sv.first_name} {sv.last_name}</td>
                        <td style={css.td}>{sv.email}</td>
                        <td style={css.td}>{sv.telephone}</td>
                        <td style={css.td}>{sv.city}, {sv.state}</td>
                        <td style={css.td}>{sv.survey_date}</td>
                        <td style={css.td}><span style={badgeStyle(sv.recommendation)}>{sv.recommendation}</span></td>
                        <td style={css.td}>
                          <button onClick={() => startEdit(sv)} style={css.editBtn}>Edit</button>
                          <button onClick={() => setDelId(sv.id)} style={css.delBtn}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

       
        {delId && (
          <div style={css.overlay}>
            <div style={css.modal}>
              <h5 style={{ marginBottom:8 }}>⚠️ Delete Survey?</h5>
              <p style={{ color:"#666", marginBottom:20 }}>This action cannot be undone.</p>
              <button onClick={() => handleDelete(delId)} style={css.dangerBtn}>Yes, Delete</button>
              <button onClick={() => setDelId(null)} style={css.secondaryBtn}>Cancel</button>
            </div>
          </div>
        )}

        
        {view === "add" && (
          <div style={css.card}>
            <h4 style={{ color:"#2f5d34", marginBottom:24 }}>
              {editId ? "Edit Survey" : " New Student Survey"}
            </h4>

            <div style={css.secTitle}>Personal Information</div>
            <div style={css.grid2}>
              <Field label="First Name *"  name="first_name"  value={form.first_name}  error={errors.first_name}  onChange={handleChange} />
              <Field label="Last Name *"   name="last_name"   value={form.last_name}   error={errors.last_name}   onChange={handleChange} />
            </div>
            <Field label="Street Address *" name="street_address" value={form.street_address} error={errors.street_address} onChange={handleChange} />
            <div style={css.grid3}>
              <Field label="City *" name="city" value={form.city} error={errors.city} onChange={handleChange} />
              <div style={{ marginBottom:16 }}>
                <label style={css.label}>State *</label>
                <select name="state" value={form.state} onChange={handleChange} style={errors.state ? css.inputErr : css.inputOk}>
                  <option value="">Select...</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <div style={css.errTxt}>{errors.state}</div>}
              </div>
              <Field label="ZIP Code *" name="zip_code" value={form.zip_code} error={errors.zip_code} onChange={handleChange} />
            </div>
            <div style={css.grid2}>
              <Field label="Telephone *" name="telephone" value={form.telephone} error={errors.telephone} onChange={handleChange} />
              <Field label="Email *"     name="email"     type="email" value={form.email} error={errors.email} onChange={handleChange} />
            </div>
            <div style={{ maxWidth:240 }}>
              <Field label="Date of Survey *" name="survey_date" type="date" value={form.survey_date} error={errors.survey_date} onChange={handleChange} />
            </div>

            <div style={css.secTitle}>Campus Feedback</div>

            <div style={{ marginBottom:20 }}>
              <label style={css.label}>What did you like most about the campus?</label>
              <div style={css.checkRow}>
                {LIKED_OPTIONS.map(o => (
                  <label key={o} style={css.checkLabel}>
                    <input type="checkbox" name="liked_most" value={o}
                      checked={form.liked_most.includes(o)} onChange={handleChange} />
                    {o}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={css.label}>How did you hear about us? *</label>
              {errors.interest_source && <div style={css.errTxt}>{errors.interest_source}</div>}
              <div style={css.checkRow}>
                {INTEREST_OPTIONS.map(o => (
                  <label key={o} style={css.checkLabel}>
                    <input type="radio" name="interest_source" value={o}
                      checked={form.interest_source===o} onChange={handleChange} />
                    {o}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:28 }}>
              <label style={css.label}>Likelihood of recommending us? *</label>
              {errors.recommendation && <div style={css.errTxt}>{errors.recommendation}</div>}
              <div style={css.checkRow}>
                {RECOMMEND_OPTIONS.map(o => (
                  <label key={o} style={css.checkLabel}>
                    <input type="radio" name="recommendation" value={o}
                      checked={form.recommendation===o} onChange={handleChange} />
                    {o}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display:"flex", gap:12 }}>
              <button onClick={handleSubmit} style={css.primaryBtn} disabled={loading}>
                {loading ? "Saving..." : editId ? "Update Survey" : "Submit Survey"}
              </button>
              <button onClick={() => { setView("list"); setForm(emptyForm()); setEditId(null); }} style={css.secondaryBtn}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
       <footer style={{ background: "#2f5d34", color: "gold", textAlign: "center", padding: "10px" }}>
         George Mason University
        </footer>
      </div>
  );
}