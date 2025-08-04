import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ClientContextProvider } from "./context/clientContext";
import { AuthContextProvider } from './context/authContext';
import Login from "./pages/Login"
import Users from "./pages/Users"
import ChangePassword from './pages/ChangePassword';
import SendRecoveryPassword from "./pages/SendRecoveryPassword"
import RecoveryPassword from './pages/RecoveryPassword';
import Page404 from "./pages/Page404"
import Navbar from './components/Navbar';
import PrivateRoute from "./components/PrivateRoute";
import PendigRecords from './pages/PendingRecords';
import RecordsComplete from './pages/RecordsComplete';
import InitialVideo from './pages/InitialVideo';
import FinalVideo from './pages/FinalVideo';
import QrMail from './pages/QrMail';
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import ViewRegister from './pages/ViewRegister';
import Records from './pages/Records';
import News from './pages/News';
import PreviewRegister from './pages/PreviewRegister';
import Qrs from './pages/Qrs';

function App() {
  return (
    <AuthContextProvider>
      <ClientContextProvider>
        <Router>
          <Navbar />
          <div id='wrapper' className="d-flex vh-100 overflow-auto p-0">
            <Routes>
              <Route path='/' element={<Navigate to="/login" />} />
              <Route path='login' element={<Login />} />
              <Route path='/usuarios' element={<PrivateRoute component={Users} />} />
              <Route path='/cambiar/contrasena' element={<PrivateRoute component={ChangePassword} />} />
              {/* <Route path='/enviar/recuperacion' element={<SendRecoveryPassword/>} /> */}
              {/* <Route path='/recuperacion/contrasena/:token' element={<RecoveryPassword/>} /> */}
              <Route path='*' element={<Page404 />} />

              {/* rutas privadas */}
              <Route path='/start/record/:id' element={<PrivateRoute component={InitialVideo} />} />
              <Route path='/news/:id' element={<PrivateRoute component={News} />} />
              <Route path='/end/record/:id' element={<PrivateRoute component={FinalVideo} />} />
              <Route path='/pending/records' element={<PrivateRoute component={PendigRecords} />} />
              <Route path='/records' element={<PrivateRoute component={Records} />} />
              <Route path='/records/complete' element={<PrivateRoute component={RecordsComplete} />} />
              <Route path='/view/register/:id' element={<PrivateRoute component={ViewRegister} />} />
              <Route path='/preview/register/:id' element={<PrivateRoute component={PreviewRegister} />} />
              <Route path='/qr/mail' element={<PrivateRoute component={QrMail} />} />
              <Route path='/qrs' element={<PrivateRoute component={Qrs} />} />
            </Routes>
          </div>
        </Router>
      </ClientContextProvider>
    </AuthContextProvider>
  );
}

export default App;
