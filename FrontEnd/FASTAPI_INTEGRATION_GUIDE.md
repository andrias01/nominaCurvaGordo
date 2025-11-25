# 🔧 Guía de Integración con FastAPI (Backend en Python)

Este documento proporciona instrucciones para conectar el frontend de React con un backend en Python usando FastAPI.

## 📋 Requisitos Previos

### Frontend
- Node.js 16+ instalado
- Project React + TypeScript + Tailwind configurado

### Backend
- Python 3.9+
- FastAPI
- SQLAlchemy (para ORM)
- Pydantic (para validación)

## 🏗️ Estructura Base de FastAPI

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# Habilitar CORS para comunicación con frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# MODELS
# ============================================================================

class EmployeeRequest(BaseModel):
    nombreCompleto: str
    tipoContrato: str  # 'tiempo_completo', 'medio_tiempo', 'extra'
    rol: str
    activo: bool = True
    sede: str

class EmployeeResponse(EmployeeRequest):
    id: str

class ShiftRequest(BaseModel):
    numero: int
    horaInicio: str
    horaFin: str

class EmployeeShiftAssignmentRequest(BaseModel):
    employeeId: str
    tipoJornada: str
    turno: Optional[int] = None

class ScheduleRequest(BaseModel):
    nombre: str
    sede: str
    diasTrabajo: List[str]
    horaApertura: str
    horaCierre: str
    turnos: List[ShiftRequest]
    mes: int
    anio: int
    empleadosAsignados: List[EmployeeShiftAssignmentRequest]

class ScheduleResponse(ScheduleRequest):
    id: str
    createdAt: str

# ============================================================================
# EMPLOYEES ENDPOINTS
# ============================================================================

# Base de datos simulada (reemplazar con base de datos real)
employees_db: Dict[str, EmployeeResponse] = {}

@app.get("/api/employees/sede/{sede}", response_model=List[EmployeeResponse])
async def get_employees_by_sede(sede: str):
    """Obtener todos los empleados de una sede"""
    return [emp for emp in employees_db.values() if emp.sede == sede]

