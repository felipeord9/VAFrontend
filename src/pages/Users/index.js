import { useState, useEffect } from "react";
import * as GoIcons from "react-icons/go"
import TableUsers from "../../components/TableUsers"
import ModalUsers from "../../components/ModalUsers";
import { findUsers } from "../../services/userService"

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suggestions, setSuggestions] = useState([])
  const [search, setSearch] = useState('')
  const [showModalUsers, setShowModalUsers] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAllUsers()
  }, []);

  const getAllUsers = () => {
    setLoading(true)
    findUsers()
      .then(({ data }) => {
        setUsers(data)
        setSuggestions(data)
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
      });
  }

  const searchUsers = (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredUsers = users.filter((elem) => {
        if(elem.name.toLowerCase().includes(value.toLowerCase())) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions([])
     }
    } else {
      setSuggestions(users)
    }
    setSearch(value)
  }

  return (
    <div className="d-flex flex-column container mt-5">
      <ModalUsers 
        user={selectedUser}
        setUser={setSelectedUser}
        showModal={showModalUsers} 
        setShowModal={setShowModalUsers} 
        reloadInfo={getAllUsers} 
      />
      <div className="d-flex flex-column gap-2 h-100">
        <div className="div-botons justify-content-center mt-2 gap-2 w-100">
          <div className="position-relative d-flex justify-content-center w-100">
            <input
              type="search"
              value={search}
              className="form-control form-control-sm w-100"
              placeholder="Buscar usuario por nombre"
              onChange={searchUsers}
              style={{textTransform:'uppercase'}}
            />
          </div>
            <button
              title="Nuevo usuario"
              className="d-flex align-items-center text-nowrap btn btn-sm text-light gap-1" 
              style={{backgroundColor:'rgba(33, 129, 255, 0.7)'}}
              onClick={(e) => setShowModalUsers(!showModalUsers)}>
                Nuevo usuario
                <GoIcons.GoPersonAdd style={{width: 15, height: 15}} />
            </button>
        </div>
        <TableUsers users={suggestions} setShowModal={setShowModalUsers} setSelectedUser={setSelectedUser} loading={loading}/>
      </div>
    </div>
  )
} 