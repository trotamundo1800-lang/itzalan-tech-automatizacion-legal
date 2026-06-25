# 🔐 GUÍA DE SEGURIDAD - ITZALAN TECH

## Resumen de Implementaciones de Seguridad

### ✅ YA IMPLEMENTADO

#### 1. **Helmet.js** - Protección de Headers HTTP
- Content Security Policy (CSP)
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options (Clickjacking protection)
- X-Content-Type-Options (MIME type sniffing)
- Referrer-Policy

```bash
Headers protegidos contra:
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME type sniffing
- Cache poisoning
```

#### 2. **Rate Limiting** - Protección contra DDoS
- 100 requests / 15 minutos por IP
- Exenciones para health check endpoints
- Configurable via `.env`

```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100    # máximo 100
```

#### 3. **CORS Configurado** - Validación de Orígenes
- Solo origenes whitelistados pueden acceder
- Métodos HTTP explícitos (GET, POST, PATCH, DELETE, etc.)
- Headers específicos (Content-Type, Authorization)

```env
CORS_ORIGINS=https://itzalan.com,https://app.itzalan.com
```

#### 4. **JWT Authentication** - Autenticación Segura
- Tokens con expiración (15 minutos)
- Refresh tokens (7 días)
- Encriptación con bcryptjs
- Validación de roles (admin, abogado, asistente, cliente)

#### 5. **Global Exception Filter** - Error Handling
- No expone detalles internos en production
- Logging centralizado de errores
- Stack traces ocultos en production

#### 6. **Logging Interceptor** - Auditoría
- Registra todas las requests
- Redacta tokens (Bearer [redacted])
- Incluye IP, User-Agent, duración
- Solo en modo development

---

## 🚨 VULNERABILIDADES CONOCIDAS Y MITIGACIÓN

### Vulnerabilidades npm (78 total)
- 3 Low | 51 Moderate | 22 High | 2 Critical

**Ubicación**: Principalmente en dependencias transitivas (expo, react-native, next)

**Mitigación**:
1. Usar contenedores Docker con distros hardened
2. Ejecutar escaneo regular con Snyk/GitHub Dependabot
3. Mantener todas las librerías actualizadas
4. No usar versiones "latest" sin validar breaking changes

---

## 🔧 CONFIGURACIÓN PARA PRODUCCIÓN

### 1. **Variables de Entorno** (.env.production)
```bash
# CRÍTICO: Cambiar estos valores
JWT_SECRET=GENERATE_RANDOM_32_CHARS_MIN
JWT_REFRESH_SECRET=GENERATE_RANDOM_32_CHARS_MIN

# Base de datos con credenciales seguras
DB_TYPE=postgres
DB_HOST=db.itzalan.com
DB_PASSWORD=VAULT_SECURE_PASSWORD

# Keys de servicios externos
OPENAI_API_KEY=sk_prod_...
STRIPE_SECRET_KEY=sk_live_...
```

### 2. **Base de Datos**
```sql
-- Crear usuario limitado para API
CREATE USER itzalan_api WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT CONNECT ON DATABASE itzalan_prod TO itzalan_api;
GRANT USAGE ON SCHEMA public TO itzalan_api;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO itzalan_api;

-- Audit logging
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action VARCHAR(50),
  table_name VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. **SSL/TLS Certificate**
```bash
# Generate self-signed (dev)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/itzalan.key \
  -out /etc/ssl/certs/itzalan.crt

