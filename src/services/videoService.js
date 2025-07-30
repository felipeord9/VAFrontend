import axios from 'axios'
import { config } from "../config";

const url = `${config.apiUrl2}/upload`;
const url2 = `${config.apiUrl2}/videos`;

/* export const sendVideo = async(formData) =>{
    try {
      const res = await fetch(`${config.apiUrl2}/upload/record`, {
        method: 'POST',
        body: formData,
      });
      return res;
    } catch (error) {
      throw error;
    }
} */

export const sendVideo = async(formData) =>{
  try {
    const {data}= await axios.post(`${url}/record`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data;
  } catch (error) {
    throw error;
  }
}

export const sendVideoQr = async(formData) =>{
  try {
    const {data}= await axios.post(`${url}/qr/record`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data;
  } catch (error) {
    throw error;
  }
}

export const getVideo = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/file`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}
