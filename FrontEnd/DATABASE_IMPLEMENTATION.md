# 🗄️ EJEMPLO: IMPLEMENTACIÓN CON BASE DE DATOS EN FASTAPI

Este archivo muestra cómo implementar la base de datos para los endpoints.
Adaptable a SQLite (desarrollo) o PostgreSQL (producción).

---

## 📦 INSTALACIÓN

```bash
pip install sqlalchemy alembic psycopg2-binary python-dotenv
```

---

## 📋 ESTRUCTURA DE CARPETAS

```
backend/
├── main.py              # Punto de entrada
├── database.py          # Configuración de BD
├── models.py            # Modelos SQLAlchemy
├── schemas.py           # Schemas Pydantic
├── crud.py              # Operaciones CRUD
├── requirements.txt
└── .env                 # Variables de entorno
```

---

## 🔧 database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Configurar base de datos
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./schedules.db"  # Por defecto SQLite para desarrollo
)

# Para PostgreSQL (producción):
# DATABASE_URL = "postgresql://user:password@localhost:5432/schedules"

# Crear engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)

# Crear SessionLocal
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear Base para los modelos
Base = declarative_base()

def get_db():
    """Dependencia para obtener sesión de BD en endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Crear tablas
def init_db():
    """Crear todas las tablas"""
    Base.metadata.create_all(bind=engine)
```

---

## 📊 models.py

```python
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from datetime import datetime
import uuid

# Tabla de asociación para muchos-a-muchos
employee_schedule_association = Table(
    'employee_schedule',
    Base.metadata,
    Column('employee_id', String, ForeignKey('employees.id'), primary_key=True),
    Column('schedule_id', String, ForeignKey('schedules.id'), primary_key=True),
    Column('tipo_jornada', String),
    Column('turno', Integer, nullable=True),
)

class EmployeeDB(Base):
    """Modelo de empleado en base de datos"""
    __tablename__ = "employees"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nombreCompleto = Column(String, index=True)
    tipoContrato = Column(String)  # 'tiempo_completo', 'medio_tiempo', 'extra'
    rol = Column(String)
    activo = Column(Boolean, default=True)
    sede = Column(String, index=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relación con Schedule
    schedules = relationship(
        "ScheduleDB",
        secondary=employee_schedule_association,
        back_populates="employees"
    )

class ShiftDB(Base):
    """Modelo de turno en base de datos"""
    __tablename__ = "shifts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    schedule_id = Column(String, ForeignKey('schedules.id'))
    numero = Column(Integer)
    horaInicio = Column(String)
    horaFin = Column(String)
    
    schedule = relationship("ScheduleDB", back_populates="turnos")

class ScheduleDB(Base):
    """Modelo de horario en base de datos"""
    __tablename__ = "schedules"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nombre = Column(String, index=True)
    sede = Column(String, index=True)
    diasTrabajo = Column(String)  # JSON string: '["lunes","martes",...]'
    horaApertura = Column(String)
    horaCierre = Column(String)
    mes = Column(Integer)
    anio = Column(Integer)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    turnos = relationship("ShiftDB", back_populates="schedule", cascade="all, delete-orphan")
    employees = relationship(
        "EmployeeDB",
        secondary=employee_schedule_association,
        back_populates="schedules"
    )
```

---

## 📝 schemas.py

```python
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ShiftRequest(BaseModel):
    numero: int
    horaInicio: str
    horaFin: str

class ShiftResponse(ShiftRequest):
    pass

class EmployeeShiftAssignmentRequest(BaseModel):
    employeeId: str
    tipoJornada: str
    turno: Optional[int] = None

class EmployeeRequest(BaseModel):
    nombreCompleto: str
    tipoContrato: str
    rol: str
    activo: bool = True
    sede: str

class EmployeeResponse(EmployeeRequest):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True  # Antes: orm_mode = True

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
    createdAt: datetime

    class Config:
        from_attributes = True
```

---

## 🎯 crud.py

```python
from sqlalchemy.orm import Session
from models import EmployeeDB, ScheduleDB, ShiftDB, employee_schedule_association
from schemas import EmployeeRequest, ScheduleRequest, ShiftRequest
import json

# ============================================================================
# EMPLOYEES
# ============================================================================

def get_employees_by_sede(db: Session, sede: str):
    """Obtener todos los empleados de una sede"""
    return db.query(EmployeeDB).filter(EmployeeDB.sede == sede).all()

def get_employee(db: Session, employee_id: str):
    """Obtener un empleado específico"""
    return db.query(EmployeeDB).filter(EmployeeDB.id == employee_id).first()

def create_employee(db: Session, employee: EmployeeRequest):
    """Crear nuevo empleado"""
    db_employee = EmployeeDB(
        nombreCompleto=employee.nombreCompleto,
        tipoContrato=employee.tipoContrato,
        rol=employee.rol,
        activo=employee.activo,
        sede=employee.sede,
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def update_employee(db: Session, employee_id: str, employee: EmployeeRequest):
    """Actualizar empleado existente"""
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        return None
    
    db_employee.nombreCompleto = employee.nombreCompleto
    db_employee.tipoContrato = employee.tipoContrato
    db_employee.rol = employee.rol
    db_employee.activo = employee.activo
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

def delete_employee(db: Session, employee_id: str):
    """Eliminar empleado"""
    db_employee = get_employee(db, employee_id)
    if not db_employee:
        return False
    
    db.delete(db_employee)
    db.commit()
    return True

# ============================================================================
# SCHEDULES
# ============================================================================

def get_schedules_by_sede(db: Session, sede: str):
    """Obtener todos los horarios de una sede"""
    return db.query(ScheduleDB).filter(ScheduleDB.sede == sede).all()

def get_schedule(db: Session, schedule_id: str):
    """Obtener un horario específico"""
    return db.query(ScheduleDB).filter(ScheduleDB.id == schedule_id).first()

def create_schedule(db: Session, schedule: ScheduleRequest):
    """Crear nuevo horario"""
    # Crear horario principal
    db_schedule = ScheduleDB(
        nombre=schedule.nombre,
        sede=schedule.sede,
        diasTrabajo=json.dumps(schedule.diasTrabajo),
        horaApertura=schedule.horaApertura,
        horaCierre=schedule.horaCierre,
        mes=schedule.mes,
        anio=schedule.anio,
    )
    db.add(db_schedule)
    db.flush()  # Obtener ID antes de agregar relaciones
    
    # Crear turnos
    for turno in schedule.turnos:
        db_shift = ShiftDB(
            schedule_id=db_schedule.id,
            numero=turno.numero,
            horaInicio=turno.horaInicio,
            horaFin=turno.horaFin,
        )
        db.add(db_shift)
    
    # Asignar empleados
    for assignment in schedule.empleadosAsignados:
        employee = db.query(EmployeeDB).filter(
            EmployeeDB.id == assignment.employeeId
        ).first()
        
        if employee:
            # Insertar en tabla de asociación con tipo_jornada y turno
            stmt = employee_schedule_association.insert().values(
                employee_id=employee.id,
                schedule_id=db_schedule.id,
                tipo_jornada=assignment.tipoJornada,
                turno=assignment.turno,
            )
            db.execute(stmt)
    
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def update_schedule(db: Session, schedule_id: str, schedule: ScheduleRequest):
    """Actualizar horario existente"""
    db_schedule = get_schedule(db, schedule_id)
    if not db_schedule:
        return None
    
    db_schedule.nombre = schedule.nombre
    db_schedule.diasTrabajo = json.dumps(schedule.diasTrabajo)
    db_schedule.horaApertura = schedule.horaApertura
    db_schedule.horaCierre = schedule.horaCierre
    db_schedule.mes = schedule.mes
    db_schedule.anio = schedule.anio
    
    # Eliminar turnos antiguos y crear nuevos
    db.query(ShiftDB).filter(ShiftDB.schedule_id == schedule_id).delete()
    for turno in schedule.turnos:
        db_shift = ShiftDB(
            schedule_id=schedule_id,
            numero=turno.numero,
            horaInicio=turno.horaInicio,
            horaFin=turno.horaFin,
        )
        db.add(db_shift)
    
    # Actualizar asignaciones
    db.execute(
        employee_schedule_association.delete().where(
            employee_schedule_association.c.schedule_id == schedule_id
        )
    )
    
    for assignment in schedule.empleadosAsignados:
        employee = db.query(EmployeeDB).filter(
            EmployeeDB.id == assignment.employeeId
        ).first()
        
        if employee:
            stmt = employee_schedule_association.insert().values(
                employee_id=employee.id,
                schedule_id=schedule_id,
                tipo_jornada=assignment.tipoJornada,
                turno=assignment.turno,
            )
            db.execute(stmt)
    
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def delete_schedule(db: Session, schedule_id: str):
    """Eliminar horario"""
    db_schedule = get_schedule(db, schedule_id)
    if not db_schedule:
        return False
    
    db.delete(db_schedule)
    db.commit()
    return True
```

---

## 🚀 main.py (Integración Completa)

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, init_db
from schemas import (
    EmployeeRequest, EmployeeResponse,
    ScheduleRequest, ScheduleResponse
)
import crud

# Inicializar FastAPI
app = FastAPI(title="La Curva Del Gordo - Schedule Manager")

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear tablas al iniciar
@app.on_event("startup")
def startup():
    init_db()

# ============================================================================
# EMPLOYEES ENDPOINTS
# ============================================================================

@app.get("/api/employees/sede/{sede}", response_model=list[EmployeeResponse])
def get_employees_by_sede(sede: str, db: Session = Depends(get_db)):
    """Obtener empleados por sede"""
    employees = crud.get_employees_by_sede(db, sede)
    return employees

@app.get("/api/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    """Obtener un empleado"""
    employee = crud.get_employee(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return employee

@app.post("/api/employees", response_model=EmployeeResponse)
def create_employee(employee: EmployeeRequest, db: Session = Depends(get_db)):
    """Crear nuevo empleado"""
    return crud.create_employee(db, employee)

@app.put("/api/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: str, employee: EmployeeRequest, db: Session = Depends(get_db)):
    """Actualizar empleado"""
    result = crud.update_employee(db, employee_id, employee)
    if not result:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return result

@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """Eliminar empleado"""
    if not crud.delete_employee(db, employee_id):
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return {"message": "Empleado eliminado"}

# ============================================================================
# SCHEDULES ENDPOINTS
# ============================================================================

@app.get("/api/schedules/sede/{sede}", response_model=list[ScheduleResponse])
def get_schedules_by_sede(sede: str, db: Session = Depends(get_db)):
    """Obtener horarios por sede"""
    schedules = crud.get_schedules_by_sede(db, sede)
    return schedules

@app.get("/api/schedules/{schedule_id}", response_model=ScheduleResponse)
def get_schedule(schedule_id: str, db: Session = Depends(get_db)):
    """Obtener un horario"""
    schedule = crud.get_schedule(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return schedule

@app.post("/api/schedules", response_model=ScheduleResponse)
def create_schedule(schedule: ScheduleRequest, db: Session = Depends(get_db)):
    """Crear nuevo horario"""
    return crud.create_schedule(db, schedule)

@app.put("/api/schedules/{schedule_id}", response_model=ScheduleResponse)
def update_schedule(schedule_id: str, schedule: ScheduleRequest, db: Session = Depends(get_db)):
    """Actualizar horario"""
    result = crud.update_schedule(db, schedule_id, schedule)
    if not result:
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return result

@app.delete("/api/schedules/{schedule_id}")
def delete_schedule(schedule_id: str, db: Session = Depends(get_db)):
    """Eliminar horario"""
    if not crud.delete_schedule(db, schedule_id):
        raise HTTPException(status_code=404, detail="Horario no encontrado")
    return {"message": "Horario eliminado"}

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/api/health")
def health_check():
    """Verificar que el servidor está vivo"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 📝 .env

```env
# Base de datos - Desarrollo (SQLite)
DATABASE_URL=sqlite:///./schedules.db

# Para Producción (PostgreSQL)
# DATABASE_URL=postgresql://user:password@localhost:5432/schedules

# FastAPI
API_TITLE=La Curva Del Gordo
DEBUG=True
```

---

## 🚀 EJECUCIÓN

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Ejecutar servidor
uvicorn main:app --reload

# 3. Ver documentación interactiva
# http://localhost:8000/docs
# http://localhost:8000/redoc

# 4. Probar endpoints
curl http://localhost:8000/api/health
```

---

## 📊 CAMBIO A POSTGRESQL (PRODUCCIÓN)

1. Instalar PostgreSQL
2. Crear base de datos:
   ```sql
   CREATE DATABASE schedules_db;
   ```
3. Instalar driver:
   ```bash
   pip install psycopg2-binary
   ```
4. Actualizar .env:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/schedules_db
   ```

---

**¡Listo! Base de datos funcional e integrada con FastAPI.**
