import React from 'react';
import { useState, useEffect, useContext } from "react";
import TableRecordsComplete from '../../components/TableRecordsComplete';
import AuthContext from "../../context/authContext";
import { findRecordsComplete } from '../../services/recordService';
import { Modal, Button, Form } from "react-bootstrap";
import * as XLSX from "xlsx";
import * as FaIcons from "react-icons/fa";
import { MdNoteAdd } from "react-icons/md";
import { SiMicrosoftexcel } from "react-icons/si";
import { saveAs } from "file-saver";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import './styles.css'

export default function RecordsComplete() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [typeDate, setTypeDate] = useState('Entrada');
  const [filterDate, setFilterDate] = useState({
    initialDate: '',
    finalDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchRef, setSearchRef] = useState('')
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

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
    getRecordsComplete();
  }, []);

  //funcion para obtener los registros completos
  const getRecordsComplete = () => {
    setLoading(true)
    findRecordsComplete()
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
    getRecordsComplete();
    setFillWithDate({})
  };  

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column gap-2 h-100">
        <div className="d-flex div-botons justify-content-center align-items-center bg-light rounded shadow-sm p-2 pe-2">
          <div className='d-flex flex-column w-100'>
            <label style={{fontSize: isMobile ? 15 : 22, color: 'rgba(74, 157, 38, 0.7)'}} className='d-flex justify-content-center fw-bold'>REGISTROS COMPLETADOS</label>
            <Modal show={showModal} onHide={closeModal} centered>
              <Modal.Header closeButton>
                <Modal.Title className='d-flex justify-content-center w-100 fw-bold'>Detalles del filtro</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group controlId="formWeight">
                <div className='d-flex flex-column'>
                  <label className='me-2 mt-1'>PLACA</label>
                  <input
                    id="placa"
                    type="text"
                    value={searchRef && searchRef.toUpperCase()}
                    className="form-control form-control-sm"
                    onChange={(e)=>(setSearchRef(e.target.value))}
                  />
                </div>
                <hr className='mb-1 mt-3'/>
                <div className='d-flex w-100 justify-content-center gap-2 mt-1'>
                  <button 
                    className={`btn btn-sm btn-${typeDate === 'Entrada' ? 'primary' : 'secondary'}`}
                    onClick={(e)=>setTypeDate('Entrada')}
                  >Entrada</button> 
                  <button
                    className={`btn btn-sm btn-${typeDate === 'Entrada' ? 'secondary' : 'primary'}`}
                    onClick={(e)=>setTypeDate('Salida')}
                  >Salida</button> 
                </div>
                <div className='d-flex flex-column'>
                  <label className='me-2'>Desde</label>
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
                <Button variant="primary" onClick={(e)=>(duoSearch(e), closeModal(e))}>
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
                style={{width:isMobile ? '100%':'50%'}}
                onClick={openModal}
              >
                <FaIcons.FaFilter className='mt-1 me-1'/>
                Filtrar
              </button>
              <button 
                className='btn btn-sm btn-danger d-flex justify-content-center' 
                style={{width:isMobile ? '100%':'50%'}}
                onClick={(e) => (navigate('/start/record'))}
              >
                <MdNoteAdd className='mt-1 me-1'/>
                Nuevo registro
              </button>
            </div>
          </div>
        </div>
        <TableRecordsComplete records={suggestions} getAllBalances={getRecordsComplete} loading={loading}/>
      </div>
    </div>
  );
}
