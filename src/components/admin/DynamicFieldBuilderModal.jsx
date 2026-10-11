'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Save, MoveVertical, Sparkles } from 'lucide-react';

export default function DynamicFieldBuilderModal({ product, onClose, onSaveFields }) {
  if (!product) return null;

  const [fields, setFields] = useState(
    product.customFields && product.customFields.length > 0
      ? product.customFields
      : [
          { fieldId: 'bride_name', label: 'Bride Full Name', placeholder: 'e.g. Ayesha Noor', required: true, type: 'text' },
          { fieldId: 'groom_name', label: 'Groom Full Name', placeholder: 'e.g. Hamza Tariq', required: true, type: 'text' },
          { fieldId: 'wedding_date', label: 'Wedding / Nikkah Date', placeholder: 'DD/MM/YYYY', required: true, type: 'date' },
          { fieldId: 'special_instructions', label: 'Special Instructions', placeholder: 'Any specific calligraphy or floral border requests...', required: false, type: 'textarea' },
        ]
  );

  const handleAddField = () => {
    const newId = `field_${Date.now()}`;
    setFields([
      ...fields,
      {
        fieldId: newId,
        label: 'New Custom Input',
        placeholder: 'Enter details...',
        required: true,
        type: 'text',
      },
    ]);
  };

  const handleUpdateField = (index, key, value) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    // If updating label, auto generate clean fieldId if needed
    if (key === 'label' && (!updated[index].fieldId || updated[index].fieldId.startsWith('field_'))) {
      updated[index].fieldId = value.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    }
    setFields(updated);
  };

  const handleRemoveField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSaveFields(product.id, fields);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#E3C677]" />
            <div>
              <h3 className="font-serif font-bold text-base">Dynamic Field Builder</h3>
              <p className="text-xs text-[#E3C677]">
                Product: {product.name} ({product.productType})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 bg-[#FAF7F2] flex-1">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            Customize and rename input fields shown to customers on the product page. Customers ordering this item will be prompted with these exact text fields.
          </div>

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div
                key={field.fieldId || idx}
                className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs space-y-3 transition hover:border-[#C59A27]/60"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#A47A1A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Field #{idx + 1}: {field.fieldId}
                  </span>
                  <button
                    onClick={() => handleRemoveField(idx)}
                    className="text-stone-400 hover:text-rose-600 transition p-1"
                    title="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Field Label (Displayed to Customer)</label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleUpdateField(idx, 'label', e.target.value)}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#C59A27] bg-stone-50"
                      placeholder="e.g. Bride Name, Wedding Date"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Input Placeholder</label>
                    <input
                      type="text"
                      value={field.placeholder}
                      onChange={(e) => handleUpdateField(idx, 'placeholder', e.target.value)}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#C59A27] bg-stone-50"
                      placeholder="e.g. Enter bride full name"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Input Type</label>
                    <select
                      value={field.type}
                      onChange={(e) => handleUpdateField(idx, 'type', e.target.value)}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-[#C59A27] bg-stone-50"
                    >
                      <option value="text">Single Line Text</option>
                      <option value="date">Date Picker (DD/MM/YYYY)</option>
                      <option value="textarea">Multi-line Paragraph</option>
                      <option value="number">Numeric</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id={`req_${idx}`}
                      checked={field.required}
                      onChange={(e) => handleUpdateField(idx, 'required', e.target.checked)}
                      className="w-4 h-4 text-[#C59A27] rounded border-stone-300 focus:ring-[#C59A27]"
                    />
                    <label htmlFor={`req_${idx}`} className="font-semibold text-stone-800 cursor-pointer">
                      Mandatory Field (Required)
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddField}
            className="w-full py-2.5 px-4 border-2 border-dashed border-[#C59A27]/40 hover:border-[#C59A27] rounded-xl text-xs font-bold text-[#A47A1A] hover:bg-amber-50/50 flex items-center justify-center space-x-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Input Field</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-5 py-2 bg-[#C59A27] hover:bg-[#A47A1A] text-white text-xs font-bold rounded-lg shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Custom Fields</span>
          </button>
        </div>
      </div>
    </div>
  );
}
