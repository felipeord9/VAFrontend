import { useState, useEffect , useContext } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { createRecord } from "../../services/recordService";
import Swal from 'sweetalert2'
import AuthContext from "../../context/authContext";
import './styles.css'

export default function ModalVerifyBalance({
  balance,
  setBalance,
  showModal,
  setShowModal,
  reloadInfo,
}) {
  //logica del segundo modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);

  const [ observations, setObservations ] = useState('');

  const openModal = (number) => {
    setSelectedNumber(number);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const [weights, setWeights] = useState({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });
  const [um, setUm] = useState({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });

  const handleWeightChange = (event) => {
    const { value } = event.target;
    setWeights((prevWeights) => ({
      ...prevWeights,
      [selectedNumber]: value,
    }));
  };

  const handleUmChange = (event) => {
    const { value } = event.target;
    setUm((prevUm) => ({
      ...prevUm,
      [selectedNumber]: value,
    }));
  };

  const { user } = useContext(AuthContext);
  
  //LOGICA DEL MODAL HIJO
  const handleCreateRecord = (e) => {
    e.preventDefault();
      if(
        weights[1] !== '' && weights[1] !== null &&
        um[1] !== '' && um[1] !== null &&
        weights[2] !== '' && weights[2] !== null &&
        um[2] !== '' && um[2] !== null &&
        weights[3] !== '' && weights[3] !== null &&
        um[3] !== '' && um[3] !== null &&
        weights[4] !== '' && weights[4] !== null &&
        um[4] !== '' && um[4] !== null &&
        weights[5] !== '' && weights[5] !== null &&
        um[5] !== '' && um[5] !== null 
      ){
        const body={
          firstWeight: `${weights[1]} ${um[1]}`,
          secondWeight: `${weights[2]} ${um[2]}`,
          thirdWeight: `${weights[3]} ${um[3]}`,
          fourthWeight: `${weights[4]} ${um[4]}`,
          fifthWeight: `${weights[5]} ${um[5]}`,
          date: new Date(),
          hour: `${new Date().getHours()}:${new Date().getMinutes()}`,
          balanceId: balance.id,
          userId: user.id,
          observations: observations,
        }
        createRecord(body)
        .then((data) => {
          setShowModal(!showModal)
          Swal.fire({
            title: '¡Correcto!',
            text: `El registro de la gramera se ha generado correctamente`,
            showConfirmButton: false,
            timer: 4000
          })
          cleanForm()
          reloadInfo()
        })
        .catch((error) => {
          Swal.fire({
            icon:'warning',
            title: '¡ERROR!',
            text: 'Ha ocurrido un error al momento de registrar la verificación. Vuelve a intentarlo, si el problema persiste comunicate con el área de sistemas.',
            showConfirmButton: false,
            timer: 5000
          })
        });
      }else if(observations !== ''){
        const body={
          firstWeight: weights[1] !== '' ? `${weights[1]} ${um[1]}` : 0,
          secondWeight: weights[2] !== '' ? `${weights[2]} ${um[2]}` : 0,
          thirdWeight: weights[3] !== '' ? `${weights[3]} ${um[3]}` : 0,
          fourthWeight: weights[4] !== '' ? `${weights[4]} ${um[4]}` : 0,
          fifthWeight: weights[5] !== '' ? `${weights[5]} ${um[5]}` : 0,
          date: new Date(),
          hour: `${new Date().getHours()}:${new Date().getMinutes()}`,
          balanceId: balance.id,
          userId: user.id,
          observations: observations,
        }
        createRecord(body)
        .then((data) => {
          Swal.fire({
            title: '¡Correcto!',
            text: `El registro de la gramera se ha generado correctamente`,
            showConfirmButton: false,
            timer: 4000
          })
          cleanForm()
        })
        .catch((error) => {
          Swal.fire({
            icon:'warning',
            title: '¡ERROR!',
            text: 'Ha ocurrido un error al momento de registrar la verificación. Vuelve a intentarlo, si el problema persiste comunicate con el área de sistemas.',
            showConfirmButton: false,
            timer: 5000
          })
        });
      }else{
        Swal.fire({
          icon:'warning',
          title: '¡ATENCIÓN!',
          text: 'Debes completar todos pesos en las diferentes posiciones para poder hacer el registro.',
          showConfirmButton: false,
          timer: 5000
        })
      }
  }

  const cleanForm = () => {
    setWeights({
      1:'',
      2:'',
      3:'',
      4:'',
      5:'',
    })
    setUm({
      1:'',
      2:'',
      3:'',
      4:'',
      5:'',
    })
    setObservations('');
    setBalance(null)
    setShowModal(false)
  }

  return (
    <div className="wrapper d-flex justify-content-center align-content-center" style={{userSelect:'none'}}>
    <Modal show={showModal} style={{ fontSize: 18, userSelect:'none' }} centered size="xl">
      <Modal.Header className="d-flex w-100">
        <Modal.Title className="fw-bold w-100 d-flex p-0 m-0" style={{fontSize:20}}>
          <div className="d-flex w-100 justify-content-center align-items-center" style={{color:'#eb6146'}} >
            {`Verificar gramera ${balance && balance?.reference}`}
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-2">
      <label className="d-flex w-100 justify-content-center align-items-center h-100">Posiciones</label> 
      <div className="container-ejemplo d-flex h-100">
        <div className="square">
          <div 
            className="number top-left" 
            onClick={() => openModal(2)}
            style={{color: (weights[2] && um[2]) !== '' ? 'green' : 'orange'}}
          >
            2
          </div>
          <div 
            className="number top-right" 
            onClick={() => openModal(3)}
            style={{color: (weights[3] && um[3]) !== '' ? 'green' : 'orange'}}
          >
            3
          </div>
          <div 
            className="number center" 
            onClick={() => openModal(1)}
            style={{color: (weights[1] && um[1]) !== '' ? 'green' : 'orange'}}  
          >
            1
          </div>
          <div 
            className="number bottom-left" 
            onClick={() => openModal(4)}
            style={{color: (weights[4] && um[4]) !== '' ? 'green' : 'orange'}}  
          >
            4
          </div>
          <div 
            className="number bottom-right" 
            onClick={() => openModal(5)}
            style={{color: (weights[5] && um[5]) !== '' ? 'green' : 'orange'}}
          >
            5
          </div>
        </div>
        

        {/* Logica del modal hijo */}
        <Modal show={modalIsOpen} onHide={closeModal} centered style={{backgroundColor:'rgba(0, 0, 0, 0.6)'}} size="sm">
          <Modal.Header closeButton>
            <Modal.Title>Peso {selectedNumber}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="formWeight">
              <Form.Control
                type="number"
                value={weights[selectedNumber] || ''}
                onChange={handleWeightChange}
                placeholder="Ingrese el peso"
                className="mb-2"
              />
              <select
                value={um[selectedNumber] || ''}
                className="form-select form-select-sm"
                onChange={handleUmChange}
                required
              >
                <option selected disabled value="">
                  UM 
                </option>
                <option value="KG">KG</option>
                <option value="G">G</option>
              </select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={closeModal}>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      {/* observaciones */}
      <div className="d-flex flex-column mb-1 mt-2">
          <label className="d-flex w-100 justify-content-center align-items-center fw-bold">OBSERVACIONES</label>
          <textarea
            id="observations"
            className="form-control"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
          ></textarea>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex justify-content-center gap-2 mt-2 w-100">
          <button
            className="btn btn-sm btn-success p-2 w-50"
            type='submit'
            onClick={(e)=>(handleCreateRecord(e))}
          >
            REGISTRAR
          </button>
          <button
            className="btn btn-sm btn-danger w-50"
            onClick={(e)=>cleanForm()}
          >
            CANCELAR
          </button>
        </div>
      </Modal.Footer>
    </Modal>
    </div>
  );
}
