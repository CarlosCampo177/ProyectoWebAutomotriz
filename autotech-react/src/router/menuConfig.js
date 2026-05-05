export const menuConfig = {
  admin: [
    { label: 'Inicio',          path: '/admin/inicio',       icon: 'bi-grid-1x2'       },
    { label: 'Clientes',        path: '/admin/clientes',     icon: 'bi-people'         },
    { label: 'Vehículos',       path: '/admin/vehiculos',    icon: 'bi-car-front'      },
    { label: 'Mecánicos',       path: '/admin/mecanicos',    icon: 'bi-person-badge'   },
    { label: 'Servicios',       path: '/admin/servicios',    icon: 'bi-tools'          },
    { label: 'Órdenes y citas', path: '/admin/citas',        icon: 'bi-calendar-check' },
    { label: 'Facturación',     path: '/admin/facturacion',  icon: 'bi-receipt'        },
    { label: 'Estadísticas',    path: '/admin/estadisticas', icon: 'bi-bar-chart-line' },
  ],
  mecanico: [                                        
    { label: 'Inicio',               path: '/mecanico',                 icon: 'bi-grid-1x2'        },
    { label: 'Mis órdenes',          path: '/mecanico/ordenes',         icon: 'bi-clipboard-check' },
    { label: 'Vehículos asignados',  path: '/mecanico/vehiculos',       icon: 'bi-car-front'       },
    { label: 'Observaciones',        path: '/mecanico/observaciones',   icon: 'bi-chat-left-text'  },
  ],
}