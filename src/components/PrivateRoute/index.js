import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../../context/authContext";

function PrivateRoute({ component: Component, ...rest }) {
  const { token } = useContext(AuthContext);

  return token ? <Component {...rest} /> : <Navigate to="/login" />;
}

export default PrivateRoute;