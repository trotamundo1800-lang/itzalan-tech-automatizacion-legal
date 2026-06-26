const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  
  // Create test document
  const docId = uuidv4();
  const userId = '09533563-5c8f-46a3-8eb8-bd8260601e75'; // test@example.com
  const titulo = 'Test Document - Legal Code';
  const archivoNombre = 'test-legal.txt';
  const archivoRuta = `biblioteca/${docId}.txt`;
  const mimeType = 'text/plain';
  const tamano = 1024;
  
  const sql = `
    INSERT INTO biblioteca_documents 
    (id, titulo, tipoDocumento, categoria, descripcion, archivoNombre, archivoRuta, mimeType, tamano, usuarioId, extractionStatus, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    docId,
    titulo,
    'ley',
    'General',
    'Test document for Phase 2 validation',
    archivoNombre,
    archivoRuta,
    mimeType,
    tamano,
    userId,
    'pending',
    new Date().toISOString(),
    new Date().toISOString()
  ];
  
  db.run(sql, values, function(err) {
    if (err) {
      console.error('Error inserting document:', err.message);
      process.exit(1);
    }
    
    console.log('Document created:', docId);
    
    // Create test file
    const uploadDir = './uploads/biblioteca';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const testContent = `LEGAL CODE - TEST DOCUMENT

Chapter 1: Introduction
This is a test document for the Biblioteca system.
It contains sample legal text for extraction and processing.

Chapter 2: Rights and Obligations
Users have the right to access the system.
Users are obligated to follow the terms of service.

Chapter 3: Procedures
The procedure is as follows:
1. Register an account
2. Upload documents
3. Process documents
4. Consult with AI

Chapter 4: Compliance
All documents must be compliant with regulations.
Processing must maintain data security.

This is the end of the test document.`;
    
    fs.writeFileSync(path.join(uploadDir, `${docId}.txt`), testContent);
    console.log('Test file created:', path.join(uploadDir, `${docId}.txt`));
    
    db.close();
  });
});
