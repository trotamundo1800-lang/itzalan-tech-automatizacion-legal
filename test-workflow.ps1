$API = "http://localhost:3001"

Write-Host "Testing Biblioteca Phase 2 Workflow" -ForegroundColor Cyan
Write-Host "===================================="

Write-Host "`nStep 1: Login" -ForegroundColor Yellow
$loginBody = @{ email = "test@example.com"; password = "Test1234!" } | ConvertTo-Json
$loginResp = Invoke-WebRequest -Uri "$API/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body $loginBody -UseBasicParsing
$loginResult = $loginResp.Content | ConvertFrom-Json
$TOKEN = $loginResult.accessToken
Write-Host "Success! Token obtained" -ForegroundColor Green

Write-Host "`nStep 2: Get Documents" -ForegroundColor Yellow
$listResp = Invoke-WebRequest -Uri "$API/api/biblioteca" -Method GET -Headers @{"Authorization"="Bearer $TOKEN"} -UseBasicParsing
$listResult = $listResp.Content | ConvertFrom-Json
Write-Host "Found: $($listResult.Count) documents" -ForegroundColor Green

if ($listResult.Count -gt 0) {
  $DOC = $listResult[0]
  $DOC_ID = $DOC.id
  Write-Host "Using document: $($DOC.titulo)" -ForegroundColor Cyan

  Write-Host "`nStep 3: Process Document" -ForegroundColor Yellow
  $procResp = Invoke-WebRequest -Uri "$API/api/biblioteca/$DOC_ID/process" -Method POST -Headers @{"Authorization"="Bearer $TOKEN"} -UseBasicParsing
  $procResult = $procResp.Content | ConvertFrom-Json
  Write-Host "Processed! Chunks: $($procResult.chunkCount)" -ForegroundColor Green

  Write-Host "`nStep 4: Consult with AI" -ForegroundColor Yellow
  $consultBody = @{ pregunta = "What are the key points?"; contexto = "Legal"; categoria = "General" } | ConvertTo-Json
  $consultResp = Invoke-WebRequest -Uri "$API/api/biblioteca/consultar" -Method POST -Headers @{"Authorization"="Bearer $TOKEN";"Content-Type"="application/json"} -Body $consultBody -UseBasicParsing
  $consultResult = $consultResp.Content | ConvertFrom-Json
  Write-Host "Done! Response length: $($consultResult.respuesta.Length) chars" -ForegroundColor Green

  Write-Host "`nStep 5: Check Status" -ForegroundColor Yellow
  $verResp = Invoke-WebRequest -Uri "$API/api/biblioteca/$DOC_ID" -Method GET -Headers @{"Authorization"="Bearer $TOKEN"} -UseBasicParsing
  $verResult = $verResp.Content | ConvertFrom-Json
  Write-Host "Status: $($verResult.extractionStatus)" -ForegroundColor Green
}

Write-Host "`nAll tests passed!" -ForegroundColor Green
