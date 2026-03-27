import React, { useMemo, useRef } from 'react';
import { useState, useEffect, useContext } from "react";
import TablePendingRecords from '../../components/TablePendingRecords';
import AuthContext from "../../context/authContext";
import { createRecord, findOneByPlate, findRecord, findRecordsPending } from '../../services/recordService';
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
import { FaTableList } from "react-icons/fa6";
import { IoBarChartSharp } from "react-icons/io5";
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import InteractiveZoneDonutChart from '../../components/PieChartZones';
import InteractiveStateBarChart from '../../components/BarChartStates';
import InteractiveNewsDonutChart from '../../components/PieChatNews';
import { findTypes } from '../../services/typeInstallService';
import { FaCircle } from 'react-icons/fa';
import Select from 'react-select';

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
  const [typeInstall, setTypeInstall] = useState('');
  const [types, setTypes] = useState([]);
  const selectTypeInstall = useRef();
  const [entyInfo, setEntyInfo] = useState(false);
  const options = types
    .sort((a, b) => a.id - b.id)
    .map(elem => ({ value: elem.description, label: elem.description }));
  const selectRefInstalador = useRef();
  const [users, setUsers] = useState([]);
  const [reportes, setReportes] = useState(false);
  const [filterZone, setFilterZone] = useState('');
  const [filterState, setFilterState] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    getAllUsers();
    findTypes()
    .then(({data})=>{ setTypes(data) });
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if(placa !== '' && zona !== '' && typeInstall !== ''){
      setRecording(true);
      const { data } = await findOneByPlate(placa.toUpperCase())
      if(data.length > 0){
        Swal.fire({
          icon:'warning',
          title:'¡ATENCIÓN!',
          text:`Este vehículo ya ha sido registrado en nuestro sistema, ¿Qué acción desea realizar?`,
          showConfirmButton: true,
          confirmButtonText:'Ver historial',
          confirmButtonColor: 'grey',
          showDenyButton:true,
          denyButtonText: 'Crear nuevo',
          denyButtonColor: 'green',
        })
        .then(({isConfirmed, isDenied})=>{
          if(isConfirmed){
            closeModalNew();
            setSearchRef(placa.toUpperCase())
  
            //realizar filtro
            const valor = placa.toUpperCase()
            const filtered = records.filter((elem) => {
              const dato = elem.placa.toUpperCase();
              if(dato.includes(valor)) {
                return elem
              }
            })
            if(filtered.length > 0) {  
              //cargar los resultados
              setRecording(false);
              setSuggestions(filtered);
              setPlaca('');
              setZona('');
            }
          }else if(isDenied){
            const body = {
              placa: placa.toUpperCase(),
              zone: zona.toUpperCase(),
              typeInstall: typeInstall.toUpperCase(),
              status: 'En proceso',
              placaCreatedAt: new Date(),
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
              setTypeInstall('');
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
        })
      }else{
        const body = {
          placa: placa.toUpperCase(),
          zone: zona.toUpperCase(),
          typeInstall: typeInstall.toUpperCase(),
          status: 'En proceso',
          placaCreatedAt: new Date(),
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
          setTypeInstall('');
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
    }else {
      setEntyInfo(true)
      setTimeout(() => {
        setEntyInfo(false);
      }, 5000);
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
      if (filterDate.finalDate !== '' && filterDate.initialDate !== '') {
        // 1. Usar replace('-', '/') fuerza a JavaScript a tratar la fecha como LOCAL
        // Esto evita que se reste el desfase de la zona horaria.
        const startStr = filterDate.initialDate.replace(/-/g, '/');
        const endStr = filterDate.finalDate.replace(/-/g, '/');

        const initialDate = new Date(startStr);
        initialDate.setHours(0, 0, 0, 0);

        const finalDate = new Date(endStr);
        finalDate.setHours(23, 59, 59, 999);

        const filtered = result.filter((elem) => {
            // 2. Para la fecha del elemento (Postgres), new Date() suele manejarlo bien 
            // porque el string de Postgres ya trae el offset (-05)
            const itemDate = new Date(elem.placaCreatedAt);

            return itemDate.getTime() >= initialDate.getTime() && 
                  itemDate.getTime() <= finalDate.getTime();
        });

        result = filtered;

      } else if ((filterDate.finalDate !== '' && filterDate.initialDate === '') || 
                (filterDate.finalDate === '' && filterDate.initialDate !== '')) {
          Swal.fire({
              icon: 'warning',
              title: '¡ERROR!',
              text: 'Para hacer un filtro por fecha debes de especificar la fecha inicial y la fecha final',
              confirmButtonColor: 'red',
              confirmButtonText: 'OK'
          });
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
      const typeInstall = item.typeInstall.toUpperCase();
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
        'Tipo de vidrio': typeInstall,
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

  const exportToExcel2 = () => {
    // 1. Preparar los metadatos del filtro
    const filtroInfo = [
      { 'Reporte': 'INFORME DE INSTALACIONES' },
      { 'Reporte': 'Fecha de Generación', 'Valor': new Date().toLocaleString() },
      { 'Reporte': 'Filtro Desde', 'Valor': filterDate.initialDate || 'N/A' },
      { 'Reporte': 'Filtro Hasta', 'Valor': filterDate.finalDate || 'N/A' },
      { 'Reporte': '', 'Valor': '' }, // Espacio en blanco
    ];

    // 3. Transformar datos de las tablas de resumen (Dashboard)
    const dataResumenZonas = Object.keys(zoneStats).map(zone => ({
      'Zona': zone,
      'Realizado': zoneStats[zone].count,
      'En Proceso': zoneStats[zone].sinFinal,
      'No Realizado': zoneStats[zone].numError,
      'Novedades': zoneStats[zone].novedad,
      'TOTAL': zoneStats[zone].totalZone
    }));

    const dataResumenInstaladores = Object.keys(instalerStats).map(inst => ({
      'Instalador': inst,
      'Realizado': instalerStats[inst].count,
      'En Proceso': instalerStats[inst].sinFinal,
      'Novedades': instalerStats[inst].novedad,
      'TOTAL': instalerStats[inst].totalZone
    }));

    // 4. Crear el Libro y las Hojas
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Resumen (Dashboard)
    // Agregamos primero los metadatos de fecha, luego las tablas
    const worksheetResumen = XLSX.utils.json_to_sheet(filtroInfo, { skipHeader: true });
    XLSX.utils.sheet_add_json(worksheetResumen, [{ a: 'RESUMEN POR ZONAS' }], { skipHeader: true, origin: 'A6' });
    XLSX.utils.sheet_add_json(worksheetResumen, dataResumenZonas, { origin: 'A7' });
    
    // Añadir tabla de instaladores más abajo en la misma hoja
    const nextRow = dataResumenZonas.length + 10;
    XLSX.utils.sheet_add_json(worksheetResumen, [{ a: 'RESUMEN POR INSTALADORES' }], { skipHeader: true, origin: `A${nextRow}` });
    XLSX.utils.sheet_add_json(worksheetResumen, dataResumenInstaladores, { origin: `A${nextRow + 1}` });

    // 5. Añadir hojas al libro
    XLSX.utils.book_append_sheet(workbook, worksheetResumen, "Resumen General");

    // 6. Guardar archivo
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const filename = `Reporte_VA_${filterDate.initialDate || 'Completo'}.xlsx`;
    saveAs(dataBlob, filename);
  };

  const formatToFullTime = (ms) => {
    if (!ms || ms <= 0) return "00:00:00";

    // Calculamos horas, minutos y segundos
    let seconds = Math.floor(ms / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    // Obtenemos el remanente de cada uno
    seconds = seconds % 60;
    minutes = minutes % 60;

    // Formateamos con "padStart" para que siempre tengan 2 dígitos (ej: 05 en vez de 5)
    const hDisplay = String(hours).padStart(2, '0');
    const mDisplay = String(minutes).padStart(2, '0');
    const sDisplay = String(seconds).padStart(2, '0');

    return `${hDisplay}:${mDisplay}:${sDisplay}`;
  };

  //calcular conteo por zona 
  const calculateAveragesByZoneFull = (records) => {
    const zones = ['VIP', 'PATIOS', 'DOMICILIO', 'TOTAL'];
    const stats = {};

    zones.forEach(z => {
        // Añadimos totalZone para calcular el % sobre la zona y no sobre el gran total
        stats[z] = { 
          count: 0, numError: 0,  
          sinFinal: 0 , novedad: 0,
          totalZone: 0
        };
    });

    suggestions.forEach(record => {
        const zoneKey = record.zone?.toUpperCase();

        if (stats[zoneKey]) {
            stats[zoneKey].totalZone += 1; // Contador total de la zona

            // Lógica de tiempo (solo para finalizados con fechas válidas)
            if (record.finalDate && record.status === 'Finalizado') {
              stats[zoneKey].count += 1;
              stats['TOTAL'].count += 1;
            }

            // Lógica de Error
            if (record.status === 'No realizado') {
              stats[zoneKey].numError += 1;
              stats['TOTAL'].numError += 1;
            }
            if(record.status === 'En proceso'){
              stats[zoneKey].sinFinal += 1;
              stats['TOTAL'].sinFinal += 1;
            }

            if (record.news) {
              stats[zoneKey].novedad += 1;  
              stats['TOTAL'].novedad += 1;       
            }

            stats['TOTAL'].totalZone += 1;
        }
    });

    const finalResults = {};
    zones.forEach(z => {
        finalResults[z] = {
            count: stats[z].count,
            numError: stats[z].numError,
            sinFinal: stats[z].sinFinal,
            novedad: stats[z].novedad,
            totalZone: stats[z].totalZone,
        };
    });

    return finalResults;
  };

  //calcular conteo por instalador
  const calculateStatsByUser = (userData) => {
    // 1. Extraemos los nombres de los usuarios de la primera consulta
    // Usamos un Set para evitar nombres duplicados y añadimos 'TOTAL'
    const userNames = [...new Set(userData.map(u => {
      if(u.name !== 'USUARIO'){
        return u.name.trim().toUpperCase()
      }
    })), 'TOTAL'];
    
    const stats = {};

    // 2. Inicializamos el objeto stats con los nombres de los usuarios
    userNames.forEach(name => {
        stats[name] = { 
            count: 0, 
            numError: 0,  
            sinFinal: 0, 
            novedad: 0,
            totalZone: 0 // En este caso sería "total por usuario"
        };
    });

    // 3. Procesamos las sugerencias/registros
    suggestions.forEach(record => {
        // Asumo que el registro tiene un campo 'userName' o 'name' para vincularlo
        // Si el campo se llama distinto, cámbialo aquí:
        const userKey = record.initialCreatedBy?.trim().toUpperCase(); 

        if (stats[userKey]) {
            // Lógica de Finalizados
            if (record.initalDate && record.finalDate && record.status === 'Finalizado') {
                stats[userKey].count += 1;
                stats['TOTAL'].count += 1;
            }

            // Lógica de En proceso
            if (record.status === 'En proceso' && record.initalDate) {
                stats[userKey].sinFinal += 1;
                stats['TOTAL'].sinFinal += 1;
            }

            // Lógica de Novedades
            if (record.news) {
                const valorNovedad = typeof record.news === 'number' ? record.news : 1;
                stats[userKey].novedad += valorNovedad;
                stats['TOTAL'].novedad += valorNovedad;
            }

            if ( record.status === 'No realizado' ){
              return 0;
            }

            // Contador total de filas procesadas por usuario
            stats[userKey].totalZone += 1;
            stats['TOTAL'].totalZone += 1;
        }
    });

    return stats;
  };

  const zoneStats = useMemo(() => calculateAveragesByZoneFull(records));
  const instalerStats = useMemo(() => calculateStatsByUser(users));

  return (
    <div className="d-flex flex-column container mt-5">
      {reportes ? 
        <div className="mt-3 gap-2"> 
          <div className="row row-cols-sm-1 bg-light rounded shadow-sm mt-2">
            <label style={{fontSize: isMobile ? 15 : 22, color: '#145a83'}} className='d-flex justify-content-center fw-bold'>DASHBOARD</label>
            {/* Modal del filtro */}
              <Modal show={showModal} onHide={closeModal} centered>
                <Modal.Header closeButton>
                  <Modal.Title className='d-flex justify-content-center w-100 fw-bold'>Detalles</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form.Group controlId="formWeight">
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
                      <option value="">
                        TODOS
                      </option>
                    </select>
                  </div>
                  <hr className='mb-1 mt-3'/>
                  <div className='d-flex flex-column'>
                    <label className='me-2'>Instalador</label>
                    <select
                      id="searchInstalador"
                      value={searchInstalador}
                      ref={selectRefInstalador}
                      className="form-select form-select-sm w-100 me-3"
                      onChange={(e) => setSearchInstalador(e.target.value)}
                      required
                    >
                      <option selected value='' disabled>
                        -- SELECCIONE EL INSTALADOR --
                      </option>
                        {users
                        .sort((a, b) => a.id - b.id)
                        .map((elem) => (
                          <option id={elem.id} value={(elem.name)}>
                            {elem.name}
                          </option>
                        ))}
                      <option value=''>
                        NINGUNO
                      </option>
                    </select>
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
            <div className={`d-flex div-botons justify-content-center mt-1 w-100 ${isMobile ? 'gap-2' : 'gap-4'} ${isMobile ? 'mx-0' : 'px-2'}`}>
              <div className={`${isMobile ? 'd-flex flex-column gap-2' : 'd-flex flex-row gap-4'}`}>
                <div className='d-flex flex-row'>
                  <label className='me-2 mt-1'>Desde:</label>
                  <input
                    id="initialDate"
                    type="date"
                    value={filterDate.initialDate}
                    className="form-control form-control-sm"
                    max={filterDate.finalDate !== '' ? filterDate.finalDate : new Date().toISOString().split("T")[0]}
                    onChange={handleChangeFilterDate}
                  />
                </div>
                <div className='d-flex flex-row '>
                  <label className='me-2 mt-1'>Hasta:</label>
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
              </div> 
              <button
                className="btn btn-sm btn-primary d-flex justify-content-center "
                style={{width:isMobile && '100%'}}
                onClick={(e)=>completeSearch(e)/* openModal */}
              >
                <FaIcons.FaFilter className='mt-1 me-1'/>
                Filtrar
              </button>
              <button 
                className='btn btn-sm btn-danger' 
                onClick={(e)=>(removeFilterDate(e))}
              >
                Borrar filtro
              </button>
            </div> 

            {/* Diagramas individuales */}
            <div className={`d-flex flex-column gap-3`}>
              {/* tabla cuantificadora */}
                <div className={`${isMobile ? 'd-flex flex-column mt-2' : 'd-flex align-items-between justify-content-between mt-2'}`}>
                  <h6 className='fw-bold'>Conteo por Zona</h6>
                  <button 
                    className='btn btn-sm btn-success d-flex justify-content-center' 
                    style={{width:isMobile ? '100%':'15%'}}
                    onClick={() => exportToExcel2(suggestions)}
                  >
                    <SiMicrosoftexcel className='mt-1 me-1'/>
                    Exportar
                  </button>
                </div>
              <div className={` w-100 table-responsive mb-3 rounded`}>
                <table className="table table-bordered table-hover align-middle text-center m-0 caption-top" style={{fontSize:13}}>
                  <thead className="table-light">
                    <tr className=''>
                      <th className="diagonal-header p-0">
                        <span className="abajo">Zona</span>
                        <span className="arriba">Estado</span>
                      </th>
                      <th>✅ Realizado</th>
                      <th>🟡 En proceso</th>
                      <th>❌ No realizado</th>
                      <th><FaCircle style={{ color: '#007bff', marginRight: '8px', fontSize: '0.8em' }} /> Novedad</th>
                      <th style={{backgroundColor:'whitesmoke'}}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(zoneStats).map(zone => (
                        <tr key={zone} style={{ borderBottom: '1px solid #eee' }}>
                            <td className='fw-bold'>{zone}</td>
                            <td>{zoneStats[zone].count}</td>
                            <td >{zoneStats[zone].sinFinal}</td>
                            <td >{zoneStats[zone].numError}</td>
                            <td >{zoneStats[zone].novedad}</td>
                            <td style={{backgroundColor:'whitesmoke'}}>{zoneStats[zone].totalZone}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* <div
                className="mt-1"
              >
                <h6>Registros por zona</h6>
                <InteractiveZoneDonutChart suggestions={suggestions} selectedZone='' />
              </div>
              <div
                className="mt-1"
              >
                <InteractiveStateBarChart suggestions={suggestions} selectedZone=''  />
              </div>
              <div
                className="mt-1"
              >
                <h6>Porcentaje de evidencias</h6>
                <InteractiveNewsDonutChart suggestions={suggestions} selectedZone='' />
              </div> */}
            </div>
          </div>

          {/* tabla por instalador */}
          <div className="row row-cols-sm-1 bg-light rounded shadow-sm mt-2" style={{fontSize:13}}>
            <h6 className='fw-bold mt-2'>Conteo por Instalador</h6>
            <div className={` w-100 table-responsive mt-2 mb-3 rounded`}>
                <table className="table table-bordered table-hover align-middle text-center m-0 caption-top">
                  <thead className="table-light">
                    <tr className='p-0 m-0'>
                      <th className="diagonal-header p-0" style={{width:'230px'}}>
                        <span className="abajo">Instalador</span>
                        <span className="arriba">Estado</span>
                      </th>
                      <th>✅ Realizado</th>
                      <th>🟡 En proceso</th>
                      {/* <th>❌ No realizado</th> */}
                      <th><FaCircle style={{ color: '#007bff', marginRight: '8px', fontSize: '0.8em' }} /> Novedad</th>
                      <th style={{backgroundColor:'whitesmoke'}}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(instalerStats).map(instaler => (
                        <tr key={instaler} style={{ borderBottom: '1px solid #eee' }}>
                            <td className='fw-bold'>{instaler}</td>
                            <td>{instalerStats[instaler].count}</td>
                            <td >{instalerStats[instaler].sinFinal}</td>
                            {/* <td >{instalerStats[instaler].numError}</td> */}
                            <td >{instalerStats[instaler].novedad}</td>
                            <td style={{backgroundColor:'whitesmoke'}}>{instalerStats[instaler].totalZone}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
        :
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
                  <div className='d-flex w-100 justify-content-center mt-2'>
                    <Select
                      isMulti // <--- Magia: permite selección múltiple
                      isClearable={false}
                      options={options}
                      placeholder="-- TIPO DE VIDRIO --"
                      styles={{
                        container: (base) => ({
                          ...base,
                          width: isMobile ? '100%' : '50%',
                          textTransform: 'uppercase',
                          fontSize: '13px'
                        })
                      }}
                      onChange={(selectedOptions) => {
                        // 1. Si no hay nada seleccionado, guardamos un string vacío
                        if (!selectedOptions || selectedOptions.length === 0) {
                          setTypeInstall(""); 
                          return;
                        }

                        // 2. Extraemos los valores, los unimos con coma y espacio
                        const stringResult = selectedOptions
                          .map(option => option.value.toUpperCase()) // Opcional: asegurar mayúsculas
                          .join(", "); 

                        // 3. Guardamos el string final en el estado
                        setTypeInstall(stringResult);
                      }}
                    />
                    {/* <select
                      ref={selectTypeInstall}
                      className="form-select form-select-sm"
                      style={{textTransform:'uppercase', width: isMobile ? '100%' : '50%'}}
                      onChange={(e) => setTypeInstall(JSON.parse(e.target.value))}
                      required
                    >
                      <option selected value="" disabled>
                        -- Seleccione el tipo de instalación --
                      </option>
                      {types
                        .sort((a, b) => a.id - b.id)
                        .map((elem) => (
                          <option id={elem.id} value={JSON.stringify(elem.description)}>
                            {elem.description}
                          </option>
                        ))}
                    </select> */}
                  </div>
                  {entyInfo &&
                    <caption className='text-danger d-flex w-100 justify-content-center text-align-center'>COMPLETA LA INFORMACIÓN</caption>
                  }
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
      }

      {/* Bola flotante */}
        {(user.role === 'admin') &&
          <div
            onClick={() => (setReportes(!reportes), setSuggestions(records))}
            style={{
              position: 'fixed',
              bottom: 30,
              right: 20,
              backgroundColor: '#145a83',
              color: 'white',
              borderRadius: '50%',
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: 18,
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}
            title="Reportes"
          >
            <Stack spacing={4} direction="row" sx={{ color: 'white' }}>
              <Badge color="primary" /* badgeContent={<IoBarChartSharp />} */>
                {/* <FaCartShopping
                  style={{color:'white', padding:7}}
                /> */}
                {reportes ?
                  <FaTableList />
                  :
                  <IoBarChartSharp />
                }
              </Badge>
            </Stack>
          </div>
        }
    </div>
  );
}