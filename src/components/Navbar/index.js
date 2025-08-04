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
import { MdNoteAdd } from "react-icons/md";
import { createRecord } from "../../services/recordService";
import Swal from "sweetalert2";
import "./styles.css";

export default function Navbar() {
  const { isLogged, logout } = useUser();
  const [showSideBar, setShowSidebar] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [ruta, setRuta] = useState('');
  const [recording, setRecording] = useState(false);
  const [placa, setPlaca] = useState('');
  const [zona, setZona] = useState('');

  const handleClickImg = (e) => {
    if(user.role==='bodega'){
      return navigate('/qrs')
    }else{
      return navigate('/records')
    }
  }

  useEffect(() => {
    setRuta(window.location.pathname);
  }, []);

  //logica para saber si es celular
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900); // Establecer a true si la ventana es menor o igual a 768px
    };

    // Llama a handleResize al cargar y al cambiar el tamaño de la ventana
    window.addEventListener('resize', handleResize);
    handleResize(); // Llama a handleResize inicialmente para establecer el estado correcto

    // Elimina el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

  /* constantes para el modal nuevo registro */
  const [showModalNew, setShowModalNew] = useState(false);
  const closeModalNew = () => {
    setShowModalNew(false);
  };
  const openModalNew = (number) => {
    setShowModalNew(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setRecording(true);
    if(placa !== '' && zona !== ''){
      const body = {
        placa: placa.toUpperCase(),
        zone: zona.toUpperCase(),
        status: 'En proceso',
      }
      createRecord(body)
      .then(()=>{
        setRecording(false);
        Swal.fire({
          title:'¡Felicitades!',
          text:'Se ha hecho el registro de manera satisfactoria.',
          showConfirmButton: true,
          confirmButtonColor:'green',
        })
        setPlaca('');
        setZona('');
      })
      .catch(()=>{
        setRecording(false);
        Swal.fire({
          title:'¡ERROR!',
          text:'Ha ocurrido un error al momento de hacer el registro. Intentalo de nuevo. Si el problema persiste comunícate con el programador.',
          showConfirmButton: true,
          confirmButtonColor:'red',
        })
      })
    }
  }

  return (
    <>
      {isLogged && (
        <div
          className="position-fixed shadow w-100"
          style={{ fontSize: 11, left: 0, height: "50px", zIndex: 2 , backgroundColor:'#145a83' }}
        >

          {/* Modal de nuevo registro */}
            <Modal show={showModalNew} onHide={closeModalNew} centered>
              <Modal.Header closeButton>
                <Modal.Title
                  className='d-flex w-100 justify-content-center'
                  style={{
                    color:'#145a83'
                  }}
                >Nuevo registro</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <label>Para llevar a cabo el nuevo registro debes ingresar la placa a continuación:</label>
                <div className='d-flex w-100 justify-content-center mt-1'>
                  <input
                    type="text"
                    value={placa}
                    className="form-control form-control-sm shadow-sm"
                    onChange={(e) => setPlaca(e.target.value)}
                    style={{textTransform:'uppercase', width: isMobile ? '100%' : '50%'}}
                    placeholder='Eje: ABC000'
                    required
                  />
                </div>
                <div className='d-flex w-100 justify-content-center mt-2'>
                  <select
                    className="form-select form-select-sm"
                    value={zona}
                    id="zona"
                    style={{textTransform:'uppercase', width: isMobile ? '100%' : '50%'}}
                    required
                    onChange={(e) => setZona(e.target.value)}
                  >
                    <option selected value="" disabled>
                      -- Seleccione la zona --
                    </option>
                    <option id="vip" value="vip">
                      VIP
                    </option>
                    <option id="patios" value="patios">
                      PATIOS
                    </option>
                    <option id="domicilio" value="domicilio">
                      DOMICILIO
                    </option>
                  </select>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="success" onClick={(e)=>handleSubmit(e)}>
                  {recording ? 'REGISTRANDO...' : 'Registrar'} 
                </Button>
                <Button variant="danger" onClick={closeModalNew}>
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
                onClick={(e)=> handleClickImg(e)}
                style={{ cursor: "pointer" }}
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
              {(user.role === 'admin' || user.role === 'supervisor' || user.role === 'creador') &&
                <li className="nav-text">
                  <Link
                    onClick={(e)=>openModalNew(e)}  
                    style={{backgroundColor: 'transparent', color: 'white'}}
                  >
                    <MdNoteAdd />
                    <span>Nuevo registro</span>
                  </Link>
                </li>
              }
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
