import * as FiIcons from 'react-icons/fi';
import DataTable from 'react-data-table-component'
import useAlert from '../../hooks/useAlert';
import { FaUserEdit } from "react-icons/fa";
import { useState } from 'react';
import ModalUsers from '../ModalUsers';

export default function TableUsers({ users, loading, setSelectedUser, setShowModal }) {
  const { successAlert } = useAlert()
  const [selected,setSelected] = useState('');

  const columns = [
    {
      id: "options",
      name: "",
      center: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 p-1'>
          <button title="Editar usuario" className='btn btn-sm btn-primary'
            onClick={(e) => {
            setSelectedUser(row)
            setShowModal(true)
          }}>
            <FaUserEdit />
          </button>
        </div>
      ),
      width: '60px'
    },
    {
      id: "name",
      name: "Nombre",
      selector: (row) => row?.name,
      sortable: true,
      width:'cell-name'
    },
    {
      id: "username",
      name: "Username",
      selector: (row) => row?.username,
      sortable: true,
      width:'cell-name'
    },
    {
      id: "email",
      name: "Gmail",
      selector: (row) => row?.email,
      sortable: true,
      width:'cell-name'
    },
    {
      id: "password",
      name: "Contraseña",
      selector: (row) => '**************',
      sortable: true,
      class: 'cell-name'
    },
    {
      id: "role",
      name: "Cargo",
      selector: (row) => row?.role,
      sortable: true,
      width: '150px'
    }
  ]

  const customStyles = {
    cells: {
      style: {
        backgroundColor: 'rgba(225, 76, 17, 0.1)', // ajustar el tamaño de la fuente de las celdas
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
        backgroundColor:'rgba(33, 129, 255, 0.7)'
      },
    },
  };
  
  return (
    <div
      className="d-flex flex-column rounded"
      style={{ height: "calc(100% - 100px)", width: '100%' }}
    >
      <DataTable
        className="bg-light text-center border border-2 h-100"
        columns={columns}
        data={users}
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
        paginationPerPage={15}
        paginationRowsPerPageOptions={[15, 25, 50]}
        noDataComponent={
        <div style={{padding: 24}}>Ningún resultado encontrado.</div>}
      />
    </div>
  )
}