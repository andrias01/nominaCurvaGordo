# 🔗 CHECKLIST DE INTEGRACIÓN CON BACKEND

## Antes de Integrar (Setup Backend)

### Python/FastAPI Setup
- [ ] Crear proyecto FastAPI
  ```bash
  mkdir backend
  cd backend
  python -m venv venv
  source venv/bin/activate  # Windows: venv\Scripts\activate
  pip install fastapi uvicorn sqlalchemy pydantic python-dotenv
  ```

- [ ] Crear estructura de carpetas
  ```
  backend/
  ├── main.py
  ├── models.py
  ├── schemas.py
  ├── database.py
  ├── crud.py
  └── requirements.txt
  ```

- [ ] Crear `requirements.txt`
  ```
  fastapi==0.104.1
  uvicorn==0.24.0
  sqlalchemy==2.0.23
  pydantic==2.5.0
  python-dotenv==1.0.0
  ```

### Database Setup
- [ ] Elegir base de datos (SQLite para dev, PostgreSQL para prod)
- [ ] Crear esquema de tablas
  - [ ] tabla_empleados
  - [ ] tabla_horarios
  - [ ] tabla_asignaciones_empleado_turno

---

## Paso 1: Implementar Endpoints en FastAPI

### Crear Modelos (schemas.py)
- [ ] EmployeeRequest
- [ ] EmployeeResponse
- [ ] ShiftRequest
- [ ] EmployeeShiftAssignmentRequest
- [ ] ScheduleRequest
- [ ] ScheduleResponse

### Crear Endpoints EMPLOYEES
- [ ] `GET /api/employees/sede/{sede}` - Listar por sede
- [ ] `GET /api/employees/{id}` - Obtener uno
- [ ] `POST /api/employees` - Crear
- [ ] `PUT /api/employees/{id}` - Actualizar
- [ ] `DELETE /api/employees/{id}` - Eliminar

### Crear Endpoints SCHEDULES
- [ ] `GET /api/schedules/sede/{sede}` - Listar por sede
- [ ] `GET /api/schedules/{id}` - Obtener uno
- [ ] `POST /api/schedules` - Crear
- [ ] `PUT /api/schedules/{id}` - Actualizar
- [ ] `DELETE /api/schedules/{id}` - Eliminar

### Configuración General
- [ ] Habilitar CORS
- [ ] Crear endpoint de health check
- [ ] Configurar variables de entorno

### Testing Backend
- [ ] Probar endpoints con Postman/Insomnia
- [ ] Verificar que devuelven datos correctos
- [ ] Probar errores (404, 400, 500)
- [ ] Verificar CORS headers

---

## Paso 2: Preparar el Frontend

### Crear Estructura de Servicios
- [ ] Crear carpeta `src/services/`
- [ ] Crear archivo `src/config/api.ts`
- [ ] Crear archivo `src/services/useEmployees.ts`
- [ ] Crear archivo `src/services/useSchedules.ts`

### Configurar Variables de Entorno
- [ ] Crear `.env.local` en la raíz del proyecto
  ```
  VITE_API_URL=http://localhost:8000
  ```

### Implementar Custom Hooks
- [ ] Copiar hooks del archivo `CUSTOM_HOOKS_EXAMPLE.tsx`
- [ ] Ajustar si es necesario
- [ ] Probar que no haya errores de TypeScript

---

## Paso 3: Reemplazar Mocks en ScheduleManager.tsx

### Cambios en Estado
```typescript
// ANTES
const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
const [schedules, setSchedules] = useState<Schedule[]>(MOCK_SCHEDULES);

// DESPUÉS
const { employees, loading, error, createEmployee, ... } = useEmployees(selectedSede);
const { schedules, loading: schLoading, error: schError, ... } = useSchedules(selectedSede);
```

### Cambios en Handlers
- [ ] `onAddEmployee` → usa `createEmployee()` del hook
- [ ] `onEditEmployee` → usa `updateEmployee()` del hook
- [ ] `onDeleteEmployee` → usa `deleteEmployee()` del hook
- [ ] `onCreateSchedule` → usa `createSchedule()` del hook
- [ ] `onUpdateSchedule` → usa `updateSchedule()` del hook
- [ ] `onDeleteSchedule` → usa `deleteSchedule()` del hook

### Agregar Loading/Error UI
- [ ] Mostrar spinner mientras `loading === true`
- [ ] Mostrar mensaje de error si `error !== null`
- [ ] Deshabilitar botones durante operaciones

### Actualizar Calls
- [ ] Remover MOCK_EMPLOYEES
- [ ] Remover MOCK_SCHEDULES
- [ ] Remover comentario TODO

---

## Paso 4: Testing Integración

### Frontend Testing
- [ ] [ ] Crear empleado → verifica en backend
- [ ] [ ] Editar empleado → verifica cambios
- [ ] [ ] Eliminar empleado → verifica en backend
- [ ] [ ] Crear horario → verifica con empleados asignados
- [ ] [ ] Editar horario → verifica cambios
- [ ] [ ] Eliminar horario → verifica en backend
- [ ] [ ] Cambiar sede → verifica que carga datos correctos
- [ ] [ ] Errores de red → muestra mensaje al usuario
- [ ] [ ] Búsqueda → funciona con datos del backend
- [ ] [ ] Filtros → funcionan con datos del backend