@app.get("/api/employees/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    """Obtener un empleado específico"""
    if employee_id not in employees_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return employees_db[employee_id]

@app.post("/api/employees", response_model=EmployeeResponse)
async def create_employee(employee: EmployeeRequest):
    """Crear nuevo empleado"""
    emp_id = str(uuid.uuid4())
    emp = EmployeeResponse(id=emp_id, **employee.dict())
    employees_db[emp_id] = emp
    return emp

@app.put("/api/employees/{employee_id}", response_model=EmployeeResponse)
async def update_employee(employee_id: str, employee: EmployeeRequest):
    """Editar empleado existente"""
    if employee_id not in employees_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    emp = EmployeeResponse(id=employee_id, **employee.dict())
    employees_db[employee_id] = emp
    return emp

@app.delete("/api/employees/{employee_id}")
async def delete_employee(employee_id: str):
    """Eliminar empleado"""
    if employee_id not in employees_db:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    del employees_db[employee_id]
    return {"message": "Empleado eliminado"}

# ============================================================================
# SCHEDULES ENDPOINTS
# ============================================================================

schedules_db: Dict[str, ScheduleResponse] = {}

@app.get("/api/schedules/sede/{sede}", response_model=List[ScheduleResponse])
async def get_schedules_by_sede(sede: str):
    """Obtener todos los horarios de una sede"""
    return [sch for sch in schedules_db.values() if sch.sede == sede]

@app.get("/api/schedules/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(schedule_id: str):
    """Obtener un horario específico"""
    if schedule_id not in schedules_db:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return schedules_db[schedule_id]

@app.post("/api/schedules", response_model=ScheduleResponse)
async def create_schedule(schedule: ScheduleRequest):
    """Crear nuevo horario"""
    sch_id = str(uuid.uuid4())
    created_at = datetime.datetime.now().isoformat()
    sch = ScheduleResponse(
        id=sch_id,
        createdAt=created_at,
        **schedule.dict()
    )
    schedules_db[sch_id] = sch
    return sch

@app.put("/api/schedules/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(schedule_id: str, schedule: ScheduleRequest):
    """Editar horario existente"""
    if schedule_id not in schedules_db:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    existing = schedules_db[schedule_id]
    sch = ScheduleResponse(
        id=schedule_id,
        createdAt=existing.createdAt,
        **schedule.dict()
    )
    schedules_db[schedule_id] = sch
    return sch

@app.delete("/api/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str):
    """Eliminar horario"""
    if schedule_id not in schedules_db:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    del schedules_db[schedule_id]
    return {"message": "Horario eliminado"}

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/api/health")
async def health_check():
    """Verificar que el servidor está funcionando"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 🔗 Integración en React

### 1. Crear un archivo de configuración

```typescript
// src/config/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Employees
  EMPLOYEES_BY_SEDE: (sede: string) => `${API_BASE_URL}/api/employees/sede/${sede}`,
  EMPLOYEE: (id: string) => `${API_BASE_URL}/api/employees/${id}`,
  EMPLOYEES: `${API_BASE_URL}/api/employees`,
  
  // Schedules
  SCHEDULES_BY_SEDE: (sede: string) => `${API_BASE_URL}/api/schedules/sede/${sede}`,
  SCHEDULE: (id: string) => `${API_BASE_URL}/api/schedules/${id}`,
  SCHEDULES: `${API_BASE_URL}/api/schedules`,
  
  // Health
  HEALTH: `${API_BASE_URL}/api/health`,
};
```

### 2. Crear servicios (hooks personalizados)

```typescript
// src/services/useEmployees.ts
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export const useEmployees = (sede: string) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.EMPLOYEES_BY_SEDE(sede));
        if (!response.ok) throw new Error('Error al obtener empleados');
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [sede]);

  const createEmployee = async (employee: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.EMPLOYEES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      if (!response.ok) throw new Error('Error al crear empleado');
      const data = await response.json();
      setEmployees([...employees, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  const updateEmployee = async (id: string, employee: any) => {
    try {
      const response = await fetch(API_ENDPOINTS.EMPLOYEE(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      if (!response.ok) throw new Error('Error al actualizar empleado');
      const data = await response.json();
      setEmployees(employees.map(e => e.id === id ? data : e));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.EMPLOYEE(id), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar empleado');
      setEmployees(employees.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    }
  };

  return { employees, loading, error, createEmployee, updateEmployee, deleteEmployee };
};
```

### 3. Variables de entorno

```env
# .env.local
VITE_API_URL=http://localhost:8000
```

### 4. Reemplazar mocks en ScheduleManager.tsx

**Antes:**
```typescript
const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);
```

**Después:**
```typescript
import { useEmployees } from '../services/useEmployees';
import { useSchedules } from '../services/useSchedules';

const ScheduleManager: React.FC = () => {
  const [selectedSede, setSelectedSede] = useState<string | null>(null);
  const { employees, createEmployee, updateEmployee, deleteEmployee } = 
    useEmployees(selectedSede || '');
  const { schedules, createSchedule, updateSchedule, deleteSchedule } = 
    useSchedules(selectedSede || '');

  // ... resto del código
};
```

## 🚀 Ejecución

### Terminal 1 - Backend
```bash
cd backend
python -m pip install fastapi uvicorn sqlalchemy pydantic
python main.py
```

Accesible en: `http://localhost:8000`
Docs interactivos: `http://localhost:8000/docs`

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

Accesible en: `http://localhost:5173`

## 🔒 Consideraciones de Seguridad

```python
# Agregar autenticación con JWT
from fastapi_jwt_extended import JWTManager, create_access_token, jwt_required

jwt = JWTManager(app)

@app.post("/api/login")
async def login(username: str, password: str):
    # Validar credenciales
    access_token = create_access_token(identity=username)
    return {"access_token": access_token}

@app.get("/api/employees", dependencies=[Depends(jwt_required())])
async def get_employees():
    # Solo usuarios autenticados
    pass
```

## 📊 Base de Datos (Ejemplo con SQLAlchemy)

```python
from sqlalchemy import create_engine, Column, String, Integer, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./schedules.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class EmployeeDB(Base):
    __tablename__ = "employees"
    
    id = Column(String, primary_key=True)
    nombreCompleto = Column(String)
    tipoContrato = Column(String)
    rol = Column(String)
    activo = Column(Boolean, default=True)
    sede = Column(String)
    createdAt = Column(DateTime)

class ScheduleDB(Base):
    __tablename__ = "schedules"
    
    id = Column(String, primary_key=True)
    nombre = Column(String)
    sede = Column(String)
    mes = Column(Integer)
    anio = Column(Integer)
    # ... más campos
    createdAt = Column(DateTime)

Base.metadata.create_all(bind=engine)
```

## 🧪 Testing

### Frontend (Vitest)
```bash
npm install vitest @testing-library/react
npm run test
```

### Backend (Pytest)
```bash
pip install pytest pytest-asyncio
pytest
```

## 📝 Notas Finales

- Siempre usar HTTPS en producción
- Validar datos tanto en frontend como en backend
- Implementar rate limiting
- Usar variables de entorno para configuración sensible
- Mantener logs detallados para auditoría

---

Para más información, consulta:
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
