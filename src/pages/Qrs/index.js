import React, { useRef } from 'react';
import { useState, useEffect, useContext } from "react";
import TablePendingRecords from '../../components/TablePendingRecords';
import AuthContext from "../../context/authContext";
import { createRecord, findRecord, findRecordsPending } from '../../services/recordService';
import { Modal, Button, Form } from "react-bootstrap";
import * as XLSX from "xlsx";
import * as FaIcons from "react-icons/fa";
import { MdNoteAdd } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import { saveAs } from "file-saver";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import './styles.css'
import { findInstaladores, findUsers } from '../../services/userService';
import { findQrs } from '../../services/qrService';
import TableQrs from '../../components/TableQrs';

export default function Qrs() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [filterDate, setFilterDate] = useState({
    initialDate: '',
    finalDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchNoFactura, setSearchNoFactura] = useState('');
  const [searchRef, setSearchRef] = useState('');
  const [searchRazonsocial, setSearchRazonsocial] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllUsers()
  }, []);
  
  const getAllUsers = () => {
    findInstaladores()
      .then(({ data }) => {
        setUsers(data)
      })
      .catch((error) => {
        console.log('error')
      });
  }

  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
  };
  const openModal = (number) => {
    setShowModal(true);
  };

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

  useEffect(() => {
    getRecordsPending();
  }, []);

  //funcion para obtener los registros completos
  const getRecordsPending = () => {
    setLoading(true)
    findQrs()
    .then(({data})=>{
      setLoading(false)
      setRecords(data)
      setSuggestions(data)
    })
    .catch((error)=>{
      setLoading(false)
      console.log(error)
    })
  };

  const completeSearch = (e) =>{
      e.preventDefault();
      let result = records;
      //filtro por placa
      if(searchRef !== ''){
        const valor = searchRef.toUpperCase()
        const filtered = result.filter((elem) => {
          const dato = elem.refProduct.toUpperCase();
          if(dato.includes(valor)) {
            return elem
          }
        })
        if(filtered.length > 0) {  
          result = filtered
        } else {
          result = []
        }
      }
      //filtro por zona
      if(searchNoFactura !== ''){
        const valor = searchNoFactura.toUpperCase()
        const filtered = result.filter((elem) => {
          if(elem.numFactura !== null){
            const dato = elem?.numFactura.toUpperCase();
            if(dato?.includes(valor)) {
              return elem
            }
          }
        })
        if(filtered.length > 0) {  
          result = filtered
        } else {
          result = []
        }
      }
      //filtro por instalador
      if(searchRazonsocial !== ''){
        const valor = searchRazonsocial.toUpperCase()
        const filtered = result.filter((elem) => {
          if(elem.razonSocial !== null){
            const dato = elem?.razonSocial.toUpperCase();
            if(dato?.includes(valor)) {
              return elem
            }
          }
        })
        if(filtered.length > 0) {  
          result = filtered
        } else {
          result = []
        }
      }
      //filtro por fecha
      if(filterDate.finalDate !== '' && filterDate.initialDate !== ''){
        const initialDate = new Date(filterDate?.initialDate?.split('-').join('/')).toLocaleDateString();
        const finalDate = new Date(filterDate?.finalDate?.split('-').join('/')).toLocaleDateString();
        const filtered = result.filter((elem) => {
          const splitDate = new Date(elem.createdAt).toLocaleDateString();
          if (splitDate >= initialDate && splitDate <= finalDate) {
            return elem;
          }
          return 0;
        });
        if(filtered.length > 0) {  
          result = filtered
        } else {
          result = []
        }
      }else if((filterDate.finalDate !== '' && filterDate.initialDate === '')||(filterDate.finalDate === '' && filterDate.initialDate !== '')){
        Swal.fire({
          icon:'warning',
          title:'¡ERROR!',
          text:'Para hacer un filtro por fecha debes de especificar la fecha inicial y la fecha final',
          confirmButtonColor:'red',
          confirmButtonText:'OK'
        })
      }

      //cargar los resultados
      if(result.length > 0) {  
        setSuggestions(result)
      } else {
        setSuggestions([])
      }
    }

  const handleChangeFilterDate = (e) => {
    const { id, value } = e.target;
    setFilterDate({
      ...filterDate,
      [id]: value,
    });
  };

  const removeFilterDate = () => {
    setFilterDate({
      initialDate: '',
      finalDate: '',
    });
    setSearchRef('');
    setSearchNoFactura('');
    setSearchRazonsocial('');
    getRecordsPending();
  };  

  // Función para aplicar estilos a los títulos
  const applyStylesToHeaders = (worksheet, data) => {
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    const headers = Object.keys(data[0]);

    // Estilos para celdas de encabezado
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;

      worksheet[cellAddress].s = {
        font: { bold: true },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "DCE6F1" } }, // Fondo azul claro
      };
    }

    // Ancho dinámico para columnas
    const columnWidths = headers.map((key) => {
      const maxContent = Math.max(
        key.length,
        ...data.map((row) => (row[key] ? row[key].toString().length : 0))
      );
      return { wch: maxContent + 2 };
    });

    worksheet["!cols"] = columnWidths;
  };

  // Lógica para exportar la tabla a un Excel
  const exportToExcel = (data) => {
    const filteredData = data.map((item) => {
      const numFactura = item?.numFactura;
      const razonSocial = item?.razonSocial;
      const refProduct = item?.refProduct;
      const descriProduct = item.descriProduct;
      const cantidad = item?.cantidad;
      const arriveDate = new Date(item?.arriveDate).toLocaleString("es-CO");
      const observations = item?.observations;
      const createdAt = new Date(item?.createdAt).toLocaleString("es-CO");

      return {
        'No. factura': numFactura,
        'Razón social': razonSocial,
        'Referencia': refProduct,
        'Descripción': descriProduct,
        'Cantidad': cantidad,
        'Fecha Llegada': arriveDate,
        'Fecha Creación': createdAt,
        'Observaciones': observations,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    applyStylesToHeaders(worksheet, filteredData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array", cellStyles: true });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });

    const filename = `VARecords_Reporte ${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    saveAs(dataBlob, `${filename}.xlsx`);
  };


  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column gap-2 h-100">
        <div className="d-flex div-botons justify-content-center align-items-center bg-light rounded shadow-sm p-2 pe-2">
          <div className='d-flex flex-column w-100'>
            <label style={{fontSize: isMobile ? 15 : 22, color: '#145a83'}} className='d-flex justify-content-center fw-bold'>TABLA DE QRS</label>
            {/* Modal del filtro */}
            <Modal show={showModal} onHide={closeModal} centered>
              <Modal.Header closeButton>
                <Modal.Title className='d-flex justify-content-center w-100 fw-bold'>Detalles</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group controlId="formWeight">
                <div className='d-flex flex-column'>
                  <label className='me-2'>No. Factura</label>
                  <input
                    id="placa"
                    type="text"
                    value={searchNoFactura && searchNoFactura.toUpperCase()}
                    className="form-control form-control-sm"
                    onChange={(e)=>(setSearchNoFactura(e.target.value))}
                  />
                </div>
                <hr className='mb-1 mt-3'/>
                <div className='d-flex flex-column'>
                  <label className='me-2'>Referencia de producto</label>
                  <input
                    id="searchRef"
                    type="text"
                    value={searchRef && searchRef.toUpperCase()}
                    className="form-control form-control-sm"
                    onChange={(e)=>(setSearchRef(e.target.value))}
                  />
                </div>
                <hr className='mb-1 mt-3'/>
                <div className='d-flex flex-column'>
                  <label className='me-2'>Razón social</label>
                  <input
                    id="searchRef"
                    type="text"
                    value={searchRazonsocial && searchRazonsocial.toUpperCase()}
                    className="form-control form-control-sm"
                    onChange={(e)=>(setSearchRazonsocial(e.target.value))}
                  />
                </div>
                <hr className='mb-1 mt-3'/>
                <div className='d-flex flex-column'>
                  <label className='me-2 mt-1'>Desde</label>
                  <input
                    id="initialDate"
                    type="date"
                    value={filterDate.initialDate}
                    className="form-control form-control-sm"
                    max={filterDate.finalDate !== '' ? filterDate.finalDate : new Date().toISOString().split("T")[0]}
                    onChange={handleChangeFilterDate}
                  />
                </div>
                <div className='d-flex flex-column '>
                  <label className='me-2 mt-1'>Hasta</label>
                  <input
                    id="finalDate"
                    type="date"
                    value={filterDate.finalDate}
                    className="form-control form-control-sm"
                    min={filterDate.initialDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={handleChangeFilterDate}
                    disabled={filterDate.initialDate === '' ? true : false}
                  />
                </div>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="primary" onClick={(e)=>(completeSearch(e), closeModal(e))}>
                  FILTRAR
                </Button>
                <Button variant="danger" onClick={(e)=>(removeFilterDate(e),closeModal(e))}>
                Borrar filtro
                </Button>
              </Modal.Footer>
            </Modal>

            <div className={`d-flex div-botons mt-1 w-100 ${isMobile ? 'gap-2' : 'gap-4'} ${isMobile ? 'mx-0' : 'px-2'}`}>
              <button
                className="btn btn-sm btn-primary d-flex justify-content-center "
                style={{width:isMobile ? '100%': user.role === 'usuario' ? '100%' : '50%'}}
                onClick={openModal}
              >
                <FaIcons.FaFilter className='mt-1 me-1'/>
                Filtrar
              </button>
              {(user.role === 'admin' || user.role === 'supervisor') &&
                <button 
                  className='btn btn-sm btn-success d-flex justify-content-center' 
                  style={{width:isMobile ? '100%':'50%'}}
                  onClick={() => exportToExcel(suggestions)}
                >
                  <SiMicrosoftexcel className='mt-1 me-1'/>
                  Exportar
                </button>
              }
              {(user.role === 'admin' || user.role === 'bodega') &&
                <button 
                  className='btn btn-sm btn-danger d-flex justify-content-center' 
                  style={{width:isMobile ? '100%':'50%'}}
                  onClick={(e) => navigate('/qr/mail')}
                >
                  <MdNoteAdd className='mt-1 me-1'/>
                  Nuevo QR
                </button>
              }
            </div> 
          </div>
        </div>
        <TableQrs qrs={suggestions} getAllQrs={getRecordsPending} loading={loading}/>
      </div>
    </div>
  );
}