### Backend Testing
- [ ] [ ] Validar entrada de datos
- [ ] [ ] Rechazar datos inválidos
- [ ] [ ] Manejar errores correctamente
- [ ] [ ] Retornar status codes correctos
- [ ] [ ] CORS headers presentes

### Performance
- [ ] [ ] Datos cargan en < 2 segundos
- [ ] [ ] No hay memory leaks
- [ ] [ ] Manejo eficiente de listas grandes

---

## Paso 5: Agregar Autenticación (Opcional pero Recomendado)

### Backend
- [ ] Instalar `fastapi-jwt-extended`
- [ ] Crear endpoint `POST /api/login`
- [ ] Crear endpoint `POST /api/logout`
- [ ] Proteger endpoints con `@jwt_required()`
- [ ] Generar JWT tokens
- [ ] Verificar tokens en requests

### Frontend
- [ ] Crear hook `useAuth` para login/logout
- [ ] Almacenar token en localStorage/sessionStorage
- [ ] Enviar token en header `Authorization: Bearer {token}`
- [ ] Redirigir a login si no autenticado
- [ ] Manejar token expirado

### Token en Requests
```typescript
const response = await fetch(`${API_URL}/api/employees`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,  // ← Agregar token
  },
});
```

---

## Paso 6: Deployment

### Backend (Heroku/Railway/Replit)
- [ ] Crear cuenta en plataforma hosting
- [ ] Conectar repositorio Git
- [ ] Configurar variables de entorno
- [ ] Configurar base de datos
- [ ] Deploy
- [ ] Verificar que funciona en producción

### Frontend (Vercel/Netlify)
- [ ] Crear cuenta en plataforma hosting
- [ ] Conectar repositorio Git
- [ ] Configurar variable `VITE_API_URL` con URL de backend en prod
- [ ] Deploy
- [ ] Verificar que funciona en producción
- [ ] Probar integración completa

### HTTPS
- [ ] Activar SSL en frontend
- [ ] Activar SSL en backend
- [ ] Actualizar CORS_ORIGINS en backend con URLs en prod
- [ ] Verificar que no haya errores de "mixed content"

---

## Paso 7: Monitoreo y Mantenimiento

### Logs
- [ ] Configurar logging en backend
- [ ] Configurar error tracking (Sentry, etc.)
- [ ] Monitorear errors en producción

### Performance
- [ ] Monitorear velocidad de requests
- [ ] Optimizar queries que sean lentas
- [ ] Agregar índices a base de datos si es necesario

### Updates
- [ ] Mantener dependencias actualizadas
- [ ] Revisar cambios en API de librerías
- [ ] Plan de updates regular

---

## Checklist de Calidad de Código

### Frontend
- [ ] [ ] No hay variables no usadas
- [ ] [ ] No hay `console.log()` en producción
- [ ] [ ] TypeScript compila sin warnings
- [ ] [ ] Linter (ESLint) sin errores
- [ ] [ ] Código formateado (Prettier)

### Backend
- [ ] [ ] Código sigue PEP 8
- [ ] [ ] Docstrings en funciones
- [ ] [ ] Type hints en todas las funciones
- [ ] [ ] Tests para endpoints críticos
- [ ] [ ] Manejo de excepciones robusto

---

## Comandos Útiles

### Backend
```bash
# Desarrollo
python main.py

# Con auto-reload
uvicorn main:app --reload

# Producción
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app

# Tests
pytest

# Linting
flake8
pylint
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Format
npm run format
```

---

## Troubleshooting Común

### CORS Error
- [ ] Verificar que backend tiene `CORSMiddleware` configurado
- [ ] Verificar `allow_origins` incluye URL del frontend
- [ ] Verificar `allow_methods` incluye el método usado
- [ ] Verificar `allow_headers` incluye "Content-Type"

### 404 Not Found
- [ ] Verificar que endpoint existe en backend
- [ ] Verificar URL es correcta
- [ ] Verificar método HTTP es correcto (GET, POST, etc.)

### Token Expirado
- [ ] Implementar refresh token endpoint
- [ ] Detectar 401 en frontend
- [ ] Hacer login automáticamente
- [ ] Reintentar request original

### Base de Datos Errores
- [ ] Verificar conexión a base de datos
- [ ] Verificar credenciales
- [ ] Verificar que tablas existen
- [ ] Revisar logs de base de datos

### Performance Lento
- [ ] Agregar índices a columnas de búsqueda
- [ ] Paginar resultados en lugar de traer todo
- [ ] Usar caching (Redis)
- [ ] Optimizar queries (EXPLAIN PLAN)

---

## Links Útiles

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/quickstart.html)
- [Pydantic Docs](https://docs.pydantic.dev/latest/)
- [JWT Auth](https://fastapi-jwt-extended.readthedocs.io/)
- [Vercel Docs](https://vercel.com/docs)
- [Heroku Docs](https://devcenter.heroku.com/)

---

## Contacto y Soporte

Si tienes dudas sobre:
- **Frontend (React):** Revisar `SCHEDULE_MANAGER_README.md` y `CUSTOM_HOOKS_EXAMPLE.tsx`
- **Backend (FastAPI):** Revisar `FASTAPI_INTEGRATION_GUIDE.md`
- **General:** Revisar `ENTREGA_RESUMEN.md`

---

**✅ Cuando hayas completado este checklist, tu aplicación estará en producción.**
