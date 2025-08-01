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
import TableRecords from '../../components/TableRecords';
import { findInstaladores, findUsers } from '../../services/userService';

export default function Records() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [typeDate, setTypeDate] = useState('Entrada');
  const [filterDate, setFilterDate] = useState({
    initialDate: '',
    finalDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchRef, setSearchRef] = useState('');
  const [searchZone, setSearchZone] = useState('');
  const [searchInstalador, setSearchInstalador] = useState('');
  const [searchNew, setSearchNew] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recording, setRecording] = useState(false);
  const [placa, setPlaca] = useState('');
  const [zona, setZona] = useState('');
  const selectRefInstalador = useRef();
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
        getRecordsPending();
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
    findRecord()
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

  const [fillWithDate, setFillWithDate] = useState({})
  const [fillWithRef, setFillWithRef] = useState({})

  const duoSearch = (e) =>{
      e.preventDefault();
      if(searchRef !== '' && filterDate.finalDate === '' && filterDate.initialDate === ''){
        const valor = searchRef.toUpperCase()
        const filtered = records.filter((elem) => {
          const dato = elem.placa.toUpperCase();
          if(dato.includes(valor)) {
            return elem
          }
        })
        if(filtered.length > 0) {  
          setSuggestions(filtered)
        } else {
          setSuggestions([])
        }
      }else if(searchRef === '' && filterDate.finalDate !== '' && filterDate.initialDate !== ''){
        const initialDate = new Date(filterDate?.initialDate?.split('-').join('/')).toLocaleDateString();
        const finalDate = new Date(filterDate?.finalDate?.split('-').join('/')).toLocaleDateString();
        if(typeDate === 'Entrada'){
          const filtered = records.filter((elem) => {
            const splitDate = new Date(elem.initalDate).toLocaleDateString();
            if (splitDate >= initialDate && splitDate <= finalDate) {
              return elem;
            }
            return 0;
          });
          setSuggestions(filtered);
        }else{
          const filtered = records.filter((elem) => {
            const splitDate = new Date(elem.finalDate).toLocaleDateString();
            if (splitDate >= initialDate && splitDate <= finalDate) {
              return elem;
            }
            return 0;
          });
          setSuggestions(filtered);
        }
      }else{
        if(filterDate.finalDate !== '' && filterDate.initialDate !== ''){
          const initialDate = new Date(filterDate?.initialDate?.split('-').join('/')).toLocaleDateString();
          const finalDate = new Date(filterDate?.finalDate?.split('-').join('/')).toLocaleDateString();
          let filtered ;
          if(typeDate === 'Entrada'){
            filtered = records.filter((elem) => {
              const splitDate = new Date(elem.initalDate).toLocaleDateString();
              if (splitDate >= initialDate && splitDate <= finalDate) {
                return elem;
              }
              return 0;
            });
          }else{
            filtered = records.filter((elem) => {
              const splitDate = new Date(elem.finalDate).toLocaleDateString();
              if (splitDate >= initialDate && splitDate <= finalDate) {
                return elem;
              }
              return 0;
            });
          }
          const valor = searchRef.toUpperCase();
          const duoFiltered = filtered.filter((elem) => {
            const dato = elem.placa.toUpperCase();
            if(dato.includes(valor)) {
              return elem
            }
          })
          if(duoFiltered.length > 0) {  
            setSuggestions(duoFiltered)
          } else {
            setSuggestions([])
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
      }
    }

  const completeSearch = (e) =>{
      e.preventDefault();
      let result = records;
      //filtro por placa
      if(searchRef !== ''){
        const valor = searchRef.toUpperCase()
        const filtered = result.filter((elem) => {
          const dato = elem.placa.toUpperCase();
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
      if(searchZone !== ''){
        const valor = searchZone.toUpperCase()
        const filtered = result.filter((elem) => {
          if(elem.zone !== null){
            const dato = elem?.zone.toUpperCase();
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
      if(searchInstalador !== ''){
        const valor = searchInstalador.toUpperCase()
        const filtered = result.filter((elem) => {
          if(elem.initialCreatedBy !== null){
            const dato = elem?.initialCreatedBy.toUpperCase();
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
          const splitDate = new Date(elem.initalDate).toLocaleDateString();
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
    setSearchZone('');
    setSearchInstalador('');
    getRecordsPending();
    setFillWithDate({})
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

  // Lógica para calcular duración entre fechas
  const handleDuration = (row) => {
    if (row.initalDate !== null && row.finalDate !== null) {
      const inicio = new Date(row.initalDate.replace(" ", "T"));
      const fin = new Date(row.finalDate.replace(" ", "T"));
      const diferenciaMs = fin - inicio;
      let totalSeconds = Math.floor(diferenciaMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      return "";
    }
  };

  // Lógica para exportar la tabla a un Excel
  const exportToExcel = (data) => {
    const filteredData = data.map((item) => {
      const placa = item?.placa?.toUpperCase();
      const zona = item?.zone?.toUpperCase();
      const status = item?.status?.toUpperCase();
      const initalDate = item.initalDate !== null ? new Date(item?.initalDate).toLocaleString("es-CO") : '';
      const initialCreatedBy = item?.initialCreatedBy;
      const newsDate = item.newsDate !== null ? new Date(item?.newsDate).toLocaleString("es-CO") : '';
      const newsCreatedBy = item?.newsCreatedBy;
      const finalDate = item.finalDate !== null ? new Date(item?.finalDate).toLocaleString("es-CO") : '';
      const finalCreatedBy = item?.finalCreatedBy;
      const duracion = handleDuration(item);

      return {
        'Placa': placa,
        'Zona': zona,
        'Estado': status,
        'Fecha Inicio': initalDate,
        'Instalador Inicio': initialCreatedBy,
        'Fecha Novedad': newsDate,
        'Instalador Novedad': newsCreatedBy,
        'Fecha Final': finalDate,
        'Instalador Final': finalCreatedBy,
        'Duración': duracion,
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
            <label style={{fontSize: isMobile ? 15 : 22, color: '#145a83'}} className='d-flex justify-content-center fw-bold'>TABLA DE REGISTROS</label>
            {/* Modal del filtro */}
            <Modal show={showModal} onHide={closeModal} centered>
              <Modal.Header closeButton>
                <Modal.Title className='d-flex justify-content-center w-100 fw-bold'>Detalles</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group controlId="formWeight">
                <div className='d-flex flex-column'>
                  <label className='me-2'>Placa</label>
                  <input
                    id="placa"
                    type="text"
                    value={searchRef && searchRef.toUpperCase()}
                    className="form-control form-control-sm"
                    onChange={(e)=>(setSearchRef(e.target.value))}
                  />
                </div>
                <hr className='mb-1 mt-3'/>
                <div className='d-flex flex-column'>
                  <label className='me-2'>Zona</label>
                  <select
                    className="form-select form-select-sm"
                    value={searchZone}
                    id="searchZone"
                    style={{textTransform:'uppercase', width: '100%'}}
                    required
                    onChange={(e) => setSearchZone(e.target.value)}
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
                <hr className='mb-1 mt-3'/>
                <div className='d-flex flex-column'>
                  <label className='me-2'>Instalador</label>
                  <select
                    ref={selectRefInstalador}
                    className="form-select form-select-sm w-100 me-3"
                    onChange={(e) => setSearchInstalador(e.target.value)}
                    required
                  >
                    <option selected value='' disabled>
                      -- Seleccione el instalador --
                    </option>
                      {users
                      .sort((a, b) => a.id - b.id)
                      .map((elem) => (
                        <option id={elem.id} value={(elem.name)}>
                          {elem.name}
                        </option>
                      ))}
                  </select>
                  {/* <select
                    className="form-select form-select-sm"
                    value={searchInstalador}
                    id="searchInstalador"
                    style={{textTransform:'uppercase', width: isMobile ? '100%' : '50%'}}
                    required
                    onChange={(e) => setSearchInstalador(e.target.value)}
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
                  </select> */}
                </div>
                <hr className='mb-1 mt-3'/>
                {/* <div className='d-flex w-100 justify-content-center gap-2 mt-1'>
                  <button 
                    className={`btn btn-sm btn-${typeDate === 'Entrada' ? 'primary' : 'secondary'}`}
                    onClick={(e)=>setTypeDate('Entrada')}
                  >Entrada</button> 
                  <button
                    className={`btn btn-sm btn-${typeDate === 'Entrada' ? 'secondary' : 'primary'}`}
                    onClick={(e)=>setTypeDate('Salida')}
                  >Salida</button> 
                </div> */}
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
              {(user.role === 'admin' || user.role === 'supervisor' || user.role === 'creador') &&
                <button 
                  className='btn btn-sm btn-danger d-flex justify-content-center' 
                  style={{width:isMobile ? '100%':'50%'}}
                  onClick={(e) => openModalNew(e)}
                >
                  <MdNoteAdd className='mt-1 me-1'/>
                  Nuevo registro
                </button>
              }
            </div> 
          </div>
        </div>
        <TableRecords records={suggestions} getAllRecords={getRecordsPending} loading={loading}/>
      </div>
    </div>
  );
}