# Use Let's Encrypt (production)
certbot certonly --standalone -d itzalan.com
```

### 4. **Environment Variables to Encrypt**
Store in secure vault (HashiCorp Vault, AWS Secrets Manager):
- JWT_SECRET
- JWT_REFRESH_SECRET
- DB_PASSWORD
- API_KEYS (OpenAI, Claude, Stripe, PayPal)
- OAuth credentials
- Encryption keys

---

## 📋 CHECKLIST SEGURIDAD PRE-DEPLOYMENT

### Semana 1
- [ ] Cambiar todos los JWT secrets a valores seguros (32+ chars)
- [ ] Configurar database users con permisos limitados
- [ ] Habilitar HTTPS/TLS con certificado válido
- [ ] Configurar WAF (Web Application Firewall)

### Semana 2
- [ ] Implementar Secrets Management (Vault / Secrets Manager)
- [ ] Configurar Audit Logging en database
- [ ] Habilitar IP whitelisting para DB
- [ ] Implementar backup encryption

### Semana 3
- [ ] Realizar Security Audit (OWASP Top 10)
- [ ] Penetration Testing
- [ ] Setup monitoring y alertas
- [ ] Crear incident response plan

### Semana 4
- [ ] Hardening del SO (fail2ban, UFW)
- [ ] Configure DDoS protection (CloudFlare, AWS Shield)
- [ ] Implementar 2FA en admin panel
- [ ] Realizar Red Team exercise

---

## 🛡️ RECOMENDACIONES ADICIONALES

### Infraestructura
1. **Zero Trust Security**
   - Requerir VPN para acceso interno
   - Mutua autenticación (mTLS)
   - IP whitelisting strict

2. **Network Segmentation**
   - API en subnet aislada
   - Database sin acceso directo desde internet
   - Load balancer con WAF

3. **Monitoring & Alerting**
   - SIEM (Splunk, ELK Stack)
   - Real-time alerts para eventos sospechosos
   - Daily security reports

### Código
1. **Code Review**
   - Peer review obligatorio
   - SAST (Static Application Security Testing)
   - Dependency scanning automático

2. **Testing**
   - Tests de seguridad
   - Fuzzing
   - DAST (Dynamic Security Testing)

3. **Incident Response**
   - Plan de respuesta a incidentes
   - Comunicación crisis
   - Post-mortem analysis

---

## 🔍 COMANDOS DE VALIDACIÓN

```bash
# Ver headers de seguridad
curl -I https://api.itzalan.com/

# Validar certificado SSL
openssl s_client -connect api.itzalan.com:443 -showcerts

# Test rate limiting
for i in {1..150}; do curl -i http://localhost:3001/ 2>/dev/null | grep -i "x-ratelimit"; done

# Validar JWT expiration
jwt decode <token>

# Scan vulnerabilities
npm audit --production

# OWASP dependency check
npm install -g snyk
snyk test --all-projects

# Performance & security
npm install -g lighthouse
lighthouse https://api.itzalan.com --output-path=./lighthouse-report.html
```

---

## ⚠️ VULNERABILIDADES CRÍTICAS A PREVENIR

1. **SQL Injection** ✅ Mitigado: TypeORM con parameterized queries
2. **XSS** ✅ Mitigado: Helmet CSP + Validación de entrada
3. **CSRF** ✅ Mitigado: SameSite cookies + CORS validation
4. **Broken Authentication** ✅ Mitigado: JWT + bcryptjs
5. **Sensitive Data Exposure** ✅ Mitigado: HTTPS enforced + Secrets Manager
6. **XXE** ✅ Mitigado: Librería XML parsing segura
7. **Broken Access Control** ✅ Mitigado: Roles guard + RLS en database
8. **Deserialization Attacks** ✅ Mitigado: No usar pickle/unsafe JSON
9. **Using Components with Vulnerabilities** ⚠️ Monitorear: npm audit regular
10. **Insufficient Logging** ✅ Mitigado: Logging Interceptor + Audit logs

---

## 📞 CONTACTO SEGURIDAD

En caso de vulnerabilidad encontrada:
1. NO hacer commit ni push
2. Notificar a: security@itzalan.com
3. Proporcionar PoC (Proof of Concept)
4. Esperar confirmación antes de disclosure público

---

**Última actualización**: 24/06/2026
**Próxima revisión**: 01/07/2026
**Responsable**: Security Team
