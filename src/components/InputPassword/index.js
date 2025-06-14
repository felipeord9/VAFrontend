import { useState, useCallback } from "react";
import * as Bs from "react-icons/bs";

export default function InputPassword({ id, label, password, setPassword }) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = useCallback((e) => {
    setShowPassword(!showPassword);
  });

  const handleChange = useCallback((e) => {
    const { value } = e.target;
    setPassword(value);
  });

  return (
    <div className="d-flex flex-column" style={{fontSize: 13.5}}>
      <label className="fw-bold">{label}</label>
      <div className="d-flex align-items-center position-relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className="form-control form-control-sm shadow-sm"
          onChange={handleChange}
          style={{ paddingRight: 33 }}
          minLength={4}
          autoComplete="off"
          required
        />
        <span
          className="position-absolute"
          onClick={togglePasswordVisibility}
          style={{ right: 10, cursor: "pointer" }}
        >
          {showPassword ? <Bs.BsEye /> : <Bs.BsEyeSlash />}
        </span>
      </div>
    </div>
  );
}