import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { createUser, updateUser , findUserByEmail } from "../../services/userService";
import { FiEdit3 } from "react-icons/fi";
import Swal from 'sweetalert2'
import './styles.css'
export default function ModalUsers({
  user,
  setUser,
  showModal,
  setShowModal,
  reloadInfo,
}) {
  const [nonePass,setNonePass] = useState(false);
  const [newPassword,setNewPassword] = useState(false)
  const [infoUser, setInfoUser] = useState(
    () => JSON.parse(window.localStorage.getItem("user"))
  )

  const [info, setInfo] = useState({
    rowId:'',
    name:'',
    username:'',
    email:'',
    password:'',
    role:'',
  });
  const [error, setError] = useState('')
  const [correoInvali,setCorreoInvali] = useState(false)
  const [emailEditado, setemailEditado] = useState(false)
  const [correoExit,setCorreoExist] = useState(false)

  useEffect(() => {
    if(user) {
      setInfo({
        rowId:user.rowId,
        name:user.name,
        username:user.username,
        email:user.email,
        password:user?.password,
        role:user.role,
      })
    }

  }, [user])

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo({
      ...info,
      [id]: value,
    });
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    if(
      info.email !== '',
      info.name !== '',
      info.role !== '',
      info.password !== '',
      info.rowId !== '',
      info.username !== '',
      newPassword ? info?.password !== '' && info?.password?.length > 4 : info?.password?.length !==''
    ){
      if(emailEditado ? info.email!=='' && info.email.includes('@') && info.email.split('@')[1].includes('.') : info.email !==''){
        if(emailEditado){
          findUserByEmail(info.email)
          .then(()=>{
            setCorreoExist(true)
            setTimeout(() => setCorreoExist(false), 3000) 
          })
          .catch(()=>{
            Swal.fire({
              title: '¿Está segur@ de querer editar este perfil?',
                  showDenyButton: true,
                  confirmButtonText: 'Confirmar',
                  confirmButtonColor: 'green',
                  denyButtonText: `Cancelar`,
                  denyButtonColor:'red',
                  icon:'question'
              }).then((result)=>{
              if(result.isConfirmed){
                const body={
                  email:info.email,
                  username: info.username,
                  name: info.name.toUpperCase(),
                  password: newPassword && info.password,
                  role: info.role,
                }
                updateUser(user.id, body)
                  .then((data) => {  
                    reloadInfo();
                    setShowModal(!showModal)
                    setCorreoExist(false)
                    setemailEditado(false)
                    setCorreoInvali(false)
                    Swal.fire({
                      title: '¡Correcto!',
                      text: 'El usuario se ha actualizado correctamente',
                      showConfirmButton: false,
                      timer: 2500
                    })
                  })
                  .catch((error) => {
                    reloadInfo();
                    setError('Error al cargar la información del usuario')
                    setTimeout(() => setError(''), 2500)
                  });
              }else if(result.isDenied){
                Swal.fire('Oops', 'La información suministrada se ha descartado', 'info')
                reloadInfo();
                setShowModal(!showModal)
              }
              cleanForm()
              })
          })
        }else{
          Swal.fire({
          title: '¿Está segur@ de querer editar este perfil?',
              showDenyButton: true,
              confirmButtonText: 'Confirmar',
              confirmButtonColor: 'green',
              denyButtonText: `Cancelar`,
              denyButtonColor:'red',
              icon:'question'
          }).then((result)=>{
          if(result.isConfirmed){
            const body={
              email:info.email,
              username: info.username,
              name: info?.name?.toUpperCase(),
              password: newPassword && info.password,
              role: info.role,
            }
            updateUser(user.id, body)
              .then((data) => {  
                setShowModal(!showModal)
                reloadInfo();
                setCorreoExist(false)
                setemailEditado(false)
                setCorreoInvali(false)
                Swal.fire({
                  title: '¡Correcto!',
                  text: 'El usuario se ha actualizado correctamente',
                  showConfirmButton: false,
                  timer: 2500
                })
              })
              .catch((error) => {
                reloadInfo();
                setError('Error al cargar la información del usuario')
                setTimeout(() => setError(''), 2500)
              });
          }else if(result.isDenied){
            Swal.fire('Oops', 'La información suministrada se ha descartado', 'info')
            reloadInfo();
            setShowModal(!showModal)
            setCorreoExist(false)
            setemailEditado(false)
            setCorreoInvali(false)
          }
          cleanForm()
          })
        }
      }else{
        setCorreoInvali(true)
        setTimeout(() => setCorreoInvali(false), 3000) 
      }
    }else{
      setNonePass(true)
      setTimeout(() => setNonePass(false), 3000) 
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if(info.password !== '' && info.password.length > 4,
      info.email !== '',
      info.name !== '',
      info.role !== '',
      info.password !== '',
      info.rowId !== '',
      info.username !== ''
    ){
      if(info.email!=='' && info.email.includes('@') && info.email.split('@')[1].includes('.')){
        const body={
          email:info.email,
          rowId: info.rowId,
          username: info.username,
          name: info.name.toUpperCase(),
          password: info.password,
          role: info.role,
        }
        createUser(body)
        .then((data) => {
          setShowModal(!showModal)
          reloadInfo();
          Swal.fire({
            title: '¡Correcto!',
            text: 'El usuario se ha creado correctamente',
            icon: 'success',
            showConfirmButton: false,
            timer: 2500
          })
          cleanForm()
        })
        .catch((error) => {
          Swal.fire({
            title:`${error}`
          })
          setError('Error al cargar la información del usuario')
          setTimeout(() => setError(''), 2500)
        });
      }else{
        setCorreoInvali(true)
        setTimeout(() => setCorreoInvali(false), 3000) 
      }
    }else{
      setNonePass(true)
      setTimeout(() => setNonePass(false), 3000) 
    }
  }

  const cleanForm = () => {
    setUser(null)
    setInfo(null)
    setShowModal(false)
    setNewPassword(false)
  }

  return (
    <div className="wrapper d-flex justify-content-center align-content-center" style={{userSelect:'none'}}>
    <Modal show={showModal} style={{ fontSize: 18, userSelect:'none' }} centered>
      <Modal.Header className="d-flex w-100">
        <Modal.Title className="fw-bold w-100 d-flex" style={{fontSize:25}}>
          <div className="d-flex w-100 justify-content-center align-items-center" style={{color:'#eb6146'}} >
            {user ? 'Actualizar Usuario' : 'Crear usuario'}
          </div>
        </Modal.Title>
      </Modal.Header>
      {/* <form onSubmit={(e)=> user ? handleUpdateUser(e) : handleCreateUser(e)}> */}
      <Modal.Body className="p-2">
        <div className="m-2 h-100">
            <div>
              <div>
              <div>
                <label style={{fontSize:15}}>Cédula</label>
                <input
                  id="rowId"
                  type="number"
                  value={info?.rowId}
                  className="form-control form-control-sm"
                  onChange={(e)=> (handleChange(e))}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label style={{fontSize:15}}>Nombre</label>
                <input
                  id="name"
                  type="text"
                  value={(info?.name)}
                  style={{textTransform:'uppercase'}}
                  className="form-control form-control-sm"
                  onChange={(e)=> (handleChange(e))}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label style={{fontSize:15}}>Usuario</label>
                <input
                  id="username"
                  type="text"
                  value={info?.username}
                  className="form-control form-control-sm"
                  onChange={(e)=> (handleChange(e))}
                  autoComplete="off"
                  required
                />
              </div>
              {user ? 
                <div>
                  <label style={{fontSize:15}}>Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    value={info?.email}
                    className="form-control form-control-sm"
                    onChange={(e)=> (handleChange(e),setemailEditado(true))}
                    autoComplete="off"
                    required
                  />
                </div>
                :
                <div>
                  <label style={{fontSize:15}}>Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    value={info?.email}
                    className="form-control form-control-sm"
                    onChange={(e)=> (handleChange(e))}
                    autoComplete="off"
                    required
                  />
                </div>
              }
              {user ?
                <div>
                <label style={{fontSize:15}}>Contraseña</label>
                <div className="d-flex flex-row">
                <input
                  id="password"
                  type="text"
                  value={newPassword ? info?.password : '*************'}
                  className="form-control form-control-sm me-3"
                  onChange={handleChange}
                  disabled={newPassword ? false : true}
                  autoComplete="off"
                  required
                />
                <button title="editar contraseña" className='btn btn-sm'
                  style={{color:'white',backgroundColor:'black'}} onClick={(e) => {
                    setNewPassword(true)
                    setInfo({
                      password:''
                    })
                  }}>
                    <FiEdit3 />
                </button>
                </div>
                </div> 
                :
                <div>
                  <label style={{fontSize:15}}>Contraseña</label>
                  <div className="d-flex flex-row">
                    <input
                      id="password"
                      type="text"
                      value={ info?.password }
                      className="form-control form-control-sm me-3"
                      onChange={handleChange}
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>
              }
              <div>
                <label style={{fontSize:15}}>Cargo</label>
                <select
                  id="role"
                  value={info?.role}
                  className="form-select form-select-sm"
                  onChange={handleChange}
                  required
                >
                  <option selected disabled value="">
                    -- Seleccione un cargo --
                  </option>
                  <option value="planta">PLANTA</option>
                  <option value="logistica">LOGÍSTICA</option>
                  <option value="calidad">CALIDAD</option>
                  {infoUser.role==='admin' && (
                    <option value="admin">ADMINISTRADOR</option>
                  )}
                </select>
              </div>
              </div>
            </div>
            <div className="d-flex w-100 mt-2">
              <span 
                className="text-center text-danger w-100 m-0"
                style={{height: 15}}
              >
                {error}
              </span>
            </div>
            {correoExit && <div className='text-danger text-center p-0 m-0 fw-bold'>Este correo ya está registrado</div> }
            {correoInvali && <div className='text-danger text-center p-0 m-0 fw-bold'>Correo Inválido</div> }
            {nonePass && <div className='text-danger text-center p-0 m-0 fw-bold'>Ingresa una contraseña nueva</div> }
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-center gap-2 mt-2 ">
          <button
            className="fw-bold btn btn-sm btn-success p-2 ps-3 pe-3"
            type='submit'
            onClick={(e)=>(user ? handleUpdateUser(e) : handleCreateUser(e))}
          >
            {user ? 'Actualizar' : 'Crear'}
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={(e)=>cleanForm()}
          >
            Cancelar
          </button>
        </div>
      </Modal.Footer>
      {/* </form> */}
    </Modal>
    </div>
  );
}
