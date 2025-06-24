import { FaUsers } from "react-icons/fa";
import { LiaClipboardCheckSolid } from "react-icons/lia";
import { MdPendingActions } from "react-icons/md";
import { MdNoteAdd } from "react-icons/md";

export const NavBarData = [ 
  {
    title: "Nuevo registro",
    path: "/start/record",
    icon: <MdNoteAdd />,
    cName: "nav-text",
    access: ['admin', 'usuario']
  },
  {
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
  },
  /* {
    title: "Grameras",
    path: "/grameras",
    icon: <FaBalanceScale />,
    cName: "nav-text",
    access: ['admin','calidad']
  }, */
  {
    title: "Usuarios",
    path: "/usuarios",
    icon: <FaUsers />,
    cName: "nav-text",
    access: ['admin']
  },
];