import { useState, useEffect , useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputPassword from "../../components/InputPassword";
import useUser from "../../hooks/useUser";
import AuthContext from "../../context/authContext";
import Logo from "../../assets/AVRecortado.png";
import "./styles.css";

export default function Login() {
  const { login, isLoginLoading, hasLoginError, isLogged } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    /* if (isLogged) navigate('/records') */
    if (
      isLogged && user.role==='admin' || isLogged && user.role==='creador' ||
      isLogged && user.role==='supervisor' || isLogged && user.role==='usuario'
    ){
      navigate('/records')
    }else if(isLogged && user.role==='bodega'){
      navigate('/')
    }
  }, [isLogged, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="d-flex justify-content-center align-items-center h-100 w-100 m-auto">
      <div
        className="card p-4 pt-3 rounded-4 m-auto shadow"
        style={{ maxWidth: 370 , border:'2px solid #145a83'}}
      >
        <div className="mb-2 p-2">
          <img src={Logo} style={{borderRadius:10}} className="w-100" alt="logo" />
        </div>
        <form
          className="d-flex flex-column gap-2"
          style={{ fontSize: 13.5 }}
          onSubmit={handleLogin}
        >
          <div>
            <label className="fw-bold">Nombre de usuario</label>
            <input
              type="text"
              value={email}
              className="form-control form-control-sm shadow-sm"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <InputPassword
              label="Contraseña"
              password={password}
              setPassword={setPassword}
            />
          </div>
          <div className="w-100 justify-content-center align-items-center d-flex">
            <button
              type="submit"
              className="text-light btn btn-sm mt-2 w-50 justify-content-center rounded-4"
              style={{ backgroundColor: "#145a83" }}
            >
              Ingresar
            </button>
          </div>
        </form>
        {isLoginLoading && <div className="loading">Cargando...</div>}
        {hasLoginError && (
          <div className="text-danger text-center mt-2">
            Usuario o contraseña incorrectos
          </div>
        )}
        {/* <Link
          to="/enviar/recuperacion"
          className="text-primary text-center text-decoration-none mt-3"
        >
          ¿Olvidó su contraseña?
        </Link> */}
      </div>
    </div>
  );
}
