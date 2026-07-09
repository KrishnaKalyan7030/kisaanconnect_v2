import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}) {
  // ==========================
  // State
  // ==========================
  const [showPassword, setShowPassword] = useState(false);

  // ==========================
  // Logic
  // ==========================
  const inputType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  // ==========================
  // JSX
  // ==========================
  return (
    <div className="mb-4">
      <label className="mb-2 block font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-300 p-3 pr-12 outline-none focus:border-green-600"
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
          >
            {showPassword ? (
              <EyeOff size={15} />
            ) : (
              <Eye size={15} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default InputField;