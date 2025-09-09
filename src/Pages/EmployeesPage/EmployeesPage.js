import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./employeespage.css";

const PAGE_SIZE = 5;

export default function EmployeesPage() {
  const navigate = useNavigate();
  const adminId = localStorage.getItem("adminId");

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null); // employee being edited
  const [form, setForm] = useState({ fullName: "", department: "", position: "", email: "" });

  // Fetch employees
  const fetchEmployees = async () => {
    if (!adminId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/employees?adminId=${adminId}`
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load");
      setEmployees(data.employees || []);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, []);

  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [employees]);

  // derive with search + filter
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = employees;
    if (dept !== "All") list = list.filter((e) => e.department === dept);
    if (term) {
      list = list.filter(
        (e) =>
          e.fullName.toLowerCase().includes(term) ||
          e.employeeId.toLowerCase().includes(term) ||
          (e.position || "").toLowerCase().includes(term) ||
          (e.email || "").toLowerCase().includes(term)
      );
    }
    return list;
  }, [employees, q, dept]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    // reset to first page on filters
    setPage(1);
  }, [q, dept]);

  // Delete
  const onDelete = async (employeeId) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/employees/${employeeId}?adminId=${adminId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Delete failed");
      await fetchEmployees();
    } catch (e) {
      alert(e.message);
    }
  };

  // Edit
  const openEdit = (emp) => {
    setEditing(emp.employeeId);
    setForm({
      fullName: emp.fullName || "",
      department: emp.department || "",
      position: emp.position || "",
      email: emp.email || ""
    });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/employees/${editing}?adminId=${adminId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Update failed");
      setEditing(null);
      await fetchEmployees();
    } catch (e) {
      alert(e.message);
    }
  };

  // Export CSV (client-side)
  const exportCSV = () => {
    const rows = [
      ["Employee ID", "Full Name", "Department", "Position", "Email", "Last Check-in"],
      ...filtered.map((e) => [
        e.employeeId,
        e.fullName,
        e.department || "",
        e.position || "",
        e.email || "",
        e.lastCheckIn ? new Date(e.lastCheckIn).toLocaleString() : ""
      ])
    ];
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="Employee-page">
    <div className="emp-container">
      <div className="emp-header">
        <h2>Employee Management</h2>
        <div className="header-actions">
          <button className="btn-light" onClick={exportCSV}>📄 Export Report</button>
          <button className="btn-primary" onClick={() => navigate("/reg")}>➕ Add Employee</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">🔎</span>
          <input
            placeholder="Search employees..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <select value={dept} onChange={(e) => setDept(e.target.value)}>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="table-wrap">
        <table className="emp-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Check-in</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="muted">Loading...</td></tr>
            ) : current.length === 0 ? (
              <tr><td colSpan="5" className="muted">No employees found</td></tr>
            ) : current.map((e) => (
              <tr key={e.employeeId}>
                <td>
                  <div className="emp-cell">
                    <div className="emp-name">{e.fullName}</div>
                    <div className="emp-sub">ID: {e.employeeId}</div>
                  </div>
                </td>
                  <td><b>{e.department || "—"}</b></td>
                <td>
                  <span className="badge badge-green">Present</span>
                </td>
                <td>{e.lastCheckIn ? new Date(e.lastCheckIn).toLocaleString() : "—"}</td>
                <td className="actions">
                  <button className="icon-btn" title="Edit" onClick={() => openEdit(e)}>✏️</button>
                  <button className="icon-btn" title="Delete" onClick={() => onDelete(e.employeeId)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pager">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={page === i + 1 ? "active" : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
        <div style={{ marginTop: 20, textAlign: "center" }}>
        
      </div>

      </div>
       <button
          className="btn-primary"
          onClick={() => navigate("/attendance")}
        >
          📝 Mark Attendance
        </button>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Employee</h3>
            <label>Full Name</label>
            <input value={form.fullName} onChange={(e)=>setForm({...form, fullName:e.target.value})}/>
            <label>Department</label>
            <input value={form.department} onChange={(e)=>setForm({...form, department:e.target.value})}/>
            <label>Position</label>
            <input value={form.position} onChange={(e)=>setForm({...form, position:e.target.value})}/>
            <label>Email</label>
            <input value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
            <div className="modal-actions">
              <button className="btn-light" onClick={()=>setEditing(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}