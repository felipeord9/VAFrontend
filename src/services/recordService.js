import axios from 'axios'
import { config } from "../config";

const url = `${config.apiUrl2}/record`;

export const findCheckList = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/checkList`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findRecord = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findRecordsComplete = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/find/records/complete`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findRecordsPending = async () => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/find/records/pending`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const findOneRecord = async (id) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.get(`${url}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const createRecord = async (body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}

export const updateRecord = async (id, body) => {
  const token = JSON.parse(localStorage.getItem("token"))
  const { data } = await axios.patch(`${url}/${id}`, body, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  return data
}