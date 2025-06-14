import { useState, useEffect, useContext } from "react";
import DataTable from "react-data-table-component";
import AuthContext from "../../context/authContext";
import ModalVerifyBalance from "../ModalVerifyBalance";
import FormControlLabel from '@mui/material/FormControlLabel';
import { useNavigate } from "react-router-dom";
import Checkbox from '@mui/material/Checkbox';
import "./styles.css";

function TablePendingRecords({ records, getAllRecords, loading }) {
  const { user } = useContext(AuthContext);
  // Estado para el modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const navigate = useNavigate();

  //funcion para abrir el modal y darle los valores de la fila
  const handleRowClicked = (row) => {
    setSelectedRow(row);
    navigate(`/end/record/${row.id}`)
    /* setShowModal(true); */
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

  const columns = [
    {
      id: "placa",
      name: "PLACA",
      selector: (row) => row?.placa.toUpperCase(),
      sortable: true,
      width: isMobile ? '115px':'115px'
    },
    {
      id: "initialVideo",
      name: isMobile ? 'Entrada' : "Vídeo Entrada",
      center: true,
      cell: (row, index, column, id) => (
        <FormControlLabel
          disabled
          control={<Checkbox checked={row.initialVideo} />}
        />
      ),
      sortable: true,
      width: isMobile ? '125px':'auto'
    },
    {
      id: "initalDate",
      name: "Fecha Entrada",
      selector: (row) => new Date(row?.initalDate).toLocaleString("es-CO"),
      sortable: true,
      width: isMobile ? '190px':'auto'
    },
    {
      id: "finalVideo",
      name: isMobile ? 'Salida' : "Vídeo Salida",
      center: true,
      cell: (row, index, column, id) => (
        <FormControlLabel
          control={<Checkbox checked={row.finalDate} />}
          onClick={(e)=>navigate(`/end/record/${row.id}`)}
        />
      ),
      sortable: true,
      width: isMobile ? '115px':'auto'
    },
    {
      id: "finalDate",
      name: "Fecha Salida",
      selector: (row) => row.finalDate !== null ? new Date(row?.finalDate).toLocaleString("es-CO") : '',
      sortable: true,
      width: isMobile ? '190px':'auto'
    },
    {
      id: "createdBy",
      name: isMobile ? 'Creador' : "Creado por",
      selector: (row) => row?.user.name,
      sortable: true,
      width: isMobile ? '190px':'auto'
    },
    
  ];

  const customStyles = {
    cells: {
      style: {
        backgroundColor: 'rgba(255, 200, 39, 0.4)', // ajustar el tamaño de la fuente de las celdas
      },
    },
    rows: {
      style: {
        height:'15px', // ajusta el alto de las filas según tus necesidades
        cursor:'pointer'
      },
    },
    headCells: {
      style: {
        fontSize: '14px',
        height:'35px',
        fontWeight:'bold',
        color:'black',
        backgroundColor:'rgba(255, 200, 50, 0.8)'
      },
    },
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
        reloadInfo={getAllRecords}
      />
      <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={records}
        customStyles={customStyles}
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
    </div>
  );
}

export default TablePendingRecords;
