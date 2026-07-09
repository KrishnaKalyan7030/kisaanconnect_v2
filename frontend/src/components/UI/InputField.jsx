import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}) {
  
  const [showPassword, setShowPassword] = useState(false);

  
  const inputType =
    type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  
  return (
    <div className="mb-4">
      {/* Label */}
      <label className="mb-2 block font-medium text-gray-700">
        {label}
      </label>

      {/* Input + Eye Icon */}
      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg border border-gray-300 p-3 pr-12 outline-none transition focus:border-green-600"
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-green-600"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default InputField;