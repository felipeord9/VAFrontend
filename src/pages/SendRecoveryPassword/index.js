import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useUser from '../../hooks/useUser';
import { sendRecovery } from '../../services/authService';
import Logo from "../../assets/AVRecortado.png";
import { GiSandsOfTime } from "react-icons/gi";
import './styles.css'

export default function SendRecoveryPassword() {
  const { isLogged } = useUser()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [cargando,setCargando] = useState(false)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    if (isLogged) navigate('/inicio');
  }, [isLogged, navigate]);

  const handleSubmit = (e) => {
    setCargando(true)
    e.preventDefault()
    if(email!=='' && email.includes('@') && email.split('@')[1].includes('.')){
      sendRecovery(email)
        .then((data) => {
          setCargando(false)
          Swal.fire({
            title: "¡CORECTO!",
            text: "El correo de recuperación fue enviado de manera exitosa",
            /* icon: 'success', */
            confirmButtonText: "Aceptar",
            confirmButtonColor:'green'
          })
          navigate('/login')
        })
        .catch((error) => {
          setCargando(false)
          Swal.fire({
            title:'¡Uops!',
            text:'Ha ocurrido un error a la hora de mandar el correo electrónico. Verificalo y vuelve a intentarlo. Si el problema persiste comunicate con el área de sistemas.',
            showConfirmButton:true,
            confirmButtonText:'OK',
            confirmButtonColor:'#D92121'
          })
        })
    }else{
      setCargando(false)
      setInvalid(true)
      setTimeout(() => setInvalid(false), 3000)
    }
  }

  return (
    <div className='d-flex justify-content-center align-items-center h-100 w-100 m-auto'>
      <div className='card p-4 rounded-4 m-auto shadow' 
        style={{ maxWidth: 370 , border:'2px solid #145a83'}}
      >
        <div className='mb-3 p-2'>
          <img src={Logo} style={{borderRadius:10}} className='w-100' alt='logo' />
        </div>
        <form className='d-flex flex-column gap-3' style={{fontSize: 13.5}} onSubmit={handleSubmit}>
          <div>
            <label className='fw-bold w-100'>Correo electrónico</label>
            <input
              type='email'
              value={email}
              className='form-control form-control-sm shadow-sm'
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete='on'
            />
          </div>
          <button 
            type='submit'
            className='text-light btn btn-sm mt-1 rounded-4' 
            style={{ backgroundColor: '#145a83'}}
          >
            {cargando ? <label>Solicitando... <GiSandsOfTime /></label>:'solicitar recuperación'}
            
          </button>
        </form>
        <span className='text-center text-danger text-rowrap w-100 m-0 my-2' style={{height: 0}}>{error.message}</span>
        <Link to="/login" className='text-decoration-none text-center mt-2 w-100'>Volver al login</Link>
        {invalid && <div className='text-danger text-center mt-2 fw-bold'>Corréo Inválido</div>}
      </div>
    </div>
  )
}