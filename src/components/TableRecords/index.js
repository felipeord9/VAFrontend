import { useState, useEffect, useContext } from "react";
import DataTable from "react-data-table-component";
import AuthContext from "../../context/authContext";
import ModalVerifyBalance from "../ModalVerifyBalance";
import FormControlLabel from '@mui/material/FormControlLabel';
import { updateRecord } from "../../services/recordService";
import { Modal , Button , Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Checkbox from '@mui/material/Checkbox';
import { FaCheckCircle } from "react-icons/fa";
import { MdRemoveCircle } from "react-icons/md";
import { FaCamera } from "react-icons/fa";
import Swal from "sweetalert2";
import "./styles.css";

const styleStatus = {
  "pedido nuevo": "primary",
  alistamiento: "secondary",
  "verificando pago": "info",
  "en ruta": "warning",
  rechazado: "danger",
  entregado: "success",
};

function TableRecords({ records, getAllRecords, loading }) {
  const { user } = useContext(AuthContext);
  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [finalizando, setFinalizando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const navigate = useNavigate();

  //funcion para abrir el modal y darle los valores de la fila
  const handleRowClicked = (row) => {
    setSelectedRow(row);
    if(row.initialVideo && row.finalVideo){
      navigate(`/view/register/${row.id}`)
    }else if(row.initialVideo && row.finalVideo === null){
      navigate(`/end/record/${row.id}`)
    }else if(row.status === 'No realizado'){
      Swal.fire({
        title: "No realizado",
        confirmButtonText: "Aceptar",
        html: row.motivo
          ? row.motivo
            .split("\n")
            .map((elem) => `<p style="font-size: 15px; margin: 0;"><strong>Motivo:</strong> ${elem}</p>`)
            .join("")
          : "Sin Información",
        })
    }else{
      navigate(`/start/record/${row.id}`)
    }
  };

  //logica para saber si se esta visualizando en un celular
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

  /* Modal para marcar como finalizado */
  const [modalFinish, setModalFinish] = useState(false);
  const closeModalFinish = () => {
    setModalFinish(false);
    setSelectedRow(null);
  };
  const openModalFinish = () => {
    setModalFinish(true);
  };
  /* marcar como finalizado */
  const handleUpdateFinish = (e) => {
    e.preventDefault();
    if(motivo !== ''){
      setFinalizando(true);
      const body = {
        status: 'No realizado',
        motivo: motivo.toUpperCase(),
      }
      updateRecord(selectedRow.id, body)
        .then(({data})=>{
          setFinalizando(false);
            Swal.fire({
              icon:'success',
              title:'¡Felicidades!',
              text:'Se ha marcado la solicitud en estado "No realizado" de manera satisfactoria.',
              timer:5000,
              showConfirmButton:false,
              showCancelButton:false,
            })
            getAllRecords()
            closeModalFinish()
        })
        .catch(()=>{
          setFinalizando(false);
          Swal.fire({
            icon:'warning',
            title:'¡ERROR!',
            text:'Ha ocurrido un error al momento de hacer esta acción. intenta de nuevo. Si el problema persiste comunícate con el área de sistemas.',
            showConfirmButton:true,
            confirmButtonColor: '#0101b5',
            showCancelButton:false
          })
        })
    }
  }

  //logica para la duracion
  const handleDuration = (row) => {
    if(row.initalDate !== null && row.finalDate !== null){
      const inicio = new Date(row.initalDate.replace(" ", "T"));
      const fin = new Date(row.finalDate.replace(" ", "T"));
      const diferenciaMs = fin - inicio;
      let totalSeconds = Math.floor(diferenciaMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      totalSeconds %= 3600;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }else{
      return "";
    }
  }

  const columns = [
    {
      id: "editar",
      name: "",
      center: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 p-1'>
          {((user.role === 'admin' || user.role === 'supervisor') && (row.status === 'En proceso')) ? (
            <div className="d-flex gap-2">
              <button 
                title="Finalizar" className='btn btn-sm btn-secondary'
                /* style={{background:'#FF5757', color:'white'}} */
                disabled={row.status === 'Finalizado' || row.status === 'No realizado'}
                onClick={(e) => (setSelectedRow(row), openModalFinish(e))}
              >
                <MdRemoveCircle />
              </button>
              <button 
                title="Editar registro" className='btn btn-sm btn-primary'
                style={{color:'white'}}
                onClick={(e) => {
                  setSelectedRow(row)
                  navigate(`/news/${row.id}`)
                }}
              >
                <FaCamera />
              </button>
            </div>
          ):((user.role === 'usuario' && row.status === 'En proceso') && (
            <button 
                title="Editar registro" className='btn btn-sm btn-primary'
                style={{color:'white'}}
                onClick={(e) => {
                  setSelectedRow(row)
                  navigate(`/news/${row.id}`)
                }}
              >
                <FaCamera />
              </button>
            ))
          }
        </div>
      ),
      width: (user.role === 'admin' || user.role === 'supervisor') ? '100px' :  '60px',
    },
    {
      id: "state",
      name: "Estado",
      center: true,
      selector: (row) => row?.status.toUpperCase(),
      width: "130px",
    },
    {
      id: "placa",
      name: "Placa",
      selector: (row) => row?.placa.toUpperCase(),
      sortable: true,
      width: isMobile ? '100px':'100px'
    },
    {
      id: "initialVideo",
      name: isMobile ? 'Entrada' : "Vídeo Entrada",
      center: true,
      cell: (row, index, column, id) => (
        <div>
          <FormControlLabel
            disabled
            onClick={(e)=>handleRowClicked(e)}
            control={<Checkbox checked={row.initialVideo} />}
          />
        </div>
      ),
      sortable: true,
      width: isMobile ? '125px':'155px'
    },
    {
      id: "createdBy",
      name: isMobile ? 'Creador' : "Creado por",
      selector: (row) => row?.initialCreatedBy,
      sortable: true,
      width: isMobile ? '190px':'160px'
    },
    {
      id: "initalDate",
      name: "Fecha Entrada",
      selector: (row) => row.initalDate === null ? '' : new Date(row.initalDate).toLocaleString("es-CO"),
      sortable: true,
      width: '190px'
    },
    {
      id: "finalVideo",
      name: isMobile ? 'Salida' : "Vídeo Salida",
      center: true,
      cell: (row, index, column, id) => (
        <FormControlLabel
          disabled
          control={<Checkbox checked={row.finalVideo} />}
          onClick={(e)=>handleRowClicked(e)}
        />
      ),
      sortable: true,
      width: isMobile ? '115px':'155px'
    },
    {
      id: "createdBy",
      name: isMobile ? 'Creador' : "Creado por",
      selector: (row) => row?.finalCreatedBy,
      sortable: true,
      width: isMobile ? '190px':'160px'
    },
    {
      id: "finalDate",
      name: "Fecha Salida",
      selector: (row) => row.finalDate !== null ? new Date(row?.finalDate).toLocaleString("es-CO") : '',
      sortable: true,
      width: '190px'
    },
    {
      id: "dureacion",
      name: "Duración",
      selector: (row) => handleDuration(row),
      sortable: true,
      width: '140px'
    },
    {
      id: "novedades",
      name: "Novedades",
      center: true,
      cell: (row, index, column, id) => (
        <FormControlLabel
          disabled
          control={<Checkbox checked={row.news} />}
          onClick={(e)=>handleRowClicked(e)}
        />
      ),
      sortable: true,
      width: isMobile ? '115px':'auto'
    },
    {
      id: "createdBy",
      name: isMobile ? 'Creador' : "Creado por",
      selector: (row) => row?.newsCreatedBy,
      sortable: true,
      width: isMobile ? '190px':'auto'
    },
    {
      id: "finalDate",
      name: "Fecha Novedad",
      selector: (row) => row.newsDate !== null ? new Date(row?.newsDate).toLocaleString("es-CO") : '',
      sortable: true,
      width: '190px'
    },
    {
      id: "motivo",
      name: "Motivo Novedad",
      selector: (row) => row?.reasonNews,
      sortable: true,
      width: '500px'
    },
    {
      id: "motivo",
      name: "Motivo No Realización",
      selector: (row) => row?.motivo,
      sortable: true,
      width: '500px'
    },
    /* {
      id: "createdBy",
      name: isMobile ? 'Creador' : "Creado por",
      selector: (row) => row?.user.name,
      sortable: true,
      width: isMobile ? '190px':'auto'
    }, */
    
  ];

  const customStyles = {
    /* cells: {
      style: {
        backgroundColor: row.status === 'en proceso' ?'rgba(255, 200, 39, 0.4)' : row.status === 'Finalizado' ? 'rgba(74, 157, 38, 0.35)' : 'grey', // ajustar el tamaño de la fuente de las celdas
      },
    }, */
    rows: {
      style: {
        height:'15px', // ajusta el alto de las filas según tus necesidades
        cursor:'pointer',
        
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        height:'35px',
        /* fontWeight:'bold', */
        color:'white',
        backgroundColor:'#145a83',
        /* borderRight: '1px solid black', */
        paddingLeft:10,
        paddingRight:10
      },
    },
    cells: {
      style: {
        /* borderRight: '1px solid black', */
        paddingLeft:10,
        paddingRight:10
      },
    },
    columns:{
      style: {
        borderLeft:'5px black solid'
      }
    }
  };

  const conditionalRowStyles = [
    {
      when: row => (row.status === 'En proceso'),
      style: {
        backgroundColor: 'rgba(255, 200, 39, 0.4)',
      },
    },
    {
      when: row => (row.status === 'Finalizado'),
      style: {
        backgroundColor: 'rgba(74, 157, 38, 0.35)',
      },
    },
    {
      when: row => (row.status === 'No realizado'),
      style: {
        backgroundColor: 'grey',
      },
    },
  ];

  return (
    <div
      className="d-flex flex-column rounded m-0 p-0 table-orders"
      style={{ height: "calc(100% - 140px)", width: "100%" }}
    >
      <ModalVerifyBalance 
        balance={selectedRow}
        setBalance={setSelectedRow}
        showModal={showModal}
        setShowModal={setShowModal}
        reloadInfo={getAllRecords}
      />
      <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={records}
        customStyles={customStyles}
        conditionalRowStyles={conditionalRowStyles}
        onRowClicked={handleRowClicked}
        fixedHeaderScrollHeight={200}
        progressPending={loading}
        progressComponent={
          <div class="d-flex align-items-center text-danger gap-2 mt-2">
            <strong>Cargando...</strong>
            <div
              class="spinner-border spinner-border-sm ms-auto"
              role="status"
              aria-hidden="true"
            ></div>
          </div>
        }
        dense
        striped
        fixedHeader
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
          selectAllRowsItem: false,
        }}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[15, 25, 50, 100]}
        noDataComponent={
          <div style={{ padding: 24 }}>Ningún resultado encontrado.</div>
        }
      />

      {/* Modal para marcar como finalizado */}
      <Modal show={modalFinish} onHide={closeModalFinish} centered>
        <Modal.Header closeButton>
          <Modal.Title className='d-flex justify-content-center w-100 fw-bold' style={{color:'grey'}}>Motivo no realización</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formWeight">
          <div className="d-flex flex-column mb-1 mt-2 gap-1">
            <label>Por favor ingresa el motivo por el cual no se realiza el registro:</label>
            <textarea
              id="motivo"
              className="form-control"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Digita tu respuesta aquí"
              style={{ minHeight: 70, maxHeight: 100, fontSize: 12 , textTransform: 'uppercase'}}
              required
            ></textarea>
          </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={(e)=>(handleUpdateFinish(e))}>
            {finalizando ? 'FINALIZANDO...' : 'FINALIZAR'}
          </Button>
          <Button variant="danger" onClick={(e)=>(closeModalFinish(e))}>
            CANCELAR
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default TableRecords;
