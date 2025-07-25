import React from "react";
const { useState } = React;

/**
 * InlineEditingInput - generic inline-editing input for use outside of a table
 * Props:
 * - value: current value to display
 * - type: form type (text, number, date, etc.)
 * - onSave: function(newValue) => Promise
 */

const InlineEditingInput = ({ value, type, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      await onSave(editValue);
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value);
    }
  };

  return (
    <div
      className="border p-1 cursor-pointer min-h-9"
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <input
          className="w-full"
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          onBlur={() => setIsEditing(false)}
        />
      ) : (
        value
      )}
    </div>
  );
}

export default InlineEditingInput;