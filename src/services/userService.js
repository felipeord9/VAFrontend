import axios from 'axios'
import { config } from "../config";

const url = `${config.apiUrl2}/users`;

export const findUsers = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findOneUser = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findUserByEmail = async (email) => {
  const token = JSON.parse(localStorage.getItem('token'))
  const { data } = await axios.get(`${url}/email/${email}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const createUser = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const updateUser = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}