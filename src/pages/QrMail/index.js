import React from 'react';
import { useState, useEffect, useContext , useRef } from "react";
import { useParams , useNavigate } from 'react-router-dom';
import AuthContext from "../../context/authContext";
import { sendVideoQr } from '../../services/videoService';
import Guia2 from "../../assets/guia6.png";
import Swal from 'sweetalert2';
import './styles.css'
import { createQr } from '../../services/qrService';

export default function QrMail() {
  const { user , setUser } = useContext(AuthContext);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [placa, setPlaca] = useState('');
  const [search, setSearch] = useState({
    numFactura: "",
    razonSocial: "",
    refProduct: "",
    descriProduct: "",
    cantidad: "",
    arriveDate: '',
    observations: '',
  });
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);

  const handlerChangeSearch = (e) => {
    const { id, value } = e.target;
    console.log(value);
    setSearch({
      ...search,
      [id]: value,
    });
  };

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

  const enableTorch = async (stream) => {
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    if (capabilities.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: true }],
        });
        console.log("Flash activado");
      } catch (e) {
        console.error("Error al activar el flash:", e);
      }
    } else {
      console.warn("El dispositivo no soporta flash/torch.");
    }
  };

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

    // Intenta activar el flash
    enableTorch(stream);

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
      if(search.arriveDate !== '' && search.cantidad !== ''
        && search.descriProduct !== '' && search.numFactura !== ''
        && search.observations !== '' && search.razonSocial !== ''
        && search.refProduct !== ''
      ){
        if(recordedChunks){
          Swal.fire({
            icon:'question',
            title:'Confirmación',
            text:'¿Estás segur@ de querer enviar este vídeo?',
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
                  title: 'Enviando...',
                  text: 'Por favor, espera mientras se envía...',
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
              formData.append('createdAt', new Date().toISOString().split("T")[0]);
              formData.append('numFactura', search.numFactura);
              formData.append('razonSocial', search.razonSocial.toUpperCase() );
              formData.append('arriveDate', search.arriveDate );
              formData.append('refProduct', search.refProduct );
              formData.append('descriProduct', search.descriProduct.toUpperCase() );
              formData.append('cantidad', search.cantidad );
              formData.append('observations', search.observations.toUpperCase());
          
              await sendVideoQr(formData)
              .then(() =>{
                const body = {
                  numFactura: search.numFactura,
                  razonSocial: search.razonSocial.toUpperCase(),
                  refProduct: search.refProduct,
                  descriProduct: search.descriProduct.toUpperCase(),
                  cantidad: search.cantidad,
                  arriveDate: search.arriveDate,
                  observations: search.observations.toUpperCase(),
                  createdBy: user.name,
                  createdAt: new Date(),
                }
  
                createQr(body)
                .then(()=>{
                setPreviewUrl(null);
                setElapsedTime(0);
                setSearch({
                  arriveDate:'',
                  cantidad:'',
                  descriProduct:'',
                  numFactura:'',
                  observations:'',
                  razonSocial:'',
                  refProduct:''
                })
                  Swal.fire({
                    title:'¡Felicitades!',
                    text:'Se ha enviado el vídeo para QR y registrado de manera satisfactoria.',
                    showConfirmButton: true,
                    confirmButtonColor:'green',
                  })
                  setPlaca('');
                  /* navigate('/records') */
                })
                .catch(()=>{
                  setRecording(false);
                  Swal.fire({
                    icon:'warning',
                    title:'¡ERROR!',
                    text:'Ha ocurrido un error al momento de registrar el QR. Intentalo de nuevo. Si el problema persiste comunícate con el programador.',
                    showConfirmButton: true,
                    confirmButtonColor:'red',
                  })
                })
              })
              .catch(()=>{
                setRecording(false);
                Swal.fire({
                  icon:'warning',
                  title:'¡ERROR!',
                  text:'Ha ocurrido un error al momento de enviar el vídeo. Intentalo de nuevo. Si el problema persiste comunícate con el programador.',
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
            text:'Por favor graba el vídeo del QR para poder hacer el envío.',
            showConfirmButton: true,
            confirmButtonColor:'red',
          })
        }
      }else{
        Swal.fire({
          icon:'warning',
          title:'¡ATENCIÓN!',
          text:'Debes llenar todos los campos para poder generar el QR.',
          showConfirmButton: true,
          confirmButtonColor: 'red'
        })
      }
    };

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column gap-2 h-100">
        <div className="d-flex div-botons justify-content-center align-items-center bg-light rounded shadow-sm p-2 pe-2">
          <div className='d-flex flex-column w-100'>
            <label style={{fontSize: isMobile ? 15 : 22, color: 'rgba(40, 211, 188, 0.8)'}} className='d-flex justify-content-center fw-bold'>INFORMACIÓN PARA QR</label>
            {/* <hr className="my-1" /> */}
             <div className="row row-cols-sm-3 mt-3" style={{fontSize:12}}>
              <div className='d-flex flex-column'>
                <label className="fw-bold">NÚMERO DE FACTURA</label>
                <input
                  id="numFactura"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder='*CAMPO OBLIGATORIO*'
                  value={search.numFactura}
                  onChange={handlerChangeSearch}
                  required
                />
              </div> 
              <div className='d-flex flex-column'>
                <label className="fw-bold">RAZÓN SOCIAL</label>
                <input
                  id="razonSocial"
                  type="text"
                  className="form-control form-control-sm"
                  value={search.razonSocial}
                  onChange={handlerChangeSearch}
                  placeholder='*CAMPO OBLIGATORIO*'
                  style={{textTransform:'uppercase'}}
                  required
                />
              </div>
              <div className='d-flex flex-column'>
                <label className="fw-bold">FECHA FACTURA</label>
                <input
                  id="arriveDate"
                  type="date"
                  className="form-control form-control-sm"
                  value={search.arriveDate}
                  placeholder='*CAMPO OBLIGATORIO*'
                  max={new Date().toISOString().split("T")[0]}
                  onChange={handlerChangeSearch}
                  required
                />
              </div>
            </div>
            <div className="row row-cols-sm-3 mt-2 mb-3" style={{fontSize:12}}>
              <div className='d-flex flex-column'>
                <label className="fw-bold">REFERENCIA DEL PRODUCTO</label>
                <input
                  id="refProduct"
                  type="text"
                  className="form-control form-control-sm"
                  value={search.refProduct}
                  placeholder='*CAMPO OBLIGATORIO*'
                  onChange={handlerChangeSearch}
                  required
                />
              </div> 
              <div className='d-flex flex-column'>
                <label className="fw-bold">DESCRIPCIÓN DEL PRODUCTO</label>
                <input
                  id="descriProduct"
                  type="text"
                  className="form-control form-control-sm"
                  value={search.descriProduct}
                  onChange={handlerChangeSearch}
                  placeholder='*CAMPO OBLIGATORIO*'
                  style={{textTransform:'uppercase'}}
                  required
                />
              </div>
              <div className='d-flex flex-column'>
                <label className="fw-bold">CANTIDAD</label>
                <input
                  id="cantidad"
                  type="number"
                  className="form-control form-control-sm"
                  value={search.cantidad}
                  placeholder='*CAMPO OBLIGATORIO*'
                  onChange={handlerChangeSearch}
                  required
                />
              </div>
            </div>
            <div className="d-flex flex-column mb-3" style={{fontSize: 12}}>
              <label className="fw-bold">OBSERVACIONES</label>
              <textarea
                id="observations"
                className="form-control"
                value={search.observations}
                onChange={handlerChangeSearch}
                placeholder='*CAMPO OBLIGATORIO*'
                style={{ minHeight: 70, maxHeight: 100, fontSize: 12 , textTransform:'uppercase' }}
              ></textarea>
            </div>
            <label className="fw-bold mt-2" style={{fontSize: isMobile ? 14 : 15}}>Grabación de vídeo para Qr:</label>
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
                    📤 Enviar por correo
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
                  onClick={(e)=>startRecording(e)}
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
      </div>
    </div>
  );
}