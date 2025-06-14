import { useState, useContext , useEffect , useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as FiIcons from "react-icons/fi";
import * as FaIcons from "react-icons/fa";
import AuthContext from "../../context/authContext";
import useUser from "../../hooks/useUser";
import { NavBarData } from "./NavbarData";
import { MdQrCodeScanner } from "react-icons/md";
import { Modal, Button } from "react-bootstrap";
import { Html5QrcodeScanner } from "html5-qrcode";
import Logo from "../../assets/AVRecortado.png";
import "./styles.css";

export default function Navbar() {
  const { isLogged, logout } = useUser();
  const [showSideBar, setShowSidebar] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ruta, setRuta] = useState('');

  const handleClickImg = (e) => {
    if(user.role==='aprobador'){
      return navigate('/solicitudes')
    }else{
      return navigate('/inicio')
    }
  }

  useEffect(() => {
    setRuta(window.location.pathname);
  }, []);

  //logica del modal con el scanner
  const [showModal, setShowModal] = useState(false);
  const scannerRef = useRef(null);
  const openModal = () => {
    setShowModal(true)
  }
  const handleCloseModal  = () => {
    setShowModal(false)
  }
  //logica para abrir el scanner cuando se abra el modal
  useEffect(() => {
    if (showModal) {
      const config = {
        fps: 10, // Frames per second
        qrbox: { width: 250, height: 250 }, // Scanning area size
        
      };
      // Personalizar los textos del escáner
      const updateLabelsToSpanish = () => {
        const startScanningButton = document.querySelector(".html5-qrcode-button-camera-start");
        const stopScanningButton = document.querySelector(".html5-qrcode-button-camera-stop");
        const cameraPermissionText = document.querySelector(".html5-qrcode-camera-permission-text");
        const cameraUnavailableText = document.querySelector(".html5-qrcode-camera-setup-text");

        if (startScanningButton) startScanningButton.innerText = "Iniciar escaneo";
        if (stopScanningButton) stopScanningButton.innerText = "Detener escaneo";
        if (cameraPermissionText) cameraPermissionText.innerText = "Por favor, permita el acceso a la cámara.";
        if (cameraUnavailableText) cameraUnavailableText.innerText = "Cámara no disponible. Verifique su configuración.";
      };

      const scanner = new Html5QrcodeScanner("qr-reader", config, false);

      scanner.render(
        (decodedText) => {
          handleCloseModal(); // Close the modal after scanning
          scanner.clear(); // Clear the scanner
          window.location.href = decodedText;
        },
        (error) => {
          console.warn(error);
        }
      );
      
      // Modificar textos al español después de renderizar
      setTimeout(updateLabelsToSpanish, 500); // Esperar a que se renderice la interfaz
      
      scannerRef.current = scanner;
    }

    // Cleanup on modal close or component unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [showModal]);

  return (
    <>
      {isLogged && (
        <div
          className="position-fixed shadow w-100"
          style={{ fontSize: 11, left: 0, height: "50px", zIndex: 2 , backgroundColor:'#145a83' }}
        >
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Escanear Código QR</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div id="qr-reader" style={{ width: "100%", textAlign: "center" }}></div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={handleCloseModal}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
          <div className="d-flex flex-row justify-content-between align-items-center w-100 h-100 px-3 shadow">
            <div
              id="logo-header"
              className="d-flex flex-row align-items-center gap-2"
            >
              <img
                src={Logo}
                width={100}
                alt=""
              />
            </div>

            <div className="d-flex flex-row align-items-center pe-0 me-0">
              <span className="menu-bars m-0" style={{ cursor: "pointer" }}>
                <FaIcons.FaBars
                  className=""
                  style={{color:'white'}}
                  onClick={(e) => setShowSidebar(!showSideBar)}
                />
              </span>
            </div>
          </div>

          <nav
            className={showSideBar ? " nav-menu active" : "nav-menu"}
            style={{backgroundColor:'#145a83', color:'white'}}
          >
            <ul
              className="nav-menu-items"
              onClick={(e) => setShowSidebar(!showSideBar)}
              style={{userSelect:'none'}}
            >
              {/* <li className="nav-text">
                <Link
                  onClick={(e)=>openModal(e)}  
                >
                  <MdQrCodeScanner />
                  <span>Scannear Código QR</span>
                </Link>
              </li> */}
              {NavBarData.map((item, index) => {
                if (item.access.includes(user.role)) {
                  return (
                    <li key={index} className={item.cName} >
                      <Link 
                        to={item.path}
                        onClick={(e)=>setRuta(item.path)}
                        style={{backgroundColor:(ruta === item.path) ? 'white' : 'transparent', color:(ruta===item.path) ? 'black' : 'white'}}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
            <ul
              className="nav-menu-items mb-4 pb-1"
              onClick={(e) => setShowSidebar(!showSideBar)}
              style={{userSelect:'none' , listStyle:'none'}}
            >
              <li className="text-center text-secondary">
                <button 
                  className="btn btn-sm btn-danger w-100 p-2"
                  
                  /* style={{backgroundColor:'#eb6146', color:'white'}} */
                  onClick={(e)=>(logout(e), setRuta('/pending/records'))}
                >
                  Cerrar sesión
                </button>
              </li>
              <li className="text-center mt-1">
                <span className="m-0">Vidrios & Accesorios</span>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
