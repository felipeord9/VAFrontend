import axios from 'axios'
import { config } from "../config";

const url = `${config.apiUrl2}/type`;


export const findTypes = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}