"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Car, CarsDataset } from "@/types";
import { formatPrice } from "@/lib/car-data";

const EMPTY_CAR: Car = {
  id: "",
  name: "",
  brand: "",
  model: "",
  year: 2025,
  price: 0,
  currency: "INR",
  category: "",
  imageEmoji: "🚗",
  imageUrl: "",
  gallery: [],
  color: "#448aff",
  specs: {
    engine: "",
    horsepower: 0,
    torque: "",
    transmission: "",
    drivetrain: "FWD",
    fuelType: "Petrol",
    mileage: 0,
    acceleration: 0,
    topSpeed: 0,
  },
  features: {
    safety: [],
    comfort: [],
    technology: [],
    exterior: [],
  },
  ratings: {
    performance: 5,
    fuelEfficiency: 5,
    safety: 5,
    comfort: 5,
    technology: 5,
    valueForMoney: 5,
  },
  variants: [],
  description: "",
  launchDate: "",
  bodyType: "",
  seatingCapacity: 5,
  bootSpace: "",
  groundClearance: "",
  kerbWeight: "",
  colors: [],
};

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState<{ version: string; lastUpdated: string } | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkPreview, setBulkPreview] = useState<{ valid: number; invalid: number; duplicates: number; entries: Car[] } | null>(null);
  const [bulkImporting, setBulkImporting] = useState(false);

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchCars = useCallback(async () => {
    try {
      const res = await fetch("/api/cars");
      const data: CarsDataset = await res.json();
      setCars(data.cars);
      setDatasetInfo({ version: data.version, lastUpdated: data.lastUpdated });
    } catch {
      showToast("Failed to load cars", "err");
    }
  }, [showToast]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleNew = () => {
    setEditingCar({ ...EMPTY_CAR });
    setIsNew(true);
  };

  const handleEdit = (car: Car) => {
    setEditingCar(JSON.parse(JSON.stringify(car)));
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this car permanently?")) return;
    try {
      const res = await fetch(`/api/cars?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Car deleted");
        fetchCars();
        if (editingCar?.id === id) setEditingCar(null);
      } else {
        const err = await res.json();
        showToast(err.error, "err");
      }
    } catch {
      showToast("Delete failed", "err");
    }
  };

  const handleSave = async () => {
    if (!editingCar) return;

    const car = { ...editingCar };
    if (isNew && !car.id) {
      car.id = generateId(car.name);
    }

    if (!car.name || !car.brand || !car.id) {
      showToast("Name, Brand, and ID are required", "err");
      return;
    }

    try {
      const method = isNew ? "POST" : "PUT";
      const res = await fetch("/api/cars", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      });

      if (res.ok) {
        showToast(isNew ? "Car added!" : "Car updated!");
        setEditingCar(null);
        fetchCars();
      } else {
        const err = await res.json();
        showToast(err.error, "err");
      }
    } catch {
      showToast("Save failed", "err");
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "main" | "gallery"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingCar) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (res.ok) {
        if (target === "main") {
          setEditingCar({ ...editingCar, imageUrl: data.url });
        } else {
          setEditingCar({
            ...editingCar,
            gallery: [...(editingCar.gallery || []), data.url],
          });
        }
        showToast("Image uploaded!");
      } else {
        showToast(data.error, "err");
      }
    } catch {
      showToast("Upload failed", "err");
    }
    setUploading(false);
  };

  const updateField = (path: string, value: string | number | string[]) => {
    if (!editingCar) return;
    const car = JSON.parse(JSON.stringify(editingCar));
    const keys = path.split(".");
    let obj: Record<string, unknown> = car;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
    setEditingCar(car);
  };

  const updateFeatureList = (
    category: "safety" | "comfort" | "technology" | "exterior",
    text: string
  ) => {
    updateField(
      `features.${category}`,
      text.split("\n").filter((s) => s.trim())
    );
  };

  const handleBulkPreview = () => {
    try {
      const parsed = JSON.parse(bulkJson);
      const arr: Car[] = Array.isArray(parsed) ? parsed : parsed.cars;

      if (!Array.isArray(arr)) {
        showToast("JSON must be an array of cars or { cars: [...] }", "err");
        return;
      }

      const existingIds = new Set(cars.map((c) => c.id));
      let valid = 0;
      let invalid = 0;
      let duplicates = 0;

      for (const entry of arr) {
        if (!entry.id || !entry.name || !entry.brand) {
          invalid++;
        } else if (existingIds.has(entry.id)) {
          duplicates++;
        } else {
          valid++;
        }
      }

      setBulkPreview({ valid, invalid, duplicates, entries: arr });
    } catch {
      showToast("Invalid JSON format", "err");
      setBulkPreview(null);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkPreview || bulkPreview.valid === 0) return;

    setBulkImporting(true);
    try {
      const res = await fetch("/api/cars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: bulkJson,
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Imported ${data.added} cars (${data.skipped} skipped)`);
        setBulkImportOpen(false);
        setBulkJson("");
        setBulkPreview(null);
        fetchCars();
      } else {
        showToast(data.error, "err");
      }
    } catch {
      showToast("Bulk import failed", "err");
    }
    setBulkImporting(false);
  };

  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setBulkJson(text);
      setBulkPreview(null);
    };
    reader.readAsText(file);
  };

  return (
    <div className="admin-page">
      {toast && (
        <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>
      )}

      <header className="admin-header">
        <div>
          <Link href="/" className="back-link">← Back to App</Link>
          <h1 className="admin-title">Car Admin Panel</h1>
          <p className="admin-subtitle">
            Manage car dataset — {cars.length} cars
            {datasetInfo && (
              <span> · v{datasetInfo.version} · Updated {new Date(datasetInfo.lastUpdated).toLocaleDateString()}</span>
            )}
          </p>
        </div>
        <div className="admin-header-buttons">
          <button className="admin-btn admin-btn-secondary" onClick={() => setBulkImportOpen(true)}>
            📦 Bulk Import
          </button>
          <button className="admin-btn admin-btn-primary" onClick={handleNew}>
            + Add New Car
          </button>
        </div>
      </header>

      {bulkImportOpen && (
        <div className="admin-modal-overlay" onClick={() => setBulkImportOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>📦 Bulk Import Cars</h3>
              <button className="admin-btn admin-btn-sm" onClick={() => setBulkImportOpen(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p className="admin-modal-help">
                Paste a JSON array of Car objects or upload a .json file.
                Format: <code>[{`{ "id": "...", "name": "...", "brand": "...", ... }`}]</code>
                or <code>{`{ "cars": [...] }`}</code>
              </p>
              <div className="admin-upload-row">
                <label className="admin-upload-btn">
                  📁 Choose JSON File
                  <input type="file" accept=".json" onChange={handleBulkFileUpload} hidden />
                </label>
              </div>
              <textarea
                className="admin-bulk-textarea"
                rows={12}
                placeholder='[{ "id": "brand-model-2025", "name": "Brand Model 2025", "brand": "Brand", ... }]'
                value={bulkJson}
                onChange={(e) => { setBulkJson(e.target.value); setBulkPreview(null); }}
              />
              <div className="admin-bulk-actions">
                <button className="admin-btn admin-btn-secondary" onClick={handleBulkPreview} disabled={!bulkJson.trim()}>
                  🔍 Preview
                </button>
                {bulkPreview && (
                  <div className="admin-bulk-preview">
                    <span className="preview-valid">✅ {bulkPreview.valid} new</span>
                    <span className="preview-dup">⏭️ {bulkPreview.duplicates} duplicate</span>
                    <span className="preview-invalid">❌ {bulkPreview.invalid} invalid</span>
                  </div>
                )}
              </div>
              {bulkPreview && bulkPreview.valid > 0 && (
                <button
                  className="admin-btn admin-btn-primary admin-bulk-import-btn"
                  onClick={handleBulkImport}
                  disabled={bulkImporting}
                >
                  {bulkImporting ? "Importing..." : `Import ${bulkPreview.valid} Cars`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout">
        <div className="admin-list-panel">
          <h3 className="admin-panel-title">All Cars ({cars.length})</h3>
          {cars.map((car) => (
            <div
              key={car.id}
              className={`admin-car-row ${editingCar?.id === car.id ? "active" : ""}`}
            >
              <div className="admin-car-row-info">
                <div>
                  <strong>{car.name}</strong>
                  <span className="admin-car-row-meta">
                    {car.brand} · {formatPrice(car.price)}
                  </span>
                  <span className="admin-car-row-meta">
                    {car.imageUrl ? "✅ Image" : "⚠️ No Image"}
                    {" · "}
                    {(car.variants?.length || 0)} variants
                  </span>
                </div>
              </div>
              <div className="admin-car-row-actions">
                <button className="admin-btn admin-btn-sm" onClick={() => handleEdit(car)}>Edit</button>
                <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(car.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-form-panel">
          {editingCar ? (
            <>
              <div className="admin-form-header">
                <h3>{isNew ? "Add New Car" : `Edit: ${editingCar.name}`}</h3>
                <div className="admin-form-header-actions">
                  <button className="admin-btn admin-btn-sm" onClick={() => setEditingCar(null)}>Cancel</button>
                  <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={handleSave}>
                    {isNew ? "Add Car" : "Save Changes"}
                  </button>
                </div>
              </div>

              <div className="admin-form-body">
                <fieldset className="admin-fieldset">
                  <legend>Basic Info</legend>
                  <div className="admin-form-grid">
                    <label>
                      <span>Car Name *</span>
                      <input value={editingCar.name} onChange={(e) => {
                        updateField("name", e.target.value);
                        if (isNew) updateField("id", generateId(e.target.value));
                      }} />
                    </label>
                    <label>
                      <span>ID</span>
                      <input value={editingCar.id} onChange={(e) => updateField("id", e.target.value)} disabled={!isNew} />
                    </label>
                    <label>
                      <span>Brand *</span>
                      <input value={editingCar.brand} onChange={(e) => updateField("brand", e.target.value)} />
                    </label>
                    <label>
                      <span>Model</span>
                      <input value={editingCar.model} onChange={(e) => updateField("model", e.target.value)} />
                    </label>
                    <label>
                      <span>Year</span>
                      <input type="number" value={editingCar.year} onChange={(e) => updateField("year", +e.target.value)} />
                    </label>
                    <label>
                      <span>Price (INR)</span>
                      <input type="number" value={editingCar.price} onChange={(e) => updateField("price", +e.target.value)} />
                    </label>
                    <label>
                      <span>Category</span>
                      <input value={editingCar.category} onChange={(e) => updateField("category", e.target.value)} placeholder="e.g. Compact SUV" />
                    </label>
                    <label>
                      <span>Body Type</span>
                      <input value={editingCar.bodyType || ""} onChange={(e) => updateField("bodyType", e.target.value)} />
                    </label>
                    <label>
                      <span>Emoji Icon</span>
                      <input value={editingCar.imageEmoji} onChange={(e) => updateField("imageEmoji", e.target.value)} />
                    </label>
                    <label>
                      <span>Theme Color</span>
                      <input type="color" value={editingCar.color} onChange={(e) => updateField("color", e.target.value)} />
                    </label>
                    <label>
                      <span>Seating</span>
                      <input type="number" value={editingCar.seatingCapacity || 5} onChange={(e) => updateField("seatingCapacity", +e.target.value)} />
                    </label>
                    <label>
                      <span>Launch Date</span>
                      <input type="date" value={editingCar.launchDate || ""} onChange={(e) => updateField("launchDate", e.target.value)} />
                    </label>
                  </div>
                  <label className="admin-full-width">
                    <span>Description</span>
                    <textarea value={editingCar.description} onChange={(e) => updateField("description", e.target.value)} rows={3} />
                  </label>
                </fieldset>

                <fieldset className="admin-fieldset">
                  <legend>Images</legend>
                  <label className="admin-full-width">
                    <span>Main Image URL</span>
                    <input value={editingCar.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} placeholder="https://... or upload below" />
                  </label>
                  <div className="admin-upload-row">
                    <label className="admin-upload-btn">
                      {uploading ? "Uploading..." : "📤 Upload Main Image"}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "main")} hidden disabled={uploading} />
                    </label>
                    <label className="admin-upload-btn">
                      {uploading ? "Uploading..." : "🖼️ Add to Gallery"}
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "gallery")} hidden disabled={uploading} />
                    </label>
                  </div>
                  {editingCar.imageUrl && (
                    <div className="admin-image-preview">
                      <img src={editingCar.imageUrl} alt="Main" />
                    </div>
                  )}
                  {(editingCar.gallery?.length ?? 0) > 0 && (
                    <div className="admin-gallery-grid">
                      {editingCar.gallery!.map((url, i) => (
                        <div key={i} className="admin-gallery-item">
                          <img src={url} alt={`Gallery ${i + 1}`} />
                          <button onClick={() => {
                            const g = [...(editingCar.gallery || [])];
                            g.splice(i, 1);
                            updateField("gallery", g as unknown as string[]);
                          }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </fieldset>

                <fieldset className="admin-fieldset">
                  <legend>Specifications</legend>
                  <div className="admin-form-grid">
                    <label>
                      <span>Engine</span>
                      <input value={editingCar.specs.engine} onChange={(e) => updateField("specs.engine", e.target.value)} />
                    </label>
                    <label>
                      <span>Horsepower</span>
                      <input type="number" value={editingCar.specs.horsepower} onChange={(e) => updateField("specs.horsepower", +e.target.value)} />
                    </label>
                    <label>
                      <span>Torque</span>
                      <input value={editingCar.specs.torque} onChange={(e) => updateField("specs.torque", e.target.value)} placeholder="e.g. 250 Nm" />
                    </label>
                    <label>
                      <span>Transmission</span>
                      <input value={editingCar.specs.transmission} onChange={(e) => updateField("specs.transmission", e.target.value)} />
                    </label>
                    <label>
                      <span>Drivetrain</span>
                      <select value={editingCar.specs.drivetrain} onChange={(e) => updateField("specs.drivetrain", e.target.value)}>
                        <option>FWD</option>
                        <option>RWD</option>
                        <option>AWD</option>
                        <option>4WD</option>
                      </select>
                    </label>
                    <label>
                      <span>Fuel Type</span>
                      <select value={editingCar.specs.fuelType} onChange={(e) => updateField("specs.fuelType", e.target.value)}>
                        <option>Petrol</option>
                        <option>Diesel</option>
                        <option>Electric</option>
                        <option>Petrol Hybrid</option>
                        <option>CNG</option>
                      </select>
                    </label>
                    <label>
                      <span>{editingCar.specs.fuelType === "Electric" ? "Range (km)" : "Mileage (km/l)"}</span>
                      <input type="number" value={editingCar.specs.mileage} onChange={(e) => updateField("specs.mileage", +e.target.value)} />
                    </label>
                    <label>
                      <span>0-100 km/h (sec)</span>
                      <input type="number" step="0.1" value={editingCar.specs.acceleration} onChange={(e) => updateField("specs.acceleration", +e.target.value)} />
                    </label>
                    <label>
                      <span>Top Speed (km/h)</span>
                      <input type="number" value={editingCar.specs.topSpeed} onChange={(e) => updateField("specs.topSpeed", +e.target.value)} />
                    </label>
                    <label>
                      <span>Boot Space</span>
                      <input value={editingCar.bootSpace || ""} onChange={(e) => updateField("bootSpace", e.target.value)} placeholder="e.g. 433 L" />
                    </label>
                    <label>
                      <span>Ground Clearance</span>
                      <input value={editingCar.groundClearance || ""} onChange={(e) => updateField("groundClearance", e.target.value)} placeholder="e.g. 200 mm" />
                    </label>
                    <label>
                      <span>Kerb Weight</span>
                      <input value={editingCar.kerbWeight || ""} onChange={(e) => updateField("kerbWeight", e.target.value)} placeholder="e.g. 1385 kg" />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="admin-fieldset">
                  <legend>Features (one per line)</legend>
                  <div className="admin-form-grid-2">
                    <label>
                      <span>🛡️ Safety</span>
                      <textarea rows={5} value={editingCar.features.safety.join("\n")} onChange={(e) => updateFeatureList("safety", e.target.value)} />
                    </label>
                    <label>
                      <span>🪑 Comfort</span>
                      <textarea rows={5} value={editingCar.features.comfort.join("\n")} onChange={(e) => updateFeatureList("comfort", e.target.value)} />
                    </label>
                    <label>
                      <span>📱 Technology</span>
                      <textarea rows={5} value={editingCar.features.technology.join("\n")} onChange={(e) => updateFeatureList("technology", e.target.value)} />
                    </label>
                    <label>
                      <span>✨ Exterior</span>
                      <textarea rows={5} value={editingCar.features.exterior.join("\n")} onChange={(e) => updateFeatureList("exterior", e.target.value)} />
                    </label>
                  </div>
                </fieldset>

                <fieldset className="admin-fieldset">
                  <legend>Ratings (0-10)</legend>
                  <div className="admin-form-grid">
                    {(["performance", "fuelEfficiency", "safety", "comfort", "technology", "valueForMoney"] as const).map((key) => (
                      <label key={key}>
                        <span>{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}: {editingCar.ratings[key]}</span>
                        <input type="range" min="0" max="10" step="0.1" value={editingCar.ratings[key]} onChange={(e) => updateField(`ratings.${key}`, +e.target.value)} />
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="admin-fieldset">
                  <legend>Available Colors (one per line)</legend>
                  <label className="admin-full-width">
                    <textarea
                      rows={4}
                      value={(editingCar.colors || []).join("\n")}
                      onChange={(e) => updateField("colors", e.target.value.split("\n").filter((s) => s.trim()) as unknown as string[])}
                      placeholder="Pristine White&#10;Flame Red&#10;Crystal Blue"
                    />
                  </label>
                </fieldset>

                <div className="admin-form-footer">
                  <button className="admin-btn" onClick={() => setEditingCar(null)}>Cancel</button>
                  <button className="admin-btn admin-btn-primary" onClick={handleSave}>
                    {isNew ? "Add Car to Dataset" : "Save Changes"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-empty-form">
              <div className="admin-empty-icon">📝</div>
              <h3>Select a car to edit</h3>
              <p>or click &quot;Add New Car&quot; to add one</p>
              <div className="admin-dataset-info">
                <h4>Dataset Info</h4>
                <p>File: <code>public/data/cars.json</code></p>
                <p>Uploads: <code>public/uploads/</code></p>
                <p>API: <code>GET/POST/PUT/DELETE /api/cars</code></p>
                <p>Upload: <code>POST /api/upload</code></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
