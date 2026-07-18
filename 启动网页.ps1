$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4173

function Test-LocalPort([int]$Port) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $client.Connect("127.0.0.1", $Port)
    return $true
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

if (-not (Test-LocalPort $port)) {
  $bundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
  $pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue

  if (Test-Path -LiteralPath $bundledPython) {
    $pythonExe = $bundledPython
  } elseif ($pythonCommand -and $pythonCommand.Source) {
    $pythonExe = $pythonCommand.Source
  } else {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show("Python was not found. Please install Python 3 and try again.", "Unable to start") | Out-Null
    exit 1
  }

  Start-Process -FilePath $pythonExe `
    -ArgumentList "server.py" `
    -WorkingDirectory $project `
    -WindowStyle Hidden

  $deadline = (Get-Date).AddSeconds(15)
  while (-not (Test-LocalPort $port)) {
    if ((Get-Date) -gt $deadline) {
      throw "The local web server did not start within 15 seconds."
    }
    Start-Sleep -Milliseconds 200
  }
}

Start-Process "http://127.0.0.1:$port/"
