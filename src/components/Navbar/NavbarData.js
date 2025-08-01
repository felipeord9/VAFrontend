import { FaUsers } from "react-icons/fa";
import { LiaClipboardCheckSolid } from "react-icons/lia";
import { MdPendingActions } from "react-icons/md";
import { MdNoteAdd } from "react-icons/md";
import { FaClipboardList } from "react-icons/fa";
import { MdOutgoingMail } from "react-icons/md";

export const NavBarData = [ 
  /* {
    title: "Nuevo registro",
    path: "/start/record",
    icon: <MdNoteAdd />,
    cName: "nav-text",
    access: ['admin', 'supervisor']
  }, */
  {
    title: "Tabla registros",
    path: "/records",
    icon: <FaClipboardList />,
    cName: "nav-text",
    access: ['admin', 'supervisor', 'creador', 'usuario']
  },
  /* {
    title: "Registros pendientes",
    path: "/pending/records",
    icon: <MdPendingActions />,
    cName: "nav-text",
    access: ['admin', 'usuario']
  },
  {
    title: "Registros completos",
    path: "/records/complete",
    icon: <LiaClipboardCheckSolid />,
    cName: "nav-text",
    access: ['admin','usuario']
  }, */
  {
    title: "Mail QR",
    path: "/qr/mail",
    icon: <MdOutgoingMail />,
    cName: "nav-text",
    access: ['admin', 'bodega']
  },
  {
    title: "Tabla QR",
    path: "/qrs",
    icon: <FaClipboardList />,
    cName: "nav-text",
    access: ['admin', 'bodega']
  },
  {
    title: "Usuarios",
    path: "/usuarios",
    icon: <FaUsers />,
    cName: "nav-text",
    access: ['admin']
  },
];