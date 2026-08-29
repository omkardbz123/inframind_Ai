import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  PlusCircle,
  QrCode,
  Search,
  Printer,
  MapPin,
  X,
} from 'lucide-react';
import { useAssetStore } from '../../store/assetStore';
import { CAMPUS_BUILDINGS, DEPARTMENTS } from '../../lib/constants';
import { Asset, AssetCondition } from '../../types/asset';
import { DepartmentType } from '../../types/user';
import { WingType } from '../../types/location';

export const AssetRegistry: React.FC = () => {
  const { assets, addAsset } = useAssetStore();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [qrModalAsset, setQrModalAsset] = useState<Asset | null>(null);

  // Add Asset Form State
  const [name, setName] = useState('Havells 1200mm Heavy-Duty Ceiling Fan #4');
  const [assetTag, setAssetTag] = useState('FAN-MAB-102-04');
  const [category, setCategory] = useState<DepartmentType>('electrical');
  const [subcategory, setSubcategory] = useState('Ceiling Fan');
  const [brand, setBrand] = useState('Havells');
  const [model, setModel] = useState('Pacer High-Speed 72W');
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0].name);
  const [floor, setFloor] = useState<number>(1);
  const [wing, setWing] = useState<WingType>('east');
  const [roomNumber, setRoomNumber] = useState('102');
  const [installDate, setInstallDate] = useState('2023-03-15');
  const [expectedLifespanYears, setExpectedLifespanYears] = useState<number>(4);
  const [condition, setCondition] = useState<AssetCondition>('good');
  const [notes, setNotes] = useState('Installed in Classroom 102 (TY B.Sc CS) row 2.');

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      a.building.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAsset({
      name,
      assetTag,
      category,
      subcategory,
      brand,
      model,
      building,
      floor,
      wing,
      roomNumber,
      installDate,
      expectedLifespanYears,
      condition,
      notes,
    });

    setIsAddModalOpen(false);
    alert(`Asset "${assetTag}" successfully registered into MIT ACSC database!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Campus Asset Registry & QR Tagging
            <span className="px-2.5 py-0.5 bg-maroon-50 text-maroon-800 text-xs font-mono font-bold rounded-md border border-maroon-200">
              {assets.length} Registered Units
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Track equipment duration, installation date, breakdown causes, and generate printable QR labels
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by name, tag, room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-maroon-700"
        />
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((asset) => {
          const ageYears = (asset.ageInMonths / 12).toFixed(1);

          return (
            <div
              key={asset.id}
              className="white-card white-card-hover p-5 rounded-2xl flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-maroon-800">
                    {asset.assetTag}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                    {asset.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{asset.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  {asset.brand} • Model: {asset.model || 'Standard'}
                </div>

                {/* Location */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-maroon-700 shrink-0" />
                    <span>{asset.building} • Floor {asset.floor}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Room: <strong className="text-slate-900">{asset.roomNumber || 'General'}</strong> ({asset.wing.toUpperCase()} Wing)
                  </div>
                </div>

                {/* Duration & Age stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Service Age:</div>
                    <div className="font-bold text-slate-800 font-mono">{ageYears} Years ({asset.ageInMonths} mo)</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Installed On:</div>
                    <div className="font-bold text-slate-800 font-mono">{asset.installDate}</div>
                  </div>
                </div>

                {asset.notes && (
                  <div className="mt-2 text-[11px] text-slate-500 italic">
                    "{asset.notes}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-mono font-bold text-slate-500">
                  Risk: <span className="text-amber-700">{asset.predictiveScore}/100</span>
                </div>

                <button
                  onClick={() => setQrModalAsset(asset)}
                  className="px-3 py-1.5 bg-maroon-50 hover:bg-maroon-100 text-maroon-800 border border-maroon-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Print QR Tag</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QR Code Printable Modal */}
      {qrModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white text-slate-900 rounded-3xl shadow-2xl p-6 text-center border border-slate-200">
            <button
              onClick={() => setQrModalAsset(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-maroon-800">
                MIT ACSC Official Asset QR Tag
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">{qrModalAsset.name}</h3>
              <div className="font-mono text-xs font-bold text-maroon-700">{qrModalAsset.assetTag}</div>
            </div>

            {/* Rendered SVG QR Code */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 inline-block my-2">
              <QRCodeSVG
                value={`https://mitacsc.ac.in/report?assetTag=${qrModalAsset.assetTag}&id=${qrModalAsset.id}`}
                size={180}
                level="H"
                fgColor="#821930" // Maroon QR
                includeMargin={false}
              />
            </div>

            <div className="text-xs text-slate-600 space-y-0.5 mt-2">
              <div><strong>Location:</strong> {qrModalAsset.building}</div>
              <div>Floor {qrModalAsset.floor}, Room {qrModalAsset.roomNumber || 'Corridor'}</div>
              <div className="text-[10px] text-slate-400 pt-1">Scan with any phone camera for 5-second fault reporting</div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Sticker
              </button>
              <button
                onClick={() => setQrModalAsset(null)}
                className="py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Register New Campus Equipment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter fan number, location, installation date, and expected lifecycle
            </p>

            <form onSubmit={handleAddAssetSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipment Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unique Asset Tag / Fan #:</label>
                  <input
                    type="text"
                    required
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-maroon-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700 capitalize"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Brand:</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model / Specs:</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Building:</label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-[11px]"
                  >
                    {CAMPUS_BUILDINGS.map((b: any) => (
                      <option key={b.id} value={b.name}>
                        {b.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor #:</label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room #:</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Installation Date:</label>
                  <input
                    type="date"
                    required
                    value={installDate}
                    onChange={(e) => setInstallDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lifespan (Years):</label>
                  <input
                    type="number"
                    value={expectedLifespanYears}
                    onChange={(e) => setExpectedLifespanYears(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Maintenance / Usage Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Older fan, serviced twice for capacitor replacement"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-maroon-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold rounded-xl shadow-xs"
                >
                  Register & Generate QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
