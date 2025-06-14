import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import InputPassword from '../../components/InputPassword';
import useUser from '../../hooks/useUser';
import { changeRecoveryPassword } from '../../services/authService';
import Logo from "../../assets/AVRecortado.png";
import { GiSandsOfTime } from "react-icons/gi";
import './styles.css'

export default function RecoveryPassword() {
    const { isLogged } = useUser()
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [errorInput, setErrorInput] = useState('')
    const { token } = useParams()
    const navigate = useNavigate()
    const [cargando,setCargando] = useState(false);

    useEffect(() => {
      if (isLogged) navigate('/inicio');
    }, [isLogged, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault()
    setCargando(true)
    if(newPassword !== confirmNewPassword) {
      setCargando(false)
      setErrorInput('La contraseña nueva no coincide')
      return setTimeout(() => setErrorInput (''), 3000)
    }
    if(newPassword !== '' && confirmNewPassword !== ''){
      if(newPassword.length > 4){
        changeRecoveryPassword({token, newPassword})
          .then((data) => {
            Swal.fire({
              title: "¡CORECTO!",
              text: "La contraseña se ha cambiado exitosamente.",
              /* icon: 'success', */
              confirmButtonText: "Aceptar",
              confirmButtonColor:'green',
              /* timer: 3000 */
            })
            navigate('/login')
          })
          .catch((error) => {
            setErrorInput('El token ha expirado, será redirigido al login')
            return setTimeout(() => navigate('/login'), 4000)
          })
      }else{
        setCargando(false)
        Swal.fire({
          icon:'warning',
          title:'¡Atención!',
          text:'La contraseña debe tener por lo menos 4 caracteres. verifica la información suministrada.',
          showConfirmButton:true,
          confirmButtonColor:'red'
        })
      }
    }
  }

  return (
    <div className='d-flex justify-content-center align-items-center h-100 w-100 m-auto'>
      <div className='card p-4 pt-3 shadow rounded-4 m-auto' style={{ maxWidth: 400 , border:'2px solid #145a83'}}>
        <div className='mb-3 p-2'>
          <img src={Logo} style={{borderRadius:10}} className='w-100' alt='logo' />
        </div>
        <form className='d-flex flex-column gap-3' style={{fontSize: 13.5}} onSubmit={handleSubmit}>
        <div>
            <InputPassword
              id="new-password"
              label="Nueva Contraseña"
              password={newPassword}
              setPassword={setNewPassword}
            />
          </div>
          <div>
            <InputPassword
              id="confirm-new-password"
              label="Repite la Nueva Contraseña"
              password={confirmNewPassword}
              setPassword={setConfirmNewPassword}
            />
          </div>
          <button 
            type='submit'
            className='text-light btn btn-sm rounded-4' 
            style={{ backgroundColor: '#145a83'}}
          >
            {cargando ? <label>Cargando... <GiSandsOfTime /></label>:'Recuperar contraseña'}
          </button>
        </form>
        <span className="text-center text-danger m-0 mt-2" style={{ fontSize: 13, height: 0 }}>{errorInput}</span>
      </div>
    </div>
  )
}