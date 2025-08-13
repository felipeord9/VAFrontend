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
import { FaEye } from "react-icons/fa";

const styleStatus = {
  "pedido nuevo": "primary",
  alistamiento: "secondary",
  "verificando pago": "info",
  "en ruta": "warning",
  rechazado: "danger",
  entregado: "success",
};

function TableQrs({ qrs, getAllQrs, loading }) {
  const { user } = useContext(AuthContext);
  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [finalizando, setFinalizando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const navigate = useNavigate();

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

  const columns = [
    {
      id: "numFactura",
      name: "No. factura",
      selector: (row) => row?.numFactura,
      sortable: true,
      width: '140px'
    },
    {
      id: "razonSocial",
      name: "Razón social",
      selector: (row) => row?.razonSocial,
      sortable: true,
      width: '300px'
    },
    {
      id: "refProduct",
      name: 'Referencia',
      selector: (row) => row?.refProduct,
      sortable: true,
      width: '140px'
    },
    {
      id: "descriProduct",
      name: "Descripción",
      selector: (row) => row.descriProduct,
      sortable: true,
      width: '300px'
    },
    {
      id: "cantidad",
      name: 'Cantidad',
      selector: (row) => row?.cantidad,
      sortable: true,
      width: '140px'
    },
    {
      id: "arriveDate",
      name: "Fecha Factura",
      selector: (row) => new Date(row.arriveDate).toLocaleString("es-CO"),
      sortable: true,
      width: '190px'
    },
    {
      id: "createdAt",
      name: "Fecha Creación",
      selector: (row) => new Date(row.createdAt).toLocaleString("es-CO"),
      sortable: true,
      width: '190px'
    },
    {
      id: "observations",
      name: 'Observaciones',
      selector: (row) => row?.observations,
      sortable: true,
      width: 'auto'
    },
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
        reloadInfo={getAllQrs}
      />
      <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={qrs}
        customStyles={customStyles}
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
    </div>
  );
}

export default TableQrs;
