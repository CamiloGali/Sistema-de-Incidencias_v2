const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserExe = fs.existsSync(edgePath) ? edgePath : chromePath;

const projectDir = path.resolve(__dirname);
const outputPdfPath = path.join(projectDir, 'MANUAL_DE_USUARIO.pdf');
const tempHtmlPath = path.join(projectDir, 'manual_imprimible.html');
const tempUserDataDir = path.join(projectDir, '.temp_pdf_profile');

if (!fs.existsSync(tempUserDataDir)) {
  fs.mkdirSync(tempUserDataDir, { recursive: true });
}

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Manual de Usuario - Sistema de Gestión y Control de Incidencias ESTi</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0;
    }
    
    *, *::before, *::after {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .page {
      width: 215.9mm;
      height: 279.4mm;
      max-height: 279.4mm;
      padding: 14mm 16mm 14mm 16mm;
      position: relative;
      page-break-after: always;
      page-break-inside: avoid;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
    }

    /* PORTADA FULL BLEED */
    .page.cover-page {
      padding: 0;
      background: linear-gradient(135deg, #38040b 0%, #630c18 45%, #8c1625 80%, #5a0a15 100%);
      color: #ffffff;
      justify-content: space-between;
    }

    .cover-header {
      padding: 22mm 20mm 0 20mm;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .cover-logo-box {
      width: 68px;
      height: 68px;
      background: rgba(255, 255, 255, 0.12);
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    }

    .cover-inst-text h3 {
      margin: 0;
      font-size: 15px;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 800;
      color: #fbe6e8;
    }

    .cover-inst-text p {
      margin: 3px 0 0 0;
      font-size: 11px;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 500;
    }

    .cover-body {
      padding: 0 20mm;
      margin-top: -15mm;
    }

    .cover-badge-doc {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #ffffff;
      margin-bottom: 14px;
    }

    .cover-title {
      font-size: 38px;
      font-weight: 900;
      line-height: 1.1;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
      color: #ffffff;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .cover-subtitle {
      font-size: 20px;
      font-weight: 600;
      color: #fbe6e8;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }

    .cover-desc {
      font-size: 12.5px;
      line-height: 1.55;
      color: rgba(255, 255, 255, 0.9);
      max-width: 90%;
      border-left: 3px solid rgba(255,255,255,0.4);
      padding-left: 12px;
      margin: 0 0 20px 0;
    }

    .cover-pill-tags {
      display: flex;
      gap: 10px;
    }

    .cover-pill {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.25);
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #fce7e9;
    }

    .cover-footer {
      background: rgba(15, 23, 42, 0.85);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding: 14mm 20mm 16mm 20mm;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }

    .cover-meta-item .label {
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #cbd5e1;
      font-weight: 600;
      margin-bottom: 3px;
    }

    .cover-meta-item .val {
      font-size: 11.5px;
      color: #ffffff;
      font-weight: 700;
      line-height: 1.25;
    }

    /* HEADER & FOOTER EN PÁGINAS INTERIORES */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #8c1625;
      padding-bottom: 7px;
      margin-bottom: 12px;
    }

    .page-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-logo {
      width: 20px;
      height: 20px;
    }

    .header-title-text {
      font-size: 10.5px;
      font-weight: 700;
      color: #8c1625;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .header-subtitle-text {
      font-size: 10px;
      color: #64748b;
      font-weight: 600;
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      margin-top: 10px;
      font-size: 9.5px;
      color: #64748b;
    }

    .page-footer strong {
      color: #8c1625;
    }

    .page-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* TIPOGRAFÍA */
    h1.sec-title {
      font-size: 17.5px;
      font-weight: 800;
      color: #8c1625;
      margin: 0 0 6px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 4px solid #8c1625;
      padding-left: 8px;
      letter-spacing: -0.2px;
    }

    h2.sub-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      margin: 4px 0 3px 0;
    }

    p, li {
      font-size: 11px;
      line-height: 1.5;
      color: #334155;
      margin: 0 0 5px 0;
    }

    ul, ol {
      margin: 0 0 6px 0;
      padding-left: 18px;
    }

    li {
      margin-bottom: 3px;
    }

    /* BADGES */
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-burgundy { background: #fdf2f4; color: #8c1625; border: 1px solid #f7c2c7; }
    .badge-green { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .badge-amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
    .badge-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-purple { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
    .badge-gray { background: #f8fafc; color: #475569; border: 1px solid #cbd5e1; }

    /* CONTENEDORES Y TARJETAS */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .card-highlight {
      background: #fdf2f4;
      border: 1px solid #f7c2c7;
      border-radius: 8px;
      padding: 10px 12px;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .grid-5 {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
    }

    /* TABLAS */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin: 4px 0 6px 0;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }

    table.data-table th {
      background: #8c1625;
      color: #ffffff;
      text-align: left;
      padding: 6px 9px;
      font-weight: 700;
      font-size: 10px;
      letter-spacing: 0.3px;
    }

    table.data-table td {
      padding: 6px 9px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
      line-height: 1.35;
    }

    table.data-table tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* LLAMADAS Y ALERTAS */
    .callout {
      border-left: 4px solid #8c1625;
      background: #fff5f6;
      padding: 8px 12px;
      border-radius: 0 6px 6px 0;
      margin: 4px 0;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .callout-icon {
      font-size: 14px;
      line-height: 1;
      margin-top: 2px;
    }

    .callout-content {
      font-size: 10.5px;
      line-height: 1.45;
      color: #5a0a15;
    }

    .callout-content strong {
      color: #8c1625;
    }

    /* DIAGRAMAS */
    .diagram-container {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 4px 0;
    }

    /* TARJETAS DE KPIS */
    .kpi-mini-card {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 8px;
      background: #ffffff;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }
    .kpi-mini-card .val {
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .kpi-mini-card .lbl {
      font-size: 8.5px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- ==================== PÁGINA 1: PORTADA ==================== -->
  <section class="page cover-page">
    <div class="cover-header">
      <div class="cover-logo-box">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="46" height="46">
          <path d="M256 82 392 132v112c0 98-58 154-136 186-78-32-136-88-136-186V132L256 82Z" fill="#ffffff"/>
          <path d="M256 148v154M179 225h154" stroke="#8c1625" stroke-width="38" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="cover-inst-text">
        <h3>Escuela Superior de Tizayuca</h3>
        <p>COORDINACIÓN DE INFRAESTRUCTURA Y SISTEMAS &bull; ESTi</p>
      </div>
    </div>

    <div class="cover-body">
      <span class="cover-badge-doc">Documento Técnico Oficial</span>
      <h1 class="cover-title">MANUAL DE USUARIO</h1>
      <h2 class="cover-subtitle">Sistema de Gestión y Control de Incidencias</h2>
      <p class="cover-desc">
        Guía integral de operación, captura pública de anomalías, seguimiento en tiempo real, justificación técnica de pendientes, emisión de alertas prioritarias y control administrativo por módulos para personal escolar y operativo.
      </p>
      <div class="cover-pill-tags">
        <span class="cover-pill">Versión 2.0</span>
        <span class="cover-pill">Edición 2026</span>
        <span class="cover-pill">Módulos 1 al 5 y Laboratorios</span>
        <span class="cover-pill">Acceso Multi-Rol</span>
      </div>
    </div>

    <div class="cover-footer">
      <div class="cover-meta-item">
        <div class="label">Desarrollador</div>
        <div class="val">Daniel Camilo García Galicia</div>
      </div>
      <div class="cover-meta-item">
        <div class="label">Carrera / Programa</div>
        <div class="val">Lic. en Tecnologías de la Información</div>
      </div>
      <div class="cover-meta-item">
        <div class="label">Institución</div>
        <div class="val">ESTi</div>
      </div>
      <div class="cover-meta-item">
        <div class="label">Control Técnico</div>
        <div class="val">MNL-ESTI-INC-v2.0</div>
      </div>
    </div>
  </section>

  <!-- ==================== PÁGINA 2: FICHA TÉCNICA E ÍNDICE ==================== -->
  <section class="page">
    <div class="page-header">
      <div class="page-header-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="header-logo">
          <rect width="512" height="512" rx="96" fill="#8c1625"/>
          <path d="M256 82 392 132v112c0 98-58 154-136 186-78-32-136-88-136-186V132L256 82Z" fill="#fff"/>
        </svg>
        <span class="header-title-text">Sistema de Gestión de Incidencias &bull; ESTi</span>
      </div>
      <span class="header-subtitle-text">Control Documental e Índice General</span>
    </div>

    <div class="page-content">
      <h1 class="sec-title">Ficha Técnica y Control Documental</h1>
      
      <div class="card" style="padding: 10px 14px;">
        <table style="width: 100%; font-size: 10.5px; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; width: 25%; font-weight: 700; color: #8c1625;">Nombre del Proyecto:</td>
            <td style="padding: 4px 0; width: 40%; color: #1e293b;">Sistema de Gestión y Control de Incidencias (ESTi)</td>
            <td style="padding: 4px 0; width: 15%; font-weight: 700; color: #8c1625;">Versión:</td>
            <td style="padding: 4px 0; width: 20%; color: #1e293b;">2.0 (Revisión Final)</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 700; color: #8c1625;">Autor / Desarrollador:</td>
            <td style="padding: 4px 0; color: #1e293b;">Daniel Camilo García Galicia</td>
            <td style="padding: 4px 0; font-weight: 700; color: #8c1625;">Fecha:</td>
            <td style="padding: 4px 0; color: #1e293b;">Octubre 2026</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 700; color: #8c1625;">Carrera:</td>
            <td style="padding: 4px 0; color: #1e293b;">Licenciatura en Tecnologías de la Información</td>
            <td style="padding: 4px 0; font-weight: 700; color: #8c1625;">Clasificación:</td>
            <td style="padding: 4px 0; color: #1e293b;"><span class="badge badge-burgundy">Operativo / Institucional</span></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-weight: 700; color: #8c1625;">Arquitectura Web:</td>
            <td colspan="3" style="padding: 4px 0; color: #334155;">
              HTML5 Semántico, CSS3 Vanilla / Tailwind CSS, JavaScript ES6+, Node.js, Express, PostgreSQL, Web Push API, Service Workers.
            </td>
          </tr>
        </table>
      </div>

      <h1 class="sec-title" style="margin-top: 8px;">Tabla de Contenidos</h1>
      
      <div class="card" style="padding: 12px 16px;">
        <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">1. Introducción y Propósito del Sistema</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #8c1625;">Página 3</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 6px 0; padding-left: 15px; color: #475569;">1.1 Objetivos clave y diagrama de ciclo de vida del incidente</td>
            <td style="padding: 6px 0; text-align: right; color: #64748b;">Pág. 3</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">2. Perfiles y Roles de Usuario</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #8c1625;">Página 4</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">3. Módulo 1: Portal Público de Reportes (<code>index.html</code>)</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #8c1625;">Página 4</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 6px 0; padding-left: 15px; color: #475569;">3.1 Campos y comportamiento dinámico condicional</td>
            <td style="padding: 6px 0; text-align: right; color: #64748b;">Pág. 4</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 6px 0; padding-left: 15px; color: #475569;">3.2 Carga de fotografía y proceso de confirmación toast</td>
            <td style="padding: 6px 0; text-align: right; color: #64748b;">Pág. 4</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">4. Módulo 2: Acceso al Sistema (<code>admin-login.html</code>)</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #8c1625;">Página 5</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">5. Módulo 3: Panel de Control y Seguimiento (<code>admin.html</code>)</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #8c1625;">Página 5</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 6px 0; padding-left: 15px; color: #475569;">5.1 KPIs, métricas de rendimiento y filtros históricos por mes</td>
            <td style="padding: 6px 0; text-align: right; color: #64748b;">Pág. 5</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 6px 0; padding-left: 15px; color: #475569;">5.2 Tabla interactiva de incidentes y visor modal de fotos</td>
            <td style="padding: 6px 0; text-align: right; color: #64748b;">Pág. 6</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">6. Funcionalidades Especiales y Flujos Operativos</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #8c1625;">Página 7</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 6px 0; padding-left: 15px; color: #475569;">6.1 Justificación técnica de pendientes (motivos y tarjetas)</td>
            <td style="padding: 6px 0; text-align: right; color: #64748b;">Pág. 7</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 6px 0; padding-left: 15px; color: #475569;">6.2 Emisión de alertas prioritarias (Admin a Intendente)</td>
            <td style="padding: 6px 0; text-align: right; color: #64748b;">Pág. 7</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 6px 0; padding-left: 15px; color: #475569;">6.3 Activación y uso de Notificaciones Push Web</td>
            <td style="padding: 6px 0; text-align: right; color: #64748b;">Pág. 7</td>
          </tr>
          <tr style="border-bottom: 1px dotted #cbd5e1;">
            <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">7. Matriz Oficial de Módulos y Personal Asignado</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #8c1625;">Página 8</td>
          </tr>
          <tr>
            <td style="padding: 7px 0; font-weight: 700; color: #0f172a;">8. Preguntas Frecuentes y Solución de Problemas (FAQ)</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #8c1625;">Página 8</td>
          </tr>
        </table>
      </div>

      <div class="callout" style="margin-top: 6px;">
        <span class="callout-icon">💡</span>
        <div class="callout-content">
          <strong>Convención de Uso:</strong> Este documento está estructurado para guiar tanto a usuarios finales que reportan averías como al personal operativo y directivo responsable del mantenimiento institucional en ESTi.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span><strong>ESTi</strong> &bull; Licenciatura en Tecnologías de la Información</span>
      <span>Manual de Usuario &bull; <strong>Página 2 de 8</strong></span>
    </div>
  </section>

  <!-- ==================== PÁGINA 3: INTRODUCCIÓN Y ARQUITECTURA ==================== -->
  <section class="page">
    <div class="page-header">
      <div class="page-header-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="header-logo">
          <rect width="512" height="512" rx="96" fill="#8c1625"/>
          <path d="M256 82 392 132v112c0 98-58 154-136 186-78-32-136-88-136-186V132L256 82Z" fill="#fff"/>
        </svg>
        <span class="header-title-text">Sistema de Gestión de Incidencias &bull; ESTi</span>
      </div>
      <span class="header-subtitle-text">1. Introducción y Arquitectura</span>
    </div>

    <div class="page-content">
      <h1 class="sec-title">1. Introducción y Propósito del Sistema</h1>
      
      <p style="font-size: 11.5px; line-height: 1.55; text-align: justify;">
        El <strong>Sistema de Gestión y Control de Incidencias ESTi</strong> es una plataforma web integral diseñada para optimizar, centralizar y dar seguimiento en tiempo real al mantenimiento e incidencias reportadas en las instalaciones escolares (aulas, módulos, baños, laboratorios y áreas comunes). El sistema elimina los reportes en papel o desorganizados, garantizando que cada falla sea asignada de forma inmediata al responsable técnico del módulo.
      </p>

      <h2 class="sub-title">1.1 Objetivos Clave de la Plataforma</h2>
      <div class="grid-2" style="gap: 8px;">
        <div class="card" style="border-left: 3px solid #8c1625;">
          <strong style="color: #8c1625; font-size: 11px;">1. Captura Pública Ágil</strong>
          <p style="font-size: 10px; margin: 2px 0 0 0; color: #475569;">Cualquier integrante de la comunidad escolar reporta averías en segundos sin trámites ni registros engorrosos.</p>
        </div>
        <div class="card" style="border-left: 3px solid #8c1625;">
          <strong style="color: #8c1625; font-size: 11px;">2. Asignación Inteligente</strong>
          <p style="font-size: 10px; margin: 2px 0 0 0; color: #475569;">Cálculo automático del intendente responsable según el módulo escolar o edificio seleccionado.</p>
        </div>
        <div class="card" style="border-left: 3px solid #8c1625;">
          <strong style="color: #8c1625; font-size: 11px;">3. Trazabilidad Operativa</strong>
          <p style="font-size: 10px; margin: 2px 0 0 0; color: #475569;">Estados claros en tiempo real: <em>En curso</em>, <em>Pendiente</em>, <em>Completado</em>, <em>Baja</em> y <em>En revisión</em>.</p>
        </div>
        <div class="card" style="border-left: 3px solid #8c1625;">
          <strong style="color: #8c1625; font-size: 11px;">4. Justificación de Pendientes</strong>
          <p style="font-size: 10px; margin: 2px 0 0 0; color: #475569;">Control técnico estricto que exige documentar el motivo exacto ante cualquier pausa de trabajo.</p>
        </div>
      </div>

      <h2 class="sub-title" style="margin-top: 6px;">1.2 Diagrama de Flujo y Ciclo de Vida del Reporte</h2>
      
      <!-- DIAGRAMA VECTORIAL SVG ESTILIZADO -->
      <div class="diagram-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 200" width="100%" height="190">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#8c1625" />
            </marker>
          </defs>

          <!-- NODO A: COMUNIDAD ESCOLAR -->
          <rect x="15" y="65" width="135" height="70" rx="8" fill="#ffffff" stroke="#8c1625" stroke-width="2"/>
          <text x="82" y="88" font-family="sans-serif" font-size="10" font-weight="bold" fill="#8c1625" text-anchor="middle">COMUNIDAD ESCOLAR</text>
          <text x="82" y="103" font-family="sans-serif" font-size="8.5" fill="#475569" text-anchor="middle">Formulario Público</text>
          <text x="82" y="117" font-family="sans-serif" font-size="8" fill="#64748b" text-anchor="middle">(index.html - Sin login)</text>

          <!-- LINEA A -> B -->
          <line x1="150" y1="100" x2="185" y2="100" stroke="#8c1625" stroke-width="2" marker-end="url(#arrow)"/>
          <text x="168" y="93" font-family="sans-serif" font-size="7.5" fill="#8c1625" text-anchor="middle" font-weight="bold">Envío</text>

          <!-- NODO B: REGISTRO E IDENTIFICACIÓN -->
          <rect x="190" y="65" width="130" height="70" rx="8" fill="#fdf2f4" stroke="#c22237" stroke-width="1.5"/>
          <text x="255" y="88" font-family="sans-serif" font-size="10" font-weight="bold" fill="#8c1625" text-anchor="middle">REGISTRO DE INCIDENCIA</text>
          <text x="255" y="103" font-family="sans-serif" font-size="8.5" fill="#475569" text-anchor="middle">Asignación por Módulo</text>
          <text x="255" y="117" font-family="sans-serif" font-size="8" fill="#64748b" text-anchor="middle">Evidencia Opcional</text>

          <!-- LINEA B -> C -->
          <line x1="320" y1="100" x2="355" y2="100" stroke="#8c1625" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- NODO C: BACKEND / BASE DE DATOS -->
          <rect x="360" y="65" width="125" height="70" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
          <text x="422" y="88" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#38bdf8" text-anchor="middle">BASE DE DATOS / API</text>
          <text x="422" y="103" font-family="sans-serif" font-size="8.5" fill="#f8fafc" text-anchor="middle">Persistencia PostgreSQL</text>
          <text x="422" y="117" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">Despacho Web Push</text>

          <!-- LINEAS SPLIT C -> D (ADMIN & INTENDENTE) -->
          <path d="M 485 85 L 515 50 L 530 50" fill="none" stroke="#8c1625" stroke-width="2" marker-end="url(#arrow)"/>
          <path d="M 485 115 L 515 150 L 530 150" fill="none" stroke="#8c1625" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- NODO D1: VISTA ADMINISTRADOR -->
          <rect x="535" y="18" width="135" height="65" rx="6" fill="#f8fafc" stroke="#8c1625" stroke-width="1.8"/>
          <text x="602" y="38" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#8c1625" text-anchor="middle">ADMINISTRADOR</text>
          <text x="602" y="52" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">&bull; Control global de módulos</text>
          <text x="602" y="64" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">&bull; Alertas y reportes PDF</text>

          <!-- NODO D2: VISTA INTENDENTE -->
          <rect x="535" y="118" width="135" height="65" rx="6" fill="#f8fafc" stroke="#059669" stroke-width="1.8"/>
          <text x="602" y="138" font-family="sans-serif" font-size="9.5" font-weight="bold" fill="#059669" text-anchor="middle">INTENDENCIA</text>
          <text x="602" y="152" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">&bull; Módulo específico asignado</text>
          <text x="602" y="164" font-family="sans-serif" font-size="8" fill="#475569" text-anchor="middle">&bull; Justificación y notificaciones</text>
        </svg>
      </div>

      <div class="callout">
        <span class="callout-icon">⚡</span>
        <div class="callout-content">
          <strong>Sincronización en Tiempo Real:</strong> Cuando un alumno o docente registra un reporte, los paneles activos de los intendentes y administradores actualizan sus contadores y listas de inmediato sin necesidad de recargar la página web.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span><strong>ESTi</strong> &bull; Licenciatura en Tecnologías de la Información</span>
      <span>Manual de Usuario &bull; <strong>Página 3 de 8</strong></span>
    </div>
  </section>

  <!-- ==================== PÁGINA 4: ROLES Y PORTAL PÚBLICO ==================== -->
  <section class="page">
    <div class="page-header">
      <div class="page-header-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="header-logo">
          <rect width="512" height="512" rx="96" fill="#8c1625"/>
          <path d="M256 82 392 132v112c0 98-58 154-136 186-78-32-136-88-136-186V132L256 82Z" fill="#fff"/>
        </svg>
        <span class="header-title-text">Sistema de Gestión de Incidencias &bull; ESTi</span>
      </div>
      <span class="header-subtitle-text">2. Perfiles &bull; 3. Portal Público</span>
    </div>

    <div class="page-content">
      <h1 class="sec-title">2. Perfiles y Roles de Usuario</h1>
      <p style="font-size: 11px; margin-bottom: 4px;">El sistema cuenta con tres niveles de interacción claramente definidos:</p>

      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 25%;">Perfil</th>
            <th style="width: 25%;">Punto de Acceso</th>
            <th style="width: 50%;">Permisos y Alcance Operativo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong style="color: #0f172a;">Comunidad Escolar</strong><br><span class="badge badge-gray">Público</span></td>
            <td><code>index.html</code><br><span style="font-size: 9px; color: #64748b;">(Sin autenticación)</span></td>
            <td>Registro directo de fallas, selección inteligente de tipo de espacio, ubicación y carga opcional de fotografía de evidencia.</td>
          </tr>
          <tr>
            <td><strong style="color: #047857;">Personal de Intendencia</strong><br><span class="badge badge-green">Operativo</span></td>
            <td><code>admin-login.html</code> &rarr; <code>admin.html</code></td>
            <td>Visualización <strong>exclusiva</strong> de reportes asignados a su módulo, actualización de estados de trabajo, justificación técnica obligatoria de pendientes y recepción de alertas push.</td>
          </tr>
          <tr>
            <td><strong style="color: #8c1625;">Administrador</strong><br><span class="badge badge-burgundy">Supervisión</span></td>
            <td><code>admin-login.html</code> &rarr; <code>admin.html</code></td>
            <td>Supervisión global de todos los módulos, reasignación de responsables, emisión de alertas urgentes, exportación de reportes PDF y auditoría general.</td>
          </tr>
        </tbody>
      </table>

      <h1 class="sec-title" style="margin-top: 6px;">3. Módulo 1: Portal Público de Reportes (<code>index.html</code>)</h1>
      <p style="font-size: 11px;">Es la interfaz de entrada para cualquier persona que detecte una avería en las instalaciones.</p>

      <div class="grid-2" style="gap: 8px;">
        <div class="card">
          <strong style="color: #8c1625; font-size: 11px;">3.1 Campos del Formulario</strong>
          <ul style="font-size: 10px; padding-left: 14px; margin-top: 4px;">
            <li><strong>Tu nombre completo:</strong> Obligatorio para dar seguimiento al reporte.</li>
            <li><strong>Tipo de espacio:</strong> Seleccionable entre <em>Aula</em>, <em>Baño</em> u <em>Otro</em>. Despliega campos condicionales de manera dinámica.</li>
            <li><strong>Ubicación específica:</strong> Referencia libre (ej. <em>"Aula 302 junto al pizarrón"</em> o <em>"Baño mujeres frente a escaleras"</em>).</li>
            <li><strong>Descripción de la avería:</strong> Detalle del problema (fugas, chapas, focos, cristales).</li>
            <li><strong>Evidencia fotográfica:</strong> Carga de imagen o captura de cámara (JPG, PNG, WEBP hasta 2MB).</li>
          </ul>
        </div>

        <div class="card">
          <strong style="color: #8c1625; font-size: 11px;">3.2 Dinámica Inteligente de Campos</strong>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px; margin-top: 4px; font-size: 9.5px;">
            <p style="margin: 0 0 4px 0;"><span class="badge badge-blue">Al elegir Aula</span> &rarr; Se abre selector de <strong>Módulo / Edificio</strong> (Módulo 1 a 5 o Laboratorios).</p>
            <p style="margin: 0 0 4px 0;"><span class="badge badge-purple">Al elegir Baño</span> &rarr; Se abren 3 selectores: <strong>Módulo</strong>, <strong>Género</strong> (Hombres/Mujeres) y <strong>Piso</strong> (Alta/Baja).</p>
            <p style="margin: 0;"><span class="badge badge-gray">Al elegir Otro</span> &rarr; Oculta selectores y permite especificar el área libremente en la referencia.</p>
          </div>
          <p style="font-size: 9.5px; color: #64748b; margin-top: 5px;">
            <strong>Proceso de Envío:</strong> Al presionar <em>"Enviar reporte"</em>, el botón entra en estado de espera para impedir envíos dobles, asigna al intendente responsable y despliega una alerta verde confirmando el folio.
          </p>
        </div>
      </div>

      <div class="callout" style="margin-top: 4px;">
        <span class="callout-icon">📷</span>
        <div class="callout-content">
          <strong>Optimización de Evidencia Fotográfica:</strong> Las imágenes cargadas desde teléfonos móviles son optimizadas en el cliente para agilizar la transferencia, mostrando una vista previa inmediata con opción de cambio o eliminación antes del envío.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span><strong>ESTi</strong> &bull; Licenciatura en Tecnologías de la Información</span>
      <span>Manual de Usuario &bull; <strong>Página 4 de 8</strong></span>
    </div>
  </section>

  <!-- ==================== PÁGINA 5: ACCESO Y PANEL DE CONTROL ==================== -->
  <section class="page">
    <div class="page-header">
      <div class="page-header-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="header-logo">
          <rect width="512" height="512" rx="96" fill="#8c1625"/>
          <path d="M256 82 392 132v112c0 98-58 154-136 186-78-32-136-88-136-186V132L256 82Z" fill="#fff"/>
        </svg>
        <span class="header-title-text">Sistema de Gestión de Incidencias &bull; ESTi</span>
      </div>
      <span class="header-subtitle-text">4. Acceso &bull; 5. Panel de Control</span>
    </div>

    <div class="page-content">
      <h1 class="sec-title">4. Módulo 2: Acceso al Sistema (<code>admin-login.html</code>)</h1>
      
      <div class="grid-2" style="gap: 8px;">
        <div class="card">
          <strong style="color: #8c1625; font-size: 11px;">Inicio de Sesión Administrador</strong>
          <p style="font-size: 10px; margin: 3px 0;">1. Seleccione la pestaña <strong>Administrador</strong> en el conmutador superior.</p>
          <p style="font-size: 10px; margin: 3px 0;">2. Ingrese la <strong>contraseña maestra</strong> institucional.</p>
          <p style="font-size: 10px; margin: 3px 0;">3. Presione <strong>"Ingresar al Panel"</strong>. Accederá a la vista general con control total.</p>
        </div>
        <div class="card">
          <strong style="color: #047857; font-size: 11px;">Inicio de Sesión Intendente</strong>
          <p style="font-size: 10px; margin: 3px 0;">1. Seleccione la pestaña <strong>Intendente</strong> en el conmutador superior.</p>
          <p style="font-size: 10px; margin: 3px 0;">2. Seleccione su <strong>nombre propio</strong> del desplegable de intendentes.</p>
          <p style="font-size: 10px; margin: 3px 0;">3. Ingrese su <strong>clave individual</strong> asignada y pulse ingresar.</p>
        </div>
      </div>

      <div class="callout" style="margin: 2px 0 6px 0;">
        <span class="callout-icon">🔒</span>
        <div class="callout-content">
          <strong>Seguridad y Persistencia de Sesión:</strong> La sesión se almacena de forma segura en <code>sessionStorage</code>. Al cerrar la pestaña del navegador o presionar el botón <em>"Cerrar sesión"</em>, las credenciales se purgan inmediatamente, impidiendo accesos indebidos.
        </div>
      </div>

      <h1 class="sec-title" style="margin-top: 4px;">5. Módulo 3: Panel de Control y Seguimiento (<code>admin.html</code>)</h1>
      <p style="font-size: 11px; margin-bottom: 4px;">El panel adapta su disposición de herramientas según el rol con el que se haya autenticado el usuario.</p>

      <h2 class="sub-title">5.1 Barra Superior y Controles de Navegación</h2>
      <ul style="font-size: 10px; margin-bottom: 6px;">
        <li><strong>Insignia de Rol con Pulso en Vivo:</strong> Muestra <code>Administrador</code> o <code>Intendente: [Nombre]</code> con un led verde activo.</li>
        <li><strong>Botón "Ir a reporte":</strong> Permite abrir directamente el portal público para registrar incidencias de prueba o presenciales.</li>
        <li><strong>Botón "Cerrar sesión":</strong> Finaliza la sesión de manera segura y redirige al inicio.</li>
      </ul>

      <h2 class="sub-title">5.2 Tarjetas de Rendimiento y KPIs en Tiempo Real</h2>
      <div class="grid-5" style="margin-bottom: 6px;">
        <div class="kpi-mini-card" style="border-top: 3px solid #8c1625;">
          <div class="val" style="color: #8c1625;">124</div>
          <div class="lbl">Total Reportes</div>
        </div>
        <div class="kpi-mini-card" style="border-top: 3px solid #059669;">
          <div class="val" style="color: #059669;">98</div>
          <div class="lbl">Completados</div>
        </div>
        <div class="kpi-mini-card" style="border-top: 3px solid #d97706;">
          <div class="val" style="color: #d97706;">14</div>
          <div class="lbl">Pendientes</div>
        </div>
        <div class="kpi-mini-card" style="border-top: 3px solid #2563eb;">
          <div class="val" style="color: #2563eb;">12</div>
          <div class="lbl">Recientes (24h)</div>
        </div>
        <div class="kpi-mini-card" style="border-top: 3px solid #64748b;">
          <div class="val" style="color: #475569; font-size: 12px; padding-top: 3px;">Hoy</div>
          <div class="lbl">Último Reporte</div>
        </div>
      </div>

      <h2 class="sub-title">5.3 Filtros y Descarga de Reportes PDF</h2>
      <div class="card" style="font-size: 10.5px;">
        <p style="margin: 0 0 4px 0;">
          <strong>Filtro Mensual Dinámico:</strong> Agrupa y filtra automáticamente los incidentes por mes y año para consultar estadísticas históricas.
        </p>
        <p style="margin: 0; color: #8c1625;">
          <strong>Descarga de Reporte PDF (Exclusivo Administrador):</strong> Genera un informe ejecutivo consolidado listo para impresión. Por directiva operativa, este botón está totalmente bloqueado y oculto en la vista de los intendentes.
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span><strong>ESTi</strong> &bull; Licenciatura en Tecnologías de la Información</span>
      <span>Manual de Usuario &bull; <strong>Página 5 de 8</strong></span>
    </div>
  </section>

  <!-- ==================== PÁGINA 6: TABLA INTERACTIVA Y MATRIZ ==================== -->
  <section class="page">
    <div class="page-header">
      <div class="page-header-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="header-logo">
          <rect width="512" height="512" rx="96" fill="#8c1625"/>
          <path d="M256 82 392 132v112c0 98-58 154-136 186-78-32-136-88-136-186V132L256 82Z" fill="#fff"/>
        </svg>
        <span class="header-title-text">Sistema de Gestión de Incidencias &bull; ESTi</span>
      </div>
      <span class="header-subtitle-text">5.4 Tabla de Incidentes &bull; Permisos</span>
    </div>

    <div class="page-content">
      <h1 class="sec-title">5.4 Tabla Interactiva de Incidentes</h1>
      <p style="font-size: 11px; margin-bottom: 4px;">
        Es el núcleo operativo del sistema, donde se visualiza el estado de cada anomalía y se ejecutan las actualizaciones:
      </p>

      <table class="data-table" style="font-size: 9.5px;">
        <thead>
          <tr>
            <th style="width: 14%;">Columna</th>
            <th style="width: 86%;">Descripción y Comportamiento por Rol</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Fecha</strong></td>
            <td>Estampa cronológica exacta de registro con formato legible (Día, Mes, Año, Hora).</td>
          </tr>
          <tr>
            <td><strong>Nombre</strong></td>
            <td>Nombre del alumno, docente o personal reportante para aclaraciones directas.</td>
          </tr>
          <tr>
            <td><strong>Tipo</strong></td>
            <td>Categoría del espacio con especificación detallada (ej. <em>Aula</em>, <em>Baño (Hombres - P. Alta)</em>).</td>
          </tr>
          <tr>
            <td><strong>Módulo / Edif.</strong></td>
            <td><strong>Admin:</strong> Desplegable interactivo para reasignar módulo. <strong>Intendente:</strong> Etiqueta fija del módulo asignado.</td>
          </tr>
          <tr>
            <td><strong>Ubicación</strong></td>
            <td>Punto exacto o referencia libre ingresada por el reportante.</td>
          </tr>
          <tr>
            <td><strong>Descripción</strong></td>
            <td>Detalle de la anomalía técnica reportada.</td>
          </tr>
          <tr>
            <td><strong>Evidencia</strong></td>
            <td>Miniatura fotográfica interactiva. Al dar clic se abre el <strong>Visor de Alta Resolución en pantalla completa</strong>. Si no hay foto, muestra <em>"Sin foto"</em>.</td>
          </tr>
          <tr>
            <td><strong>Estado</strong></td>
            <td>
              Selector con indicación cromática: 
              <span class="badge badge-blue">En curso</span>
              <span class="badge badge-green">Completado</span>
              <span class="badge badge-amber">Pendiente</span>
              <span class="badge badge-gray">Baja</span>
              <span class="badge badge-purple">En revisión</span>
            </td>
          </tr>
          <tr>
            <td><strong>Motivo Pend.</strong></td>
            <td>Tarjeta contextual que muestra la justificación técnica, autor y fecha si el estado es <em>Pendiente</em>. Incluye botón de edición.</td>
          </tr>
          <tr>
            <td><strong>Responsable</strong></td>
            <td><strong>Admin:</strong> Desplegable para reasignar intendente. <strong>Intendente:</strong> Modo solo lectura mostrando su nombre.</td>
          </tr>
          <tr>
            <td><strong>Alerta</strong></td>
            <td><strong>Solo Admin:</strong> Botón directo para disparar un modal de notificación prioritaria al intendente asignado.</td>
          </tr>
        </tbody>
      </table>

      <h2 class="sub-title" style="margin-top: 6px;">Matriz Comparativa de Capacidades por Rol</h2>
      
      <div class="grid-2" style="gap: 10px;">
        <div class="card" style="border-top: 3px solid #8c1625; background: #fffdfd;">
          <strong style="color: #8c1625; font-size: 11px;">★ Funciones Exclusivas de Administrador</strong>
          <ul style="font-size: 10px; margin-top: 5px; padding-left: 15px;">
            <li>Supervisión integral de todos los módulos escolares (1 al 5 y Laboratorios).</li>
            <li>Reasignación de módulos y responsables ante contingencias.</li>
            <li>Emisión de <strong>Alertas Prioritarias</strong> con despacho Web Push inmediato.</li>
            <li>Generación y descarga oficial del <strong>Reporte Ejecutivo en PDF</strong>.</li>
            <li>Gestión y auditoría del catálogo histórico de incidencias.</li>
          </ul>
        </div>

        <div class="card" style="border-top: 3px solid #059669; background: #fdfffe;">
          <strong style="color: #059669; font-size: 11px;">✓ Funciones Exclusivas de Intendente</strong>
          <ul style="font-size: 10px; margin-top: 5px; padding-left: 15px;">
            <li>Vista filtrada y restringida: <strong>únicamente incidentes de su módulo asignado</strong>.</li>
            <li>Actualización directa de estados de avance (En curso, Completado, Pendiente).</li>
            <li>Registro obligatorio de justificación técnica para aplazamientos.</li>
            <li>Activación de suscripción para <strong>Notificaciones Push Web</strong> en su dispositivo.</li>
            <li>Recepción en tiempo real de toasts y avisos emitidos por la Administración.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span><strong>ESTi</strong> &bull; Licenciatura en Tecnologías de la Información</span>
      <span>Manual de Usuario &bull; <strong>Página 6 de 8</strong></span>
    </div>
  </section>

  <!-- ==================== PÁGINA 7: FUNCIONALIDADES ESPECIALES ==================== -->
  <section class="page">
    <div class="page-header">
      <div class="page-header-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="header-logo">
          <rect width="512" height="512" rx="96" fill="#8c1625"/>
          <path d="M256 82 392 132v112c0 98-58 154-136 186-78-32-136-88-136-186V132L256 82Z" fill="#fff"/>
        </svg>
        <span class="header-title-text">Sistema de Gestión de Incidencias &bull; ESTi</span>
      </div>
      <span class="header-subtitle-text">6. Funcionalidades Especiales y Flujos</span>
    </div>

    <div class="page-content">
      <h1 class="sec-title">6. Funcionalidades Especiales y Flujos Operativos</h1>

      <h2 class="sub-title">6.1 Flujo de Justificación Técnica de Incidencias "Pendientes"</h2>
      <p style="font-size: 10.5px; margin-bottom: 4px;">
        Para evitar demoras injustificadas, cambiar el estado a <strong>Pendiente</strong> requiere obligatoriamente registrar una causa técnica formal:
      </p>

      <div class="card" style="padding: 8px 12px; background: #fffdfa; border: 1px solid #fde68a;">
        <p style="font-size: 10px; margin: 0 0 4px 0;"><strong>Paso a paso:</strong> Al cambiar el estado a <em>Pendiente</em> en la tabla, el sistema abre el modal de justificación. El intendente o administrador puede seleccionar una opción rápida o redactar un texto personalizado (hasta 500 caracteres):</p>
        
        <div style="display: flex; gap: 5px; flex-wrap: wrap; margin: 4px 0;">
          <span style="background: #ffffff; border: 1px solid #d97706; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #92400e;">📦 Falta refacción / material</span>
          <span style="background: #ffffff; border: 1px solid #d97706; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #92400e;">📋 Esperando autorización</span>
          <span style="background: #ffffff; border: 1px solid #d97706; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #92400e;">🔧 Requiere apoyo externo</span>
          <span style="background: #ffffff; border: 1px solid #d97706; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #92400e;">🚫 Sin acceso temporal</span>
          <span style="background: #ffffff; border: 1px solid #d97706; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #92400e;">⏳ Turno siguiente</span>
        </div>
        <p style="font-size: 9.5px; margin: 4px 0 0 0; color: #475569;">Al guardar, la tabla renderiza una tarjeta ámbar permanente con el motivo, la firma de quien lo registró y la hora exacta.</p>
      </div>

      <h2 class="sub-title" style="margin-top: 6px;">6.2 Emisión de Alertas Prioritarias (Administrador &rarr; Intendente)</h2>
      <p style="font-size: 10.5px; margin-bottom: 4px;">
        Permite a la Administración enviar notificaciones de alta urgencia directamente al intendente responsable de una avería:
      </p>

      <div class="card" style="padding: 8px 12px; background: #fdf2f4; border: 1px solid #f7c2c7;">
        <p style="font-size: 10px; margin: 0 0 4px 0;"><strong>Paso a paso:</strong> En la fila del incidente, el Administrador hace clic en <strong>"Enviar alerta"</strong>. Se despliega el modal con la ficha del intendente y las siguientes plantillas instantáneas:</p>
        
        <div style="display: flex; gap: 5px; flex-wrap: wrap; margin: 4px 0;">
          <span style="background: #ffffff; border: 1px solid #c22237; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #8c1625;">🚨 Revisión urgente</span>
          <span style="background: #ffffff; border: 1px solid #c22237; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #8c1625;">⚡ Atender a la brevedad</span>
          <span style="background: #ffffff; border: 1px solid #c22237; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #8c1625;">📋 Solicitar informe</span>
          <span style="background: #ffffff; border: 1px solid #c22237; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #8c1625;">🧹 Limpieza prioritaria</span>
          <span style="background: #ffffff; border: 1px solid #c22237; padding: 2px 7px; border-radius: 4px; font-size: 9.5px; color: #8c1625;">📦 Verificar refacciones</span>
        </div>
        <p style="font-size: 9.5px; margin: 4px 0 0 0; color: #5a0a15;">El mensaje se envía de inmediato vía Web Push al celular del intendente y se refleja como un aviso toast emergente en su pantalla.</p>
      </div>

      <h2 class="sub-title" style="margin-top: 6px;">6.3 Activación de Notificaciones Push Web (Personal Operativo)</h2>
      
      <div class="card" style="padding: 8px 12px;">
        <ol style="font-size: 10px; margin: 0; padding-left: 16px;">
          <li>El intendente inicia sesión en su teléfono celular o computadora portátil desde <code>admin-login.html</code>.</li>
          <li>En la barra superior presiona el botón naranja <strong>"Activar notificaciones"</strong>.</li>
          <li>El navegador mostrará el diálogo del sistema solicitando permiso; debe pulsar <strong>"Permitir"</strong>.</li>
          <li>Una vez confirmado, el botón cambia a color verde con la etiqueta <em>"Notificaciones activas"</em>.</li>
          <li>A partir de ese momento, recibirá alertas urgentes incluso si el navegador se encuentra en segundo plano.</li>
        </ol>
      </div>

      <div class="callout" style="margin-top: 4px;">
        <span class="callout-icon">📱</span>
        <div class="callout-content">
          <strong>Compatibilidad PWA:</strong> La plataforma incorpora <code>manifest.json</code> y Service Worker, permitiendo añadir el acceso directo como una aplicación nativa en dispositivos Android e iOS.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span><strong>ESTi</strong> &bull; Licenciatura en Tecnologías de la Información</span>
      <span>Manual de Usuario &bull; <strong>Página 7 de 8</strong></span>
    </div>
  </section>

  <!-- ==================== PÁGINA 8: MATRIZ, FAQ Y CIERRE ==================== -->
  <section class="page">
    <div class="page-header">
      <div class="page-header-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="header-logo">
          <rect width="512" height="512" rx="96" fill="#8c1625"/>
          <path d="M256 82 392 132v112c0 98-58 154-136 186-78-32-136-88-136-186V132L256 82Z" fill="#fff"/>
        </svg>
        <span class="header-title-text">Sistema de Gestión de Incidencias &bull; ESTi</span>
      </div>
      <span class="header-subtitle-text">7. Matriz de Módulos &bull; 8. Preguntas Frecuentes</span>
    </div>

    <div class="page-content">
      <h1 class="sec-title">7. Matriz Oficial de Módulos y Personal Asignado</h1>
      <p style="font-size: 10.5px; margin-bottom: 3px;">
        Distribución operativa establecida para la asignación directa de incidencias:
      </p>

      <table class="data-table" style="font-size: 10px; margin-bottom: 6px;">
        <thead>
          <tr>
            <th style="width: 30%;">Módulo / Edificio Escolar</th>
            <th style="width: 45%;">Personal de Intendencia Titular</th>
            <th style="width: 25%;">Apoyo / Turno Alterno</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Módulo 1</strong> (Aulas 101-110)</td>
            <td>Hermelinda, Maika</td>
            <td>Sotero</td>
          </tr>
          <tr>
            <td><strong>Módulo 2</strong> (Aulas 201-210)</td>
            <td>Liliana, Diego</td>
            <td>Sotero</td>
          </tr>
          <tr>
            <td><strong>Módulo 3</strong> (Aulas 301-310)</td>
            <td>Anita, Ricardo</td>
            <td>Sotero</td>
          </tr>
          <tr>
            <td><strong>Módulo 4</strong> (Aulas 401-410)</td>
            <td>Oscar, Cynthia</td>
            <td>Sotero</td>
          </tr>
          <tr>
            <td><strong>Módulo 5</strong> (Aulas 501-510)</td>
            <td>Gabriela, Jesus</td>
            <td>Sotero</td>
          </tr>
          <tr>
            <td><strong>Laboratorios y Especialidades</strong></td>
            <td>Gabriela, Jesus</td>
            <td>Sotero</td>
          </tr>
        </tbody>
      </table>

      <h1 class="sec-title" style="margin-top: 4px;">8. Preguntas Frecuentes y Solución de Problemas (FAQ)</h1>

      <div class="grid-2" style="gap: 8px;">
        <div class="card" style="padding: 7px 10px;">
          <strong style="color: #8c1625; font-size: 10.5px;">¿Por qué como intendente no veo el botón de descargar PDF?</strong>
          <p style="font-size: 9.5px; margin: 3px 0 0 0; color: #475569;">
            Por política operativa y de seguridad, la generación y descarga de reportes oficiales consolidados está restringida exclusivamente al perfil de <strong>Administrador</strong>.
          </p>
        </div>

        <div class="card" style="padding: 7px 10px;">
          <strong style="color: #8c1625; font-size: 10.5px;">¿Qué sucede si se interrumpe la conexión al servidor?</strong>
          <p style="font-size: 9.5px; margin: 3px 0 0 0; color: #475569;">
            El sistema cuenta con persistencia híbrida. Si la API o base de datos no responde temporalmente, los reportes se resguardan en <code>localStorage</code> para evitar cualquier pérdida de información.
          </p>
        </div>

        <div class="card" style="padding: 7px 10px;">
          <strong style="color: #8c1625; font-size: 10.5px;">¿Cómo ver con más claridad la fotografía de una avería?</strong>
          <p style="font-size: 9.5px; margin: 3px 0 0 0; color: #475569;">
            Haga clic sobre la miniatura en la columna <em>Evidencia</em>. Se abrirá el visor flotante en alta definición. Para cerrarlo, presione la "X" superior o cualquier área exterior.
          </p>
        </div>

        <div class="card" style="padding: 7px 10px;">
          <strong style="color: #8c1625; font-size: 10.5px;">¿Se pueden editar las justificaciones de un reporte pendiente?</strong>
          <p style="font-size: 9.5px; margin: 3px 0 0 0; color: #475569;">
            Sí. En la tarjeta de la columna <em>Motivo Pend.</em>, presione el botón <strong>"Editar"</strong> para actualizar la explicación técnica o cambiar el motivo cuando surjan avances de material o turno.
          </p>
        </div>
      </div>

      <div class="card-highlight" style="margin-top: 6px; padding: 8px 12px; text-align: center;">
        <p style="font-size: 10.5px; font-weight: 700; color: #8c1625; margin: 0 0 2px 0;">
          Manual de Usuario elaborado para el Sistema de Reporte y Control de Incidencias &bull; ESTi
        </p>
        <p style="font-size: 9.5px; color: #5a0a15; margin: 0;">
          Desarrollado por <strong>Daniel Camilo García Galicia</strong> &bull; Licenciatura en Tecnologías de la Información &bull; Versión 2.0
        </p>
      </div>
    </div>

    <div class="page-footer">
      <span><strong>ESTi</strong> &bull; Licenciatura en Tecnologías de la Información</span>
      <span>Manual de Usuario &bull; <strong>Página 8 de 8</strong></span>
    </div>
  </section>

</body>
</html>`;

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');
console.log('HTML written to:', tempHtmlPath);

console.log('Printing PDF with browser...');
const res = spawnSync(browserExe, [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--no-pdf-header-footer',
  `--user-data-dir=${tempUserDataDir}`,
  `--print-to-pdf=${outputPdfPath}`,
  tempHtmlPath
], { stdio: 'pipe' });

if (fs.existsSync(outputPdfPath)) {
  const stats = fs.statSync(outputPdfPath);
  console.log('SUCCESS: PDF generated successfully!');
  console.log('File size:', stats.size, 'bytes');
  console.log('Path:', outputPdfPath);
} else {
  console.error('ERROR: PDF was not generated.');
  process.exit(1);
}
