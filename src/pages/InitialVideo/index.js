import React from 'react';
import { useState, useEffect, useContext , useRef } from "react";
import { createRecord } from '../../services/recordService';
import { sendVideo } from '../../services/videoService';
import AuthContext from "../../context/authContext";
import { BsFillSendCheckFill } from "react-icons/bs";
import { BiReset } from "react-icons/bi";
import Guia from "../../assets/guia2.png";
import Guia2 from "../../assets/guia6.png";
import Swal from "sweetalert2";
import './styles.css'

export default function InitialVideo() {
  const { user } = useContext(AuthContext);
  const [placa, setPlaca] = useState('');
  const [firstPart, setFirstPart] = useState('');
  const [secondPart, setSecondPart] = useState('');
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [registrando, setRegistrando] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);

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

    // Muestra la barra de carga
    let timerInterval;
    Swal.fire({
        title: 'Registrando...',
        text: 'Por favor, espera mientras se registra...',
        /* timer: 999999999999999,
        timerProgressBar: true, */
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
            /* Swal.showLoading();
            const timer = Swal.getPopup().querySelector("b"); */
            /* timerInterval = setInterval(() => {}, 200); */
        },
        willClose: () => {
            clearInterval(timerInterval);
        },
        onBeforeOpen: () => {
            Swal.showLoading();
        },
        showConfirmButton: false,
    });

    setRecording(true);
    if(placa !== '' && recordedChunks){
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('video', blob, 'grabacion.webm');
      formData.append('placa', placa.toUpperCase());
      formData.append('concept', 'Entrada');
      formData.append('createdAt', new Date().toISOString().split("T")[0]);
  
      await sendVideo(formData)
      .then(() =>{
        setPreviewUrl(null);
        setElapsedTime(0);
    
        const body = {
          placa: placa.toUpperCase(),
          initialVideo: 1,
          initalDate: new Date(),
          userId: user.id ,
        }
    
        createRecord(body)
        .then(()=>{
          setRecording(false);
          Swal.fire({
            title:'¡Felicitades!',
            text:'Se ha registrado y guardado el vídeo de entrada de manera satisfactoria.',
            showConfirmButton: true,
            confirmButtonColor:'green',
          })
          setPlaca('');
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
    } else {
      setRecording(false);
      Swal.fire({
        icon:'warning',
        title:'¡ATENCION!',
        text:'Por favor indicanos la placa y graba el vídeo de entrada para poder hacer el registro.',
        showConfirmButton: true,
        confirmButtonColor:'red',
      })
    }

  };

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column gap-2 h-100">
        <div className="d-flex div-botons justify-content-center align-items-center bg-light rounded shadow-sm p-2 pe-2">
          <div className='d-flex flex-column w-100'>
            <label style={{fontSize: isMobile ? 15 : 22, color: 'red'}} className='d-flex justify-content-center fw-bold'>NUEVO REGISTRO</label>
            <div className='d-flex div-botons mt-1 w-100 gap-2 justify-content-center align-items-center'>
              <div className='justify-content-center align-items-center d-flex flex-column'>
                <label className="fw-bold">Placa</label>
                <div className='d-flex'>
                  <input
                    type="text"
                    value={placa}
                    className="form-control form-control-sm shadow-sm"
                    onChange={(e) => setPlaca(e.target.value)}
                    style={{textTransform:'uppercase'}}
                    placeholder='Eje: ABC000'
                    required
                  />
                  {/* <label className='mt-1 ms-2 me-2'>-</label>
                  <input
                    type="text"
                    value={secondPart}
                    className="form-control form-control-sm shadow-sm"
                    onChange={(e) => setSecondPart(e.target.value)}
                    placeholder='Eje: 000'
                    required
                  /> */}
                </div>
              </div>
            </div> 
            <label className="fw-bold mt-2" style={{fontSize: isMobile ? 14 : 15}}>Grabación de vídeo entrada:</label>
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
                    onClick={(e) => uploadVideo(e)}
                    className="bg-green-600 btn btn-sm btn-success text-black px-4 py-2 rounded"
                  >
                    {registrando ? 'Registrando...' : '📤 Enviar al servidor'} 
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
              <button
                onClick={startRecording}
                className="bg-blue-600 btn btn-sm btn-primary text-black px-6 py-2 rounded mt-4"
              >
                ▶️ Iniciar grabación
              </button>
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