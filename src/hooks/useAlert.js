import { useCallback } from "react";
import Swal from "sweetalert2";

export default function useAlert() {
  const successAlert = useCallback(({ title, text }) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#198754",
      timer: 2500,
    });
  }, [])

  const warningAlert = useCallback(({ title, text }) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#198754",
      timer: 2500,
    });
  }, [])

  const errorAlert = useCallback(({ title, text }) => {
    Swal.fire({
      title: title,
      text: text,
      icon: "error",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#198754",
      timer: 2500,
    });
  }, [])

  return {
    successAlert,
    warningAlert,
    errorAlert
  }
}