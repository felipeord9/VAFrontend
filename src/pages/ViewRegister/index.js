import React from 'react';
import { useState, useEffect, useContext , useRef } from "react";
import AuthContext from "../../context/authContext";
import { BsFillSendCheckFill } from "react-icons/bs";
import { BiReset } from "react-icons/bi";
import Guia from "../../assets/guia2.png";
import Guia2 from "../../assets/guia6.png";
import { useNavigate, useParams } from 'react-router-dom';
import { findOneRecord } from '../../services/recordService';
import { Modal } from "react-bootstrap";
import { config } from '../../config';
import Swal from 'sweetalert2';
import './styles.css'


export default function ViewRegister() {
  const { user } = useContext(AuthContext);
  const [placa, setPlaca] = useState('');
  const [firstPart, setFirstPart] = useState('');
  const [secondPart, setSecondPart] = useState('');
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [videoEntrada, setVideoEntrada] = useState('');
  const [videoSalida, setVideoSalida] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);

  //constante para guardar el valor del parametro
  const { id } = useParams();
  const [info, setInfo] = useState({});

  //Logica para traer la info del registro
    useEffect(() => {
      if(id){
        setLoading(true)
        findOneRecord(id)
        .then(({data})=>{
          //variables para la consulta de videos
          const fileEntrada = `videoEntrada_${data.placa}.mp4`
          const fechaEntrada = new Date(data.initalDate).toISOString().split("T")[0];
          const fileSalida = `videoSalida_${data.placa}.mp4`
          const fechaSalida = new Date(data.finalDate).toISOString().split("T")[0];

          //envío de consulta al backend
          const url = `${config.apiUrl2}/upload/obtener-archivo/${fechaEntrada}/${data.placa}/${fileEntrada}`
          const url2 = `${config.apiUrl2}/upload/obtener-archivo/${fechaSalida}/${data.placa}/${fileSalida}`;
          /* const url = `http://localhost:3002/upload/file?folder=${encodeURIComponent(folderEntrada)}&filename=${encodeURIComponent(fileEntrada)}` */
          /* const url2 = `http://localhost:3002/upload/file?folder=${folderSalida}&filename=${fileSalida}`; */
          /* const url = `${config.apiUrl2}/uploadMultiple/obtener-archivo/${carpeta}/${archivo}`; */
          setVideoEntrada(url)
          setVideoSalida(url2)
          setInfo(data)
          setLoading(false)
        })
        .catch(()=>{
          setInfo({})
          setLoading(false)
          Swal.fire({
            icon:'warning',
            title:'¡ATENCIÓN!',
            text:'Ha ocurrido un error al momento de abrir el vínculo. Vuelve a intentarlo, si el problema persiste comunícate con el programador.',
            confirmButtonText:'OK',
            confirmButtonColor:'red'
          })
          .then(()=>{
            navigate('/pending/records')
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

  // Función para convertirla al formato correcto
  const formatDateForInput = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column gap-2 h-100">
        <div className="d-flex div-botons justify-content-center align-items-center bg-light rounded shadow-sm p-2 pe-2">
          <div className='d-flex flex-column w-100'>
            <label style={{fontSize: isMobile ? 15 : 22, color: 'grey'}} className='d-flex justify-content-center fw-bold'>VISUALIZAR REGISTRO </label>
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
            <div className='row row-cols-sm-2 mt-1'>
              <label className="fw-bold mt-2" style={{fontSize: isMobile ? 14 : 15}}>{isMobile ? 'Vídeo entrada:' : 'Grabación de vídeo entrada:'}</label>
              <div className='d-flex flex-row'>
                <label className="fw-bold mt-2" style={{fontSize: isMobile ? 14 : 15}}>Fecha: </label>
                <label className="mt-2 ms-2" style={{fontSize: isMobile ? 14 : 15, backgroundColor:'whitesmoke'}}>{new Date(info.initalDate).toLocaleString("es-CO")}</label>
              </div>
            </div> 
            <div className='d-flex flex-column mt-1' style={{height: isMobile ? '100%' : '60vh'}}>
            {videoEntrada && (
              <>
                <video
                  src={videoEntrada}
                  controls
                  className="w-full rounded border"
                  style={{height: isMobile ? '100%' : '60vh'}}
                />
              </>
            )}
            </div>
            <hr className="my-1 mt-4" />
            <div className='row row-cols-sm-2 mt-1'>
              <label className="fw-bold mt-2" style={{fontSize: isMobile ? 14 : 15}}>{isMobile ? 'Vídeo salida:' : 'Grabación de vídeo salida:'}</label>
              <div className='d-flex flex-row'>
                <label className="fw-bold mt-2" style={{fontSize: isMobile ? 14 : 15}}>Fecha:</label>
                <label className="mt-2 ms-2" style={{fontSize: isMobile ? 14 : 15, backgroundColor:'whitesmoke'}}>{new Date(info.finalDate).toLocaleString("es-CO")}</label>
              </div>
            </div>
            <div className='d-flex flex-column mt-1' style={{height: isMobile ? '100%' : '60vh'}}>
            {videoSalida && (
              <>
                <video
                  src={videoSalida}
                  controls
                  className="w-full rounded border"
                  style={{height: isMobile ? '100%' : '60vh'}}
                />
              </>
            )}
            </div>
            <button
              onClick={(e)=>navigate('/records/complete')}
              className="bg-red-600 btn btn-sm btn-primary text-black px-4 py-2 rounded mt-2"
            >
              ↩️ Salir
            </button>
          </div>
        </div>
        <Modal show={loading} centered>
          <Modal.Body>
            <div className="d-flex align-items-center">
              <strong className="text-danger" role="status">
                Cargando...
              </strong>
              <div
                className="spinner-grow text-danger ms-auto"
                role="status"
              ></div>
            </div>
          </Modal.Body>
        </Modal>
        {/* <TablePendingRecords records={suggestions} getAllRecords={getCheckList} loading={loading}/> */}
      </div>
    </div>
  );
}