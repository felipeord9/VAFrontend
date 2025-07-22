import React from 'react';
import { useState, useEffect, useContext , useRef } from "react";
import { useParams , useNavigate } from 'react-router-dom';
import { findOneRecord , updateRecord } from '../../services/recordService';
import AuthContext from "../../context/authContext";
import { BsFillSendCheckFill } from "react-icons/bs";
import { MdOutlineArrowBack } from "react-icons/md";
import { sendVideo } from '../../services/videoService';
import { userLogin } from '../../services/authService';
import InputPassword from '../../components/InputPassword';
import { Modal , Button , Form } from "react-bootstrap";
import { BiReset } from "react-icons/bi";
import Guia from "../../assets/guia2.png";
import Guia2 from "../../assets/guia6.png";
import Swal from 'sweetalert2';
import './styles.css'

export default function News() {
  const { user , setUser } = useContext(AuthContext);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reject, setReject] = useState(false);
  const [reasonNews, setReasonNews] = useState('');
  const navigate = useNavigate();

  const [info, setInfo] = useState({});

  //constante para guardar el valor del parametro
  const { id } = useParams();

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);

  //Logica para traer la info del registro
  useEffect(() => {
    if(id){
      findOneRecord(id)
      .then(({data})=>{
        setInfo(data)
      })
      .catch(()=>{
        setInfo({})
        Swal.fire({
          icon:'warning',
          title:'¡ATENCIÓN!',
          text:'Ha ocurrido un error al momento de abrir el vínculo. Vuelve a intentarlo, si el problema persiste comunícate con el programador.',
          confirmButtonText:'OK',
          confirmButtonColor:'red'
        })
        .then(()=>{
          navigate('/records')
        })
      })
    }
  },[])

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

  // Formatear tiempo como mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  /* login autenticación */
  const handleAutentication = (e) => {
    e.preventDefault();
    setIsLoading(true);
    if(email !== '' && password !== ''){
      userLogin({email, password})
      .then((data) => {
        window.localStorage.setItem("token", JSON.stringify(data.token))
        window.localStorage.setItem("user", JSON.stringify(data.user))
        setUser(data.user)
        setIsLoading(false);
        closeModal();
        startRecording();
      })
      .catch((err)=>{
        setIsLoading(false);
        setReject(true);
        setTimeout(() => setReject(false), 4000)
      })
    }
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: { ideal: 'environment' },
        /* width: { ideal : '100%' },
        height: { ideal : '100%' }  */
      },
      audio: true,
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;

    mediaRecorderRef.current = new MediaRecorder(stream);
    recordedChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setElapsedTime(0);

    const interval = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach((track) => track.stop());
    clearInterval(timerInterval);
    setRecording(false);
  };

  const uploadVideo = async (e) => {
      e.preventDefault();
      setRecording(true);
      if(reasonNews !== ''){
        if(recordedChunks){
          Swal.fire({
            icon:'question',
            title:'Confirmación',
            text:'¿Estás segur@ de querer registrar este vídeo?',
            showConfirmButton:true,
            confirmButtonColor:'green',
            confirmButtonText:'Si',
            showDenyButton: true,
            denyButtonColor:'red',
          })
          .then ( async ({isConfirmed, isDenied})=>{
            if(isConfirmed){
              // Muestra la barra de carga
              let timerInterval;
              Swal.fire({
                  title: 'Registrando...',
                  text: 'Por favor, espera mientras se registra...',
                  allowOutsideClick: false,
                  didOpen: () => {
                      Swal.showLoading();
                  },
                  willClose: () => {
                      clearInterval(timerInterval);
                  },
                  onBeforeOpen: () => {
                      Swal.showLoading();
                  },
                  showConfirmButton: false,
              });
              const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
              const formData = new FormData();
              formData.append('video', blob, 'grabacion.webm');
              formData.append('placa', info.placa.toUpperCase());
              formData.append('concept', 'Novedad');
              formData.append('createdAt', new Date().toISOString().split("T")[0]);
          
              await sendVideo(formData)
              .then(() =>{
                setPreviewUrl(null);
                setElapsedTime(0);
            
                const body = {
                  news: 1,
                  newsCreatedBy: user.name,
                  newsDate: new Date(),
                  reasonNews: reasonNews.toUpperCase()
                  /* status: 'No realizado' */
                }
            
                updateRecord(info.id, body)
                .then(()=>{
                  setRecording(false);
                  Swal.fire({
                    title:'¡Felicitades!',
                    text:'Se ha registrado y guardado el vídeo de novedad de manera satisfactoria.',
                    showConfirmButton: true,
                    confirmButtonColor:'green',
                  })
                  setInfo({});
                  navigate('/records')
                })
                .catch(()=>{
                  setRecording(false);
                  Swal.fire({
                    title:'¡ERROR!',
                    text:'Ha ocurrido un error al momento de hacer el registro. Intentalo de nuevo. Si el problema persiste comunícate con el programador.',
                    showConfirmButton: true,
                    confirmButtonColor:'green',
                  })
                })
              })
              .catch(()=>{
                setRecording(false);
                Swal.fire({
                  icon:'warning',
                  title:'¡ERROR!',
                  text:'Ha ocurrido un error al momento de guarda el vídeo. Intentalo de nuevo. Si el problema persiste comunícate con el programador.',
                  showConfirmButton: true,
                  confirmButtonColor:'red',
                })
              })
            }
          })
        } else {
          setRecording(false);
          Swal.fire({
            icon:'warning',
            title:'¡ATENCION!',
            text:'Por favor graba el vídeo de entrada para poder hacer el registro.',
            showConfirmButton: true,
            confirmButtonColor:'red',
          })
        }
      }else{
        setRecording(false);
        Swal.fire({
          icon:'warning',
          title:'¡ATENCION!',
          text:'Por favor agregar un motivo especificando la novedad para poder hacer el registro.',
          showConfirmButton: true,
          confirmButtonColor:'red',
        })
      }
    };

  /* logica del modal */
  const [modal, setModal] = useState(false);
  const closeModal = () => {
    setEmail('');
    setPassword('');
    setModal(false);
  };
  const openModal = () => {
    setModal(true);
  };

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column gap-2 h-100">
        {/* Modal para la autenticacion */}
        <Modal show={modal} onHide={closeModal} centered>
          <Modal.Header closeButton>
            <Modal.Title className='d-flex justify-content-center w-100 fw-bold' style={{color:'#145a83'}}>Autenticación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div
              className="d-flex flex-column gap-2"
              style={{ fontSize: 13.5 }}
              /* onSubmit={handleAutentication} */
            >
              <div>
                <label className="fw-bold">Nombre de usuario</label>
                <input
                  type="text"
                  value={email}
                  className="form-control form-control-sm shadow-sm"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <InputPassword
                  label="Contraseña"
                  password={password}
                  setPassword={setPassword}
                />
              </div>
            </div>
            {reject && (
              <div className="text-danger text-center mt-2">
                Usuario o contraseña incorrectos
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="w-100 justify-content-center align-items-center d-flex">
              <button
                /* type="submit" */
                className="text-light btn btn-sm mt-2 w-50 justify-content-center rounded-4"
                style={{ backgroundColor: "#145a83" }}
                onClick={(e) => handleAutentication(e)}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'} 
              </button>
            </div>
          </Modal.Footer>
        </Modal>
        <div className="d-flex div-botons justify-content-center align-items-center bg-light rounded shadow-sm p-2 pe-2">
          <div className='d-flex flex-column w-100'>
            <label style={{fontSize: isMobile ? 15 : 22, color: 'rgba(255, 200, 50, 0.8)'}} className='d-flex justify-content-center fw-bold'>VIDEO NOVEDAD</label>
            <div className='d-flex div-botons mt-1 w-100 gap-2 justify-content-center align-items-center'>
              <div className='justify-content-center align-items-center d-flex flex-column'>
                <label className="fw-bold">Placa</label>
                <div className='d-flex'>
                  <input
                    type="text"
                    value={info.placa}
                    className="form-control form-control-sm shadow-sm"
                    style={{textTransform:'uppercase'}}
                    placeholder='Eje: ABC000'
                    disabled
                    required
                  />
                </div>
              </div>
            </div> 
            <div className="d-flex flex-column mb-1 mt-2">
              <label className="fw-bold">MOTIVO DE LA NOVEDAD</label>
              <textarea
                id="observations"
                className="form-control"
                value={reasonNews}
                onChange={(e)=>setReasonNews(e.target.value)}
                style={{ minHeight: 70, maxHeight: 100, fontSize: 12 , textTransform:'uppercase'}}
              ></textarea>
            </div>
            <label className="fw-bold mt-2" style={{fontSize: isMobile ? 14 : 15}}>Grabación de vídeo novedad:</label>
            <div className='d-flex flex-column' style={{height: isMobile ? '80%' : '60vh'}}>
            {!previewUrl && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                poster={Guia2}
                className="w-full rounded border h-full"
                height={'100%'}
                width={'100%'}
                style={{height: isMobile ? '60vh' : '60vh'}}
              />
            )}

            {recording && (
              <div className="text-red-600 font-bold text-lg mt-2">
                ⏺ Grabando... {formatTime(elapsedTime)}
              </div>
            )}

            {!recording && previewUrl && (
              <>
                <video
                  src={previewUrl}
                  controls
                  className="w-full rounded border"
                  
                  style={{height: isMobile ? '60vh' : '60vh'}}
                />
                <div className={`mt-2 d-flex div-botons justify-content-center ${isMobile ? 'gap-2' : 'gap-4'} `}>
                  <button
                    onClick={uploadVideo}
                    className="bg-green-600 btn btn-sm btn-success text-black px-4 py-2 rounded"
                  >
                    📤 Enviar al servidor
                  </button>
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      recordedChunks.current = [];
                    }}
                    className="bg-gray-500 btn btn-sm btn-danger text-black px-4 py-2 rounded"
                  >
                    🔄 Grabar de nuevo
                  </button>
                </div>
              </>
            )}

            {!recording && !previewUrl && (
              <div className={`mt-2 d-flex div-botons justify-content-center ${isMobile ? 'gap-2' : 'gap-4'} `}>
                <button
                  onClick={(e)=>openModal(e)}
                  className="bg-blue-600 btn btn-sm btn-primary text-black px-4 py-2 rounded"
                >
                  ▶️ Iniciar grabación
                </button>
                <button
                  onClick={(e)=>navigate('/records')}
                  className="bg-red-600 btn btn-sm btn-danger text-black px-4 py-2 rounded"
                >
                  ↩️ Salir
                </button>
              </div>
            )}

            {recording && (
              <button
                onClick={stopRecording}
                className="bg-red-600 btn btn-sm btn-danger text-black px-6 py-2 rounded mt-1"
              >
                ⏹️ Detener grabación
              </button>
            )}
            </div>
          </div>
        </div>
        {/* <TablePendingRecords records={suggestions} getAllRecords={getCheckList} loading={loading}/> */}
      </div>
    </div>
  );
}