# 📅 Módulo de Gestión de Horarios - La Curva Del Gordo

## Descripción General

Sistema completo de gestión de horarios de empleados para la cadena de restaurantes **"La Curva Del Gordo"**. Desarrollado con **React + TypeScript + TailwindCSS**, proporciona una interfaz moderna y amigable para gestionar empleados y horarios por sede.

## 🎯 Características Principales

### 1. **Selector de Sede**
- Interfaz inicial para seleccionar entre 6 sedes:
  - Amagá
  - Paso Nivel
  - Girardota
  - Variante Caldas
  - Guarne
  - Campestre

### 2. **Gestión de Empleados**
- ✅ Crear, editar y eliminar empleados
- ✅ Filtrar por nombre y tipo de contrato
- ✅ Tipos de contrato: Tiempo Completo, Medio Tiempo, Extra
- ✅ Gestión de roles (Mesero, Cajero, Cocina, etc.)
- ✅ Estados activo/inactivo
- ✅ Tabla responsiva con búsqueda en tiempo real

### 3. **Gestión de Horarios** ⭐ (Función Principal)
- ✅ Crear horarios con configuración flexible
- ✅ Seleccionar días de trabajo (Lunes a Domingo)
- ✅ Definir horarios de apertura y cierre
- ✅ Configurar 1, 2 o 3 turnos
- ✅ Asignar empleados a turnos específicos
- ✅ Tipos de jornada por empleado
- ✅ Generación automática de nombres por mes/año
- ✅ Vista detallada con resumen de horarios
- ✅ Edición y eliminación de horarios

## 📊 Estructura de Datos

### Employee
```typescript
interface Employee {
  id: string;
  nombreCompleto: string;
  tipoContrato: 'tiempo_completo' | 'medio_tiempo' | 'extra';
  rol: string;
  activo: boolean;
  sede: string;
}
```

### Schedule
```typescript
interface Schedule {
  id: string;
  nombre: string;
  sede: string;
  diasTrabajo: string[];
  horaApertura: string;
  horaCierre: string;
  turnos: Shift[];
  mes: number;
  anio: number;
  empleadosAsignados: EmployeeShiftAssignment[];
  createdAt: string;
}
```

### Shift
```typescript
interface Shift {
  numero: number;
  horaInicio: string;
  horaFin: string;
}
```

### EmployeeShiftAssignment
```typescript
interface EmployeeShiftAssignment {
  employeeId: string;
  tipoJornada: 'tiempo_completo' | 'medio_tiempo' | 'extra';
  turno?: number; // 1, 2, o 3
}
```

## 🚀 Cómo Usar

### Instalación de Dependencias
```bash
npm install
```

### Desarrollo Local
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5173`

### Build para Producción
```bash
npm run build
```

## 🎨 Stack Tecnológico

- **Framework:** React 18+
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS 3+
- **Build Tool:** Vite
- **State Management:** React Hooks (useState)
- **Componentes:** Sin dependencias externas (CSS puro)

## 📁 Estructura de Archivos

```
src/
├── components/
│   └── ScheduleManager.tsx    # Componente principal con todos los subcomponentes
├── App.jsx                     # Punto de entrada
├── main.jsx                    # Bootstrap
├── index.css                   # Estilos globales
└── assets/                     # Recursos estáticos
```

## 🔌 Integración con Backend (Python/FastAPI)

El código está **preparado para integración con un backend en Python**. Los puntos donde se deben conectar los servicios HTTP están marcados con comentarios `TODO`.

### Endpoints Necesarios

Para reemplazar los mocks con llamadas reales, necesitarás implementar estos endpoints en tu backend:

```javascript
// EMPLOYEES
GET    /api/employees/sede/{sede}              // Obtener empleados por sede
POST   /api/employees                          // Crear nuevo empleado
PUT    /api/employees/{id}                     // Editar empleado
DELETE /api/employees/{id}                     // Eliminar empleado

// SCHEDULES
GET    /api/schedules/sede/{sede}              // Obtener horarios por sede
GET    /api/schedules/{id}                     // Obtener detalle de horario
POST   /api/schedules                          // Crear nuevo horario
PUT    /api/schedules/{id}                     // Editar horario
DELETE /api/schedules/{id}                     // Eliminar horario
```

### Ejemplo de Cómo Conectar (Reemplazar Mocks)

**Antes (Mock actual):**
```typescript
const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
```

**Después (Con backend):**
```typescript
const [employees, setEmployees] = useState<Employee[]>([]);

useEffect(() => {
  // Llamar al backend cuando carga el componente
  fetch(`/api/employees/sede/${selectedSede}`)
    .then(res => res.json())
    .then(data => setEmployees(data))
    .catch(err => console.error('Error:', err));
}, [selectedSede]);
```

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario:** Azul (#2563eb, #1d4ed8)
- **Secundario:** Verde (#16a34a)
- **Acento:** Rojo (#dc2626)
- **Neutro:** Grises (#64748b, #94a3b8)

### Componentes Principales
1. **SedeSelect** - Selector inicial de sede con cards
2. **EmployeesTab** - Gestión completa de empleados
3. **SchedulesTab** - Selector y gestión de horarios
4. **ScheduleForm** - Formulario multi-paso para crear/editar horarios
5. **ScheduleDetailView** - Vista detallada de horario seleccionado

### Responsividad
- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)

## 📝 Datos Mock Incluidos

### Empleados de Ejemplo
- Carlos García López (Mesero, Tiempo Completo) - Amagá
- María Rodríguez Sánchez (Cajero, Tiempo Completo) - Amagá
- Juan Pérez Martínez (Cocina, Medio Tiempo) - Amagá
- Ana Gómez Silva (Mesero, Extra) - Amagá
- Y más...

### Horarios de Ejemplo
- "Horario Amagá - Noviembre 2025" con 2 turnos y 5 empleados asignados

## 🔐 Validaciones Implementadas

- ✅ Al menos un día debe estar seleccionado
- ✅ Hora de apertura < Hora de cierre
- ✅ Hora inicio turno < Hora fin turno
- ✅ Al menos un empleado debe ser asignado
- ✅ Campos requeridos en formularios
- ✅ Confirmación antes de eliminar

## 🚧 Mejoras Futuras

1. **Backend Integration**
   - Conectar a FastAPI en Python
   - Implementar autenticación y autorización
   - Agregar logs y auditoría

2. **Funcionalidades Adicionales**
   - Exportar horarios a PDF
   - Notificaciones de cambios
   - Historial de modificaciones
   - Búsqueda avanzada
   - Reportes y estadísticas

3. **Optimizaciones**
   - Lazy loading de empleados/horarios
   - Caché de datos
   - Optimistic updates
   - Offline mode

4. **UX Improvements**
   - Drag & drop para asignar empleados
   - Vista de calendario visual
   - Notificaciones toast
   - Dark mode

## 📞 Soporte

Para problemas, mejoras o preguntas sobre la integración con backend, consulta la documentación de FastAPI en Python.

---

**Desarrollado con ❤️ para La Curva Del Gordo**
